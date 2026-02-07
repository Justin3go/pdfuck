import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

export interface OcrOptions {
  language: 'chi_sim' | 'eng' | 'chi_sim+eng';
}

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * 将 PDF 页面渲染为图片
 */
async function renderPageToImage(
  pdfDocument: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2
): Promise<ImageData> {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * 使用 Tesseract.js 识别图片中的文字
 */
async function recognizeText(
  imageData: ImageData,
  language: string
): Promise<OcrResult> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  ctx.putImageData(imageData, 0, 0);

  const result = await Tesseract.recognize(
    canvas.toDataURL('image/png'),
    language,
    {
      logger: () => {}, // 禁用日志
    }
  );

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

/**
 * 对 PDF 进行 OCR 识别并添加可搜索文本层
 */
export async function ocrPdf(
  pdfBuffer: Uint8Array,
  options: OcrOptions
): Promise<Uint8Array> {
  try {
    // 加载 PDF 用于渲染
    const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    // 加载 PDF 用于编辑
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      // 渲染页面为图片
      const imageData = await renderPageToImage(pdfjsDoc, i + 1, 2);

      // OCR 识别
      const ocrResult = await recognizeText(imageData, options.language);

      if (ocrResult.text.trim()) {
        // 添加透明文本层
        // 注意：这里简化处理，将识别的文本整体添加到页面左上角
        // 实际应用中应该根据 Tesseract 返回的每个字符/单词的位置精确定位
        const lines = ocrResult.text.split('\n').filter((line) => line.trim());
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const y = height - 50 - lineIndex * lineHeight;

          if (y > 0) {
            page.drawText(line, {
              x: 50,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
              opacity: 0.01, // 几乎透明，但可选择
            });
          }
        }
      }
    }

    // 复制元数据
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const creator = pdfDoc.getCreator();

    pdfDoc.setCreator(`${creator || ''} (OCR Processed)`);
    pdfDoc.setModificationDate(new Date());

    return await pdfDoc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OCR failed: ${error.message}`);
    }
    throw new Error('OCR failed');
  }
}
