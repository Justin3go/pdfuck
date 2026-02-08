'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { addWatermark } from '@/lib/pdf/watermark';
import { CheckCircleIcon, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function WatermarkPdfTool() {
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

  const [text, setText] = useState('DRAFT');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<'center' | 'diagonal'>('diagonal');

  const file = files[0];

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setStatus('processing');
    try {
      const result = await addWatermark(file.buffer, {
        text: text.trim(),
        fontSize,
        opacity,
        rotation,
        color: { r: 0.5, g: 0.5, b: 0.5 },
        position,
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-watermarked.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Watermark failed');
    }
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
    <div className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6">
      <div className="flex-1 space-y-4 overflow-auto p-1">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="watermark-text">Text</Label>
            <Input
              id="watermark-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Watermark text"
            />
          </div>
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={position}
              onValueChange={(value) =>
                setPosition(value as 'center' | 'diagonal')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="diagonal">Diagonal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              {t('common.fontSize')}: {fontSize}px
            </Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={120}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Opacity: {Math.round(opacity * 100)}%
            </Label>
            <Slider
              value={[opacity]}
              onValueChange={(value) => setOpacity(value[0])}
              min={0.05}
              max={1}
              step={0.05}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleWatermark}
          disabled={!text.trim() || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.watermarkPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
