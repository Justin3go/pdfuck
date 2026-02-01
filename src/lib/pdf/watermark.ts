import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: { r: number; g: number; b: number };
  position: 'center' | 'diagonal';
}

export async function addWatermark(
  pdfBuffer: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);

    let x: number;
    let y: number;
    let rotate = degrees(0);

    if (options.position === 'center') {
      x = (width - textWidth) / 2;
      y = height / 2;
    } else {
      x = width / 4;
      y = height / 4;
      rotate = degrees(options.rotation || 45);
    }

    page.drawText(options.text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(options.color.r, options.color.g, options.color.b),
      opacity: options.opacity,
      rotate,
    });
  }

  return doc.save();
}
