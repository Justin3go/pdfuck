'use client';

import { FormatToPdfTool } from './format-to-pdf-tool';

export function SvgToPdfTool() {
  return (
    <FormatToPdfTool acceptedMimeType="image/svg+xml" i18nKey="svgToPdf" />
  );
}
