import { PDFDocument } from 'pdf-lib';

export async function extractPages(
  pdfBuffer: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, pageIndices);
  for (const page of pages) {
    newDoc.addPage(page);
  }
  return newDoc.save();
}
