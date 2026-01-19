import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

/**
 * Extracts images from a PDF and saves them as PNG files
 */
export async function extractImagesFromPDF(pdfPath: string): Promise<string[]> {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const imagePaths: string[] = [];

  const outputDir = path.join(__dirname, "../../temp/pdf_images");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const images = (page as any).node.Resources().lookupMaybe("XObject");

    if (images) {
      for (const key of images.keys()) {
        const img = images.lookup(key);
        if (img?.name === "Image") {
          const bytes = img.getBytes();
          const filePath = path.join(outputDir, `page_${i + 1}_${key}.png`);
          fs.writeFileSync(filePath, bytes);
          imagePaths.push(filePath);
        }
      }
    }
  }

  console.log(`✅ Extracted ${imagePaths.length} images from ${pdfPath}`);
  return imagePaths;
}
