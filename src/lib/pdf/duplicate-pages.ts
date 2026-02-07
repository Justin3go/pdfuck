import { PDFDocument } from 'pdf-lib';

export interface DuplicateOptions {
  pageIndices: number[]; // 要复制的页面索引（从0开始）
  insertAfter: number; // 插入位置（-1表示在开头）
  copies: number; // 每个页面复制几份
}

export async function duplicatePages(
  pdfBuffer: Uint8Array,
  options: DuplicateOptions
): Promise<Uint8Array> {
  try {
    const sourceDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    const newDoc = await PDFDocument.create();
    const sourcePages = sourceDoc.getPages();

    if (options.pageIndices.length === 0) {
      throw new Error('No pages selected for duplication');
    }

    // 验证页面索引
    const invalidIndices = options.pageIndices.filter(
      (i) => i < 0 || i >= sourcePages.length
    );
    if (invalidIndices.length > 0) {
      throw new Error(`Invalid page indices: ${invalidIndices.join(', ')}`);
    }

    // 构建最终页面的顺序
    const finalPageIndices: number[] = [];

    // 如果要在开头插入
    if (options.insertAfter === -1) {
      // 先添加复制的页面
      for (let copy = 0; copy < options.copies; copy++) {
        finalPageIndices.push(...options.pageIndices);
      }
      // 再添加原始所有页面
      for (let i = 0; i < sourcePages.length; i++) {
        finalPageIndices.push(i);
      }
    } else if (
      options.insertAfter >= 0 &&
      options.insertAfter < sourcePages.length
    ) {
      // 在某个位置后插入
      // 先添加从开始到插入点的页面
      for (let i = 0; i <= options.insertAfter; i++) {
        finalPageIndices.push(i);
      }
      // 添加复制的页面
      for (let copy = 0; copy < options.copies; copy++) {
        finalPageIndices.push(...options.pageIndices);
      }
      // 添加剩余的原始页面
      for (let i = options.insertAfter + 1; i < sourcePages.length; i++) {
        finalPageIndices.push(i);
      }
    } else if (options.insertAfter === sourcePages.length - 1) {
      // 在末尾追加（等同于在最后一页后）
      for (let i = 0; i < sourcePages.length; i++) {
        finalPageIndices.push(i);
      }
      for (let copy = 0; copy < options.copies; copy++) {
        finalPageIndices.push(...options.pageIndices);
      }
    } else {
      throw new Error('Invalid insert position');
    }

    // 复制页面到新文档
    const copiedPages = await newDoc.copyPages(sourceDoc, finalPageIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
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
    if (keywords) newDoc.setKeywords(Array.isArray(keywords) ? keywords : [keywords]);
    if (creator) newDoc.setCreator(creator);
    if (producer) newDoc.setProducer(producer);
    if (creationDate) newDoc.setCreationDate(creationDate);
    if (modificationDate) newDoc.setModificationDate(modificationDate);

    return await newDoc.save();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to duplicate pages: ${error.message}`);
    }
    throw new Error('Failed to duplicate pages');
  }
}
