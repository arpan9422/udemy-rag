import { buildFinalRAGResult } from "./extractSources";
import { extractTextSummaryAndFile } from "./extractText";
import { generateGeminiConclusionFromInput } from "./geminiSummarizer";
import { queryPinecone } from "./query";

export async function getAnswerfromRAG(query: string, threadId: string) {
    try {
        // 1️⃣ Query Pinecone
        const RAG_result: any = await queryPinecone(query);
        console.log(RAG_result);
        
        if (!RAG_result || RAG_result.length === 0) {
            return {
                result_from_RAG: [],
                conclusion: "",
                error: "No results returned from Pinecone for the given query",
            };
        }
        const structed_sources = await buildFinalRAGResult({ result_from_RAG: RAG_result, conclusion: "" })

        // 2️⃣ Extract text, summary, and file from the top result
        const extracted_text_for_gemini = extractTextSummaryAndFile(RAG_result);

        if ((!extracted_text_for_gemini.text && !extracted_text_for_gemini.summary) || !extracted_text_for_gemini.file) {
            return {
                result_from_RAG: RAG_result,
                conclusion: "",
                error: "No text or summary found in Pinecone results",
            };
        }

        // 3️⃣ Generate final conclusion using Gemini
        let generatedConclusion = "";
        try {
            generatedConclusion = await generateGeminiConclusionFromInput(extracted_text_for_gemini, threadId);
        } catch (geminiErr: any) {
            console.error("Gemini summarization failed:", geminiErr.message);
            generatedConclusion = "Gemini summarization failed for this content";
        }

        return {
            structed_sources,
            conclusion: generatedConclusion,
        };
    } catch (err: any) {
        console.error("Error in getAnswerfromRAG:", err.message);
        return {
            result_from_RAG: [],
            conclusion: "",
            error: err.message || "Unknown error occurred",
        };
    }
}
