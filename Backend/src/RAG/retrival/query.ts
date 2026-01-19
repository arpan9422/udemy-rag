import { index } from "../../lib/pinecone";
import { generateGeminiTextEmbedding } from "../geminiEmbedding";

interface QueryOptions {
  topK?: number;
  namespaces?: string[];
}

/**
 * Query multiple namespaces in Pinecone
 */
export async function queryPinecone(
  queryText: string,
  options: QueryOptions = { topK: 5, namespaces: ["file_summaries", "course_lessons"] }
) {
  const { topK = 5, namespaces = ["file_summaries", "course_lessons"] } = options;

  // Generate embedding for the query
  const queryEmbedding = await generateGeminiTextEmbedding(queryText);

  let allResults: any[] = [];

  for (const ns of namespaces) {
    const queryResponse = await index.namespace(ns).query({
      topK,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: false, // optional
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      allResults = allResults.concat(
        queryResponse.matches.map((m:any) => ({ ...m, namespace: ns }))
      );
    }
  }

  // Sort combined results by score descending
  allResults.sort((a, b) => (b.score || 0) - (a.score || 0));

  return allResults;
}
