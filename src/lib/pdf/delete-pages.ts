import { PDFDocument } from 'pdf-lib';

export async function deletePages(
  pdfBuffer: Uint8Array,
  pageIndicesToDelete: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const totalPages = srcDoc.getPageCount();
  const deleteSet = new Set(pageIndicesToDelete);
  const keepIndices: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!deleteSet.has(i)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages');
  }

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, keepIndices);
  for (const page of pages) {
    newDoc.addPage(page);
  }
  return newDoc.save();
}
