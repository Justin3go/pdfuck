import { PDFDocument } from 'pdf-lib';

export async function flattenPdf(pdfBuffer: Uint8Array): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });

  // Flatten by copying all pages to a new document.
  // This strips interactive form fields and annotations while preserving visual content.
  const newDoc = await PDFDocument.create();
  const indices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
  const pages = await newDoc.copyPages(srcDoc, indices);
  for (const page of pages) {
    newDoc.addPage(page);
  }

  return newDoc.save();
}
