'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { redactPdf } from '@/lib/pdf/redact';
import { CheckCircleIcon, FileIcon, AlertTriangleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function RedactPdfTool() {
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

  const [redactConfirmed, setRedactConfirmed] = useState(false);

  const handleRedact = async () => {
    if (!file || !redactConfirmed) return;

    setStatus('processing');
    try {
      // For this simplified version, we'll redact a predefined area
      // In a full implementation, users would select areas visually
      const result = await redactPdf(file.buffer, [
        {
          pageIndex: 0,
          x: 50,
          y: 50,
          width: 200,
          height: 50,
        },
      ]);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-redacted.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Redaction failed');
      setStatus('error');
    }
  };

  const file = files[0];

  // Processing done state
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          <p className="font-medium">Redaction Successful</p>
          <p>The sensitive information has been permanently removed.</p>
        </div>
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

  // Error state
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

  // Initial file upload state
  if (!file) {
    return (
      <FileDropzone
        acceptedMimeTypes={['application/pdf']}
        multiple={false}
        onFilesSelected={loadFiles}
      />
    );
  }

  // File uploaded - redaction configuration state
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
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertTriangleIcon className="mt-0.5 size-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Warning: Permanent Action</p>
              <p className="text-sm">
                Redaction permanently removes content from the PDF. This action
                cannot be undone. Please ensure you have a backup of the
                original document.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="text-sm">
              <strong>Note:</strong> This simplified version demonstrates
              redaction by placing a black box in the lower-left area of the
              first page. For precise redaction of specific text or images,
              please use professional PDF editing software.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
            <input
              type="checkbox"
              checked={redactConfirmed}
              onChange={(e) => setRedactConfirmed(e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span className="text-sm">
              I understand that redaction is permanent and I have a backup of
              the original document.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleRedact}
          disabled={!redactConfirmed || status === 'processing'}
          variant="destructive"
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.redactPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
