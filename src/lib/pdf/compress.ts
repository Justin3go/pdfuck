import { PDFDocument } from 'pdf-lib';

export async function compressPdf(pdfBuffer: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  return doc.save();
}
