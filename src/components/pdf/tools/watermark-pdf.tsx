'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { addWatermark } from '@/lib/pdf/watermark';
import { CheckCircleIcon } from 'lucide-react';
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Watermark failed');
    }
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="watermark-text"
            className="mb-1 block text-sm font-medium"
          >
            Text
          </label>
          <Input
            id="watermark-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Watermark text"
          />
        </div>
        <div>
          <label htmlFor="position" className="mb-1 block text-sm font-medium">
            Position
          </label>
          <select
            id="position"
            value={position}
            onChange={(e) =>
              setPosition(e.target.value as 'center' | 'diagonal')
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="center">Center</option>
            <option value="diagonal">Diagonal</option>
          </select>
        </div>
        <div>
          <label htmlFor="font-size" className="mb-1 block text-sm font-medium">
            Font Size ({fontSize}px)
          </label>
          <input
            id="font-size"
            type="range"
            min="12"
            max="120"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="opacity" className="mb-1 block text-sm font-medium">
            Opacity ({Math.round(opacity * 100)}%)
          </label>
          <input
            id="opacity"
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center gap-3">
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
