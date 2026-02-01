'use client';

import { PDF_TOOLS, PDF_TOOL_CATEGORIES } from '@/config/pdf-tools';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Get navbar config with translations
 *
 * NOTICE: used in client components only
 *
 * PDFuck navbar with each PDF tool category as a top-level nav item
 *
 * @returns The navbar config with translated titles and tool links
 */
export function useNavbarLinks(): NestedMenuItem[] {
  const t = useTranslations('ToolsPage');

  // Build nav items for each PDF tool category
  const navLinks: NestedMenuItem[] = PDF_TOOL_CATEGORIES.map(
    ({ key, i18nKey }) => {
      const toolsInCategory = PDF_TOOLS.filter((tool) => tool.category === key);

      return {
        title: t(`categories.${i18nKey}`),
        items: toolsInCategory.map((tool) => ({
          title: t(`tools.${tool.i18nKey}.name`),
          description: t(`tools.${tool.i18nKey}.description`),
          href: `${Routes.Tools}/${tool.slug}`,
          external: false,
        })),
      };
    }
  );

  return navLinks;
}
