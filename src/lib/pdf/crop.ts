import { PDFDocument } from 'pdf-lib';

export interface CropMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export async function cropPdf(
  pdfBuffer: Uint8Array,
  margins: CropMargins
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const newX = margins.left;
    const newY = margins.bottom;
    const newWidth = width - margins.left - margins.right;
    const newHeight = height - margins.top - margins.bottom;

    if (newWidth <= 0 || newHeight <= 0) {
      throw new Error('Crop margins are too large for the page size');
    }

    page.setCropBox(newX, newY, newWidth, newHeight);
  }

  return doc.save();
}
