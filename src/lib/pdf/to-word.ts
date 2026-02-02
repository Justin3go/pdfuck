import * as pdfjsLib from 'pdfjs-dist';
import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { initPdfWorker } from './worker-setup';

export async function pdfToWord(pdfBuffer: Uint8Array): Promise<Blob> {
  initPdfWorker();

  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;

  const children: Paragraph[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Add page header
    children.push(
      new Paragraph({
        text: `Page ${i}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    );

    // Process text items
    const items = textContent.items;
    let currentParagraph: string[] = [];
    let lastY: number | null = null;
    const lineThreshold = 5; // Threshold for detecting new lines

    for (const item of items) {
      if ('str' in item && item.str.trim()) {
        const transform = item.transform;
        const currentY = transform[5];

        // Check if this is a new line
        if (lastY !== null && Math.abs(currentY - lastY) > lineThreshold) {
          if (currentParagraph.length > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: currentParagraph.join(' '),
                    font: 'Arial',
                    size: 22, // 11pt
                  }),
                ],
                spacing: { after: 120 },
              })
            );
            currentParagraph = [];
          }
        }

        currentParagraph.push(item.str);
        lastY = currentY;
      }
    }

    // Add remaining text
    if (currentParagraph.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: currentParagraph.join(' '),
              font: 'Arial',
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }

    // Add page break between pages
    if (i < pdf.numPages) {
      children.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
