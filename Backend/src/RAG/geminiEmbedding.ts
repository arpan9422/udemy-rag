import fs from "fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const TEXT_MODEL = "text-embedding-004";
const IMAGE_MODEL = "gemini-embedding-001";

/**
 * Generate Gemini embedding for text
 */
export async function generateGeminiTextEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === "") throw new Error("Text cannot be empty");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:embedContent`;

  const body = {
    content: { parts: [{ text }] },
    taskType: "RETRIEVAL_DOCUMENT",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini text embedding failed: ${err}`);
  }

  const json: any = await response.json();
  const embedding = json.embedding?.values || json.embeddings?.[0]?.values;
  if (!embedding) throw new Error("No embedding returned from Gemini");
  return embedding;
}

/**
 * Generate Gemini embedding for an image
 */
export async function generateGeminiImageEmbedding(imagePath: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:embedContent`;

  const imageBase64 = fs.readFileSync(imagePath).toString("base64");

  const body = {
    content: {
      parts: [{ inlineData: { mimeType: "image/png", data: imageBase64 } }],
    },
    taskType: "RETRIEVAL_DOCUMENT",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini image embedding failed: ${err}`);
  }

  const json: any = await response.json();
  const embedding = json.embedding?.values || json.embeddings?.[0]?.values;
  if (!embedding) throw new Error("No embedding returned from Gemini");
  return embedding;
}
