import PptxGenJS from 'pptxgenjs';
import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from './worker-setup';

// Standard PPTX slide height in inches (16:9 aspect ratio)
const SLIDE_HEIGHT_INCHES = 7.5;
const SLIDE_WIDTH_INCHES = 13.333;
const HEADER_OFFSET = 0.5;
const LINE_HEIGHT = 0.4; // Approximate line height in inches

export async function pdfToPptx(pdfBuffer: Uint8Array): Promise<Blob> {
  initPdfWorker();

  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;

  const pres = new PptxGenJS();

  // Set presentation properties
  pres.author = 'PDFuck';
  pres.title = 'Converted from PDF';
  pres.subject = 'PDF to PPTX Conversion';

  // Set standard 16:9 slide size
  pres.defineLayout({
    name: 'LAYOUT_16x9',
    width: SLIDE_WIDTH_INCHES,
    height: SLIDE_HEIGHT_INCHES,
  });
  pres.layout = 'LAYOUT_16x9';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });

    // Group text items by their vertical position
    const textGroups: { y: number; items: typeof textContent.items }[] = [];
    let currentGroup: typeof textContent.items = [];
    let lastY: number | null = null;
    const lineThreshold = 15;

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const transform = item.transform;
        const y = transform[5];

        if (lastY !== null && Math.abs(y - lastY) > lineThreshold) {
          if (currentGroup.length > 0) {
            textGroups.push({ y: lastY, items: [...currentGroup] });
            currentGroup = [];
          }
        }

        currentGroup.push(item);
        lastY = y;
      }
    }

    if (currentGroup.length > 0 && lastY !== null) {
      textGroups.push({ y: lastY, items: currentGroup });
    }

    // Sort groups by Y position (top to bottom in PDF coordinates)
    // PDF Y is from bottom, so larger Y means lower on the page
    textGroups.sort((a, b) => b.y - a.y);

    // Group text into slides based on content height
    const slideGroups: (typeof textGroups)[] = [];
    let currentSlideGroups: typeof textGroups = [];
    let currentSlideHeight = HEADER_OFFSET;

    for (const group of textGroups) {
      const groupHeight = LINE_HEIGHT;

      if (currentSlideHeight + groupHeight > SLIDE_HEIGHT_INCHES - 0.5) {
        // Start a new slide
        if (currentSlideGroups.length > 0) {
          slideGroups.push(currentSlideGroups);
        }
        currentSlideGroups = [group];
        currentSlideHeight = HEADER_OFFSET + groupHeight;
      } else {
        currentSlideGroups.push(group);
        currentSlideHeight += groupHeight;
      }
    }

    if (currentSlideGroups.length > 0) {
      slideGroups.push(currentSlideGroups);
    }

    // Create slides with paginated content
    for (let slideIndex = 0; slideIndex < slideGroups.length; slideIndex++) {
      const slide = pres.addSlide();
      const groups = slideGroups[slideIndex];

      // Add page number header
      const pageLabel =
        slideGroups.length > 1
          ? `Page ${i} of ${pdf.numPages} (${slideIndex + 1}/${slideGroups.length})`
          : `Page ${i} of ${pdf.numPages}`;

      slide.addText(pageLabel, {
        x: 0.5,
        y: 0.2,
        w: SLIDE_WIDTH_INCHES - 1,
        h: 0.3,
        fontSize: 12,
        color: '666666',
        align: 'right',
      });

      // Calculate scale factor to fit PDF width to slide width
      const pdfWidthInches = viewport.width / 72;
      const scaleFactor = SLIDE_WIDTH_INCHES / pdfWidthInches;

      // Add text groups to slide with adjusted Y positions
      let currentY = HEADER_OFFSET + 0.3;

      for (const group of groups) {
        // Sort items in group by X position
        group.items.sort((a, b) => {
          const aX = 'transform' in a ? a.transform[4] : 0;
          const bX = 'transform' in b ? b.transform[4] : 0;
          return aX - bX;
        });

        const text = group.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .trim();

        if (text) {
          // Calculate X position based on first item's transform
          const firstItem = group.items[0];
          const pdfX = 'transform' in firstItem ? firstItem.transform[4] : 0;
          const pptxX = (pdfX / 72) * scaleFactor;

          slide.addText(text, {
            x: Math.max(pptxX, 0.3),
            y: currentY,
            w: SLIDE_WIDTH_INCHES - pptxX - 0.6,
            h: LINE_HEIGHT,
            fontSize: 14,
            fontFace: 'Arial',
            color: '000000',
            valign: 'top',
            wrap: true,
          });

          currentY += LINE_HEIGHT;
        }
      }
    }
  }

  // Generate PPTX blob
  return pres.write({ outputType: 'blob' }) as Promise<Blob>;
}
