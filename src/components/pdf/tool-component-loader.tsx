'use client';

import { getPdfToolBySlug } from '@/config/pdf-tools';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const toolComponents: Record<string, React.ComponentType> = {
  'merge-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/merge-pdf').then((m) => ({
        default: m.MergePdfTool,
      })),
    { ssr: false }
  ),
  'split-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/split-pdf').then((m) => ({
        default: m.SplitPdfTool,
      })),
    { ssr: false }
  ),
  'compress-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/compress-pdf').then((m) => ({
        default: m.CompressPdfTool,
      })),
    { ssr: false }
  ),
  'rotate-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/rotate-pdf').then((m) => ({
        default: m.RotatePdfTool,
      })),
    { ssr: false }
  ),
  'pdf-to-png': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-png').then((m) => ({
        default: m.PdfToPngTool,
      })),
    { ssr: false }
  ),
  'pdf-to-jpg': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-jpg').then((m) => ({
        default: m.PdfToJpgTool,
      })),
    { ssr: false }
  ),
  'pdf-to-webp': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-webp').then((m) => ({
        default: m.PdfToWebpTool,
      })),
    { ssr: false }
  ),
  'png-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/png-to-pdf').then((m) => ({
        default: m.PngToPdfTool,
      })),
    { ssr: false }
  ),
  'jpg-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/jpg-to-pdf').then((m) => ({
        default: m.JpgToPdfTool,
      })),
    { ssr: false }
  ),
  'webp-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/webp-to-pdf').then((m) => ({
        default: m.WebpToPdfTool,
      })),
    { ssr: false }
  ),
  'watermark-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/watermark-pdf').then((m) => ({
        default: m.WatermarkPdfTool,
      })),
    { ssr: false }
  ),
  'page-numbers': dynamic(
    () =>
      import('@/components/pdf/tools/page-numbers-pdf').then((m) => ({
        default: m.PageNumbersPdfTool,
      })),
    { ssr: false }
  ),
  'reorder-pages': dynamic(
    () =>
      import('@/components/pdf/tools/reorder-pdf').then((m) => ({
        default: m.ReorderPdfTool,
      })),
    { ssr: false }
  ),
  'extract-pages': dynamic(
    () =>
      import('@/components/pdf/tools/extract-pages-pdf').then((m) => ({
        default: m.ExtractPagesPdfTool,
      })),
    { ssr: false }
  ),
};

interface ToolComponentLoaderProps {
  slug: string;
}

export function ToolComponentLoader({
  slug,
}: ToolComponentLoaderProps): ReactNode {
  const tool = getPdfToolBySlug(slug);
  if (!tool) return null;

  const ToolComponent = toolComponents[slug];
  return ToolComponent ? <ToolComponent /> : null;
}
