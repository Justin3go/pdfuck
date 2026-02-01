import { PDFDocument, type PDFImage } from 'pdf-lib';

export async function imagesToPdf(
  imageBuffers: Array<{ buffer: Uint8Array; mimeType: string }>
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const { buffer, mimeType } of imageBuffers) {
    let image: PDFImage;
    if (mimeType === 'image/png') {
      image = await doc.embedPng(buffer);
    } else {
      // JPG and converted WebP (WebP must be converted to PNG/JPG first)
      image = await doc.embedJpg(buffer);
    }

    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return doc.save();
}

/**
 * Convert a WebP image to PNG using canvas.
 * Must be called in browser context.
 */
export async function convertWebpToPng(
  buffer: Uint8Array
): Promise<Uint8Array> {
  return convertImageToPng(buffer, 'image/webp');
}

/**
 * Convert any browser-supported image format to PNG using canvas.
 * Works with WebP, BMP, GIF, SVG, and other formats the browser can render.
 * Must be called in browser context.
 */
export async function convertImageToPng(
  buffer: Uint8Array,
  mimeType: string
): Promise<Uint8Array> {
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // For SVG without explicit dimensions, use a reasonable default
      const width = img.width || 800;
      const height = img.height || 600;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url);
        if (!pngBlob) {
          reject(new Error(`Failed to convert ${mimeType} to PNG`));
          return;
        }
        pngBlob.arrayBuffer().then((ab) => {
          resolve(new Uint8Array(ab));
        });
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load ${mimeType} image`));
    };
    img.src = url;
  });
}
