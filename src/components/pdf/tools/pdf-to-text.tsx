'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { pdfToText } from '@/lib/pdf/to-text';
import { CheckCircleIcon, CopyIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function PdfToTextTool() {
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

  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);

  const file = files[0];

  const handleExtract = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const text = await pdfToText(file.buffer);
      setExtractedText(text);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'extracted';
    downloadBlob(blob, `${baseName}.txt`);
  };

  const handleReset = () => {
    setExtractedText('');
    setCopied(false);
    reset();
  };

  if (status === 'done' && extractedText) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <CheckCircleIcon className="size-5 text-green-500" />
          <p className="font-medium">{t('tools.pdfToText.extracted')}</p>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={extractedText}
            className="h-80 w-full rounded-lg border bg-muted p-4 font-mono text-sm"
          />
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={handleCopy} variant="outline">
            <CopyIcon className="mr-2 size-4" />
            {copied ? t('tools.pdfToText.copied') : t('tools.pdfToText.copy')}
          </Button>
          <Button onClick={handleDownloadTxt}>
            {t('tools.pdfToText.downloadTxt')}
          </Button>
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

      <div className="flex justify-center gap-3">
        <Button onClick={handleExtract} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.pdfToText.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
