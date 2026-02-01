'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { deletePages } from '@/lib/pdf/delete-pages';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function DeletePagesPdfTool() {
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

  const handleDelete = async () => {
    if (!file || selectedPages.size === 0) return;
    if (selectedPages.size >= file.pageCount) {
      setError('Cannot delete all pages');
      return;
    }
    setStatus('processing');
    try {
      const indices = Array.from(selectedPages);
      const result = await deletePages(file.buffer, indices);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-deleted.pdf`,
          blob: new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
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
          {selectedPages.size} {t('common.pages')}{' '}
          {t('tools.deletePages.deleted')}
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
          {selectedPages.size} / {file.pageCount} {t('common.pages')}{' '}
          {t('tools.deletePages.selected')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {t('tools.deletePages.selectAll')}
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            {t('tools.deletePages.deselectAll')}
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
          variant="destructive"
          onClick={handleDelete}
          disabled={
            selectedPages.size === 0 ||
            selectedPages.size >= file.pageCount ||
            status === 'processing'
          }
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.deletePages.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
