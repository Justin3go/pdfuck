import { PDFDocument } from 'pdf-lib';

export async function reversePages(pdfBuffer: Uint8Array): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const totalPages = srcDoc.getPageCount();
  const reversedIndices = Array.from(
    { length: totalPages },
    (_, i) => totalPages - 1 - i
  );

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, reversedIndices);
  for (const page of pages) {
    newDoc.addPage(page);
  }
  return newDoc.save();
}
