from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Schema definitions
class TextPayload(BaseModel):
    text: str

class MetadataResponse(BaseModel):
    title: str
    skills: List[str]
    organization: str
    year: str
    category: str

class EmbeddingResponse(BaseModel):
    embeddingStatus: str

# Endpoints
@router.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Placeholder endpoint for OCR text extraction.
    Takes a PDF or image and returns dummy extracted text.
    """
    try:
        # File is read but logic is placeholder
        contents = await file.read()
        return {
            "text": f"OCR Placeholder. Processed file '{file.filename}' of size {len(contents)} bytes."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-metadata", response_model=MetadataResponse)
async def extract_metadata(
    file_name: Optional[str] = Form(None), 
    text_content: Optional[str] = Form(None)
):
    """
    Placeholder endpoint for AI Metadata Extraction.
    Returns structured entity parameters extracted from raw text.
    """
    # Simple rule-based mock logic to classify from file_name or text
    category = "Unknown"
    title = file_name or "Placeholder"
    
    name_lower = title.lower()
    if "resume" in name_lower or "cv" in name_lower:
        category = "RESUME"
    elif "cert" in name_lower or "license" in name_lower or "credential" in name_lower:
        category = "CERTIFICATE"
    elif "report" in name_lower or "thesis" in name_lower or "project" in name_lower:
        category = "PROJECT_REPORT"
    elif "intern" in name_lower or "offer" in name_lower or "experience" in name_lower:
        category = "INTERNSHIP_LETTER"

    return {
        "title": title.split(".")[0] if "." in title else title,
        "skills": ["Java", "Python", "React", "Docker"] if category == "RESUME" else [],
        "organization": "MemoryVerse University" if category == "CERTIFICATE" else "Mock Corporation",
        "year": "2026",
        "category": category
    }

@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(payload: TextPayload):
    """
    Placeholder endpoint for AI Vector Embeddings.
    """
    return {
        "embeddingStatus": "Pending"
    }
