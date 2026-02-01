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
  'pdf-to-images': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-images').then((m) => ({
        default: m.PdfToImagesTool,
      })),
    { ssr: false }
  ),
  'images-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/images-to-pdf').then((m) => ({
        default: m.ImagesToPdfTool,
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
