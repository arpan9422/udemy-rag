import { index } from "../../lib/pinecone";
import { generateGeminiTextEmbedding } from "../geminiEmbedding";

interface PushSectionsOptions {
  namespace?: "course_lessons";
  dimension?: number;
}

/**
 * Push one or multiple course section objects to Pinecone
 */
export async function pushSectionsToPinecone(
  input: { section: string; title: string; file?: string; file_loc?: string } | 
         { section: string; title: string; file?: string; file_loc?: string }[],
  options: PushSectionsOptions = { namespace: "course_lessons", dimension: 768 } // 768-dim for text-embedding-001
) {
  const objects = Array.isArray(input) ? input : [input];
  const { namespace = "course_lessons", dimension = 768 } = options;

  const vectors: any[] = [];

  for (const obj of objects) {
    const { file, section, title, file_loc } = obj;

    // Combine section + title as the text to embed
    const textToEmbed = `${section} - ${title}`.trim();

    if (!textToEmbed) {
      console.warn(`⚠️ No text available for section "${title}"`);
      continue;
    }

    // Generate embedding
    const embedding = await generateGeminiTextEmbedding(textToEmbed);
    console.log(`Embedding length for "${title}":`, embedding.length);

    // Create unique ID
    const id = file ? `${file}_${title.replace(/\s+/g, "_")}` : `${title.replace(/\s+/g, "_")}_${Date.now()}`;

    vectors.push({
      id,
      values: embedding,
      metadata: {
        file,
        section,
        title,
        file_loc,
        namespace,
      },
    });
  }

  // Only upsert if we have vectors
  if (vectors.length > 0) {
    await index.namespace(namespace).upsert(vectors);
    console.log(`✅ Upserted ${vectors.length} sections into namespace: ${namespace}`);
  } else {
    console.warn("⚠️ No valid sections to upsert to Pinecone.");
  }
}
