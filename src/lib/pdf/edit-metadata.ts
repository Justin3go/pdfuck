import { PDFDocument } from 'pdf-lib';

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

export async function getMetadata(pdfBuffer: Uint8Array): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  return {
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
    subject: doc.getSubject() || '',
    keywords: (doc.getKeywords() || '').toString(),
    creator: doc.getCreator() || '',
    producer: doc.getProducer() || '',
  };
}

export async function setMetadata(
  pdfBuffer: Uint8Array,
  metadata: PdfMetadata
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });
  if (metadata.title) doc.setTitle(metadata.title);
  if (metadata.author) doc.setAuthor(metadata.author);
  if (metadata.subject) doc.setSubject(metadata.subject);
  if (metadata.keywords) doc.setKeywords([metadata.keywords]);
  if (metadata.creator) doc.setCreator(metadata.creator);
  if (metadata.producer) doc.setProducer(metadata.producer);
  return doc.save();
}
