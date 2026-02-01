import { ToolCard } from '@/components/pdf/tool-card';
import { PDF_TOOLS, PDF_TOOL_CATEGORIES } from '@/config/pdf-tools';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { FileText, Shield, Zap } from 'lucide-react';
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
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '',
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('HomePage');
  const tTools = await getTranslations('ToolsPage');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {t('hero.privacy')}
          </p>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y bg-muted/50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t('features.fast.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.fast.description')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">
                {t('features.secure.title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.secure.description')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t('features.free.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.free.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t('tools.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t('tools.subtitle')}
            </p>
          </div>

          {/* Tool Grid by Category */}
          {PDF_TOOL_CATEGORIES.map(({ key, i18nKey }) => {
            const toolsInCategory = PDF_TOOLS.filter(
              (tool) => tool.category === key
            );
            if (toolsInCategory.length === 0) return null;
            return (
              <div key={key} className="mb-12">
                <h3 className="mb-6 text-lg font-semibold">
                  {tTools(`categories.${i18nKey}`)}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {toolsInCategory.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      name={tTools(`tools.${tool.i18nKey}.name`)}
                      description={tTools(`tools.${tool.i18nKey}.description`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t('howItWorks.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <h3 className="mt-4 font-semibold">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('howItWorks.step1.description')}
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <h3 className="mt-4 font-semibold">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('howItWorks.step2.description')}
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <h3 className="mt-4 font-semibold">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('faq.title')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 text-card-foreground"
              >
                <h3 className="font-semibold">{t(`faq.item-${i}.question`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`faq.item-${i}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
