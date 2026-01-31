from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import base64
import os

api_key = os.getenv("GENAI_API_KEY")

if not api_key:
    raise ValueError("GENAI_API_KEY environment variable is not set")

genai.configure(api_key=api_key)


# --------------------------
# Request model for text
# --------------------------
class TextRequest(BaseModel):
    text: str

# --------------------------
# Endpoint: Text Embedding
# --------------------------
@app.post("/embed/text")
async def embed_text(req: TextRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided")
    
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=req.text,
            task_type="retrieval_document"
        )
        embedding = response["embedding"]
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------
# Endpoint: Image Embedding
# --------------------------
@app.post("/embed/image")
async def embed_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")

        response = genai.embed_content(
            model="models/embedding-001",
            content={"parts": [{"inlineData": {"mimeType": file.content_type, "data": image_base64}}]},
            task_type="retrieval_document"
        )
        embedding = response["embedding"]
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
