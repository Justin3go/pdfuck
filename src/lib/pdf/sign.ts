import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface SignOptions {
  text?: string;
  signatureImage?: Uint8Array;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
}

export async function addSignature(
  pdfBuffer: Uint8Array,
  options: SignOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });

  const pages = doc.getPages();
  if (options.pageIndex < 0 || options.pageIndex >= pages.length) {
    throw new Error('Invalid page index');
  }

  const page = pages[options.pageIndex];

  if (options.signatureImage) {
    // Try to embed as PNG first, then JPEG
    let image;
    try {
      image = await doc.embedPng(options.signatureImage);
    } catch {
      try {
        image = await doc.embedJpg(options.signatureImage);
      } catch {
        throw new Error('Unsupported image format. Please use PNG or JPEG.');
      }
    }

    page.drawImage(image, {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    });
  } else if (options.text) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontSize = options.fontSize || 24;
    const color = options.color || { r: 0, g: 0, b: 0 };

    page.drawText(options.text, {
      x: options.x,
      y: options.y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  } else {
    throw new Error('Either text or signature image must be provided');
  }

  return doc.save();
}
