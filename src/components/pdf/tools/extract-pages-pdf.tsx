'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { extractPages } from '@/lib/pdf/extract';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ExtractPagesPdfTool() {
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

  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const file = files[0];

  const togglePage = (pageIndex: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) {
        next.delete(pageIndex);
      } else {
        next.add(pageIndex);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!file) return;
    const all = new Set(Array.from({ length: file.pageCount }, (_, i) => i));
    setSelectedPages(all);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return;
    setStatus('processing');
    try {
      const indices = Array.from(selectedPages).sort((a, b) => a - b);
      const result = await extractPages(file.buffer, indices);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-extracted.pdf`,
          blob: new Blob([result], {
            type: 'application/pdf',
          }),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extract failed');
    }
  };

  const handleReset = () => {
    setSelectedPages(new Set());
    reset();
  };

  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-sm text-muted-foreground">
          {selectedPages.size} {t('common.pages')}
        </p>
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
        onFilesSelected={loadFiles}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedPages.size} / {file.pageCount} {t('common.pages')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      <PdfPreview
        thumbnails={file.thumbnails}
        selectedPages={selectedPages}
        onPageClick={togglePage}
      />

      <div className="flex justify-center gap-3">
        <Button
          onClick={handleExtract}
          disabled={selectedPages.size === 0 || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.extractPages.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
