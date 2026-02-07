import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
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

  // Get slide size from presentation.xml
  // PPTX uses EMUs (English Metric Units), 1 point = 12700 EMUs
  const sldSz = presentation['p:presentation']['p:sldSz'] as
    | Record<string, string>
    | undefined;
  const slideWidthEmu = sldSz ? parseInt(sldSz['@_cx'], 10) : 9144000; // Default 16:9 width
  const slideHeightEmu = sldSz ? parseInt(sldSz['@_cy'], 10) : 5143500; // Default 16:9 height
  const slideWidth = slideWidthEmu / 12700;
  const slideHeight = slideHeightEmu / 12700;

  const pdfDoc = await PDFDocument.create();

  // Register fontkit for custom font support
  pdfDoc.registerFontkit(fontkit);

  // Load Chinese font
  const fontResponse = await fetch('/fonts/NotoSansSC-Regular.ttf');
  const fontBytes = new Uint8Array(await fontResponse.arrayBuffer());
  const font = await pdfDoc.embedFont(fontBytes);
  const boldFont = font;

  for (let i = 1; i <= slideCount; i++) {
    const slideXml = await zip.file(`ppt/slides/slide${i}.xml`)?.async('text');
    if (!slideXml) continue;

    const slide = parser.parse(slideXml);
    const page = pdfDoc.addPage([slideWidth, slideHeight]);

    // Extract text from slide
    const texts: SlideText[] = [];

    // Find all shapes in the slide
    function findAllShapes(obj: unknown): Array<Record<string, unknown>> {
      const shapes: Array<Record<string, unknown>> = [];

      function search(obj: unknown) {
        if (!obj || typeof obj !== 'object') return;

        const record = obj as Record<string, unknown>;

        // Check if this is a shape
        if ('p:spPr' in record) {
          shapes.push(record);
        }

        // Recursively search
        for (const value of Object.values(record)) {
          if (Array.isArray(value)) {
            for (const item of value) {
              search(item);
            }
          } else if (typeof value === 'object') {
            search(value);
          }
        }
      }

      search(obj);
      return shapes;
    }

    // Get position from shape
    function getShapePosition(
      shape: Record<string, unknown>
    ): { x: number; y: number } | null {
      const spPr = shape['p:spPr'] as Record<string, unknown> | undefined;
      if (!spPr) return null;

      const xfrm = spPr['a:xfrm'] as Record<string, unknown> | undefined;
      if (!xfrm) return null;

      const offset = xfrm['a:off'] as Record<string, string> | undefined;
      if (!offset) return null;

      const x = parseInt(offset['@_x'], 10) / 12700; // EMUs to points
      const y = parseInt(offset['@_y'], 10) / 12700; // EMUs to points

      return { x, y };
    }

    // Extract texts from a shape
    function extractTextsFromShape(shape: Record<string, unknown>) {
      const position = getShapePosition(shape);
      if (!position) return;

      // Find text body
      const txBody = shape['p:txBody'] as Record<string, unknown> | undefined;
      if (!txBody) return;

      // Find all paragraphs in the text body
      function findParagraphs(obj: unknown): Array<Record<string, unknown>> {
        const paragraphs: Array<Record<string, unknown>> = [];

        function search(obj: unknown) {
          if (!obj || typeof obj !== 'object') return;

          const record = obj as Record<string, unknown>;

          // Check if this is a paragraph
          if ('a:r' in record || 'a:endParaRPr' in record) {
            paragraphs.push(record);
          }

          // Recursively search
          for (const value of Object.values(record)) {
            if (Array.isArray(value)) {
              for (const item of value) {
                search(item);
              }
            } else if (typeof value === 'object') {
              search(value);
            }
          }
        }

        search(obj);
        return paragraphs;
      }

      const paragraphs = findParagraphs(txBody);
      let lineOffset = 0;

      for (const para of paragraphs) {
        let text = '';
        let fontSize = 18;
        let bold = false;

        // Extract text runs from paragraph
        function extractRuns(obj: unknown) {
          if (!obj || typeof obj !== 'object') return;

          const record = obj as Record<string, unknown>;

          // Check if this is a text run
          if ('a:t' in record) {
            text += String(record['a:t']);

            // Check formatting in a:rPr
            if (record['a:rPr']) {
              const props = record['a:rPr'] as Record<string, unknown>;
              if (props['@_sz']) {
                fontSize = parseInt(String(props['@_sz']), 10) / 100;
              }
              if (props['@_b'] === '1') {
                bold = true;
              }
            }
          }

          // Recursively search
          for (const value of Object.values(record)) {
            if (Array.isArray(value)) {
              for (const item of value) {
                extractRuns(item);
              }
            } else if (typeof value === 'object') {
              extractRuns(value);
            }
          }
        }

        extractRuns(para);

        if (text.trim()) {
          // Calculate Y position: flip Y (PPTX is top-down, PDF is bottom-up)
          const y = slideHeight - position.y - fontSize - lineOffset;

          texts.push({
            text: text.trim(),
            x: position.x,
            y: y,
            fontSize,
            bold,
          });

          lineOffset += fontSize * 1.5; // Line spacing
        }
      }
    }

    // Process all shapes
    const shapes = findAllShapes(slide);
    for (const shape of shapes) {
      extractTextsFromShape(shape);
    }

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
