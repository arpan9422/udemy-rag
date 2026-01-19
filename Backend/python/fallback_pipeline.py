# fallback_pipeline.py
import sys
import json
import fitz  # PyMuPDF
from PIL import Image
import io
import base64
import torch
from transformers import CLIPProcessor, CLIPModel
from langchain_community.chat_models import ChatOpenAI

pdf_file = sys.argv[1]
section_name = sys.argv[2]

# -----------------------------
# 1️⃣ Initialize CLIP
# -----------------------------
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
clip_model.eval()

# -----------------------------
# 2️⃣ Initialize Gemini LLM via LangChain
# -----------------------------
# Set your Gemini API key in environment
import os

gemini = ChatOpenAI(
    model_name="gemini-1.5",  # or "gemini-1.5-mini"
    temperature=0,
    openai_api_key=os.environ["GEMINI_API_KEY"]
)

# -----------------------------
# 3️⃣ Helper functions
# -----------------------------
def embed_text(text):
    inputs = clip_processor(
        text=text, return_tensors="pt", padding=True, truncation=True, max_length=77
    )
    with torch.no_grad():
        feats = clip_model.get_text_features(**inputs)
        feats = feats / feats.norm(dim=-1, keepdim=True)
        return feats.squeeze().numpy()

def embed_image(image):
    if isinstance(image, str):
        image = Image.open(image).convert("RGB")
    inputs = clip_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        feats = clip_model.get_image_features(**inputs)
        feats = feats / feats.norm(dim=-1, keepdim=True)
        return feats.squeeze().numpy()

# -----------------------------
# 4️⃣ Load PDF and extract text + images
# -----------------------------
doc = fitz.open(pdf_file)
full_text = ""
images_base64 = []

for i, page in enumerate(doc):
    text = page.get_text()
    if text.strip():
        full_text += text + "\n"

    for img_index, img in enumerate(page.get_images(full=True)):
        xref = img[0]
        base_image = doc.extract_image(xref)
        img_bytes = base_image["image"]
        pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        buffered = io.BytesIO()
        pil_image.save(buffered, format="PNG")
        img_b64 = base64.b64encode(buffered.getvalue()).decode()
        images_base64.append(img_b64)

doc.close()

# -----------------------------
# 5️⃣ Optional: Use Gemini to summarize text
# -----------------------------
if full_text.strip():
    response = gemini.invoke([{
        "type": "human",
        "text": f"Please summarize this PDF text:\n{full_text}"
    }])
    if response and len(response) > 0:
        full_text = response[0].get("content", full_text)
        print(full_text)

# -----------------------------
# 6️⃣ Prepare JSON output
# -----------------------------
result = {
    "file": pdf_file,
    "section": section_name,
    "file_type": ".pdf",
    "text": full_text,
}

if images_base64:
    result["images"] = images_base64

print(json.dumps(result))
