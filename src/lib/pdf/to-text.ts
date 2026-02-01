import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from './worker-setup';

export async function pdfToText(pdfBuffer: Uint8Array): Promise<string> {
  initPdfWorker();
  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n--- Page Break ---\n\n');
}
