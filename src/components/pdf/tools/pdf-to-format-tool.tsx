'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PdfToolI18nKey } from '@/config/pdf-tools';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import {
  type ImageFormat,
  type PageImage,
  type MergedImageResult,
  type BatchMergedImageResult,
  pdfToImages,
} from '@/lib/pdf/to-images';
import {
  CheckCircleIcon,
  DownloadIcon,
  FileIcon,
  ImageIcon,
  FileArchiveIcon,
  HelpCircleIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface PdfToFormatToolProps {
  format: ImageFormat;
  fileExtension: string;
  i18nKey: PdfToolI18nKey;
}

function isMergedResult(
  result: PageImage[] | MergedImageResult | BatchMergedImageResult
): result is MergedImageResult | BatchMergedImageResult {
  return 'isMerged' in result && result.isMerged;
}

function isBatchMergedResult(
  result: MergedImageResult | BatchMergedImageResult
): result is BatchMergedImageResult {
  return 'isBatch' in result && result.isBatch;
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
  const [mergedResult, setMergedResult] = useState<
    MergedImageResult | BatchMergedImageResult | null
  >(null);
  const [mergeLongImage, setMergeLongImage] = useState(false);
  const [downloadAsZip, setDownloadAsZip] = useState(false);

  const file = files[0];
  const showQuality = format !== 'image/png';

  // 估算 WebP 长图会被分割成多少份
  // 基于标准 PDF 页面高度 (A4 ≈ 842pt, Letter ≈ 792pt，取平均值)
  const ESTIMATED_PAGE_HEIGHT_PT = 820;
  const MAX_WEBP_HEIGHT = 16383;
  const estimatedBatchCount =
    file && format === 'image/webp' && mergeLongImage
      ? Math.ceil(
          (file.pageCount * ESTIMATED_PAGE_HEIGHT_PT * scale) / MAX_WEBP_HEIGHT
        )
      : 1;

  const handleConvert = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await pdfToImages(file.buffer, {
        format,
        scale,
        quality,
        mergeIntoLongImage: mergeLongImage,
      });

      if (isMergedResult(result)) {
        setMergedResult(result);
        setImages([]);
      } else {
        setImages(result);
        setMergedResult(null);
      }
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const handleReset = () => {
    setImages([]);
    setMergedResult(null);
    reset();
  };

  const createZipBlob = async (
    imageBlobs: { name: string; blob: Blob }[]
  ): Promise<Blob> => {
    const { ZipWriter, BlobWriter } = await import('@zip.js/zip.js');
    const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

    for (const { name, blob } of imageBlobs) {
      await zipWriter.add(name, blob.stream());
    }

    return zipWriter.close();
  };

  const handleDownloadAll = async () => {
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'page';

    // If merged long image (single batch)
    if (mergedResult && !isBatchMergedResult(mergedResult)) {
      downloadBlob(mergedResult.blob, `${baseName}-merged.${fileExtension}`);
      return;
    }

    // If batch merged long images (multiple batches - pack into ZIP)
    if (mergedResult && isBatchMergedResult(mergedResult)) {
      const imageBlobs = mergedResult.batches.map((batch, index) => ({
        name: `${baseName}-part${index + 1}-pages${batch.startPage}-${batch.endPage}.${fileExtension}`,
        blob: batch.blob,
      }));
      const zipBlob = await createZipBlob(imageBlobs);
      downloadBlob(zipBlob, `${baseName}-merged.zip`);
      return;
    }

    // If download as ZIP
    if (downloadAsZip && images.length > 1) {
      const imageBlobs = images.map((img) => ({
        name: `${baseName}-page-${img.pageNumber}.${fileExtension}`,
        blob: img.blob,
      }));
      const zipBlob = await createZipBlob(imageBlobs);
      downloadBlob(zipBlob, `${baseName}-images.zip`);
      return;
    }

    // Default: download individual files
    for (const img of images) {
      downloadBlob(
        img.blob,
        `${baseName}-page-${img.pageNumber}.${fileExtension}`
      );
    }
  };

  // 处理完成状态 - 使用卡片包裹
  if (status === 'done' && (images.length > 0 || mergedResult)) {
    const resultCount = mergedResult
      ? isBatchMergedResult(mergedResult)
        ? mergedResult.totalPageCount
        : mergedResult.pageCount
      : images.length;
    const isBatchResult = mergedResult && isBatchMergedResult(mergedResult);
    const isZipDownload =
      (!mergedResult && downloadAsZip && images.length > 1) || isBatchResult;

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {mergedResult
            ? isBatchResult
              ? t('common.webpBatchCompleted', {
                  pageCount: resultCount,
                  batchCount: mergedResult.batches.length,
                })
              : t('common.mergedImageDesc', { count: resultCount })
            : `${resultCount} ${t('common.pages')}`}
        </p>
        {isBatchResult && (
          <div className="max-w-md rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">{t('common.webpBatchCompletedDesc')}</p>
            <p className="mt-1">{t('common.webpBatchCompletedExplanation')}</p>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleDownloadAll} className="gap-2">
            {isZipDownload ? (
              <>
                <FileArchiveIcon className="size-4" />
                {t('common.downloadZip')}
              </>
            ) : mergedResult ? (
              <>
                <ImageIcon className="size-4" />
                {t('common.downloadMerged')}
              </>
            ) : (
              <>
                <DownloadIcon className="size-4" />
                {t('common.downloadAll')}
              </>
            )}
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

  // 上传文件后状态 - 使用卡片包裹
  return (
    <div className="flex min-h-[320px] flex-col rounded-xl border bg-card p-6">
      <div className="flex-1">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b pb-4 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {file.pageCount} {t('common.pages')}
              </p>
            </div>
          </div>

          <div
            className={`grid gap-4 shrink-0 ${showQuality ? 'sm:grid-cols-2' : ''}`}
          >
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

          {/* Options Section - 固定高度避免抖动 */}
          <div className="space-y-3 border-t pt-4 shrink-0">
            <p className="text-sm font-medium">{t('common.options')}</p>
            <div className="flex flex-col gap-3 min-h-[4.5rem]">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="mergeLongImage"
                  checked={mergeLongImage}
                  onCheckedChange={(checked) =>
                    setMergeLongImage(checked === true)
                  }
                />
                <label
                  htmlFor="mergeLongImage"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('common.mergeLongImage')}
                  {format === 'image/webp' &&
                    mergeLongImage &&
                    estimatedBatchCount > 1 && (
                      <span className="ml-1 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        （
                        {t('common.webpBatchEstimate', {
                          count: estimatedBatchCount,
                        })}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircleIcon className="size-3.5 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[280px]"
                            >
                              <p>{t('common.webpBatchTooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        ）
                      </span>
                    )}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="downloadAsZip"
                  checked={!mergeLongImage && downloadAsZip}
                  disabled={mergeLongImage || file.pageCount <= 1}
                  onCheckedChange={(checked) =>
                    setDownloadAsZip(checked === true)
                  }
                />
                <label
                  htmlFor="downloadAsZip"
                  className={`text-sm font-medium leading-none ${
                    mergeLongImage || file.pageCount <= 1
                      ? 'text-muted-foreground'
                      : ''
                  }`}
                >
                  {t('common.downloadAsZip')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 border-t pt-4 shrink-0">
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
