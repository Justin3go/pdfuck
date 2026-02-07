import { PDFDocument } from 'pdf-lib';

export interface SanitizeOptions {
  removeMetadata: boolean;
  removeJavaScript: boolean;
  removeEmbeddedFiles: boolean;
  removeLinks: boolean;
  removeComments: boolean;
}

const defaultOptions: SanitizeOptions = {
  removeMetadata: true,
  removeJavaScript: true,
  removeEmbeddedFiles: true,
  removeLinks: true,
  removeComments: true,
};

export async function sanitizePdf(
  pdfBuffer: Uint8Array,
  options: Partial<SanitizeOptions> = {}
): Promise<{
  data: Uint8Array;
  removedItems: string[];
}> {
  const opts = { ...defaultOptions, ...options };
  const removedItems: string[] = [];

  try {
    const doc = await PDFDocument.load(pdfBuffer);

    // Remove metadata
    if (opts.removeMetadata) {
      const author = doc.getAuthor();
      const creator = doc.getCreator();
      const producer = doc.getProducer();
      const title = doc.getTitle();
      const subject = doc.getSubject();
      const keywords = doc.getKeywords();

      if (author || creator || producer || title || subject || keywords) {
        doc.setAuthor('');
        doc.setCreator('');
        doc.setProducer('');
        doc.setTitle('');
        doc.setSubject('');
        doc.setKeywords([]);
        doc.setCreationDate(new Date(0));
        doc.setModificationDate(new Date(0));
        removedItems.push('元数据');
      }
    }

    // Remove JavaScript actions - using any to access internal API
    if (opts.removeJavaScript) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catalog = (doc as any).catalog;
      let hasJavaScript = false;

      try {
        // Check and remove OpenAction
        if (catalog.get && catalog.get('OpenAction')) {
          catalog.delete('OpenAction');
          hasJavaScript = true;
        }

        // Check and remove Names/JavaScript
        if (catalog.get && catalog.get('Names')) {
          const names = catalog.get('Names');
          if (names && names.get && names.get('JavaScript')) {
            names.delete('JavaScript');
            hasJavaScript = true;
          }
        }
      } catch {
        // Ignore errors from internal API access
      }

      if (hasJavaScript) {
        removedItems.push('JavaScript');
      }
    }

    // Remove embedded files - using any to access internal API
    if (opts.removeEmbeddedFiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catalog = (doc as any).catalog;
      let hasEmbeddedFiles = false;

      try {
        if (catalog.get && catalog.get('Names')) {
          const names = catalog.get('Names');
          if (names && names.get && names.get('EmbeddedFiles')) {
            names.delete('EmbeddedFiles');
            hasEmbeddedFiles = true;
          }
        }
      } catch {
        // Ignore errors from internal API access
      }

      if (hasEmbeddedFiles) {
        removedItems.push('嵌入文件');
      }
    }

    // Process each page to remove annotations (links, comments, etc.)
    const pages = doc.getPages();
    let hasRemovedLinks = false;
    let hasRemovedComments = false;

    for (const page of pages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = (page as any).node;
      if (!node || !node.get) continue;

      try {
        const annotations = node.get('Annots');

        if (annotations) {
          const annotArray = annotations.asArray ? annotations.asArray() : [];
          const newAnnotations = [];

          for (const annotRef of annotArray) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const annot = (doc as any).context.lookup(annotRef);
            if (!annot || !annot.get) {
              newAnnotations.push(annotRef);
              continue;
            }

            const subtype = annot.get('Subtype');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subtypeName = subtype ? (subtype as any).asString() : null;

            // Check annotation type and filter based on options
            if (subtypeName) {
              // Link annotations
              if (subtypeName === 'Link' && opts.removeLinks) {
                hasRemovedLinks = true;
                continue; // Skip this annotation
              }

              // Text annotations (comments)
              if (subtypeName === 'Text' && opts.removeComments) {
                hasRemovedComments = true;
                continue;
              }

              // Popup annotations (associated with comments)
              if (subtypeName === 'Popup' && opts.removeComments) {
                hasRemovedComments = true;
                continue;
              }

              // FreeText annotations
              if (subtypeName === 'FreeText' && opts.removeComments) {
                hasRemovedComments = true;
                continue;
              }

              // Highlight/Squiggly/StrikeOut/Underline (comment-related)
              const commentTypes = [
                'Highlight',
                'Squiggly',
                'StrikeOut',
                'Underline',
                'Caret',
                'Ink',
                'Stamp',
              ];
              if (commentTypes.includes(subtypeName) && opts.removeComments) {
                hasRemovedComments = true;
                continue;
              }
            }

            // Keep non-filtered annotations
            newAnnotations.push(annotRef);
          }

          // Update annotations array
          if (newAnnotations.length !== annotArray.length) {
            if (newAnnotations.length === 0) {
              node.delete('Annots');
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              node.set('Annots', (doc as any).context.obj(newAnnotations));
            }
          }
        }
      } catch {
        // Ignore errors from internal API access
      }
    }

    if (hasRemovedLinks) {
      removedItems.push('超链接');
    }
    if (hasRemovedComments) {
      removedItems.push('批注和注释');
    }

    const result = await doc.save();
    return {
      data: result,
      removedItems: removedItems.length > 0 ? removedItems : ['无'],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`清理PDF失败: ${error.message}`);
    }
    throw new Error('清理PDF失败');
  }
}
