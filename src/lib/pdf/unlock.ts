import { PDFDocument } from 'pdf-lib';

export async function unlockPdf(
  pdfBuffer: Uint8Array,
  password: string
): Promise<Uint8Array> {
  try {
    // Try to load with password
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await (PDFDocument as any).load(pdfBuffer, {
      password: password,
      ignoreEncryption: false,
    });

    // Save without password
    return await doc.save();
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('password') ||
        error.message.includes('encrypted')
      ) {
        throw new Error(
          'Incorrect password or document is not password protected'
        );
      }
      throw new Error(`Failed to unlock PDF: ${error.message}`);
    }
    throw new Error('Failed to unlock PDF');
  }
}
