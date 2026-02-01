import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

export type PageNumberFormat = 'numeric' | 'roman' | 'page-of-total';

export interface PageNumberOptions {
  position: PageNumberPosition;
  fontSize: number;
  startNumber: number;
  format: PageNumberFormat;
  margin: number;
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export async function addPageNumbers(
  pdfBuffer: Uint8Array,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const totalPages = pages.length;

  pages.forEach((page, index) => {
    const pageNum = options.startNumber + index;
    let text: string;

    switch (options.format) {
      case 'roman':
        text = toRoman(pageNum);
        break;
      case 'page-of-total':
        text = `${pageNum} / ${totalPages + options.startNumber - 1}`;
        break;
      default:
        text = String(pageNum);
    }

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    const margin = options.margin;

    let x: number;
    let y: number;

    const isTop = options.position.startsWith('top');
    const isBottom = options.position.startsWith('bottom');

    if (isTop) {
      y = height - margin;
    } else {
      y = margin;
    }

    if (options.position.endsWith('left')) {
      x = margin;
    } else if (options.position.endsWith('right')) {
      x = width - textWidth - margin;
    } else {
      x = (width - textWidth) / 2;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return doc.save();
}
