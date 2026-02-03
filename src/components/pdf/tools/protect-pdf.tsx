'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { protectPdf } from '@/lib/pdf/protect';
import { CheckCircleIcon, FileIcon, ShieldIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function ProtectPdfTool() {
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

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const file = files[0];

  const handleProtect = async () => {
    if (!file || !password.trim()) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setStatus('error');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setStatus('error');
      return;
    }

    setStatus('processing');
    try {
      const result = await protectPdf(file.buffer, {
        password: password.trim(),
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-protected.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Protection failed');
      setStatus('error');
    }
  };

  // Processing done state
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Important:</p>
          <p>
            Please remember your password. If you forget it, you won't be able
            to access the document.
          </p>
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

  // File uploaded - password configuration state
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
            <ShieldIcon className="size-5 shrink-0" />
            <p className="text-sm">
              Set a password to protect your PDF. The password will be required
              to open the document.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  password.trim() &&
                  confirmPassword.trim()
                ) {
                  handleProtect();
                }
              }}
            />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside">
              <li className={password.length >= 4 ? 'text-green-600' : ''}>
                At least 4 characters
              </li>
              <li
                className={
                  password === confirmPassword && password.length > 0
                    ? 'text-green-600'
                    : ''
                }
              >
                Passwords must match
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleProtect}
          disabled={
            !password.trim() ||
            password !== confirmPassword ||
            password.length < 4 ||
            status === 'processing'
          }
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.protectPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
