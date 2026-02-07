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
import { AnchorLink } from '@/components/ui/anchor-link';
import './hero-gradient.css';

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
      <section className="relative overflow-hidden px-4 pt-24 pb-8 sm:pt-32 sm:pb-10 hero-tyndall min-h-screen flex flex-col">
        {/* Tyndall Effect Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Main spotlight from top-left - brighter core */}
          <div
            className="absolute -top-40 -left-40 w-[1200px] h-[1200px]"
            style={{
              background: `radial-gradient(ellipse at 0% 0%,
                hsl(0 0% 95% / 0.9) 0%,
                hsl(0 0% 90% / 0.5) 8%,
                hsl(0 0% 85% / 0.25) 18%,
                hsl(0 0% 80% / 0.12) 30%,
                hsl(0 0% 75% / 0.05) 45%,
                transparent 65%)`,
              transform: 'rotate(-25deg)',
            }}
          />
          {/* Light beam rays - more defined rays */}
          <div
            className="absolute -top-10 -left-10 w-[900px] h-[900px]"
            style={{
              background: `conic-gradient(from 210deg at 0% 0%,
                transparent 0deg,
                hsl(0 0% 92% / 0.4) 5deg,
                hsl(0 0% 88% / 0.15) 12deg,
                transparent 20deg,
                transparent 32deg,
                hsl(0 0% 90% / 0.3) 38deg,
                hsl(0 0% 85% / 0.1) 48deg,
                transparent 58deg,
                transparent 72deg,
                hsl(0 0% 88% / 0.2) 78deg,
                hsl(0 0% 82% / 0.08) 88deg,
                transparent 98deg)`,
            }}
          />
          {/* Soft glow overlay */}
          <div
            className="absolute -top-20 -left-20 w-[800px] h-[800px]"
            style={{
              background: `radial-gradient(circle at 0% 0%,
                hsl(0 0% 95% / 0.25) 0%,
                hsl(0 0% 90% / 0.1) 30%,
                transparent 55%)`,
            }}
          />
          {/* Subtle ambient wash */}
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `linear-gradient(165deg,
                hsl(0 0% 95% / 0.08) 0%,
                hsl(0 0% 90% / 0.03) 25%,
                transparent 50%)`,
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl text-center relative z-10 flex-1 flex flex-col">
          {/* 指示器 - 保持原来位置 */}
          <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground mb-6 backdrop-blur-sm self-center">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            {t('hero.privacy')}
          </div>

          {/* 中间内容区域 - 垂直居中 */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            <h1 className="hero-title-gradient text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl pb-2">
              {t('hero.title')}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base"
                asChild
              >
                <AnchorLink href="#tools">
                  {t('tools.title')} <ArrowRight className="ml-2 h-4 w-4" />
                </AnchorLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base"
                asChild
              >
                <AnchorLink href="#faqs">{t('faqs.title')}</AnchorLink>
              </Button>
            </div>
          </div>

          {/* Features Cards - 移到 Hero 区域内共享背景 */}
          <div className="mt-auto pt-16 mx-auto max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">
                    {t('features.fast.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('features.fast.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">
                    {t('features.secure.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('features.secure.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">
                    {t('features.free.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('features.free.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="px-4 py-20 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {t('tools.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('tools.subtitle', { count: PDF_TOOLS.length })}
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
                        description={tTools(
                          `tools.${tool.i18nKey}.description`
                        )}
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
      <section className="border-t bg-muted px-4 py-20">
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
      <section id="faqs" className="px-4 py-20 bg-background">
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
              <Card key={i}>
                <CardHeader>
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
