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
    Uses Gemini API for structured metadata extraction,
    with a rule-based pipeline as a backup fallback.
    """
    import logging
    logger = logging.getLogger("categorization")
    
    text = request.text
    file_name = request.fileName or ""
    
    # 1. Try Gemini API extraction first
    prompt = f"""
    Analyze the following extracted document text:
    File name: {file_name}
    Document text: {text}

    Task:
    1. Classify this document. The category MUST be exactly one of the following uppercase strings:
       - RESUME
       - CERTIFICATE
       - PROJECT_REPORT
       - INTERNSHIP_LETTER
       - OTHER_ACADEMIC
    2. Extract a list of technical skills mentioned in the document with confidence scores (0.0 to 1.0).
    3. Extract entities:
       - title: A list containing a clean title for this document.
       - organization: A list containing the company, school, university, or issuer name.
       - technologies: A list of languages, databases, frameworks, or tools used.
       - dates: A list of relevant dates or years mentioned.
       - keywords: A list of 3-5 important words representing the document content.

    Return the output in raw JSON matching this format:
    {{
        "primaryCategory": "CERTIFICATE",
        "primaryConfidence": 0.95,
        "skills": [
            {{"name": "Python", "confidence": 0.98}},
            {{"name": "FastAPI", "confidence": 0.95}}
        ],
        "entities": {{
            "title": ["Google Cloud Certification"],
            "organization": ["Google"],
            "technologies": ["GCP", "Python"],
            "dates": ["2026"],
            "keywords": ["Cloud", "Architect"]
        }}
    }}
    Do not output markdown code blocks, backticks, or explanation. Only return valid JSON.
    """
    
    try:
        from app.utils.gemini import call_gemini
        import json
        
        response_text = call_gemini(prompt, json_mode=True).strip()
        # Clean potential markdown JSON syntax
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        parsed_json = json.loads(response_text.strip())
        
        primary_cat = str(parsed_json.get("primaryCategory", "OTHER_ACADEMIC")).upper()
        primary_conf = float(parsed_json.get("primaryConfidence", 0.90))
        
        skills_pydantic = [
            SkillResult(name=s["name"], confidence=float(s.get("confidence", 0.85)))
            for s in parsed_json.get("skills", [])
        ]
        
        ent_data = parsed_json.get("entities", {})
        entities_pydantic = ExtractedEntities(
            title=list(ent_data.get("title", [])),
            organization=list(ent_data.get("organization", [])),
            technologies=list(ent_data.get("technologies", [])),
            dates=list(ent_data.get("dates", [])),
            keywords=list(ent_data.get("keywords", []))
        )
        
        return CategorizeResponse(
            primaryCategory=primary_cat,
            primaryConfidence=primary_conf,
            secondaryCategories=[],
            skills=skills_pydantic,
            entities=entities_pydantic,
            processingStatus="COMPLETED"
        )
        
    except Exception as ge:
        response_snippet = ""
        try:
            response_snippet = response_text
        except NameError:
            pass
        logger.error(f"Gemini categorization failed: {ge}. Response was: '{response_snippet}'. Falling back to rule-based.")
        
        try:
            # 2. Rule-based backup fallback
            raw_scores = classify_text(text, file_name)
            primary_cat, primary_conf, secondary_cats = calculate_confidence(raw_scores)
            extracted_skills = extract_skills(text)
            entities_data = extract_entities(text, file_name)
            
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
        except Exception as fallback_err:
            import traceback
            logger.error(f"Fallback categorization failed: {fallback_err}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Categorization fallback failed: {str(fallback_err)}")
