import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Function to download a single file
async function downloadFile(url: string, filename: string, downloadFolder: string) {
  const res = await fetch(url, {
    headers: {
      "referer": "https://www.udemy.com/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });

  if (!res.ok) {
    console.error(`❌ Failed to download ${filename}: ${res.statusText}`);
    return;
  }

  const buffer = await res.arrayBuffer();
  const filePath = path.join(downloadFolder, filename);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`✅ Saved ${filename}`);
}


export async function downloadFromJSON(jsonPath: string, courseName: string) {
  // Resolve the full path inside the dataset directory
  const datasetDir = path.join(__dirname, `../${jsonPath}-main`);
  const fullJsonPath = path.join(datasetDir, jsonPath);

  console.log(`📁 Reading JSON from: ${fullJsonPath}`);

  // Read and parse JSON
  const rawData = fs.readFileSync(fullJsonPath, "utf-8");
  const downloads: {
    href: string;
    text: string;
    download: string;
    section: string;
  }[] = JSON.parse(rawData);

  // Ensure dataset/data directory exists
  const dataDir = path.join(datasetDir, `${courseName}_downloads`);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Download all files
  for (const item of downloads) {
    try {
      await downloadFile(item.href, item.download, dataDir);
    } catch (err) {
      console.error(`❌ Error downloading ${item.download}:`, err);
    }
  }

  console.log("✅ All downloads completed successfully!");
}


// Example usage
// const jsonFilePath = path.join(__dirname, "downloads.json"); // path to your JSON file
// const downloadFolder = path.join(__dirname, "data"); // folder where files will be saved

// downloadFromJSON(jsonFilePath, downloadFolder);
