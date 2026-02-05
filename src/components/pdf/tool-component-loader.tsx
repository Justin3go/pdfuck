'use client';

import { getPdfToolBySlug } from '@/config/pdf-tools';
import { Loader2Icon } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

function ToolSkeleton() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-card">
      <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

const toolComponents: Record<string, React.ComponentType> = {
  'merge-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/merge-pdf').then((m) => ({
        default: m.MergePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'split-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/split-pdf').then((m) => ({
        default: m.SplitPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'compress-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/compress-pdf').then((m) => ({
        default: m.CompressPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'rotate-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/rotate-pdf').then((m) => ({
        default: m.RotatePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-png': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-png').then((m) => ({
        default: m.PdfToPngTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-jpg': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-jpg').then((m) => ({
        default: m.PdfToJpgTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-webp': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-webp').then((m) => ({
        default: m.PdfToWebpTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'png-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/png-to-pdf').then((m) => ({
        default: m.PngToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'jpg-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/jpg-to-pdf').then((m) => ({
        default: m.JpgToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'webp-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/webp-to-pdf').then((m) => ({
        default: m.WebpToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'watermark-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/watermark-pdf').then((m) => ({
        default: m.WatermarkPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'page-numbers': dynamic(
    () =>
      import('@/components/pdf/tools/page-numbers-pdf').then((m) => ({
        default: m.PageNumbersPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'reorder-pages': dynamic(
    () =>
      import('@/components/pdf/tools/reorder-pdf').then((m) => ({
        default: m.ReorderPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'extract-pages': dynamic(
    () =>
      import('@/components/pdf/tools/extract-pages-pdf').then((m) => ({
        default: m.ExtractPagesPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'delete-pages': dynamic(
    () =>
      import('@/components/pdf/tools/delete-pages-pdf').then((m) => ({
        default: m.DeletePagesPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'reverse-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/reverse-pdf').then((m) => ({
        default: m.ReversePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-text': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-text').then((m) => ({
        default: m.PdfToTextTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'bmp-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/bmp-to-pdf').then((m) => ({
        default: m.BmpToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'gif-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/gif-to-pdf').then((m) => ({
        default: m.GifToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'svg-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/svg-to-pdf').then((m) => ({
        default: m.SvgToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'edit-metadata': dynamic(
    () =>
      import('@/components/pdf/tools/edit-metadata-pdf').then((m) => ({
        default: m.EditMetadataPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'crop-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/crop-pdf').then((m) => ({
        default: m.CropPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'flatten-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/flatten-pdf').then((m) => ({
        default: m.FlattenPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-word': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-word').then((m) => ({
        default: m.PdfToWordTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-excel': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-excel').then((m) => ({
        default: m.PdfToExcelTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pdf-to-pptx': dynamic(
    () =>
      import('@/components/pdf/tools/pdf-to-pptx').then((m) => ({
        default: m.PdfToPptxTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'word-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/word-to-pdf').then((m) => ({
        default: m.WordToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'excel-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/excel-to-pdf').then((m) => ({
        default: m.ExcelToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'pptx-to-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/pptx-to-pdf').then((m) => ({
        default: m.PptxToPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'sign-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/sign-pdf').then((m) => ({
        default: m.SignPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'unlock-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/unlock-pdf').then((m) => ({
        default: m.UnlockPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'protect-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/protect-pdf').then((m) => ({
        default: m.ProtectPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'compare-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/compare-pdf').then((m) => ({
        default: m.ComparePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'redact-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/redact-pdf').then((m) => ({
        default: m.RedactPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'duplicate-pages': dynamic(
    () =>
      import('@/components/pdf/tools/duplicate-pages-pdf').then((m) => ({
        default: m.DuplicatePagesPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'header-footer': dynamic(
    () =>
      import('@/components/pdf/tools/header-footer-pdf').then((m) => ({
        default: m.HeaderFooterPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'resize-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/resize-pdf').then((m) => ({
        default: m.ResizePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'ocr-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/ocr-pdf').then((m) => ({
        default: m.OcrPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'sanitize-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/sanitize-pdf').then((m) => ({
        default: m.SanitizePdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
  ),
  'verify-pdf': dynamic(
    () =>
      import('@/components/pdf/tools/verify-pdf').then((m) => ({
        default: m.VerifyPdfTool,
      })),
    { ssr: false, loading: ToolSkeleton }
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
