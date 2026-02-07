import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { PdfToolDefinition } from '@/config/pdf-tools';
import { ArrowRightIcon, ShieldCheckIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface UseCaseItem {
  title: string;
  description: string;
}

interface ToolLayoutProps {
  tool: PdfToolDefinition;
  name: string;
  longDescription: string;
  faqs: FaqItem[];
  useCases: UseCaseItem[];
  faqSectionTitle: string;
  useCasesSectionTitle: string;
  privacyNote: string;
  children: ReactNode;
}

export function ToolLayout({
  tool,
  name,
  longDescription,
  faqs,
  useCases,
  faqSectionTitle,
  useCasesSectionTitle,
  privacyNote,
  children,
}: ToolLayoutProps) {
  const Icon = tool.icon;
  const Icon2 = tool.icon2;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for SEO
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-12">
        {/* Hero */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 items-center justify-center">
              {Icon2 ? (
                <>
                  <Icon className="size-12" />
                  <ArrowRightIcon className="mx-2 size-6 text-muted-foreground" />
                  <Icon2 className="size-12" />
                </>
              ) : (
                <Icon className="size-14" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {longDescription}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheckIcon className="size-4" />
            <span>{privacyNote}</span>
          </div>
        </div>

        {/* Tool UI */}
        <div className="mx-auto mb-16 max-w-4xl">{children}</div>

        {/* Use Cases */}
        {useCases.length > 0 && (
          <section className="mx-auto mb-16 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              {useCasesSectionTitle}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {useCases.map((useCase, idx) => (
                <div key={idx} className="rounded-xl border bg-card p-6">
                  <h3 className="mb-2 font-semibold">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mx-auto mb-16 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              {faqSectionTitle}
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full rounded-xl border bg-card px-6"
            >
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border-dashed"
                >
                  <AccordionTrigger className="cursor-pointer text-left text-base hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-muted-foreground">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </div>
    </>
  );
}
