import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

export interface RedactArea {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function redactPdf(
  pdfBuffer: Uint8Array,
  areas: RedactArea[]
): Promise<Uint8Array> {
  try {
    const doc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const pages = doc.getPages();

    // Group areas by page
    const areasByPage = new Map<number, RedactArea[]>();
    for (const area of areas) {
      if (area.pageIndex < 0 || area.pageIndex >= pages.length) {
        continue;
      }
      const pageAreas = areasByPage.get(area.pageIndex) || [];
      pageAreas.push(area);
      areasByPage.set(area.pageIndex, pageAreas);
    }

    // Apply redaction to each page
    for (const [pageIndex, pageAreas] of areasByPage) {
      const page = pages[pageIndex];
      const { width, height } = page.getSize();

      for (const area of pageAreas) {
        // Draw a white rectangle over the redacted area
        // Note: This is visual redaction. True redaction would require
        // removing the underlying content stream objects.
        page.drawRectangle({
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          color: rgb(0, 0, 0), // Black redaction box
          opacity: 1,
        });
      }
    }

    return await doc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to redact PDF: ${error.message}`);
    }
    throw new Error('Failed to redact PDF');
  }
}

// Helper function to get page dimensions
export async function getPageDimensions(
  pdfBuffer: Uint8Array,
  pageIndex: number
): Promise<{ width: number; height: number } | null> {
  try {
    const doc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const pages = doc.getPages();
    if (pageIndex < 0 || pageIndex >= pages.length) {
      return null;
    }

    return pages[pageIndex].getSize();
  } catch {
    return null;
  }
}
