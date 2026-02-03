import {
  ArrowDownUpIcon,
  ArrowUpDownIcon,
  CombineIcon,
  CropIcon,
  EraserIcon,
  FileOutputIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileType2Icon,
  FileTypeIcon,
  GitCompareIcon,
  HashIcon,
  ImageIcon,
  ImagePlusIcon,
  LayersIcon,
  LockIcon,
  LockOpenIcon,
  type LucideIcon,
  MinimizeIcon,
  PencilLineIcon,
  PresentationIcon,
  RotateCwIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  StampIcon,
  Trash2Icon,
} from 'lucide-react';

export type PdfToolCategory = 'organize' | 'convert' | 'edit' | 'security';

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
  | 'redactPdf';

export interface PdfToolDefinition {
  slug: string;
  icon: LucideIcon;
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
    icon: CombineIcon,
    category: 'organize',
    i18nKey: 'mergePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: true,
  },
  {
    slug: 'split-pdf',
    icon: ScissorsIcon,
    category: 'organize',
    i18nKey: 'splitPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'compress-pdf',
    icon: MinimizeIcon,
    category: 'edit',
    i18nKey: 'compressPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'rotate-pdf',
    icon: RotateCwIcon,
    category: 'organize',
    i18nKey: 'rotatePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-png',
    icon: ImageIcon,
    category: 'convert',
    i18nKey: 'pdfToPng',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-jpg',
    icon: ImageIcon,
    category: 'convert',
    i18nKey: 'pdfToJpg',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-webp',
    icon: ImageIcon,
    category: 'convert',
    i18nKey: 'pdfToWebp',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'png-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'pngToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/png'],
    multipleFiles: true,
  },
  {
    slug: 'jpg-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'jpgToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/jpeg'],
    multipleFiles: true,
  },
  {
    slug: 'webp-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'webpToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/webp'],
    multipleFiles: true,
  },
  {
    slug: 'watermark-pdf',
    icon: StampIcon,
    category: 'edit',
    i18nKey: 'watermarkPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'page-numbers',
    icon: HashIcon,
    category: 'edit',
    i18nKey: 'pageNumbers',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'reorder-pages',
    icon: ArrowUpDownIcon,
    category: 'organize',
    i18nKey: 'reorderPages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'extract-pages',
    icon: FileOutputIcon,
    category: 'organize',
    i18nKey: 'extractPages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'delete-pages',
    icon: Trash2Icon,
    category: 'organize',
    i18nKey: 'deletePages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'reverse-pdf',
    icon: ArrowDownUpIcon,
    category: 'organize',
    i18nKey: 'reversePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-text',
    icon: FileTextIcon,
    category: 'convert',
    i18nKey: 'pdfToText',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'bmp-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'bmpToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/bmp'],
    multipleFiles: true,
  },
  {
    slug: 'gif-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'gifToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/gif'],
    multipleFiles: true,
  },
  {
    slug: 'svg-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'svgToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/svg+xml'],
    multipleFiles: true,
  },
  {
    slug: 'edit-metadata',
    icon: PencilLineIcon,
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
    icon: LayersIcon,
    category: 'edit',
    i18nKey: 'flattenPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-word',
    icon: FileTypeIcon,
    category: 'convert',
    i18nKey: 'pdfToWord',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-excel',
    icon: FileSpreadsheetIcon,
    category: 'convert',
    i18nKey: 'pdfToExcel',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'pdf-to-pptx',
    icon: PresentationIcon,
    category: 'convert',
    i18nKey: 'pdfToPptx',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'word-to-pdf',
    icon: FileType2Icon,
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
    icon: FileSpreadsheetIcon,
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
    icon: PresentationIcon,
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
    icon: PencilLineIcon,
    category: 'security',
    i18nKey: 'signPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'unlock-pdf',
    icon: LockOpenIcon,
    category: 'security',
    i18nKey: 'unlockPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'protect-pdf',
    icon: LockIcon,
    category: 'security',
    i18nKey: 'protectPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'compare-pdf',
    icon: GitCompareIcon,
    category: 'security',
    i18nKey: 'comparePdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: true,
  },
  {
    slug: 'redact-pdf',
    icon: EraserIcon,
    category: 'security',
    i18nKey: 'redactPdf',
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
