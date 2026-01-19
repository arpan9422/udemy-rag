import { index } from "../../lib/pinecone";
import { generateGeminiTextEmbedding } from "../geminiEmbedding";
import { pushImageToPinecone } from "./image.insertion";

interface PushToPineconeOptions {
  namespace: "file_summaries";
  dimension?: number;
}

/**
 * Push one or multiple summarized objects or lessons to Pinecone
 */
export async function pushtextToPinecone(
  input: any | any[],
  options: PushToPineconeOptions = { namespace: "file_summaries", dimension: 3072 }
) {
  const objects = Array.isArray(input) ? input : [input];
  const { namespace, dimension = 768 } = options;

  const vectors: any[] = [];

  for (const obj of objects) {
    const { file, section, summary, file_type, file_loc, title, text } = obj;

    // Safely get text or summary
    let textToEmbed = (text || "").trim();
    const summaryText = (summary || "").trim();

    if (!textToEmbed && !summaryText) {
      console.warn("⚠️ No text or summary available to embed");
      return;
    }

    // Prefer text, fallback to summary
    if (!textToEmbed) textToEmbed = summaryText;



    const embedding = await generateGeminiTextEmbedding(textToEmbed);
    console.log(embedding.length);
    


    // Create unique ID
    const id = file
      ? `${file}_${section || "general"}`
      : `${title || "lesson"}_${Date.now()}`;

    vectors.push({
      id,
      values: embedding,
      metadata: {
        file: file,
        section: section,
        title: title,
        text: text,
        summary: summary,
        file_type: file_type,
        file_loc: file_loc,
        namespace,
      },
    });

    await pushImageToPinecone(file, section, file_loc)
  }

  // Only upsert if we have vectors
  if (vectors.length > 0) {
    await index.namespace(namespace).upsert(vectors);
    console.log(`✅ Upserted ${vectors.length} items into namespace: ${namespace}`);
  } else {
    console.warn("⚠️ No valid objects to upsert to Pinecone.");
  }
}
