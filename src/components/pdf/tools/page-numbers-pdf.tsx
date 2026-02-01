'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import type {
  PageNumberFormat,
  PageNumberPosition,
} from '@/lib/pdf/page-numbers';
import { addPageNumbers } from '@/lib/pdf/page-numbers';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function PageNumbersPdfTool() {
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

  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [format, setFormat] = useState<PageNumberFormat>('numeric');
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);

  const file = files[0];

  const handleAddPageNumbers = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await addPageNumbers(file.buffer, {
        position,
        fontSize,
        startNumber,
        format,
        margin: 30,
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-numbered.pdf`,
          blob: new Blob([result], {
            type: 'application/pdf',
          }),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add page numbers'
      );
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
          <label htmlFor="position" className="mb-1 block text-sm font-medium">
            Position
          </label>
          <select
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value as PageNumberPosition)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="bottom-center">Bottom Center</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="top-center">Top Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
          </select>
        </div>
        <div>
          <label htmlFor="format" className="mb-1 block text-sm font-medium">
            Format
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as PageNumberFormat)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="numeric">1, 2, 3...</option>
            <option value="roman">I, II, III...</option>
            <option value="page-of-total">1 / 10</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="start-number"
            className="mb-1 block text-sm font-medium"
          >
            Start Number
          </label>
          <Input
            id="start-number"
            type="number"
            min="1"
            value={startNumber}
            onChange={(e) => setStartNumber(Number(e.target.value) || 1)}
          />
        </div>
        <div>
          <label htmlFor="font-size" className="mb-1 block text-sm font-medium">
            Font Size ({fontSize}px)
          </label>
          <input
            id="font-size"
            type="range"
            min="8"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={handleAddPageNumbers}
          disabled={status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.pageNumbers.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
