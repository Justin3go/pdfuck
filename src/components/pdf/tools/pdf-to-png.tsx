'use client';

import { PdfToFormatTool } from './pdf-to-format-tool';

export function PdfToPngTool() {
  return (
    <PdfToFormatTool
      format="image/png"
      fileExtension="png"
      i18nKey="pdfToPng"
    />
  );
}
