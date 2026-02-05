import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface HeaderFooterOptions {
  headerText?: string;
  footerText?: string;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  alignment?: 'left' | 'center' | 'right';
  applyTo?: 'all' | 'odd' | 'even';
  margin?: number;
}

export async function addHeaderFooter(
  pdfBuffer: Uint8Array,
  options: HeaderFooterOptions
): Promise<Uint8Array> {
  try {
    const doc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const pages = doc.getPages();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const fontSize = options.fontSize || 10;
    const color = options.color || { r: 0.5, g: 0.5, b: 0.5 };
    const alignment = options.alignment || 'center';
    const applyTo = options.applyTo || 'all';
    const margin = options.margin || 20;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNumber = i + 1;

      // 检查是否应该应用到当前页
      if (applyTo === 'odd' && pageNumber % 2 === 0) continue;
      if (applyTo === 'even' && pageNumber % 2 !== 0) continue;

      const { width, height } = page.getSize();

      // 添加页眉
      if (options.headerText) {
        const text = options.headerText;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x: number;

        switch (alignment) {
          case 'left':
            x = margin;
            break;
          case 'right':
            x = width - textWidth - margin;
            break;
          default:
            x = (width - textWidth) / 2;
            break;
        }

        page.drawText(text, {
          x,
          y: height - margin,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }

      // 添加页脚
      if (options.footerText) {
        const text = options.footerText;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x: number;

        switch (alignment) {
          case 'left':
            x = margin;
            break;
          case 'right':
            x = width - textWidth - margin;
            break;
          default:
            x = (width - textWidth) / 2;
            break;
        }

        page.drawText(text, {
          x,
          y: margin - fontSize,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }
    }

    return await doc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to add header/footer: ${error.message}`);
    }
    throw new Error('Failed to add header/footer');
  }
}
