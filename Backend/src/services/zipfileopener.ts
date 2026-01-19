import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export function unzipAndDelete(mainFolder:string, folderName: string) {
  // Set folder path inside dataset directory
  const datasetDir = path.join(__dirname, `../${mainFolder}-main`);
  const folderPath = path.join(datasetDir, `${folderName}_downloads`);

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);

    // Process only zip files
    if (fs.statSync(filePath).isFile() && path.extname(file) === ".zip") {
      try {
        const zip = new AdmZip(filePath);
        const extractPath = path.join(folderPath, path.basename(file, ".zip"));

        // Ensure extract folder exists
        if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath);

        // Extract all files
        zip.extractAllTo(extractPath, true);
        console.log(`✅ Extracted ${file} to ${extractPath}`);

        // Delete the zip after extraction
        // fs.unlinkSync(filePath);
        // console.log(`🗑 Deleted ${file}`);
      } catch (err) {
        console.error(`❌ Failed to extract ${file}:`, err);
      }
    }
  }
}
