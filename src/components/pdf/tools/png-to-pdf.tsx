'use client';

import { FormatToPdfTool } from './format-to-pdf-tool';

export function PngToPdfTool() {
  return <FormatToPdfTool acceptedMimeType="image/png" i18nKey="pngToPdf" />;
}
