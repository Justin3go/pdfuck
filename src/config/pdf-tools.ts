import type { SVGProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BmpIcon,
  CompareIcon,
  CompressIcon,
  CropIcon,
  DeletePagesIcon,
  DuplicateIcon,
  EditMetadataIcon,
  ExcelIcon,
  ExtractIcon,
  FlattenIcon,
  GifIcon,
  HeaderFooterIcon,
  JpgIcon,
  MergeIcon,
  OcrIcon,
  PageNumberIcon,
  PdfIcon,
  PngIcon,
  PowerPointIcon,
  ProtectIcon,
  RedactIcon,
  ReorderIcon,
  ResizeIcon,
  ReverseIcon,
  RotateIcon,
  SanitizeIcon,
  SignIcon,
  SplitIcon,
  SvgIcon,
  TxtIcon,
  UnlockIcon,
  VerifyIcon,
  WatermarkIcon,
  WebpIcon,
  WordIcon,
} from '@/components/icons/file-icons';

export type PdfToolCategory = 'organize' | 'convert' | 'edit' | 'security';

// 支持 Lucide 图标和自定义彩色 SVG 图标
type IconComponent = LucideIcon | React.ComponentType<SVGProps<SVGSVGElement>>;

export type PdfToolI18nKey =
  | 'mergePdf'
  | 'splitPdf'
  | 'compressPdf'
  | 'rotatePdf'
  | 'pdfToPng'
  | 'pdfToJpg'
  | 'pdfToWebp'
  | 'pngToPdf'
  | 'jpgToPdf'
  | 'webpToPdf'
  | 'watermarkPdf'
  | 'pageNumbers'
  | 'reorderPages'
  | 'extractPages'
  | 'deletePages'
  | 'reversePdf'
  | 'pdfToText'
  | 'bmpToPdf'
  | 'gifToPdf'
  | 'svgToPdf'
  | 'editMetadata'
  | 'cropPdf'
  | 'flattenPdf'
  | 'pdfToWord'
  | 'pdfToExcel'
  | 'pdfToPptx'
  | 'wordToPdf'
  | 'excelToPdf'
  | 'pptxToPdf'
  | 'signPdf'
  | 'unlockPdf'
  | 'protectPdf'
  | 'comparePdf'
  | 'redactPdf'
  | 'duplicatePages'
  | 'headerFooter'
  | 'resizePdf'
  | 'ocrPdf'
  | 'sanitizePdf'
  | 'verifyPdf';

export interface PdfToolDefinition {
  slug: string;
  icon: IconComponent;
  // 格式转换工具的第二个图标（如 PDF 转 Word 会显示 PDF + Word 两个图标）
  icon2?: IconComponent;
  category: PdfToolCategory;
  i18nKey: PdfToolI18nKey;
  faqCount: number;
  useCaseCount: number;
  acceptedMimeTypes: string[];
  multipleFiles: boolean;
}

export const PDF_TOOLS: PdfToolDefinition[] = [
  {
    slug: 'merge-pdf',
    icon: MergeIcon,
    category: 'organize',
    i18nKey: 'mergePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: true,
  },
  {
    slug: 'split-pdf',
    icon: SplitIcon,
    category: 'organize',
    i18nKey: 'splitPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'compress-pdf',
    icon: CompressIcon,
    category: 'edit',
    i18nKey: 'compressPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'rotate-pdf',
    icon: RotateIcon,
    category: 'organize',
    i18nKey: 'rotatePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-png',
    icon: PdfIcon,
    icon2: PngIcon,
    category: 'convert',
    i18nKey: 'pdfToPng',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-jpg',
    icon: PdfIcon,
    icon2: JpgIcon,
    category: 'convert',
    i18nKey: 'pdfToJpg',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-webp',
    icon: PdfIcon,
    icon2: WebpIcon,
    category: 'convert',
    i18nKey: 'pdfToWebp',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'png-to-pdf',
    icon: PngIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'pngToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/png'],
    multipleFiles: true,
  },
  {
    slug: 'jpg-to-pdf',
    icon: JpgIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'jpgToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/jpeg'],
    multipleFiles: true,
  },
  {
    slug: 'webp-to-pdf',
    icon: WebpIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'webpToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/webp'],
    multipleFiles: true,
  },
  {
    slug: 'watermark-pdf',
    icon: WatermarkIcon,
    category: 'edit',
    i18nKey: 'watermarkPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'page-numbers',
    icon: PageNumberIcon,
    category: 'edit',
    i18nKey: 'pageNumbers',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'reorder-pages',
    icon: ReorderIcon,
    category: 'organize',
    i18nKey: 'reorderPages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'extract-pages',
    icon: ExtractIcon,
    category: 'organize',
    i18nKey: 'extractPages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'delete-pages',
    icon: DeletePagesIcon,
    category: 'organize',
    i18nKey: 'deletePages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'reverse-pdf',
    icon: ReverseIcon,
    category: 'organize',
    i18nKey: 'reversePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-text',
    icon: PdfIcon,
    icon2: TxtIcon,
    category: 'convert',
    i18nKey: 'pdfToText',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'bmp-to-pdf',
    icon: BmpIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'bmpToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/bmp'],
    multipleFiles: true,
  },
  {
    slug: 'gif-to-pdf',
    icon: GifIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'gifToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/gif'],
    multipleFiles: true,
  },
  {
    slug: 'svg-to-pdf',
    icon: SvgIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'svgToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/svg+xml'],
    multipleFiles: true,
  },
  {
    slug: 'edit-metadata',
    icon: EditMetadataIcon,
    category: 'edit',
    i18nKey: 'editMetadata',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'crop-pdf',
    icon: CropIcon,
    category: 'edit',
    i18nKey: 'cropPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'flatten-pdf',
    icon: FlattenIcon,
    category: 'edit',
    i18nKey: 'flattenPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-word',
    icon: PdfIcon,
    icon2: WordIcon,
    category: 'convert',
    i18nKey: 'pdfToWord',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-excel',
    icon: PdfIcon,
    icon2: ExcelIcon,
    category: 'convert',
    i18nKey: 'pdfToExcel',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-pptx',
    icon: PdfIcon,
    icon2: PowerPointIcon,
    category: 'convert',
    i18nKey: 'pdfToPptx',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'word-to-pdf',
    icon: WordIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'wordToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
    multipleFiles: false,
  },
  {
    slug: 'excel-to-pdf',
    icon: ExcelIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'excelToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    multipleFiles: false,
  },
  {
    slug: 'pptx-to-pdf',
    icon: PowerPointIcon,
    icon2: PdfIcon,
    category: 'convert',
    i18nKey: 'pptxToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
    ],
    multipleFiles: false,
  },
  {
    slug: 'sign-pdf',
    icon: SignIcon,
    category: 'security',
    i18nKey: 'signPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'unlock-pdf',
    icon: UnlockIcon,
    category: 'security',
    i18nKey: 'unlockPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'protect-pdf',
    icon: ProtectIcon,
    category: 'security',
    i18nKey: 'protectPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'compare-pdf',
    icon: CompareIcon,
    category: 'security',
    i18nKey: 'comparePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: true,
  },
  {
    slug: 'redact-pdf',
    icon: RedactIcon,
    category: 'security',
    i18nKey: 'redactPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'duplicate-pages',
    icon: DuplicateIcon,
    category: 'organize',
    i18nKey: 'duplicatePages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'header-footer',
    icon: HeaderFooterIcon,
    category: 'edit',
    i18nKey: 'headerFooter',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'resize-pdf',
    icon: ResizeIcon,
    category: 'edit',
    i18nKey: 'resizePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'ocr-pdf',
    icon: OcrIcon,
    category: 'security',
    i18nKey: 'ocrPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'sanitize-pdf',
    icon: SanitizeIcon,
    category: 'security',
    i18nKey: 'sanitizePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'verify-pdf',
    icon: VerifyIcon,
    category: 'security',
    i18nKey: 'verifyPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
];

export function getPdfToolBySlug(slug: string): PdfToolDefinition | undefined {
  return PDF_TOOLS.find((t) => t.slug === slug);
}

export function getAllPdfToolSlugs(): string[] {
  return PDF_TOOLS.map((t) => t.slug);
}

export const PDF_TOOL_CATEGORIES = [
  { key: 'organize', i18nKey: 'organize' },
  { key: 'convert', i18nKey: 'convert' },
  { key: 'edit', i18nKey: 'edit' },
  { key: 'security', i18nKey: 'security' },
] as const;
