'use client';

import { PDF_TOOLS, PDF_TOOL_CATEGORIES } from '@/config/pdf-tools';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * PDFuck footer with PDF tools organized by category
 *
 * @returns The footer config with translated titles
 */
export function useFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('ToolsPage');

  // Build footer sections organized by category
  const footerLinks: NestedMenuItem[] = [];

  // Add each category as a section
  PDF_TOOL_CATEGORIES.forEach(({ key, i18nKey }) => {
    const toolsInCategory = PDF_TOOLS.filter((tool) => tool.category === key);
    if (toolsInCategory.length === 0) return;

    footerLinks.push({
      title: t(`categories.${i18nKey}`),
      items: toolsInCategory.map((tool) => ({
        title: t(`tools.${tool.i18nKey}.name`),
        href: `${Routes.Tools}/${tool.slug}`,
        external: false,
      })),
    });
  });

  return footerLinks;
}
