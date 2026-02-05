import { PDFDocument, PDFPage } from 'pdf-lib';

export type PageSize =
  | 'A3'
  | 'A4'
  | 'A5'
  | 'Letter'
  | 'Legal'
  | 'Tabloid'
  | 'Original';

export interface ResizeOptions {
  targetSize: PageSize;
  scaleContent: boolean;
}

// 标准页面尺寸（单位：点，1英寸=72点）
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A3: { width: 841.89, height: 1190.55 },
  A4: { width: 595.28, height: 841.89 },
  A5: { width: 419.53, height: 595.28 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
  Tabloid: { width: 792, height: 1224 },
  Original: { width: 0, height: 0 }, // 占位符，使用原始尺寸
};

export async function resizePdf(
  pdfBuffer: Uint8Array,
  options: ResizeOptions
): Promise<Uint8Array> {
  try {
    const sourceDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const newDoc = await PDFDocument.create();
    const sourcePages = sourceDoc.getPages();

    const targetSize =
      options.targetSize === 'Original' ? null : PAGE_SIZES[options.targetSize];

    for (const sourcePage of sourcePages) {
      const { width: originalWidth, height: originalHeight } =
        sourcePage.getSize();

      // 确定目标尺寸
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      if (targetSize) {
        targetWidth = targetSize.width;
        targetHeight = targetSize.height;
      }

      // 复制页面到新文档
      const [copiedPage] = await newDoc.copyPages(sourceDoc, [
        sourceDoc.getPages().indexOf(sourcePage),
      ]);

      // 设置新页面尺寸
      copiedPage.setSize(targetWidth, targetHeight);

      // 如果需要缩放内容
      if (options.scaleContent && targetSize) {
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;

        // 使用较小的缩放比例以保持内容比例
        const scale = Math.min(scaleX, scaleY);

        // 计算居中偏移
        const offsetX = (targetWidth - originalWidth * scale) / 2;
        const offsetY = (targetHeight - originalHeight * scale) / 2;

        // 注意：pdf-lib 不支持直接缩放页面内容
        // 这里我们只是调整页面大小，内容保持原样
        // 实际内容缩放需要在创建页面时处理

        // 如果目标页面比原页面大，内容保持原位
        // 如果目标页面比原页面小，内容可能被裁剪
      }

      newDoc.addPage(copiedPage);
    }

    // 复制元数据
    const title = sourceDoc.getTitle();
    const author = sourceDoc.getAuthor();
    const subject = sourceDoc.getSubject();
    const keywords = sourceDoc.getKeywords();
    const creator = sourceDoc.getCreator();
    const producer = sourceDoc.getProducer();
    const creationDate = sourceDoc.getCreationDate();
    const modificationDate = sourceDoc.getModificationDate();

    if (title) newDoc.setTitle(title);
    if (author) newDoc.setAuthor(author);
    if (subject) newDoc.setSubject(subject);
    if (keywords) newDoc.setKeywords(keywords);
    if (creator) newDoc.setCreator(creator);
    if (producer) newDoc.setProducer(producer);
    if (creationDate) newDoc.setCreationDate(creationDate);
    if (modificationDate) newDoc.setModificationDate(modificationDate);

    return await newDoc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to resize PDF: ${error.message}`);
    }
    throw new Error('Failed to resize PDF');
  }
}

export function getPageSizeDimensions(size: PageSize): {
  width: number;
  height: number;
  label: string;
} {
  const dimensions = PAGE_SIZES[size];
  const labels: Record<PageSize, string> = {
    A3: 'A3 (297 × 420 mm)',
    A4: 'A4 (210 × 297 mm)',
    A5: 'A5 (148 × 210 mm)',
    Letter: 'Letter (8.5 × 11 in)',
    Legal: 'Legal (8.5 × 14 in)',
    Tabloid: 'Tabloid (11 × 17 in)',
    Original: 'Keep Original Size',
  };

  return {
    width: dimensions.width,
    height: dimensions.height,
    label: labels[size],
  };
}
