import { ToolCard } from '@/components/pdf/tool-card';
import { PDF_TOOLS, PDF_TOOL_CATEGORIES } from '@/config/pdf-tools';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { FileText, Shield, Zap, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-20 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            {t('hero.privacy')}
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl pb-2">
            {t('hero.title')}
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20" asChild>
              <Link href="#tools">
                {t('tools.title')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base" asChild>
               <Link href="#faqs">{t('faqs.title')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <Card className="relative overflow-hidden border bg-card shadow-sm transition-colors hover:border-foreground/20 group">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{t('features.fast.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('features.fast.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border bg-card shadow-sm transition-colors hover:border-foreground/20 group">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{t('features.secure.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('features.secure.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border bg-card shadow-sm transition-colors hover:border-foreground/20 group">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{t('features.free.title')}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('features.free.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {t('tools.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('tools.subtitle')}
            </p>
          </div>

          {/* Tool Grid by Category */}
          <div className="space-y-16">
            {PDF_TOOL_CATEGORIES.map(({ key, i18nKey }) => {
              const toolsInCategory = PDF_TOOLS.filter(
                (tool) => tool.category === key
              );
              if (toolsInCategory.length === 0) return null;
              return (
                <div key={key}>
                  <div className="flex items-center gap-4 mb-8">
                     <h3 className="text-2xl font-bold tracking-tight">
                      {tTools(`categories.${i18nKey}`)}
                    </h3>
                    <div className="h-px flex-1 bg-border/60"></div>
                  </div>
                 
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t bg-background px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('howItWorks.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-border z-0"></div>
            
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary shadow-lg text-xl font-bold text-primary mb-6 transition-transform hover:scale-110">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('howItWorks.step1.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {t('howItWorks.step1.description')}
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary shadow-lg text-xl font-bold text-primary mb-6 transition-transform hover:scale-110">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('howItWorks.step2.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {t('howItWorks.step2.description')}
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border-2 border-primary shadow-lg text-xl font-bold text-primary mb-6 transition-transform hover:scale-110">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('howItWorks.step3.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('faqs.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t('faqs.subtitle')}
            </p>
          </div>
          <div className="grid gap-4">
            {([1, 2, 3, 4, 5] as const).map((i) => (
              <Card
                key={i}
                className="overflow-hidden border bg-card shadow-sm transition-colors hover:border-foreground/20"
              >
                <CardHeader className="p-6">
                  <h3 className="font-semibold text-lg">
                    {t(`faqs.items.item-${i}.question`)}
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {t(`faqs.items.item-${i}.answer`)}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
