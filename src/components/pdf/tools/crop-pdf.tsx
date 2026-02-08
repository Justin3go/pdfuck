'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { type CropMargins, cropPdf } from '@/lib/pdf/crop';
import { CheckCircleIcon, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function CropPdfTool() {
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

  const [margins, setMargins] = useState<CropMargins>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const file = files[0];

  const updateMargin = (key: keyof CropMargins, value: string) => {
    const num = Number.parseFloat(value) || 0;
    setMargins((prev) => ({ ...prev, [key]: Math.max(0, num) }));
  };

  const handleCrop = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await cropPdf(file.buffer, margins);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-cropped.pdf`,
          blob: new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed');
    }
  };

  const handleReset = () => {
    setMargins({ top: 0, right: 0, bottom: 0, left: 0 });
    reset();
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

  const marginFields: Array<{ key: keyof CropMargins; label: string }> = [
    { key: 'top', label: t('tools.cropPdf.margins.top') },
    { key: 'right', label: t('tools.cropPdf.margins.right') },
    { key: 'bottom', label: t('tools.cropPdf.margins.bottom') },
    { key: 'left', label: t('tools.cropPdf.margins.left') },
  ];

  // 上传文件后状态
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6">
      <div className="flex-1 space-y-4 overflow-auto px-1 py-1">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <FileIcon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.pageCount} {t('common.pages')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {marginFields.map(({ key, label }) => (
            <div key={key}>
              <label
                htmlFor={`margin-${key}`}
                className="mb-1 block text-sm font-medium"
              >
                {label} (pt)
              </label>
              <NumberInput
                id={`margin-${key}`}
                min={0}
                step={1}
                value={margins[key]}
                onChange={(value) => updateMargin(key, String(value))}
                showControls={false}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button onClick={handleCrop} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.cropPdf.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
