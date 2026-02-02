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
import { CheckCircleIcon, DownloadIcon, FileIcon } from 'lucide-react';
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

  const handleDownloadAll = () => {
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'page';
    for (const img of images) {
      downloadBlob(
        img.blob,
        `${baseName}-page-${img.pageNumber}.${fileExtension}`
      );
    }
  };

  // 处理完成状态 - 使用卡片包裹
  if (status === 'done' && images.length > 0) {
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'page';
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {images.length} {t('common.pages')}
        </p>
        <div className="flex gap-3">
          <Button onClick={handleDownloadAll}>{t('common.downloadAll')}</Button>
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

  // 上传文件后状态 - 使用卡片包裹
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
              {file.pageCount} {t('common.pages')}
            </p>
          </div>
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
              <label
                htmlFor="quality"
                className="mb-1 block text-sm font-medium"
              >
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
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
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
