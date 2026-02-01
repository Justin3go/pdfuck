'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import {
  type PdfMetadata,
  getMetadata,
  setMetadata,
} from '@/lib/pdf/edit-metadata';
import { CheckCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const emptyMetadata: PdfMetadata = {
  title: '',
  author: '',
  subject: '',
  keywords: '',
  creator: '',
  producer: '',
};

export function EditMetadataPdfTool() {
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

  const [metadata, setMetadataState] = useState<PdfMetadata>(emptyMetadata);

  const file = files[0];

  useEffect(() => {
    if (file) {
      getMetadata(file.buffer).then(setMetadataState).catch(() => {});
    }
  }, [file]);

  const handleSave = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const result = await setMetadata(file.buffer, metadata);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-metadata.pdf`,
          blob: new Blob([new Uint8Array(result)], { type: 'application/pdf' }),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleReset = () => {
    setMetadataState(emptyMetadata);
    reset();
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
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
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

  const fields: Array<{ key: keyof PdfMetadata; label: string }> = [
    { key: 'title', label: t('tools.editMetadata.fields.title') },
    { key: 'author', label: t('tools.editMetadata.fields.author') },
    { key: 'subject', label: t('tools.editMetadata.fields.subject') },
    { key: 'keywords', label: t('tools.editMetadata.fields.keywords') },
    { key: 'creator', label: t('tools.editMetadata.fields.creator') },
    { key: 'producer', label: t('tools.editMetadata.fields.producer') },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 text-center">
        <p className="text-sm font-medium">{file.name}</p>
      </div>

      <div className="space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label
              htmlFor={`meta-${key}`}
              className="mb-1 block text-sm font-medium"
            >
              {label}
            </label>
            <input
              id={`meta-${key}`}
              type="text"
              value={metadata[key]}
              onChange={(e) =>
                setMetadataState((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleSave} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t('tools.editMetadata.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
