'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { comparePdfs, type CompareResult } from '@/lib/pdf/compare';
import { CheckCircleIcon, FileIcon, GitCompareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ComparePdfTool() {
  const t = useTranslations('ToolsPage');
  const { files, status, error, loadFiles, setStatus, setError, reset } =
    usePdfProcessor();

  const [compareResult, setCompareResult] = useState<CompareResult | null>(
    null
  );

  const handleCompare = async () => {
    if (files.length < 2) {
      setError('Please select two PDF files to compare');
      setStatus('error');
      return;
    }

    setStatus('processing');
    try {
      const result = await comparePdfs(files[0].buffer, files[1].buffer);
      setCompareResult(result);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
      setStatus('error');
    }
  };

  // Processing done state
  if (status === 'done' && compareResult) {
    return (
      <div className="flex min-h-[320px] flex-col rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="size-6 text-green-500" />
            <div>
              <p className="font-medium">Comparison Complete</p>
              <p className="text-sm text-muted-foreground">
                Similarity: {compareResult.similarity}%
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={reset}>
            {t('common.reset')}
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto max-h-[1500px]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Document 1</h4>
              <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-auto">
                {compareResult.doc1Text || '(No text found)'}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Document 2</h4>
              <div className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-auto">
                {compareResult.doc2Text || '(No text found)'}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium">Differences</h4>
            <div className="space-y-1">
              {compareResult.differences.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No differences found
                </p>
              ) : (
                compareResult.differences.map((diff, idx) => (
                  <div
                    key={idx}
                    className={`rounded px-3 py-2 text-sm ${
                      diff.type === 'added'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : diff.type === 'removed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <span className="font-medium">
                      {diff.type === 'added'
                        ? '+ Added'
                        : diff.type === 'removed'
                          ? '- Removed'
                          : '  Same'}
                      {diff.lineNum1 !== undefined &&
                        ` (Line ${diff.lineNum1})`}
                      :
                    </span>{' '}
                    {diff.text}
                  </div>
                ))
              )}
            </div>
          </div>
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
  if (files.length < 2) {
    return (
      <div className="space-y-4">
        {files.length === 0 ? (
          <FileDropzone
            acceptedMimeTypes={['application/pdf']}
            multiple={true}
            onFilesSelected={loadFiles}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <FileIcon className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{files[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {files[0].pageCount} {t('common.pages')} • Document 1 selected
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <GitCompareIcon className="size-6 text-muted-foreground" />
            </div>
            <FileDropzone
              acceptedMimeTypes={['application/pdf']}
              multiple={false}
              onFilesSelected={(newFiles) => {
                const fileArray = Array.from(newFiles);
                loadFiles(fileArray);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Both files uploaded
  return (
    <div className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6">
      <div className="flex-1 space-y-4 overflow-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{files[0].name}</p>
              <p className="text-xs text-muted-foreground">
                {files[0].pageCount} {t('common.pages')} • Document 1
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <GitCompareIcon className="size-6 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{files[1].name}</p>
              <p className="text-xs text-muted-foreground">
                {files[1].pageCount} {t('common.pages')} • Document 2
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <p>
            The tool will compare the text content of both documents and
            highlight differences. Note: This tool extracts and compares text
            only; formatting differences will not be detected.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button onClick={handleCompare} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.comparePdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
