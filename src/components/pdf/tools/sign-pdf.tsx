'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { addSignature } from '@/lib/pdf/sign';
import { CheckCircleIcon, FileIcon, MousePointerClickIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState, useCallback } from 'react';

export function SignPdfTool() {
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

  const [signatureText, setSignatureText] = useState('');
  const [signatureImage, setSignatureImage] = useState<Uint8Array | null>(null);
  const [mode, setMode] = useState<'text' | 'draw'>('text');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const file = files[0];

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawing(true);
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    setSignatureImage(null);
  }, []);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        blob.arrayBuffer().then((buffer) => {
          setSignatureImage(new Uint8Array(buffer));
        });
      }
    }, 'image/png');
  }, []);

  const handleSign = async () => {
    if (!file) return;

    let signatureData: Uint8Array | undefined;

    if (mode === 'draw' && hasDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        signatureData = new Uint8Array(buffer);
      }
    }

    if (mode === 'text' && !signatureText.trim() && !signatureData) {
      setError('Please enter signature text or draw a signature');
      return;
    }

    setStatus('processing');
    try {
      const result = await addSignature(file.buffer, {
        text: mode === 'text' ? signatureText : undefined,
        signatureImage: signatureData,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        pageIndex: 0,
        fontSize: 36,
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-signed.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signing failed');
    }
  };

  // Processing done state
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

  // File uploaded - signature configuration state
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
          <div className="flex gap-2">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('text')}
            >
              Text Signature
            </Button>
            <Button
              variant={mode === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('draw')}
            >
              Draw Signature
            </Button>
          </div>

          {mode === 'text' ? (
            <div className="p-1">
              <label className="mb-1 block text-sm font-medium">
                Signature Text
              </label>
              <Input
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Draw Your Signature
              </label>
              <div className="rounded-lg border bg-white p-2">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair rounded border"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={saveCanvas}>
                  Save Signature
                </Button>
              </div>
              {signatureImage && (
                <p className="text-xs text-green-600">Signature saved!</p>
              )}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <MousePointerClickIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              The signature will be placed in the upper-left area of the first
              page. Download and use a PDF editor if you need precise
              positioning.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleSign}
          disabled={
            (mode === 'text' && !signatureText.trim() && !signatureImage) ||
            (mode === 'draw' && !signatureImage) ||
            status === 'processing'
          }
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.signPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
