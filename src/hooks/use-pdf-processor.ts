'use client';

import { generateThumbnails } from '@/lib/pdf/preview';
import { type PdfFile, usePdfToolStore } from '@/stores/pdf-tool-store';
import { useCallback, useEffect } from 'react';

let idCounter = 0;
function generateId() {
  idCounter += 1;
  return `pdf-${Date.now()}-${idCounter}`;
}

export function usePdfProcessor() {
  const store = usePdfToolStore();
  const reset = store.reset;

  // 组件卸载时重置状态，确保各工具页面状态独立
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const loadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      store.setStatus('loading');

      try {
        const files = Array.from(fileList);
        const pdfFiles: PdfFile[] = [];

        for (const file of files) {
          const buffer = new Uint8Array(await file.arrayBuffer());
          let thumbnails: PdfFile['thumbnails'] = [];
          let pageCount = 0;

          if (file.type === 'application/pdf') {
            thumbnails = await generateThumbnails(buffer);
            pageCount = thumbnails.length;
          }

          pdfFiles.push({
            id: generateId(),
            file,
            buffer,
            name: file.name,
            size: file.size,
            thumbnails,
            pageCount,
          });
        }

        store.addFiles(pdfFiles);
        store.setStatus('idle');
      } catch (err) {
        store.setError(
          err instanceof Error ? err.message : 'Failed to load files'
        );
      }
    },
    [store]
  );

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(
    (blobs: Array<{ name: string; blob: Blob }>) => {
      for (const { name, blob } of blobs) {
        downloadBlob(blob, name);
      }
    },
    [downloadBlob]
  );

  return {
    files: store.files,
    status: store.status,
    progress: store.progress,
    error: store.error,
    resultBlobs: store.resultBlobs,
    addFiles: store.addFiles,
    removeFile: store.removeFile,
    reorderFiles: store.reorderFiles,
    setStatus: store.setStatus,
    setProgress: store.setProgress,
    setError: store.setError,
    setResultBlobs: store.setResultBlobs,
    reset: store.reset,
    loadFiles,
    downloadBlob,
    downloadAll,
  };
}
