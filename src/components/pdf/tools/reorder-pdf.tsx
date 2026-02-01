'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import type { PageThumbnail } from '@/lib/pdf/preview';
import { reorderPdf } from '@/lib/pdf/reorder';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ReorderPdfTool() {
  const t = useTranslations('ToolsPage');
  const {
    files,
    status,
    error,
    resultBlobs,
    loadFiles,
    setStatus,
    setResultBlobs,
    setError,
    downloadBlob,
    reset,
  } = usePdfProcessor();

  const file = files[0];
  const [orderedThumbnails, setOrderedThumbnails] = useState<PageThumbnail[]>(
    []
  );

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    await loadFiles(fileList);
  };

  // Sync thumbnails when file loads
  if (file && orderedThumbnails.length === 0 && file.thumbnails.length > 0) {
    setOrderedThumbnails([...file.thumbnails]);
  }

  const handleReorder = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const newOrder = orderedThumbnails.map((t) => t.pageIndex);
      const result = await reorderPdf(file.buffer, newOrder);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-reordered.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
    }
  };

  const handleReset = () => {
    setOrderedThumbnails([]);
    reset();
  };

  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <Button
          onClick={() => downloadBlob(resultBlobs[0].blob, resultBlobs[0].name)}
        >
          {t('common.download')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/50 bg-card p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  if (!file) {
    return (
      <FileDropzone
        acceptedMimeTypes={['application/pdf']}
        multiple={false}
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        {t('common.dragToReorder')}
      </p>

      <Sortable
        value={orderedThumbnails}
        getItemValue={(item) => item.pageIndex.toString()}
        onValueChange={setOrderedThumbnails}
        orientation="mixed"
      >
        <SortableContent className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {orderedThumbnails.map((thumb) => (
            <SortableItem
              key={thumb.pageIndex}
              value={thumb.pageIndex.toString()}
              asHandle
              className="relative rounded-lg border p-1"
            >
              <img
                src={thumb.dataUrl}
                alt={`Page ${thumb.pageNumber}`}
                className="w-full"
              />
              <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium">
                {thumb.pageNumber}
              </span>
            </SortableItem>
          ))}
        </SortableContent>
        <SortableOverlay />
      </Sortable>

      <div className="flex justify-center gap-3">
        <Button onClick={handleReorder} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.reorderPages.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
