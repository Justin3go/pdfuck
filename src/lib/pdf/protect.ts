import { PDFDocument } from 'pdf-lib';

export interface ProtectOptions {
  password: string;
}

export async function protectPdf(
  pdfBuffer: Uint8Array,
  options: ProtectOptions
): Promise<Uint8Array> {
  try {
    const doc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });

    // Encrypt the document with user password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const encrypted = await (doc as any).save({
      password: options.password,
    });

    return encrypted;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to protect PDF: ${error.message}`);
    }
    throw new Error('Failed to protect PDF');
  }
}
