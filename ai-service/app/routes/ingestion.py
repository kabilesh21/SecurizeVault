from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

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
    OCR text extraction using pypdf for PDF files.
    """
    try:
        contents = await file.read()
        filename = file.filename
        
        text = ""
        if filename.lower().endswith(".pdf"):
            import io
            from pypdf import PdfReader
            try:
                pdf_file = io.BytesIO(contents)
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as pe:
                text = f"PDF parsing error: {str(pe)}"
        
        if not text.strip():
            text = f"Document Ingested: {filename}. Raw text extraction yielded no clean content."

        return {
            "text": text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-metadata", response_model=MetadataResponse)
async def extract_metadata(
    file_name: Optional[str] = Form(None), 
    text_content: Optional[str] = Form(None)
):
    """
    Metadata Extraction powered by Gemini 1.5 Flash.
    Extracts structured entities, skills, organization, year, and category from raw text.
    """
    from app.utils.gemini import call_gemini
    
    # 1. Setup fallback defaults
    category_fallback = "OTHER"
    title_fallback = file_name.split(".")[0] if file_name and "." in file_name else (file_name or "Untitled Document")
    name_lower = title_fallback.lower()
    if "resume" in name_lower or "cv" in name_lower:
        category_fallback = "RESUME"
    elif "cert" in name_lower or "license" in name_lower or "credential" in name_lower:
        category_fallback = "CERTIFICATE"
    elif "report" in name_lower or "thesis" in name_lower or "project" in name_lower:
        category_fallback = "PROJECT_REPORT"
    elif "intern" in name_lower or "offer" in name_lower or "experience" in name_lower:
        category_fallback = "INTERNSHIP_LETTER"

    fallback_data = {
        "title": title_fallback,
        "skills": ["Java", "Python", "React", "Docker"] if category_fallback == "RESUME" else [],
        "organization": "MemoryVerse University" if category_fallback == "CERTIFICATE" else "Mock Corporation",
        "year": "2026",
        "category": category_fallback
    }

    # 2. Try querying Gemini API
    prompt = f"""
    You are an AI assistant designed to extract structured metadata from document uploads for a student portfolio system.
    Analyze the following details:
    File name: {file_name or "Unknown"}
    Extracted text: {text_content or "No text content available."}

    Extract the following information:
    1. A clean title for this document.
    2. A list of relevant technical skills/technologies mentioned in this document.
    3. The organization, issuer, school, university, or company associated with this document.
    4. The year associated with this document (e.g. graduation year, year of completion, internship year, or 2026 if none).
    5. The best matching category for this document. It MUST be exactly one of the following uppercase strings:
       - RESUME
       - CERTIFICATE
       - PROJECT_REPORT
       - INTERNSHIP_LETTER
       - OTHER

    Return the output in raw JSON format matching this schema:
    {{
        "title": "Document Title",
        "skills": ["Skill 1", "Skill 2"],
        "organization": "Organization Name",
        "year": "2026",
        "category": "CERTIFICATE"
    }}
    Do not output any markdown code blocks, backticks, or explanation. Only return valid JSON.
    """
    
    try:
        response_text = call_gemini(prompt).strip()
        # Clean potential markdown JSON syntax
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        parsed_json = json.loads(response_text.strip())
        
        # Verify schema elements
        return {
            "title": str(parsed_json.get("title", fallback_data["title"])),
            "skills": list(parsed_json.get("skills", fallback_data["skills"])),
            "organization": str(parsed_json.get("organization", fallback_data["organization"])),
            "year": str(parsed_json.get("year", fallback_data["year"])),
            "category": str(parsed_json.get("category", fallback_data["category"])).upper()
        }
    except Exception:
        # Fallback to local default logic if Gemini call or parsing fails
        return fallback_data

@router.post("/embeddings", response_model=EmbeddingResponse)
async def generate_embeddings(payload: TextPayload):
    """
    Placeholder endpoint for AI Vector Embeddings.
    """
    return {
        "embeddingStatus": "Pending"
    }
