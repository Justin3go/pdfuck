import type { PdfToolDefinition } from '@/config/pdf-tools';
import { LocaleLink } from '@/i18n/navigation';

interface ToolCardProps {
  tool: PdfToolDefinition;
  name: string;
  description: string;
}

export function ToolCard({ tool, name, description }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <LocaleLink href={`/tools/${tool.slug}`} className="group block h-full">
      <div className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm hover:border-foreground/20">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-6 text-primary" />
        </div>
        <h3 className="mb-2 text-base font-semibold">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </LocaleLink>
  );
}
