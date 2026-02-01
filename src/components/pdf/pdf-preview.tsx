'use client';

import type { PageThumbnail } from '@/lib/pdf/preview';
import { cn } from '@/lib/utils';

interface PdfPreviewProps {
  thumbnails: PageThumbnail[];
  selectedPages?: Set<number>;
  onPageClick?: (pageIndex: number) => void;
  className?: string;
}

export function PdfPreview({
  thumbnails,
  selectedPages,
  onPageClick,
  className,
}: PdfPreviewProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6',
        className
      )}
    >
      {thumbnails.map((thumb) => (
        <button
          key={thumb.pageIndex}
          type="button"
          onClick={() => onPageClick?.(thumb.pageIndex)}
          className={cn(
            'relative overflow-hidden rounded-lg border p-1',
            selectedPages?.has(thumb.pageIndex)
              ? 'border-primary ring-2 ring-primary/30'
              : 'border-muted hover:border-muted-foreground/50',
            onPageClick && 'cursor-pointer'
          )}
        >
          <img
            src={thumb.dataUrl}
            alt={`Page ${thumb.pageNumber}`}
            className="w-full"
          />
          <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium">
            {thumb.pageNumber}
          </span>
        </button>
      ))}
    </div>
  );
}
