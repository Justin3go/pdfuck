import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { initPdfWorker } from './worker-setup';

interface CellData {
  text: string;
  row: number;
  col: number;
}

export async function pdfToExcel(pdfBuffer: Uint8Array): Promise<Blob> {
  initPdfWorker();

  const dataCopy = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: dataCopy }).promise;

  const workbook = XLSX.utils.book_new();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group text items by their vertical position (rows)
    const rows = new Map<number, { text: string; x: number }[]>();

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const transform = item.transform;
        const y = Math.round(transform[5] / 10) * 10; // Group by 10-unit buckets
        const x = transform[4];

        if (!rows.has(y)) {
          rows.set(y, []);
        }
        rows.get(y)!.push({ text: item.str.trim(), x });
      }
    }

    // Sort rows by Y position (top to bottom)
    const sortedRows = Array.from(rows.entries())
      .sort((a, b) => b[0] - a[0]) // Reverse Y order (PDF coordinates)
      .map(([, items]) => items);

    // Convert to 2D array for Excel
    const sheetData: string[][] = [];

    for (const row of sortedRows) {
      // Sort items in row by X position (left to right)
      row.sort((a, b) => a.x - b.x);

      const rowData: string[] = [];
      let lastX = -100;

      for (const item of row) {
        // Add empty cells for spacing
        const gap = Math.floor((item.x - lastX) / 50);
        for (let j = 0; j < Math.min(gap, 10); j++) {
          rowData.push('');
        }
        rowData.push(item.text);
        lastX = item.x;
      }

      if (rowData.length > 0) {
        sheetData.push(rowData);
      }
    }

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-size columns
    const colWidths: number[] = [];
    for (const row of sheetData) {
      for (let j = 0; j < row.length; j++) {
        const cellLength = row[j]?.length || 0;
        colWidths[j] = Math.max(colWidths[j] || 0, Math.min(cellLength, 50));
      }
    }
    worksheet['!cols'] = colWidths.map((w) => ({ wch: Math.max(w, 10) }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i}`);
  }

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
