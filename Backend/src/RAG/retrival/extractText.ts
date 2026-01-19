interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    text?: string;
    summary?: string;
    file?: string;
    [key: string]: any;
  };
  namespace: string;
}

/**
 * Extract text, summary, and file name from the top Pinecone match
 */
export function extractTextSummaryAndFile(
  matches: PineconeMatch[]
): { text: string; summary: string; file?: string } {
  if (!matches || matches.length === 0) {
    return { text: "", summary: "", file: undefined };
  }

  // Sort by score descending
  const sorted = matches.sort((a, b) => (b.score || 0) - (a.score || 0));

  for (const match of sorted) {
    const text = match.metadata.text?.trim() || "";
    const summary = match.metadata.summary?.trim() || "";
    const file = match.metadata.file;

    if (text || summary) {
      return { text, summary, file };
    }
  }

  // Fallback: no text or summary found
  const topFile = sorted[0].metadata.file;
  return { text: "", summary: "", file: topFile };
}
