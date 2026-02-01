'use client';

import { PdfToFormatTool } from './pdf-to-format-tool';

export function PdfToJpgTool() {
  return (
    <PdfToFormatTool
      format="image/jpeg"
      fileExtension="jpg"
      i18nKey="pdfToJpg"
    />
  );
}
