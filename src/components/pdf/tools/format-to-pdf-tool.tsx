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
import { convertImageToPng, imagesToPdf } from '@/lib/pdf/from-images';
import {
  CheckCircleIcon,
  FileIcon,
  GripVerticalIcon,
  Trash2Icon,
  PlusIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCallback, useState, useRef } from 'react';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const loadImages = useCallback(async (fileList: FileList | File[]) => {
    setStatus('loading');
    try {
      const files = Array.from(fileList);
      const newImages: ImageFile[] = [];

      for (const file of files) {
        let buffer = new Uint8Array(await file.arrayBuffer());
        let mimeType = file.type;

        // Convert non-PNG/JPG formats to PNG for PDF embedding compatibility
        if (
          mimeType === 'image/webp' ||
          mimeType === 'image/bmp' ||
          mimeType === 'image/gif' ||
          mimeType === 'image/svg+xml'
        ) {
          buffer = new Uint8Array(await convertImageToPng(buffer, mimeType));
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        loadImages(droppedFiles);
      }
    },
    [loadImages]
  );

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
      setResultBlob(
        new Blob([new Uint8Array(result)], { type: 'application/pdf' })
      );
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

  // 处理完成状态
  if (status === 'done' && resultBlob) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="flex gap-3">
          <Button onClick={handleDownload}>{t('common.download')}</Button>
          <Button variant="outline" onClick={handleReset}>
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
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    );
  }

  // 初始未传文件状态
  if (images.length === 0) {
    return (
      <FileDropzone
        acceptedMimeTypes={[acceptedMimeType]}
        multiple={true}
        onFilesSelected={loadImages}
      />
    );
  }

  // 上传文件后状态
  return (
    <div
      ref={dropzoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex min-h-[320px] flex-col justify-between rounded-xl border bg-card p-6"
    >
      <div className="flex-1 overflow-auto">
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
                className="flex items-center gap-3 rounded-lg border bg-background p-2"
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

        {/* 继续拖拽上传区域 */}
        <div
          className={cn(
            'mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/40'
          )}
        >
          <PlusIcon
            className={cn(
              'mb-2 size-6 transition-colors',
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <p className="text-sm text-muted-foreground">
            {isDragOver ? t('dropzone.dropHere') : t('dropzone.dragMoreFiles')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button onClick={handleConvert} disabled={status === 'processing'}>
          {status === 'processing'
            ? t('common.processing')
            : t(`tools.${i18nKey}.name`)}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
