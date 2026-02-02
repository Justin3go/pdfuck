import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function excelToPdf(excelBuffer: Uint8Array): Promise<Uint8Array> {
  // Parse Excel file
  const workbook = XLSX.read(excelBuffer, { type: 'array' });

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 10;
  const headerFontSize = 12;
  const lineHeight = 14;
  const cellPadding = 5;

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    if (data.length === 0) continue;

    // Calculate column widths
    const colWidths: number[] = [];
    for (const row of data) {
      for (let i = 0; i < row.length; i++) {
        const text = String(row[i] || '');
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        colWidths[i] = Math.max(colWidths[i] || 0, textWidth + cellPadding * 2);
      }
    }

    // Ensure minimum column width
    for (let i = 0; i < colWidths.length; i++) {
      colWidths[i] = Math.max(colWidths[i], 60);
    }

    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const pageWidth = Math.max(595.28, tableWidth + 100); // A4 width or wider if needed
    const pageHeight = 841.89;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    const margin = 50;
    let y = pageHeight - margin;

    // Add sheet name as title
    page.drawText(`Sheet: ${sheetName}`, {
      x: margin,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight * 2;

    let isFirstRow = true;

    for (const row of data) {
      // Check if we need a new page
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      let x = margin;

      for (let i = 0; i < row.length; i++) {
        const cellText = String(row[i] || '');
        const cellWidth = colWidths[i] || 60;

        // Draw cell border
        page.drawRectangle({
          x,
          y: y - lineHeight,
          width: cellWidth,
          height: lineHeight,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.5,
        });

        // Draw cell background for header
        if (isFirstRow) {
          page.drawRectangle({
            x,
            y: y - lineHeight,
            width: cellWidth,
            height: lineHeight,
            color: rgb(0.9, 0.9, 0.9),
          });
        }

        // Draw cell text
        page.drawText(cellText.substring(0, 100), {
          // Limit text length
          x: x + cellPadding,
          y: y - lineHeight + cellPadding,
          size: isFirstRow ? headerFontSize : fontSize,
          font: isFirstRow ? boldFont : font,
          color: rgb(0, 0, 0),
        });

        x += cellWidth;
      }

      y -= lineHeight;
      isFirstRow = false;
    }

    // Add spacing between sheets
    y -= lineHeight * 2;
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
