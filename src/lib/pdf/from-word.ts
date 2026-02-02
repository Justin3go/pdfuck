import * as mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function wordToPdf(docxBuffer: Uint8Array): Promise<Uint8Array> {
  // Convert DOCX to HTML with Mammoth
  const result = await mammoth.convertToHtml({
    buffer: Buffer.from(docxBuffer),
  });
  const html = result.value;

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 11;
  const lineHeight = fontSize * 1.5;
  const margin = 50;
  const maxWidth = width - 2 * margin;

  let y = height - margin;

  // Parse HTML and extract text with styles
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function addNewPage() {
    page = pdfDoc.addPage([595.28, 841.89]);
    y = height - margin;
  }

  function drawText(
    text: string,
    options: { bold?: boolean; size?: number; indent?: number } = {}
  ) {
    const currentFont = options.bold ? boldFont : font;
    const currentSize = options.size || fontSize;
    const indent = options.indent || 0;

    const words = text.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = currentFont.widthOfTextAtSize(testLine, currentSize);

      if (textWidth > maxWidth - indent && line) {
        // Draw current line
        if (y < margin + lineHeight) {
          addNewPage();
        }

        page.drawText(line, {
          x: margin + indent,
          y,
          size: currentSize,
          font: currentFont,
          color: rgb(0, 0, 0),
        });

        y -= lineHeight * (currentSize / fontSize);
        line = word;
      } else {
        line = testLine;
      }
    }

    // Draw remaining text
    if (line) {
      if (y < margin + lineHeight) {
        addNewPage();
      }

      page.drawText(line, {
        x: margin + indent,
        y,
        size: currentSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });

      y -= lineHeight * (currentSize / fontSize);
    }
  }

  function processNode(
    node: Node,
    options: { bold?: boolean; size?: number } = {}
  ) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        drawText(text, options);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          for (const child of element.childNodes) {
            processNode(child, options);
          }
          y -= lineHeight * 0.5; // Paragraph spacing
          break;
        case 'br':
          y -= lineHeight;
          break;
        case 'strong':
        case 'b':
          for (const child of element.childNodes) {
            processNode(child, { ...options, bold: true });
          }
          break;
        case 'h1':
          y -= lineHeight;
          for (const child of element.childNodes) {
            processNode(child, { bold: true, size: 24 });
          }
          y -= lineHeight;
          break;
        case 'h2':
          y -= lineHeight;
          for (const child of element.childNodes) {
            processNode(child, { bold: true, size: 20 });
          }
          y -= lineHeight * 0.5;
          break;
        case 'h3':
          y -= lineHeight * 0.5;
          for (const child of element.childNodes) {
            processNode(child, { bold: true, size: 16 });
          }
          y -= lineHeight * 0.3;
          break;
        case 'ul':
        case 'ol':
          for (const child of element.childNodes) {
            if (
              child.nodeType === Node.ELEMENT_NODE &&
              (child as Element).tagName.toLowerCase() === 'li'
            ) {
              drawText('• ', { size: options.size });
              // Process list item content with indent
              const liText = (child as Element).textContent?.trim() || '';
              drawText(liText, { ...options, indent: 20 });
            }
          }
          y -= lineHeight * 0.5;
          break;
        case 'table':
          // Simple table handling - render as text blocks
          for (const row of element.querySelectorAll('tr')) {
            const cells = row.querySelectorAll('td, th');
            const rowText = Array.from(cells)
              .map((cell) => cell.textContent?.trim() || '')
              .join(' | ');
            drawText(rowText, { bold: row.querySelectorAll('th').length > 0 });
          }
          y -= lineHeight * 0.5;
          break;
        default:
          for (const child of element.childNodes) {
            processNode(child, options);
          }
      }
    }
  }

  // Process body content
  for (const child of doc.body.childNodes) {
    processNode(child);
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
