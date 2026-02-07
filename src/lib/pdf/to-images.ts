import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from './worker-setup';

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface PdfToImagesOptions {
  format: ImageFormat;
  scale: number;
  quality: number;
  mergeIntoLongImage?: boolean;
}

export interface PageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
}

export interface MergedImageResult {
  isMerged: true;
  dataUrl: string;
  blob: Blob;
  pageCount: number;
}

export interface BatchMergedImageResult {
  isMerged: true;
  isBatch: true;
  batches: {
    dataUrl: string;
    blob: Blob;
    pageCount: number;
    startPage: number;
    endPage: number;
  }[];
  totalPageCount: number;
}

export type PdfToImagesResult = PageImage[] | MergedImageResult | BatchMergedImageResult;

// WebP 编码器限制（Chrome 的 WebP 编码器对大尺寸图片有限制）
const MAX_WEBP_DIMENSION = 16383; // WebP 编码器通常限制在 16383px
const MAX_WEBP_AREA = 268435456; // 256MB

export async function pdfToImages(
  pdfBuffer: Uint8Array,
  options: PdfToImagesOptions
): Promise<PdfToImagesResult> {
  initPdfWorker();
  // Copy buffer to avoid detachment issues with worker
  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;
  const results: PageImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: options.scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL(options.format, options.quality);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), options.format, options.quality)
    );

    results.push({ pageNumber: i, dataUrl, blob });
  }

  // If merge option is enabled, combine all images into one long image
  if (options.mergeIntoLongImage && results.length > 1) {
    // 根据格式选择不同的合并方式
    if (options.format === 'image/webp') {
      const mergedResult = await mergeImagesVerticallyWebP(
        results,
        options.format,
        options.quality
      );
      return mergedResult;
    } else {
      // PNG/JPG 格式：直接合并，无限制检查
      const mergedResult = await mergeImagesVertically(
        results,
        options.format,
        options.quality
      );
      return mergedResult;
    }
  }

  return results;
}

/**
 * PNG/JPG 格式：直接合并为单张长图，无任何尺寸限制检查
 */
async function mergeImagesVertically(
  images: PageImage[],
  format: ImageFormat,
  quality: number
): Promise<MergedImageResult> {
  const urls: string[] = [];
  try {
    const loadedImages = await Promise.all(
      images.map((img, index) => {
        const url = URL.createObjectURL(img.blob);
        urls.push(url);
        return loadImage(url).then(img => {
          console.log(`[PDF] Page ${index + 1} loaded: ${img.width}x${img.height}`);
          return img;
        });
      })
    );

    const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0);
    const maxWidth = Math.max(...loadedImages.map((img) => img.width));

    console.log(`[PDF] Merging ${images.length} pages (PNG/JPG), total: ${maxWidth}x${totalHeight}`);

    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }

    // Fill white background for JPEG format
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, maxWidth, totalHeight);
    }

    // Draw each image vertically
    let currentY = 0;
    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const x = (maxWidth - img.width) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.height;
      console.log(`[PDF] Drew page ${i + 1} at y=${currentY - img.height}`);
    }

    console.log(`[PDF] Generating ${format}...`);

    const dataUrl = canvas.toDataURL(format, quality);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), format, quality)
    );

    console.log(`[PDF] Merge complete: ${images.length} pages, ${blob.size} bytes`);

    return {
      isMerged: true,
      dataUrl,
      blob,
      pageCount: images.length,
    };
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
}

/**
 * WebP 格式：如果超过限制，自动分批合并
 */
async function mergeImagesVerticallyWebP(
  images: PageImage[],
  format: ImageFormat,
  quality: number
): Promise<MergedImageResult | BatchMergedImageResult> {
  const urls: string[] = [];
  try {
    const loadedImages = await Promise.all(
      images.map((img, index) => {
        const url = URL.createObjectURL(img.blob);
        urls.push(url);
        return loadImage(url).then(img => {
          console.log(`[PDF] Page ${index + 1} loaded: ${img.width}x${img.height}`);
          return img;
        });
      })
    );

    const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0);
    const maxWidth = Math.max(...loadedImages.map((img) => img.width));
    const totalArea = maxWidth * totalHeight;

    console.log(`[PDF] Merging ${images.length} pages (WebP), total: ${maxWidth}x${totalHeight}`);

    // 检查是否需要分批
    const needsBatching = maxWidth > MAX_WEBP_DIMENSION ||
                         totalHeight > MAX_WEBP_DIMENSION ||
                         totalArea > MAX_WEBP_AREA;

    if (needsBatching) {
      console.log(`[PDF] WebP image too large, using batch merge`);
      return await batchMergeImagesVertically(loadedImages, images, format, quality, maxWidth);
    }

    // 不需要分批，直接合并
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }

    // Draw each image vertically
    let currentY = 0;
    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      const x = (maxWidth - img.width) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.height;
      console.log(`[PDF] Drew page ${i + 1} at y=${currentY - img.height}`);
    }

    console.log(`[PDF] Generating WebP...`);

    const dataUrl = canvas.toDataURL(format, quality);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), format, quality)
    );

    console.log(`[PDF] Merge complete: ${images.length} pages, ${blob.size} bytes`);

    return {
      isMerged: true,
      dataUrl,
      blob,
      pageCount: images.length,
    };
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
}

/**
 * 分批合并图片（用于 WebP 格式超过尺寸限制时）
 */
async function batchMergeImagesVertically(
  loadedImages: HTMLImageElement[],
  originalImages: PageImage[],
  format: ImageFormat,
  quality: number,
  maxWidth: number
): Promise<BatchMergedImageResult> {
  const batches: BatchMergedImageResult['batches'] = [];
  let currentBatchStart = 0;
  let currentBatchHeight = 0;

  // 计算每批的最大高度（留一些安全边距）
  const maxBatchHeight = MAX_WEBP_DIMENSION - 100;

  // 分批：确保每批的高度不超过限制
  const batchRanges: { start: number; end: number }[] = [];

  for (let i = 0; i < loadedImages.length; i++) {
    const imgHeight = loadedImages[i].height;

    // 如果当前批为空，或者加上这张图片后不超过限制，就加入当前批
    if (currentBatchHeight === 0 || currentBatchHeight + imgHeight <= maxBatchHeight) {
      currentBatchHeight += imgHeight;
    } else {
      // 结束当前批，开始新的一批
      batchRanges.push({ start: currentBatchStart, end: i });
      currentBatchStart = i;
      currentBatchHeight = imgHeight;
    }
  }
  // 添加最后一批
  if (currentBatchStart < loadedImages.length) {
    batchRanges.push({ start: currentBatchStart, end: loadedImages.length });
  }

  console.log(`[PDF] Split into ${batchRanges.length} batches:`, batchRanges);

  // 逐批合并
  for (let batchIndex = 0; batchIndex < batchRanges.length; batchIndex++) {
    const { start, end } = batchRanges[batchIndex];
    const batchImages = loadedImages.slice(start, end);
    const batchHeight = batchImages.reduce((sum, img) => sum + img.height, 0);

    console.log(`[PDF] Processing batch ${batchIndex + 1}: pages ${start + 1}-${end}, height: ${batchHeight}`);

    // Create canvas for this batch
    const canvas = document.createElement('canvas');
    canvas.width = maxWidth;
    canvas.height = batchHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }

    // Draw images in this batch
    let currentY = 0;
    for (const img of batchImages) {
      const x = (maxWidth - img.width) / 2;
      ctx.drawImage(img, x, currentY);
      currentY += img.height;
    }

    // Generate dataUrl and blob for this batch
    const dataUrl = canvas.toDataURL(format, quality);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject(new Error('toBlob 返回 null'));
        } else {
          resolve(b);
        }
      }, format, quality);
    });

    batches.push({
      dataUrl,
      blob,
      pageCount: end - start,
      startPage: start + 1,
      endPage: end,
    });

    console.log(`[PDF] Batch ${batchIndex + 1} complete: ${blob.size} bytes`);
  }

  console.log(`[PDF] Batch merge complete: ${batches.length} batches, ${originalImages.length} total pages`);

  return {
    isMerged: true,
    isBatch: true,
    batches,
    totalPageCount: originalImages.length,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`加载图片失败: ${src}`));
    img.src = src;
  });
}
