import { PDFDocument } from 'pdf-lib';

export interface SplitOptions {
  mode: 'each-page' | 'ranges';
  ranges?: Array<{ start: number; end: number }>;
}

export async function splitPdf(
  pdfBuffer: Uint8Array,
  options: SplitOptions
): Promise<Uint8Array[]> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const results: Uint8Array[] = [];

  if (options.mode === 'each-page') {
    for (let i = 0; i < srcDoc.getPageCount(); i++) {
      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(page);
      results.push(await newDoc.save());
    }
  } else if (options.mode === 'ranges' && options.ranges) {
    for (const range of options.ranges) {
      const newDoc = await PDFDocument.create();
      const indices = Array.from(
        { length: range.end - range.start + 1 },
        (_, i) => range.start - 1 + i
      );
      const pages = await newDoc.copyPages(srcDoc, indices);
      for (const page of pages) {
        newDoc.addPage(page);
      }
      results.push(await newDoc.save());
    }
  }

  return results;
}
