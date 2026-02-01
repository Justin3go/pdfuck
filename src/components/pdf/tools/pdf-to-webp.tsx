'use client';

import { PdfToFormatTool } from './pdf-to-format-tool';

export function PdfToWebpTool() {
  return (
    <PdfToFormatTool
      format="image/webp"
      fileExtension="webp"
      i18nKey="pdfToWebp"
    />
  );
}
