import express from 'express';
import { runScraper } from './services/playwrightScraper';

import { scrapeVideoTitles } from './services/playwrightVideoNoScraper';
import path from 'path';
import { downloadFromJSON } from './services/filedownloader';
import bodyParser from 'body-parser';
import { processJsonFiles } from './RAG/extraction/tesseract_text.extraction';
import dotenv from "dotenv"
import { pushtextToPinecone } from './RAG/insertion/text.insertion';
import { pushSectionsToPinecone } from './RAG/insertion/sectionDetails.insertion';
import { getAnswerfromRAG } from './RAG/retrival/retrival_main';
import threadRoutes from "./thread/thread.route";
import { saveStructuredMemoryToZep } from './zep/zepMemory';
import { ThreadService } from "./thread/thread.service";
import { unzipAndDelete } from './services/zipfileopener';
import cors from "cors"
dotenv.config()

const app = express();
const PORT = 3006;
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/threads", threadRoutes);

app.get('/', (req, res) => {
  res.send('Udemy RAG backend is running 🚀');
});

app.post('/scrape', async (req, res) => {
  const { url, folderName, sectionsToProcess, courseName } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    // uncomment this done for testing purpose
    const jsonData = await runScraper(url, folderName, sectionsToProcess);
    await downloadFromJSON(folderName, courseName)
    await unzipAndDelete(folderName, courseName)
    res.json({ ok: true, jsonData: jsonData});
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post("/extract/tessaractText", async (req, res) => {
  try {
    const {jsonArray, courseName, folderName} = req.body;

    if (!Array.isArray(jsonArray)) {
      return res.status(400).json({ error: "Request body must be an array of JSON objects" });
    }

    const results = await processJsonFiles(jsonArray, courseName, folderName);

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Error in /extract/tessaractText:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/insertion/studyMaterial", async(req,res) => {
  try {
    const jsonArray = req.body;

    if (!Array.isArray(jsonArray)) {
      return res.status(400).json({ error: "Request body must be an array of JSON objects" });
    }

    const result = await pushtextToPinecone(jsonArray, {namespace: "file_summaries", dimension: 3072})
    
    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
     console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
})

app.post('/scrape/videoTitle', async(req, res)=>{
    const {url, folderName, sectionsToProcess} = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    try {
        await scrapeVideoTitles(url, folderName, sectionsToProcess);
       
        res.json({ok: true})
    } catch (error) {
        res.status(500).json({ok: false,error:String(error)})
    }
})


app.post("/insertion/sectionDetails", async(req,res) => {
  try {
    const jsonArray = req.body;

    if (!Array.isArray(jsonArray)) {
      return res.status(400).json({ error: "Request body must be an array of JSON objects" });
    }

    const result = await pushSectionsToPinecone(jsonArray)
    
    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
     console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
})


app.post("/query", async (req, res) => {
  try {
    const { query, threadId } = req.body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: "Query text is required" });
    }

    await ThreadService.addMessage(threadId,"user",query,"user")

    const result = await getAnswerfromRAG(query, threadId);

    await saveStructuredMemoryToZep(threadId, query, result)

    const memoryResult = JSON.stringify(result, null, 2)

    await ThreadService.addMessage(threadId,"assistant",memoryResult,"assistant")

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error in /query:", err.message);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message || err,
    });
  }
})


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

