import { GoogleGenAI } from "@google/genai";
import { getThreadMessages } from "../../zep/zepMemory";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface GeminiInput {
  text: string;
  summary: string;
  file?: string;
}

export async function generateGeminiConclusionFromInput(input: GeminiInput, threadId:string): Promise<string> {
  // Use text or fallback to summary
  const contentToUse = (input.text && input.text.trim()) || (input.summary && input.summary.trim());
  if (!contentToUse) throw new Error("Cannot generate conclusion: both text and summary are empty");

  const history = getThreadMessages(threadId)

  // Construct prompt
  const promptText = `${input.file ? `File: ${input.file}\n\n` : ""}${contentToUse}\n\nInstructions:\n1. Summarize main points.\n2. Provide a concise final conclusion.\n3. Use bullet points if necessary. \n 4. the memory `;

  // Generate content using Gemini
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promptText,
  });

  // response.text contains the generated output
  const conclusion = response.text?.trim() || "";

  if (!conclusion) throw new Error("No conclusion returned from Gemini");

  return conclusion;
}
