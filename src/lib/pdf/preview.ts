import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from './worker-setup';

export interface PageThumbnail {
  pageIndex: number;
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export async function generateThumbnails(
  pdfBuffer: Uint8Array,
  scale = 0.3
): Promise<PageThumbnail[]> {
  initPdfWorker();
  // Copy buffer to avoid detachment issues with worker
  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;
  const thumbnails: PageThumbnail[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    thumbnails.push({
      pageIndex: i - 1,
      pageNumber: i,
      dataUrl: canvas.toDataURL('image/jpeg', 0.6),
      width: viewport.width,
      height: viewport.height,
    });
  }

  return thumbnails;
}
