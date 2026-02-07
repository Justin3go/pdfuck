'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { sanitizePdf } from '@/lib/pdf/sanitize';
import { CheckCircleIcon, FileIcon, ShieldCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function SanitizePdfTool() {
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

  const [options, setOptions] = useState({
    removeMetadata: true,
    removeJavaScript: true,
    removeEmbeddedFiles: true,
    removeLinks: true,
    removeComments: true,
  });
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  const file = files[0];

  const handleSanitize = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const result = await sanitizePdf(file.buffer, options);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-sanitized.pdf`,
          blob: new Blob([new Uint8Array(result.data)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setRemovedItems(result.removedItems);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sanitize failed');
      setStatus('error');
    }
  };

  // Processing done state
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="w-full max-w-md rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          <p className="font-medium mb-2">已清理的项目:</p>
          <ul className="list-disc list-inside space-y-1">
            {removedItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
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

  // File uploaded - options configuration state
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
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <ShieldCheckIcon className="size-5 shrink-0" />
            <p className="text-sm">选择要清理的项目，保护文档中的敏感信息。</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="removeMetadata"
                checked={options.removeMetadata}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    removeMetadata: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="removeMetadata"
                className="text-sm font-medium cursor-pointer"
              >
                删除元数据 (作者、创建者、时间戳等)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="removeJavaScript"
                checked={options.removeJavaScript}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    removeJavaScript: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="removeJavaScript"
                className="text-sm font-medium cursor-pointer"
              >
                删除 JavaScript 代码
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="removeEmbeddedFiles"
                checked={options.removeEmbeddedFiles}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    removeEmbeddedFiles: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="removeEmbeddedFiles"
                className="text-sm font-medium cursor-pointer"
              >
                删除嵌入的文件
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="removeLinks"
                checked={options.removeLinks}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    removeLinks: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="removeLinks"
                className="text-sm font-medium cursor-pointer"
              >
                删除超链接
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="removeComments"
                checked={options.removeComments}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({
                    ...prev,
                    removeComments: checked as boolean,
                  }))
                }
              />
              <label
                htmlFor="removeComments"
                className="text-sm font-medium cursor-pointer"
              >
                删除批注和注释
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button onClick={handleSanitize} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.sanitizePdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
