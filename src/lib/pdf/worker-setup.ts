import * as pdfjsLib from 'pdfjs-dist';

let workerInitialized = false;

export function initPdfWorker() {
  if (workerInitialized) return;
  // Use local worker file from node_modules
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  workerInitialized = true;
}
