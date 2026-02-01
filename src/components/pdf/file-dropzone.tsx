'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';

interface FileDropzoneProps {
  acceptedMimeTypes: string[];
  multiple: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  className?: string;
}

export function FileDropzone({
  acceptedMimeTypes,
  multiple,
  onFilesSelected,
  className,
}: FileDropzoneProps) {
  const t = useTranslations('ToolsPage.dropzone');
  const ct = useTranslations('ToolsPage.common');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25',
        className
      )}
    >
      <UploadIcon className="mb-4 size-10 text-muted-foreground" />
      <p className="text-lg font-medium">{t('title')}</p>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => inputRef.current?.click()}
      >
        {multiple ? ct('selectFiles') : ct('selectFile')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedMimeTypes.join(',')}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <p className="mt-3 text-xs text-muted-foreground">{t('hint')}</p>
    </div>
  );
}
