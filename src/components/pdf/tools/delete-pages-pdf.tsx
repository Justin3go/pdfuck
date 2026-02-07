'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { deletePages } from '@/lib/pdf/delete-pages';
import { CheckCircleIcon, FileIcon } from 'lucide-react';
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
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleReset = () => {
    setSelectedPages(new Set());
    reset();
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {selectedPages.size} {t('common.pages')}{' '}
          {t('tools.deletePages.deleted')}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() =>
              downloadBlob(resultBlobs[0].blob, resultBlobs[0].name)
            }
          >
            {t('common.download')}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            {t('common.reset')}
          </Button>
        </div>
      </div>
    );
  }

  // 错误状态
  if (status === 'error') {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/50 bg-card p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  // 初始未传文件状态
  if (!file) {
    return (
      <FileDropzone
        acceptedMimeTypes={['application/pdf']}
        multiple={false}
        onFilesSelected={loadFiles}
      />
    );
  }

  // 上传文件后状态
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6">
      <div className="flex-1 space-y-4 overflow-auto">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <FileIcon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedPages.size} / {file.pageCount} {t('common.pages')}{' '}
              {t('tools.deletePages.selected')}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {t('tools.deletePages.selectAll')}
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            {t('tools.deletePages.deselectAll')}
          </Button>
        </div>

        <div className="max-h-[576px] overflow-auto rounded-lg border">
          <PdfPreview
            thumbnails={file.thumbnails}
            selectedPages={selectedPages}
            onPageClick={togglePage}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
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
