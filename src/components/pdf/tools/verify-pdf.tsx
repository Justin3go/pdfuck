'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { verifyPdf } from '@/lib/pdf/verify';
import { CheckCircleIcon, FileIcon, ShieldIcon, AlertTriangleIcon, XCircleIcon, FileCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { VerifyResult } from '@/lib/pdf/verify';

export function VerifyPdfTool() {
  const t = useTranslations('ToolsPage');
  const {
    files,
    status,
    error,
    loadFiles,
    setStatus,
    setError,
    reset,
  } = usePdfProcessor();

  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const file = files[0];

  const handleVerify = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const result = await verifyPdf(file.buffer);
      setVerifyResult(result);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setStatus('error');
    }
  };

  // Processing done state - show verification results
  if (status === 'done' && verifyResult) {
    const { signature, integrity, metadata } = verifyResult;

    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        {signature.hasSignature ? (
          signature.signatures.some(s => s.isValid) ? (
            <>
              <CheckCircleIcon className="size-12 text-green-500" />
              <p className="text-lg font-medium">验证完成 - 文档已签名</p>
            </>
          ) : (
            <>
              <AlertTriangleIcon className="size-12 text-amber-500" />
              <p className="text-lg font-medium">验证完成 - 签名可能无效</p>
            </>
          )
        ) : (
          <>
            <FileCheckIcon className="size-12 text-blue-500" />
            <p className="text-lg font-medium">验证完成 - 未检测到签名</p>
          </>
        )}

        <div className="w-full max-w-md space-y-3">
          {/* Signature Info */}
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium mb-2">数字签名</p>
            {signature.hasSignature ? (
              <div className="space-y-2 text-sm">
                {signature.signatures.map((sig, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {sig.isValid ? (
                      <CheckCircleIcon className="size-4 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="size-4 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{sig.signerName || '未知签名者'}</p>
                      {sig.signingTime && (
                        <p className="text-muted-foreground">
                          签名时间: {sig.signingTime.toLocaleString()}
                        </p>
                      )}
                      {sig.location && (
                        <p className="text-muted-foreground">位置: {sig.location}</p>
                      )}
                      {sig.reason && (
                        <p className="text-muted-foreground">原因: {sig.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">未检测到数字签名</p>
            )}
          </div>

          {/* Document Integrity */}
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium mb-2">文档完整性</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {integrity.structureValid ? (
                  <CheckCircleIcon className="size-4 text-green-500" />
                ) : (
                  <XCircleIcon className="size-4 text-red-500" />
                )}
                <span>文档结构: {integrity.structureValid ? '有效' : '损坏'}</span>
              </div>
              {integrity.lastModified && (
                <p className="text-muted-foreground">
                  最后修改: {integrity.lastModified.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Security Metadata */}
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium mb-2">安全信息</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {metadata.isEncrypted ? (
                  <ShieldIcon className="size-4 text-amber-500" />
                ) : (
                  <CheckCircleIcon className="size-4 text-green-500" />
                )}
                <span>加密状态: {metadata.isEncrypted ? '已加密' : '未加密'}</span>
              </div>
              <div className="flex items-center gap-2">
                {metadata.hasJavaScript ? (
                  <AlertTriangleIcon className="size-4 text-amber-500" />
                ) : (
                  <CheckCircleIcon className="size-4 text-green-500" />
                )}
                <span>JavaScript: {metadata.hasJavaScript ? '包含' : '无'}</span>
              </div>
              <div className="flex items-center gap-2">
                {metadata.hasEmbeddedFiles ? (
                  <AlertTriangleIcon className="size-4 text-amber-500" />
                ) : (
                  <CheckCircleIcon className="size-4 text-green-500" />
                )}
                <span>嵌入文件: {metadata.hasEmbeddedFiles ? '包含' : '无'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
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

  // File uploaded - ready to verify
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
              验证PDF文档的数字签名、完整性和安全性信息。
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>验证内容包括：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>数字签名有效性和签名者信息</li>
              <li>文档结构完整性</li>
              <li>加密状态</li>
              <li>是否包含JavaScript代码</li>
              <li>是否包含嵌入文件</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleVerify}
          disabled={status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.verifyPdf.name')}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
