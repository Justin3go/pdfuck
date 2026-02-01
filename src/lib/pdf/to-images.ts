import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from './worker-setup';

export type ImageFormat = 'image/jpeg' | 'image/png';

export interface PdfToImagesOptions {
  format: ImageFormat;
  scale: number;
  quality: number;
}

export interface PageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
}

export async function pdfToImages(
  pdfBuffer: Uint8Array,
  options: PdfToImagesOptions
): Promise<PageImage[]> {
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

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL(options.format, options.quality);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), options.format, options.quality)
    );

    results.push({ pageNumber: i, dataUrl, blob });
  }

  return results;
}
