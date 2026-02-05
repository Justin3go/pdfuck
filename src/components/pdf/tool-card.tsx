import type { PdfToolDefinition } from '@/config/pdf-tools';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowRightIcon } from 'lucide-react';

interface ToolCardProps {
  tool: PdfToolDefinition;
  name: string;
  description: string;
}

export function ToolCard({ tool, name, description }: ToolCardProps) {
  const Icon = tool.icon;
  const Icon2 = tool.icon2;

  return (
    <LocaleLink href={`/tools/${tool.slug}`} className="group block h-full">
      <div className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm hover:border-foreground/20">
        <div className="mb-4 flex h-10 items-center">
          {Icon2 ? (
            <>
              <Icon className="size-8" />
              <ArrowRightIcon className="mx-1 size-4 text-muted-foreground" />
              <Icon2 className="size-8" />
            </>
          ) : (
            <Icon className="size-10" />
          )}
        </div>
        <h3 className="mb-2 text-base font-semibold">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </LocaleLink>
  );
}
