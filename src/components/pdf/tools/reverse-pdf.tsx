'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { reversePages } from '@/lib/pdf/reverse';
import { CheckCircleIcon } from 'lucide-react';
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reverse failed');
    }
  };

  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-sm text-muted-foreground">
          {file?.pageCount} {t('common.pages')}
        </p>
        <Button
          onClick={() => downloadBlob(resultBlobs[0].blob, resultBlobs[0].name)}
        >
          {t('common.download')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/50 bg-card p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={reset}>
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
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-sm font-medium">
          {file.name} &middot; {file.pageCount} {t('common.pages')}
        </p>
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
