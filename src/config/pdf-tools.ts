import {
  ArrowUpDownIcon,
  CombineIcon,
  FileOutputIcon,
  HashIcon,
  ImageIcon,
  ImagePlusIcon,
  type LucideIcon,
  MinimizeIcon,
  RotateCwIcon,
  ScissorsIcon,
  StampIcon,
} from 'lucide-react';

export type PdfToolCategory = 'organize' | 'convert' | 'edit';

export interface PdfToolDefinition {
  slug: string;
  icon: LucideIcon;
  category: PdfToolCategory;
  i18nKey: string;
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
    slug: 'pdf-to-images',
    icon: ImageIcon,
    category: 'convert',
    i18nKey: 'pdfToImages',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['application/pdf'],
    multipleFiles: false,
  },
  {
    slug: 'images-to-pdf',
    icon: ImagePlusIcon,
    category: 'convert',
    i18nKey: 'imagesToPdf',
    faqCount: 5,
    useCaseCount: 4,
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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
];

export function getPdfToolBySlug(slug: string): PdfToolDefinition | undefined {
  return PDF_TOOLS.find((t) => t.slug === slug);
}

export function getAllPdfToolSlugs(): string[] {
  return PDF_TOOLS.map((t) => t.slug);
}

export const PDF_TOOL_CATEGORIES: {
  key: PdfToolCategory;
  i18nKey: string;
}[] = [
  { key: 'organize', i18nKey: 'organize' },
  { key: 'convert', i18nKey: 'convert' },
  { key: 'edit', i18nKey: 'edit' },
];
