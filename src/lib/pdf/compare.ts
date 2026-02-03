import * as pdfjsLib from 'pdfjs-dist';

// Worker is configured globally in the app

export interface Difference {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNum1?: number;
  lineNum2?: number;
}

export interface CompareResult {
  doc1Text: string;
  doc2Text: string;
  differences: Difference[];
  similarity: number;
}

async function extractTextFromPdf(pdfBuffer: Uint8Array): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

function computeDiff(text1: string, text2: string): Difference[] {
  const lines1 = text1.split('\n').filter((line) => line.trim());
  const lines2 = text2.split('\n').filter((line) => line.trim());

  const differences: Difference[] = [];
  const maxLines = Math.max(lines1.length, lines2.length);

  let i = 0;
  let j = 0;

  while (i < lines1.length || j < lines2.length) {
    const line1 = lines1[i];
    const line2 = lines2[j];

    if (i >= lines1.length) {
      // Remaining lines in doc2 are added
      differences.push({
        type: 'added',
        text: line2,
        lineNum2: j + 1,
      });
      j++;
    } else if (j >= lines2.length) {
      // Remaining lines in doc1 are removed
      differences.push({
        type: 'removed',
        text: line1,
        lineNum1: i + 1,
      });
      i++;
    } else if (line1.trim() === line2.trim()) {
      // Lines are the same
      differences.push({
        type: 'unchanged',
        text: line1,
        lineNum1: i + 1,
        lineNum2: j + 1,
      });
      i++;
      j++;
    } else {
      // Lines are different - mark as removed from doc1 and added to doc2
      differences.push({
        type: 'removed',
        text: line1,
        lineNum1: i + 1,
      });
      differences.push({
        type: 'added',
        text: line2,
        lineNum2: j + 1,
      });
      i++;
      j++;
    }
  }

  return differences;
}

export async function comparePdfs(
  pdfBuffer1: Uint8Array,
  pdfBuffer2: Uint8Array
): Promise<CompareResult> {
  try {
    const [doc1Text, doc2Text] = await Promise.all([
      extractTextFromPdf(pdfBuffer1),
      extractTextFromPdf(pdfBuffer2),
    ]);

    const differences = computeDiff(doc1Text, doc2Text);

    // Calculate similarity percentage
    const unchangedCount = differences.filter(
      (d) => d.type === 'unchanged'
    ).length;
    const totalLines = differences.length;
    const similarity =
      totalLines > 0 ? (unchangedCount / totalLines) * 100 : 100;

    return {
      doc1Text,
      doc2Text,
      differences,
      similarity: Math.round(similarity * 100) / 100,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to compare PDFs: ${error.message}`);
    }
    throw new Error('Failed to compare PDFs');
  }
}
