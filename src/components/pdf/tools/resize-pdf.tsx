'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { resizePdf, type PageSize } from '@/lib/pdf/resize';
import { CheckCircleIcon, FileIcon, Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
  { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
  { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' },
];

export function ResizePdfTool() {
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

  const [targetSize, setTargetSize] = useState<PageSize>('A4');
  const [scaleOption, setScaleOption] = useState<'fit' | 'keep'>('keep');

  const file = files[0];

  const handleResize = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await resizePdf(file.buffer, {
        targetSize,
        scaleContent: scaleOption === 'fit',
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-${targetSize.toLowerCase()}.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resize failed');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setTargetSize('A4');
    setScaleOption('keep');
    reset();
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">{t('common.resizedTo', { size: targetSize })}</p>
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

  // 上传文件后状态
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ruler className="size-4" />
              {t('common.pageSize')}
            </Label>
            <Select
              value={targetSize}
              onValueChange={(v) => setTargetSize(v as PageSize)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('common.scaleOption')}</Label>
            <RadioGroup
              value={scaleOption}
              onValueChange={(v) => setScaleOption(v as 'fit' | 'keep')}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="keep" id="scale-keep" />
                <Label
                  htmlFor="scale-keep"
                  className="cursor-pointer font-normal"
                >
                  {t('common.keepOriginal')}
                  <p className="text-xs text-muted-foreground">
                    {t('common.keepOriginalDescription')}
                  </p>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="fit" id="scale-fit" />
                <Label
                  htmlFor="scale-fit"
                  className="cursor-pointer font-normal"
                >
                  {t('common.fitToSize')}
                  <p className="text-xs text-muted-foreground">
                    {t('common.fitToSizeDescription')}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button onClick={handleResize} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.resizePdf.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
