'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { wordToPdf } from '@/lib/pdf/from-word';
import { CheckCircleIcon, FileIcon, FileTypeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function WordToPdfTool() {
  const t = useTranslations('ToolsPage');
  const {
    files,
    status,
    error,
    loadFiles,
    setStatus,
    setError,
    downloadBlob,
    reset,
  } = usePdfProcessor();

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const file = files[0];

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const pdfBytes = await wordToPdf(file.buffer);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setResultBlob(blob);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.replace(/\.(docx|doc)$/i, '');
    downloadBlob(resultBlob, `${baseName}.pdf`);
  };

  const handleReset = () => {
    setResultBlob(null);
    reset();
  };

  // 处理完成状态
  if (status === 'done' && resultBlob) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="flex gap-3">
          <Button onClick={handleDownload}>{t('common.download')}</Button>
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
        acceptedMimeTypes={[
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ]}
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
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={handleConvert} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.wordToPdf.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
