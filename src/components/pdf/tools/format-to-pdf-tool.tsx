'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import type { PdfToolI18nKey } from '@/config/pdf-tools';
import { convertWebpToPng, imagesToPdf } from '@/lib/pdf/from-images';
import { CheckCircleIcon, GripVerticalIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

interface ImageFile {
  id: string;
  file: File;
  buffer: Uint8Array;
  mimeType: string;
  previewUrl: string;
  name: string;
}

let imgIdCounter = 0;

interface FormatToPdfToolProps {
  acceptedMimeType: string;
  i18nKey: PdfToolI18nKey;
}

export function FormatToPdfTool({
  acceptedMimeType,
  i18nKey,
}: FormatToPdfToolProps) {
  const t = useTranslations('ToolsPage');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'processing' | 'done' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const loadImages = useCallback(async (fileList: FileList | File[]) => {
    setStatus('loading');
    try {
      const files = Array.from(fileList);
      const newImages: ImageFile[] = [];

      for (const file of files) {
        let buffer = new Uint8Array(await file.arrayBuffer());
        let mimeType = file.type;

        if (mimeType === 'image/webp') {
          buffer = await convertWebpToPng(buffer);
          mimeType = 'image/png';
        }

        imgIdCounter += 1;
        newImages.push({
          id: `img-${Date.now()}-${imgIdCounter}`,
          file,
          buffer,
          mimeType,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
        });
      }

      setImages((prev) => [...prev, ...newImages]);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
      setStatus('error');
    }
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setStatus('processing');
    try {
      const result = await imagesToPdf(
        images.map((img) => ({
          buffer: img.buffer,
          mimeType: img.mimeType,
        }))
      );
      setResultBlob(new Blob([result], { type: 'application/pdf' }));
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'images.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    for (const img of images) {
      URL.revokeObjectURL(img.previewUrl);
    }
    setImages([]);
    setResultBlob(null);
    setStatus('idle');
    setError(null);
  };

  if (status === 'done' && resultBlob) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <Button onClick={handleDownload}>{t('common.download')}</Button>
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

  return (
    <div className="space-y-6">
      <FileDropzone
        acceptedMimeTypes={[acceptedMimeType]}
        multiple={true}
        onFilesSelected={loadImages}
      />

      {images.length > 0 && (
        <>
          <Sortable
            value={images}
            getItemValue={(item) => item.id}
            onValueChange={setImages}
            orientation="vertical"
          >
            <SortableContent className="space-y-2">
              {images.map((img) => (
                <SortableItem
                  key={img.id}
                  value={img.id}
                  asHandle
                  className="flex items-center gap-3 rounded-lg border bg-card p-2"
                >
                  <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="size-12 rounded object-cover"
                  />
                  <p className="flex-1 truncate text-sm">{img.name}</p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </SortableItem>
              ))}
            </SortableContent>
            <SortableOverlay />
          </Sortable>

          <div className="flex justify-center gap-3">
            <Button onClick={handleConvert} disabled={status === 'processing'}>
              {status === 'processing'
                ? t('common.processing')
                : t(`tools.${i18nKey}.name`)}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              {t('common.reset')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
