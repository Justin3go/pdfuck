import { ToolLayout } from '@/components/pdf/tool-layout';
import { ToolComponentLoader } from '@/components/pdf/tool-component-loader';
import { getAllPdfToolSlugs, getPdfToolBySlug } from '@/config/pdf-tools';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  const slugs = getAllPdfToolSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getPdfToolBySlug(slug);
  if (!tool) return {};

  const t = await getTranslations({
    locale,
    namespace: 'ToolsPage',
  });

  return constructMetadata({
    title: t(`tools.${tool.i18nKey}.metaTitle`),
    description: t(`tools.${tool.i18nKey}.metaDescription`),
    locale,
    pathname: `/tools/${slug}`,
  });
}

interface ToolPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getPdfToolBySlug(slug);
  if (!tool) notFound();

  const t = await getTranslations('ToolsPage');

  const faqs = Array.from({ length: tool.faqCount }, (_, i) => {
    const n = (i + 1) as 1 | 2 | 3 | 4 | 5;
    return {
      question: t(`tools.${tool.i18nKey}.faq.item-${n}.question`),
      answer: t(`tools.${tool.i18nKey}.faq.item-${n}.answer`),
    };
  });

  const useCases = Array.from({ length: tool.useCaseCount }, (_, i) => {
    const n = (i + 1) as 1 | 2 | 3 | 4;
    return {
      title: t(`tools.${tool.i18nKey}.useCases.item-${n}.title`),
      description: t(`tools.${tool.i18nKey}.useCases.item-${n}.description`),
    };
  });

  return (
    <ToolLayout
      tool={tool}
      name={t(`tools.${tool.i18nKey}.name`)}
      longDescription={t(`tools.${tool.i18nKey}.longDescription`)}
      faqs={faqs}
      useCases={useCases}
      faqSectionTitle={t('common.faqTitle')}
      useCasesSectionTitle={t('common.useCasesTitle')}
      privacyNote={t('common.privacy')}
    >
      <ToolComponentLoader slug={slug} />
    </ToolLayout>
  );
}
