from fastapi import APIRouter, HTTPException
from app.categorization.models import CategorizeRequest, CategorizeResponse, SecondaryCategory, SkillResult, ExtractedEntities
from app.categorization.classifier import classify_text
from app.categorization.confidence_calculator import calculate_confidence
from app.categorization.skill_extractor import extract_skills
from app.categorization.entity_extractor import extract_entities

router = APIRouter()

@router.post("/categorize", response_model=CategorizeResponse)
async def categorize_document(request: CategorizeRequest):
    """
    Intelligent Categorization pipeline.
    Preprocesses text, computes hybrid Jaccard/TF-IDF classification,
    extracts entities and technical skills, and calculates confidence scores.
    """
    try:
        text = request.text
        file_name = request.fileName or ""
        
        # 1. Run Classification
        raw_scores = classify_text(text, file_name)
        
        # 2. Determine Primary & Secondary Categories
        primary_cat, primary_conf, secondary_cats = calculate_confidence(raw_scores)
        
        # 3. Extract Skills
        extracted_skills = extract_skills(text)
        
        # 4. Extract Entities
        entities_data = extract_entities(text, file_name)
        
        # Map list of dicts to Pydantic responses
        sec_cats_pydantic = [
            SecondaryCategory(name=c["name"], confidence=c["confidence"]) 
            for c in secondary_cats
        ]
        
        skills_pydantic = [
            SkillResult(name=s["name"], confidence=s["confidence"]) 
            for s in extracted_skills
        ]
        
        entities_pydantic = ExtractedEntities(
            title=entities_data.get("title", []),
            organization=entities_data.get("organization", []),
            technologies=entities_data.get("technologies", []),
            dates=entities_data.get("dates", []),
            keywords=entities_data.get("keywords", [])
        )
        
        return CategorizeResponse(
            primaryCategory=primary_cat,
            primaryConfidence=primary_conf,
            secondaryCategories=sec_cats_pydantic,
            skills=skills_pydantic,
            entities=entities_pydantic,
            processingStatus="COMPLETED"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization pipeline failed: {str(e)}")
