'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { splitPdf } from '@/lib/pdf/split';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function SplitPdfTool() {
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
    downloadAll,
    reset,
  } = usePdfProcessor();

  const [mode, setMode] = useState<'each-page' | 'ranges'>('each-page');
  const [rangeInput, setRangeInput] = useState('');

  const file = files[0];

  const handleSplit = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      let results: Uint8Array[];
      if (mode === 'each-page') {
        results = await splitPdf(file.buffer, {
          mode: 'each-page',
        });
      } else {
        const ranges = rangeInput
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
          .map((r) => {
            const parts = r.split('-').map((p) => Number(p.trim()));
            if (parts.length === 1) {
              return { start: parts[0], end: parts[0] };
            }
            return { start: parts[0], end: parts[1] };
          });
        results = await splitPdf(file.buffer, {
          mode: 'ranges',
          ranges,
        });
      }

      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs(
        results.map((r, i) => ({
          name: `${baseName}-part-${i + 1}.pdf`,
          blob: new Blob([r], { type: 'application/pdf' }),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed');
    }
  };

  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">
          {resultBlobs.length} {t('common.pages')}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {resultBlobs.map((r, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => downloadBlob(r.blob, r.name)}
            >
              {r.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => downloadAll(resultBlobs)}>
            {t('common.downloadAll')}
          </Button>
          <Button variant="outline" onClick={reset}>
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
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-sm font-medium">
          {file.name} &middot; {file.pageCount} {t('common.pages')}
        </p>
        <PdfPreview thumbnails={file.thumbnails} />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="split-mode"
            checked={mode === 'each-page'}
            onChange={() => setMode('each-page')}
          />
          <span className="text-sm">
            {t('tools.splitPdf.faq.item-1.question').includes('individual')
              ? 'Split into individual pages'
              : 'Split into individual pages'}
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="split-mode"
            checked={mode === 'ranges'}
            onChange={() => setMode('ranges')}
          />
          <span className="text-sm">Custom ranges</span>
        </label>
      </div>

      {mode === 'ranges' && (
        <Input
          placeholder="e.g. 1-3, 5, 7-9"
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
        />
      )}

      <div className="flex justify-center gap-3">
        <Button onClick={handleSplit} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.splitPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
