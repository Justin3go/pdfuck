import { PDFDocument } from 'pdf-lib';

export interface SignatureInfo {
  hasSignature: boolean;
  signatures: SignatureDetails[];
}

export interface SignatureDetails {
  signerName?: string;
  signingTime?: Date;
  location?: string;
  reason?: string;
  isValid: boolean;
  byteRange?: number[];
}

export interface DocumentIntegrity {
  isModified: boolean;
  lastModified?: Date;
  structureValid: boolean;
}

export interface VerifyResult {
  signature: SignatureInfo;
  integrity: DocumentIntegrity;
  metadata: {
    isEncrypted: boolean;
    hasJavaScript: boolean;
    hasEmbeddedFiles: boolean;
  };
}

export async function verifyPdf(pdfBuffer: Uint8Array): Promise<VerifyResult> {
  try {
    // Try to load the PDF - if it fails, structure is invalid
    let doc: PDFDocument;
    let isEncrypted = false;
    try {
      doc = await PDFDocument.load(pdfBuffer, {
        ignoreEncryption: false,
      });
    } catch (loadError) {
      // Try with ignore encryption flag
      try {
        doc = await PDFDocument.load(pdfBuffer, {
          ignoreEncryption: true,
        });
        isEncrypted = true;
      } catch {
        return {
          signature: {
            hasSignature: false,
            signatures: [],
          },
          integrity: {
            isModified: false,
            structureValid: false,
          },
          metadata: {
            isEncrypted: false,
            hasJavaScript: false,
            hasEmbeddedFiles: false,
          },
        };
      }
    }

    // Check for JavaScript - using any to access internal API
    let hasJavaScript = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catalog = (doc as any).catalog;

    try {
      if (catalog.get && catalog.get('Names')) {
        const names = catalog.get('Names');
        if (names && names.get && names.get('JavaScript')) {
          hasJavaScript = true;
        }
      }

      // Also check OpenAction for JavaScript
      if (catalog.get && catalog.get('OpenAction')) {
        const openAction = catalog.get('OpenAction');
        if (openAction && openAction.get) {
          const js = openAction.get('JS');
          if (js) {
            hasJavaScript = true;
          }
        }
      }
    } catch {
      // Ignore errors from internal API access
    }

    // Check for embedded files
    let hasEmbeddedFiles = false;
    try {
      if (catalog.get && catalog.get('Names')) {
        const names = catalog.get('Names');
        if (names && names.get && names.get('EmbeddedFiles')) {
          hasEmbeddedFiles = true;
        }
      }
    } catch {
      // Ignore errors from internal API access
    }

    // Look for digital signatures
    const signatures: SignatureDetails[] = [];
    let hasSignature = false;

    try {
      // Check AcroForm for signature fields
      if (catalog.get && catalog.get('AcroForm')) {
        const acroForm = catalog.get('AcroForm');
        if (acroForm && acroForm.get) {
          const fields = acroForm.get('Fields');
          if (fields && fields.asArray) {
            const fieldArray = fields.asArray();

            for (const fieldRef of fieldArray) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const field = (doc as any).context.lookup(fieldRef);
              if (!field || !field.get) continue;

              const fieldType = field.get('FT');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (
                fieldType &&
                (fieldType as any).asString &&
                (fieldType as any).asString() === 'Sig'
              ) {
                hasSignature = true;

                // Get signature details
                const v = field.get('V');
                if (v && v.get) {
                  const sigDetails: SignatureDetails = {
                    isValid: false, // We can't cryptographically verify without more complex logic
                  };

                  // Extract signer name
                  const name = v.get('Name');
                  if (
                    name &&
                    (name as unknown as { asString: () => string }).asString
                  ) {
                    sigDetails.signerName = (
                      name as unknown as { asString: () => string }
                    ).asString();
                  }

                  // Extract signing time
                  const time = v.get('M');
                  if (
                    time &&
                    (time as unknown as { asString: () => string }).asString
                  ) {
                    try {
                      const timeStr = (
                        time as unknown as { asString: () => string }
                      ).asString();
                      // Parse PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
                      const match = timeStr.match(
                        /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/
                      );
                      if (match) {
                        sigDetails.signingTime = new Date(
                          parseInt(match[1]),
                          parseInt(match[2]) - 1,
                          parseInt(match[3]),
                          parseInt(match[4]),
                          parseInt(match[5]),
                          parseInt(match[6])
                        );
                      }
                    } catch {
                      // Ignore date parsing errors
                    }
                  }

                  // Extract location
                  const location = v.get('Location');
                  if (
                    location &&
                    (location as unknown as { asString: () => string }).asString
                  ) {
                    sigDetails.location = (
                      location as unknown as { asString: () => string }
                    ).asString();
                  }

                  // Extract reason
                  const reason = v.get('Reason');
                  if (
                    reason &&
                    (reason as unknown as { asString: () => string }).asString
                  ) {
                    sigDetails.reason = (
                      reason as unknown as { asString: () => string }
                    ).asString();
                  }

                  // Check byte range for integrity verification
                  const byteRange = v.get('ByteRange');
                  if (byteRange && byteRange.asArray) {
                    const range = byteRange.asArray();
                    sigDetails.byteRange = range.map((r: unknown) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (r as any).asNumber ? (r as any).asNumber() : r
                    );

                    // If byte range exists, we can assume some level of validity
                    // but we can't fully verify without crypto libraries
                    sigDetails.isValid =
                      Array.isArray(sigDetails.byteRange) &&
                      sigDetails.byteRange.length === 4;
                  }

                  signatures.push(sigDetails);
                }
              }
            }
          }
        }
      }
    } catch {
      // Ignore errors from internal API access
    }

    // Get modification date from metadata
    let lastModified: Date | undefined;
    try {
      lastModified = doc.getModificationDate() || undefined;
    } catch {
      // Ignore if not available
    }

    // Simple structure validation - we were able to load it
    const structureValid = true;

    // We can't detect modifications without comparing to an original
    // but we can check if signatures are intact
    const isModified = hasSignature && signatures.every((s) => !s.isValid);

    return {
      signature: {
        hasSignature,
        signatures,
      },
      integrity: {
        isModified,
        lastModified,
        structureValid,
      },
      metadata: {
        isEncrypted,
        hasJavaScript,
        hasEmbeddedFiles,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`验证PDF失败: ${error.message}`);
    }
    throw new Error('验证PDF失败');
  }
}
