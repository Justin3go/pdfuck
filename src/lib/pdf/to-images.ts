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

export type PdfToImagesResult = PageImage[] | MergedImageResult;

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
    const mergedResult = await mergeImagesVertically(
      results,
      options.format,
      options.quality
    );
    return mergedResult;
  }

  return results;
}

async function mergeImagesVertically(
  images: PageImage[],
  format: ImageFormat,
  quality: number
): Promise<MergedImageResult> {
  // Load all images to get their dimensions
  const loadedImages = await Promise.all(
    images.map((img) => loadImage(img.dataUrl))
  );

  // Calculate total height and max width
  const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0);
  const maxWidth = Math.max(...loadedImages.map((img) => img.width));

  // Create canvas for merged image
  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;

  // Fill white background for JPEG format
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, maxWidth, totalHeight);
  }

  // Draw each image vertically
  let currentY = 0;
  for (const img of loadedImages) {
    // Center horizontally if image is narrower than max width
    const x = (maxWidth - img.width) / 2;
    ctx.drawImage(img, x, currentY);
    currentY += img.height;
  }

  const dataUrl = canvas.toDataURL(format, quality);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), format, quality)
  );

  return {
    isMerged: true,
    dataUrl,
    blob,
    pageCount: images.length,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
