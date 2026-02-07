'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { PdfPreview } from '@/components/pdf/pdf-preview';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { splitPdf } from '@/lib/pdf/split';
import {
  CheckCircleIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
} from 'lucide-react';
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
  const [downloadAsZip, setDownloadAsZip] = useState(true);

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
          blob: new Blob([new Uint8Array(r)], { type: 'application/pdf' }),
        }))
      );
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed');
    }
  };

  const createZipBlob = async (
    pdfBlobs: { name: string; blob: Blob }[]
  ): Promise<Blob> => {
    const { ZipWriter, BlobWriter } = await import('@zip.js/zip.js');
    const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

    for (const { name, blob } of pdfBlobs) {
      await zipWriter.add(name, blob.stream());
    }

    return zipWriter.close();
  };

  const handleDownloadAll = async () => {
    if (downloadAsZip && resultBlobs.length > 1) {
      const baseName = file?.name.replace(/\.pdf$/i, '') || 'split';
      const zipBlob = await createZipBlob(resultBlobs);
      downloadBlob(zipBlob, `${baseName}-split.zip`);
    } else {
      downloadAll(resultBlobs);
    }
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    const isZipDownload = downloadAsZip && resultBlobs.length > 1;

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">
          {resultBlobs.length} {t('common.pages')}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {resultBlobs.slice(0, 3).map((r, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => downloadBlob(r.blob, r.name)}
            >
              {r.name}
            </Button>
          ))}
          {resultBlobs.length > 3 && (
            <span className="flex items-center px-2 text-sm text-muted-foreground">
              +{resultBlobs.length - 3} more
            </span>
          )}
        </div>
        {resultBlobs.length > 1 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="downloadAsZip"
              checked={downloadAsZip}
              onCheckedChange={(checked) => setDownloadAsZip(checked === true)}
            />
            <label
              htmlFor="downloadAsZip"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('common.downloadAsZip')}
            </label>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleDownloadAll} className="gap-2">
            {isZipDownload ? (
              <>
                <FileArchiveIcon className="size-4" />
                {t('common.downloadZip')}
              </>
            ) : (
              <>
                <DownloadIcon className="size-4" />
                {t('common.downloadAll')}
              </>
            )}
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

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="split-mode"
              checked={mode === 'each-page'}
              onChange={() => setMode('each-page')}
              className="size-4"
            />
            <span className="text-sm">
              {t('tools.splitPdf.faq.item-1.question')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="split-mode"
              checked={mode === 'ranges'}
              onChange={() => setMode('ranges')}
              className="size-4"
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

        {file.thumbnails.length > 0 && (
          <div className="max-h-[576px] overflow-auto rounded-lg border p-1">
            <PdfPreview thumbnails={file.thumbnails} />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
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
