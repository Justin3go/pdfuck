import { ToolCard } from '@/components/pdf/tool-card';
import { PDF_TOOLS, PDF_TOOL_CATEGORIES } from '@/config/pdf-tools';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'ToolsPage',
  });

  return constructMetadata({
    title: t('metaTitle'),
    description: t('metaDescription'),
    locale,
    pathname: '/tools',
  });
}

interface ToolsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('ToolsPage');

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('hero.title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t('hero.subtitle')}
        </p>
      </div>

      {/* Tool Grid by Category */}
      {PDF_TOOL_CATEGORIES.map(({ key, i18nKey }) => {
        const toolsInCategory = PDF_TOOLS.filter(
          (tool) => tool.category === key
        );
        if (toolsInCategory.length === 0) return null;
        return (
          <section key={key} className="mb-12">
            <h2 className="mb-6 text-xl font-semibold">
              {t(`categories.${i18nKey}`)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {toolsInCategory.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  name={t(`tools.${tool.i18nKey}.name`)}
                  description={t(`tools.${tool.i18nKey}.description`)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
