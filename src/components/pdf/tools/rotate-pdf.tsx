'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import type { RotationAngle } from '@/lib/pdf/rotate';
import { rotatePdf } from '@/lib/pdf/rotate';
import {
  CheckCircleIcon,
  FileIcon,
  RotateCcwIcon,
  RotateCwIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function RotatePdfTool() {
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

  const file = files[0];
  const [rotations, setRotations] = useState<Map<number, RotationAngle>>(
    new Map()
  );

  const rotateAll = (angle: RotationAngle) => {
    if (!file) return;
    const newRotations = new Map<number, RotationAngle>();
    for (let i = 0; i < file.pageCount; i++) {
      newRotations.set(i, angle);
    }
    setRotations(newRotations);
  };

  const rotatePage = (pageIndex: number, delta: number) => {
    setRotations((prev) => {
      const next = new Map(prev);
      const current = next.get(pageIndex) || 0;
      const rawAngle = (current + delta) % 360;
      const newAngle = (
        rawAngle < 0 ? rawAngle + 360 : rawAngle
      ) as RotationAngle;
      next.set(pageIndex, newAngle);
      return next;
    });
  };

  const handleRotate = async () => {
    if (!file || rotations.size === 0) return;
    setStatus('processing');
    try {
      const rotationArray = Array.from(rotations.entries()).map(
        ([pageIndex, angle]) => ({ pageIndex, angle })
      );
      const result = await rotatePdf(file.buffer, rotationArray);
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-rotated.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rotate failed');
    }
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
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

        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => rotateAll(90)}>
            90°
          </Button>
          <Button variant="outline" size="sm" onClick={() => rotateAll(180)}>
            180°
          </Button>
          <Button variant="outline" size="sm" onClick={() => rotateAll(270)}>
            270°
          </Button>
        </div>

        <div className="grid max-h-[576px] grid-cols-3 gap-3 overflow-auto rounded-lg border p-1 sm:grid-cols-4 md:grid-cols-6">
          {file.thumbnails.map((thumb) => {
            const rotation = rotations.get(thumb.pageIndex) || 0;
            return (
              <div
                key={thumb.pageIndex}
                className="relative overflow-hidden rounded-lg border p-1"
              >
                <img
                  src={thumb.dataUrl}
                  alt={`Page ${thumb.pageNumber}`}
                  className="w-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
                <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 text-xs font-medium">
                  {thumb.pageNumber}
                </span>
                <div className="mt-1 flex justify-center gap-1">
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                    onClick={() => rotatePage(thumb.pageIndex, 90)}
                  >
                    <RotateCwIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                    onClick={() => rotatePage(thumb.pageIndex, -90)}
                  >
                    <RotateCcwIcon className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleRotate}
          disabled={rotations.size === 0 || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.rotatePdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
