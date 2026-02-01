'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { compressPdf } from '@/lib/pdf/compress';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CompressPdfTool() {
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

  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const file = files[0];

  const handleCompress = async () => {
    if (!file) return;
    setStatus('processing');
    setOriginalSize(file.size);
    try {
      const result = await compressPdf(file.buffer);
      const blob = new Blob([result], {
        type: 'application/pdf',
      });
      setCompressedSize(blob.size);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([{ name: `${baseName}-compressed.pdf`, blob }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compress failed');
    }
  };

  if (status === 'done' && resultBlobs.length > 0) {
    const reduction = originalSize - compressedSize;
    const percent =
      originalSize > 0 ? ((reduction / originalSize) * 100).toFixed(1) : '0';

    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <div className="text-center">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">
                {t('common.originalSize')}
              </p>
              <p className="text-lg font-semibold">
                {formatSize(originalSize)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {t('common.compressedSize')}
              </p>
              <p className="text-lg font-semibold">
                {formatSize(compressedSize)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {reduction > 0
              ? `${t('common.reduction')}: ${percent}%`
              : t('common.noReduction')}
          </p>
        </div>
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
        <p className="text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {t('common.size')}: {formatSize(file.size)}
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={handleCompress} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.compressPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
