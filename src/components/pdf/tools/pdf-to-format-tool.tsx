'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import type { PdfToolI18nKey } from '@/config/pdf-tools';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import {
  type ImageFormat,
  type PageImage,
  pdfToImages,
} from '@/lib/pdf/to-images';
import { CheckCircleIcon, DownloadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface PdfToFormatToolProps {
  format: ImageFormat;
  fileExtension: string;
  i18nKey: PdfToolI18nKey;
}

export function PdfToFormatTool({
  format,
  fileExtension,
  i18nKey,
}: PdfToFormatToolProps) {
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

  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.9);
  const [images, setImages] = useState<PageImage[]>([]);

  const file = files[0];
  const showQuality = format !== 'image/png';

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await pdfToImages(file.buffer, {
        format,
        scale,
        quality,
      });
      setImages(result);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const handleReset = () => {
    setImages([]);
    reset();
  };

  if (status === 'done' && images.length > 0) {
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'page';
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <CheckCircleIcon className="size-5 text-green-500" />
          <p className="font-medium">
            {images.length} {t('common.pages')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.pageNumber}
              className="group relative rounded-lg border p-1"
            >
              <img
                src={img.dataUrl}
                alt={`Page ${img.pageNumber}`}
                className="w-full"
              />
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    img.blob,
                    `${baseName}-page-${img.pageNumber}.${fileExtension}`
                  )
                }
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100"
              >
                <DownloadIcon className="size-6 text-white" />
              </button>
              <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium">
                {img.pageNumber}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset}>
            {t('common.reset')}
          </Button>
        </div>
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
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-sm font-medium">
          {file.name} &middot; {file.pageCount} {t('common.pages')}
        </p>
      </div>

      <div className={`grid gap-4 ${showQuality ? 'sm:grid-cols-2' : ''}`}>
        <div>
          <label htmlFor="scale" className="mb-1 block text-sm font-medium">
            Scale ({scale}x)
          </label>
          <input
            id="scale"
            type="range"
            min="1"
            max="4"
            step="0.5"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>
        {showQuality && (
          <div>
            <label htmlFor="quality" className="mb-1 block text-sm font-medium">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              id="quality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleConvert} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t(`tools.${i18nKey}.name`)}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
