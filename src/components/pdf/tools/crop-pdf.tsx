'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { type CropMargins, cropPdf } from '@/lib/pdf/crop';
import { CheckCircleIcon } from 'lucide-react';
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop failed');
    }
  };

  const handleReset = () => {
    setMargins({ top: 0, right: 0, bottom: 0, left: 0 });
    reset();
  };

  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
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

  const marginFields: Array<{ key: keyof CropMargins; label: string }> = [
    { key: 'top', label: t('tools.cropPdf.margins.top') },
    { key: 'right', label: t('tools.cropPdf.margins.right') },
    { key: 'bottom', label: t('tools.cropPdf.margins.bottom') },
    { key: 'left', label: t('tools.cropPdf.margins.left') },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-sm font-medium">
          {file.name} &middot; {file.pageCount} {t('common.pages')}
        </p>
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
            <input
              id={`margin-${key}`}
              type="number"
              min="0"
              step="1"
              value={margins[key]}
              onChange={(e) => updateMargin(key, e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
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
