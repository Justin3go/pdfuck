import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
    });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }
  return mergedPdf.save();
}
