'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { reversePages } from '@/lib/pdf/reverse';
import { CheckCircleIcon, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ReversePdfTool() {
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

  const handleReverse = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await reversePages(file.buffer);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-reversed.pdf`,
          blob: new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reverse failed');
    }
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {file?.pageCount} {t('common.pages')}
        </p>
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
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 rounded-xl border bg-card p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <FileIcon className="size-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {file.pageCount} {t('common.pages')}
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={handleReverse} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.reversePdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
