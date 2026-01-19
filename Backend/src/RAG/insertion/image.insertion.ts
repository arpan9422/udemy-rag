import { index } from "../../lib/pinecone";
import { extractImagesFromPDF } from "../extraction/image.extraction";
import { generateGeminiImageEmbedding } from "../geminiEmbedding";
import path from "path";

export async function pushImageToPinecone(pdfFile: string, section: string, pdf_loc: string) {
    const images = await extractImagesFromPDF(pdf_loc);

    if (images) {
        for (const img of images) {
            const embedding = await generateGeminiImageEmbedding(img);

            await index.namespace("pdf_images").upsert([
                {
                    id: `${path.basename(pdfFile)}_${path.basename(img)}`,
                    values: embedding,
                    metadata: {
                        source_pdf: pdfFile,
                        section,
                        image_file: img,
                        pdf_loc: pdf_loc
                    }
                }
            ]);

            console.log(`✅ Pushed image ${img} to Pinecone (namespace: pdf_images)`);
        }
    }
}
