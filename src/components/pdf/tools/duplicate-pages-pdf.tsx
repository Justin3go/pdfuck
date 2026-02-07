'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { duplicatePages } from '@/lib/pdf/duplicate-pages';
import { CheckCircleIcon, CopyIcon, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function DuplicatePagesPdfTool() {
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
  const [copies, setCopies] = useState<number>(1);
  const [insertPosition, setInsertPosition] = useState<string>('end');

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

  const getInsertAfter = (): number => {
    switch (insertPosition) {
      case 'start':
        return -1;
      case 'end':
        return file ? file.pageCount - 1 : -1;
      default:
        return -1;
    }
  };

  const handleDuplicate = async () => {
    if (!file || selectedPages.size === 0) return;
    setStatus('processing');
    try {
      const indices = Array.from(selectedPages).sort((a, b) => a - b);
      const result = await duplicatePages(file.buffer, {
        pageIndices: indices,
        insertAfter: getInsertAfter(),
        copies,
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-duplicated.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Duplicate failed');
    }
  };

  const handleReset = () => {
    setSelectedPages(new Set());
    setCopies(1);
    setInsertPosition('end');
    reset();
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {selectedPages.size} {t('common.pagesDuplicated')}
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
              {selectedPages.size} / {file.pageCount}{' '}
              {t('common.pagesSelected')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              {t('common.selectPagesToDuplicate')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {t('common.selectAll')}
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                {t('common.deselectAll')}
              </Button>
            </div>
          </div>

          <div className="max-h-[576px] overflow-auto rounded-lg border">
            <PdfPreview
              thumbnails={file.thumbnails}
              selectedPages={selectedPages}
              onPageClick={togglePage}
            />
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="space-y-2">
            <Label>{t('common.copiesCount')}</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={10}
                value={copies}
                onChange={(e) =>
                  setCopies(
                    Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  )
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {t('common.copies')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('common.insertPosition')}</Label>
            <RadioGroup
              value={insertPosition}
              onValueChange={setInsertPosition}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start" id="start" />
                <Label htmlFor="start" className="cursor-pointer">
                  {t('common.atStart')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end" id="end" />
                <Label htmlFor="end" className="cursor-pointer">
                  {t('common.atEnd')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleDuplicate}
          disabled={selectedPages.size === 0 || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.duplicatePages.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
