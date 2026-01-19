import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import { summarizeFileObj } from "./summary.extraction";
const pdfParse = require("pdf-parse");

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg"];
const TEXT_EXTENSIONS = [".txt", ".csv", ".ipynb"];

/**
 * Extract text from a single JSON file object
 */
async function extractTextFromJsonFile(jsonFile: {
  href: string;
  text: string;
  download: string;
  section: string;
}, courseName: string, folder: string): Promise<any> {
  const datasetDir = path.join(__dirname, `../../${folder}-main/${folder}_downloads`);
  const fileName = jsonFile.download;
  const filePath = path.join(datasetDir, fileName);
  console.log(`Processing: ${filePath}`);

  const fileExt = path.extname(fileName).toLowerCase();
  let filesToProcess: string[] = [];
  let folderName: string | undefined;

  if (fileExt === ".zip") {
    folderName = fileName.replace(/\.zip$/, "");
    const folderPath = path.join(datasetDir, folderName);

    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      throw new Error(`Folder "${folderName}" not found for zip file`);
    }

    filesToProcess = fs
      .readdirSync(folderPath)
      .filter((f) => !IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .map((f) => path.join(folderPath, f));
  } else {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File "${fileName}" not found in dataset`);
    }
    if (!IMAGE_EXTENSIONS.includes(fileExt)) {
      filesToProcess.push(filePath);
    }
  }

  let finalText = "";

  for (const f of filesToProcess) {
    const ext = path.extname(f).toLowerCase();
    try {
      if (TEXT_EXTENSIONS.includes(ext)) {
        finalText += fs.readFileSync(f, "utf-8") + "\n";
      } else if (ext === ".pdf") {
        const buffer = fs.readFileSync(f);
        const data = await pdfParse(buffer);
        finalText += data.text + "\n";
      } else if (IMAGE_EXTENSIONS.includes(ext)) {
        const buffer = fs.readFileSync(f);
        const { data } = await Tesseract.recognize(buffer, "eng");
        finalText += data.text + "\n";
      } else {
        console.warn(`Skipping unsupported file type: ${f}`);
      }
    } catch (err: any) {
      console.error(`Error processing file "${f}": ${err.message}`);
    }
  }

  const result: any = {
    file: fileName,
    section: jsonFile.section,
    file_type: fileExt,
    text: finalText.trim(),
    file_loc: filePath,
  };

  if (folderName) result.folder = folderName;
  return result;
}

/**
 * Process an array of JSON file objects + summarize each
 */
export async function processJsonFiles(jsonArray: {
  href: string;
  text: string;
  download: string;
  section: string;
}[], courseName: string, folderName: string): Promise<any[]> {
  const summarizedResults: any[] = [];

  for (const jsonFile of jsonArray) {
    try {
      const extracted = await extractTextFromJsonFile(jsonFile, courseName, folderName);
      
      const summarized = await summarizeFileObj(extracted);
      summarizedResults.push(summarized);

      // Take a 1-second break after extraction and summarization
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`Error processing file "${jsonFile.download}": ${error.message}`);
    }
  }

  return summarizedResults;
}
