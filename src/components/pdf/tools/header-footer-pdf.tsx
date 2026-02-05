'use client';

import { FileDropzone } from '@/components/pdf/file-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { addHeaderFooter } from '@/lib/pdf/header-footer';
import { CheckCircleIcon, FileIcon, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function HeaderFooterPdfTool() {
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

  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>(
    'center'
  );
  const [applyTo, setApplyTo] = useState<'all' | 'odd' | 'even'>('all');

  const file = files[0];

  const handleAddHeaderFooter = async () => {
    if (!file || (!headerText && !footerText)) return;
    setStatus('processing');
    try {
      const result = await addHeaderFooter(file.buffer, {
        headerText: headerText || undefined,
        footerText: footerText || undefined,
        fontSize,
        alignment,
        applyTo,
        color: { r: 0.5, g: 0.5, b: 0.5 },
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      setResultBlobs([
        {
          name: `${baseName}-with-header-footer.pdf`,
          blob: new Blob([new Uint8Array(result)], {
            type: 'application/pdf',
          }),
        },
      ]);
      setStatus('done');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add header/footer'
      );
      setStatus('error');
    }
  };

  const handleReset = () => {
    setHeaderText('');
    setFooterText('');
    setFontSize(10);
    setAlignment('center');
    setApplyTo('all');
    reset();
  };

  // 处理完成状态
  if (status === 'done' && resultBlobs.length > 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8">
        <CheckCircleIcon className="size-12 text-green-500" />
        <p className="text-lg font-medium">{t('common.completed')}</p>
        <p className="text-sm text-muted-foreground">
          {headerText && footerText
            ? 'Header & Footer added'
            : headerText
              ? 'Header added'
              : 'Footer added'}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() =>
              downloadBlob(resultBlobs[0].blob, resultBlobs[0].name)
            }
          >
            {t('common.download')}
          </Button>
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header-text" className="flex items-center gap-2">
              <Type className="size-4" />
              {t('common.headerText')}
            </Label>
            <Input
              id="header-text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter header text (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-text" className="flex items-center gap-2">
              <Type className="size-4" />
              {t('common.footerText')}
            </Label>
            <Input
              id="footer-text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter footer text (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('common.fontSize')}: {fontSize}px
            </Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={8}
              max={24}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('common.alignment')}</Label>
            <RadioGroup
              value={alignment}
              onValueChange={(v) =>
                setAlignment(v as 'left' | 'center' | 'right')
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="align-left" />
                <Label htmlFor="align-left" className="cursor-pointer">
                  {t('common.left')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="align-center" />
                <Label htmlFor="align-center" className="cursor-pointer">
                  {t('common.center')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="align-right" />
                <Label htmlFor="align-right" className="cursor-pointer">
                  {t('common.right')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>{t('common.applyTo')}</Label>
            <RadioGroup
              value={applyTo}
              onValueChange={(v) => setApplyTo(v as 'all' | 'odd' | 'even')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="apply-all" />
                <Label htmlFor="apply-all" className="cursor-pointer">
                  {t('common.allPages')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="odd" id="apply-odd" />
                <Label htmlFor="apply-odd" className="cursor-pointer">
                  {t('common.oddPages')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="even" id="apply-even" />
                <Label htmlFor="apply-even" className="cursor-pointer">
                  {t('common.evenPages')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3 border-t pt-4">
        <Button
          onClick={handleAddHeaderFooter}
          disabled={(!headerText && !footerText) || status === 'processing'}
        >
          {status === 'processing'
            ? t('common.processing')
            : t('tools.headerFooter.name')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t('common.reset')}
        </Button>
      </div>
    </div>
  );
}
