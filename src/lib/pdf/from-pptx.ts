import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { XMLParser } from 'fast-xml-parser';

interface SlideText {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  bold: boolean;
}

export async function pptxToPdf(pptxBuffer: Uint8Array): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(pptxBuffer);

  // Read presentation.xml to get slide order
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('text');
  if (!presentationXml) {
    throw new Error('Invalid PPTX file: presentation.xml not found');
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const presentation = parser.parse(presentationXml);
  const slideIds =
    presentation['p:presentation']['p:sldIdLst']?.['p:sldId'] || [];
  const slideCount = Array.isArray(slideIds) ? slideIds.length : 1;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Standard 16:9 slide size in points (10 inches x 5.625 inches at 72 DPI)
  const slideWidth = 720;
  const slideHeight = 405;

  for (let i = 1; i <= slideCount; i++) {
    const slideXml = await zip.file(`ppt/slides/slide${i}.xml`)?.async('text');
    if (!slideXml) continue;

    const slide = parser.parse(slideXml);
    const page = pdfDoc.addPage([slideWidth, slideHeight]);

    // Extract text from slide
    const texts: SlideText[] = [];

    function extractTexts(obj: unknown, parentX = 0, parentY = 0) {
      if (!obj || typeof obj !== 'object') return;

      // Check for text body
      if ('a:p' in obj) {
        const record = obj as Record<string, unknown>;
        const paragraphs = Array.isArray(record['a:p'])
          ? record['a:p']
          : [record['a:p']];

        for (const p of paragraphs) {
          if (!p) continue;
          const para = p as Record<string, unknown>;

          let text = '';
          let fontSize = 18;
          let bold = false;

          // Extract text runs
          const runs = para['a:r']
            ? Array.isArray(para['a:r'])
              ? para['a:r']
              : [para['a:r']]
            : [];

          for (const run of runs) {
            const r = run as Record<string, unknown>;
            if (r['a:t']) {
              text += String(r['a:t']);
            }

            // Check for formatting
            if (r['a:rPr']) {
              const props = r['a:rPr'] as Record<string, unknown>;
              if (props['@_sz']) {
                fontSize = parseInt(String(props['@_sz']), 10) / 100; // Convert from hundredths
              }
              if (props['@_b'] === '1') {
                bold = true;
              }
            }
          }

          // Get position from shape properties
          const spPr = record['a:spPr'] as Record<string, unknown> | undefined;
          let x = parentX;
          let y = parentY;

          const xfrm = spPr?.['a:xfrm'] as Record<string, unknown> | undefined;
          const offset = xfrm?.['a:off'] as Record<string, string> | undefined;
          if (offset) {
            x = parseInt(offset['@_x'], 10) / 12700; // EMUs to points
            y = slideHeight - parseInt(offset['@_y'], 10) / 12700 - fontSize; // Flip Y
          }

          if (text.trim()) {
            texts.push({ text: text.trim(), x, y, fontSize, bold });
          }
        }
      }

      // Recursively search
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            extractTexts(item, parentX, parentY);
          }
        } else if (typeof value === 'object') {
          extractTexts(value, parentX, parentY);
        }
      }
    }

    // Extract all texts from the slide
    extractTexts(slide);

    // Draw texts on PDF
    for (const t of texts) {
      const textWidth = (t.bold ? boldFont : font).widthOfTextAtSize(
        t.text,
        t.fontSize
      );

      // Simple wrapping if text is too wide
      if (textWidth > slideWidth - t.x - 20) {
        const words = t.text.split(' ');
        let line = '';
        let currentY = t.y;

        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = (t.bold ? boldFont : font).widthOfTextAtSize(
            testLine,
            t.fontSize
          );

          if (testWidth > slideWidth - t.x - 20 && line) {
            page.drawText(line, {
              x: t.x,
              y: currentY,
              size: t.fontSize,
              font: t.bold ? boldFont : font,
              color: rgb(0, 0, 0),
            });
            currentY -= t.fontSize * 1.2;
            line = word;
          } else {
            line = testLine;
          }
        }

        if (line) {
          page.drawText(line, {
            x: t.x,
            y: currentY,
            size: t.fontSize,
            font: t.bold ? boldFont : font,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        page.drawText(t.text, {
          x: t.x,
          y: t.y,
          size: t.fontSize,
          font: t.bold ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Add slide number
    page.drawText(`${i}`, {
      x: slideWidth - 30,
      y: 10,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
