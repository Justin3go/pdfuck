'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { mergePdfs } from '@/lib/pdf/merge';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import {
  CheckCircleIcon,
  FileIcon,
  GripVerticalIcon,
  Trash2Icon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function MergePdfTool() {
  const t = useTranslations('ToolsPage');
  const {
    files,
    status,
    error,
    resultBlobs,
    loadFiles,
    removeFile,
    reorderFiles,
    setStatus,
    setResultBlobs,
    setError,
    downloadBlob,
    reset,
  } = usePdfProcessor();

  const handleReorder = (newFiles: typeof files) => {
    reorderFiles(newFiles.map((f) => f.id));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setStatus('processing');
    try {
      const buffers = files.map((f) => f.buffer);
      const result = await mergePdfs(buffers);
      setResultBlobs([
        {
          name: 'merged.pdf',
          blob: new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed');
    }
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="flex gap-3">
          <Button
            onClick={() =>
              downloadBlob(resultBlobs[0].blob, resultBlobs[0].name)
            }
          >
            {t('common.download')}
          </Button>
          <Button variant="outline" onClick={reset}>
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
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  // 初始未传文件状态
  if (files.length === 0) {
    return (
      <FileDropzone
        acceptedMimeTypes={['application/pdf']}
        multiple={true}
        onFilesSelected={loadFiles}
      />
    );
  }

  // 上传文件后状态
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6">
      <div className="flex-1 overflow-auto">
        <Sortable
          value={files}
          getItemValue={(item) => item.id}
          onValueChange={handleReorder}
          orientation="vertical"
        >
          <SortableContent className="space-y-2">
            {files.map((file) => (
              <SortableItem
                key={file.id}
                value={file.id}
                asHandle
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.pageCount} {t('common.pages')} &middot;{' '}
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </SortableItem>
            ))}
          </SortableContent>
          <SortableOverlay />
        </Sortable>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleMerge}
          disabled={files.length < 2 || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.mergePdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
