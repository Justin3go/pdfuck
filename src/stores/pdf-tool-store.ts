import type { PageThumbnail } from '@/lib/pdf/preview';
import { create } from 'zustand';

export interface PdfFile {
  id: string;
  file: File;
  buffer: Uint8Array;
  name: string;
  size: number;
  thumbnails: PageThumbnail[];
  pageCount: number;
}

export type ProcessingStatus =
  | 'idle'
  | 'loading'
  | 'processing'
  | 'done'
  | 'error';

interface PdfToolState {
  files: PdfFile[];
  status: ProcessingStatus;
  progress: number;
  error: string | null;
  resultBlobs: Array<{ name: string; blob: Blob }>;

  addFiles: (files: PdfFile[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (newOrder: string[]) => void;
  setStatus: (status: ProcessingStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setResultBlobs: (blobs: Array<{ name: string; blob: Blob }>) => void;
  reset: () => void;
}

const initialState = {
  files: [] as PdfFile[],
  status: 'idle' as ProcessingStatus,
  progress: 0,
  error: null as string | null,
  resultBlobs: [] as Array<{ name: string; blob: Blob }>,
};

export const usePdfToolStore = create<PdfToolState>((set) => ({
  ...initialState,
  addFiles: (newFiles) =>
    set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),
  reorderFiles: (newOrder) =>
    set((state) => ({
      files: newOrder
        .map((id) => state.files.find((f) => f.id === id))
        .filter(Boolean) as PdfFile[],
    })),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, status: 'error' }),
  setResultBlobs: (resultBlobs) => set({ resultBlobs, status: 'done' }),
  reset: () => set(initialState),
}));
