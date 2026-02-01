import { PDFDocument, degrees } from 'pdf-lib';

export type RotationAngle = 0 | 90 | 180 | 270;

export interface PageRotation {
  pageIndex: number;
  angle: RotationAngle;
}

export async function rotatePdf(
  pdfBuffer: Uint8Array,
  rotations: PageRotation[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  for (const { pageIndex, angle } of rotations) {
    if (angle === 0) continue;
    const page = doc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + angle));
  }
  return doc.save();
}
