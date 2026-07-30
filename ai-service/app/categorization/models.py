from pydantic import BaseModel
from typing import List, Optional, Dict

class CategorizeRequest(BaseModel):
    documentId: int
    text: str
    fileName: Optional[str] = None

class SecondaryCategory(BaseModel):
    name: str
    confidence: float

class SkillResult(BaseModel):
    name: str
    confidence: float

class ExtractedEntities(BaseModel):
    title: Optional[List[str]] = []
    organization: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    dates: Optional[List[str]] = []
    keywords: Optional[List[str]] = []

class CategorizeResponse(BaseModel):
    primaryCategory: str
    primaryConfidence: float
    secondaryCategories: List[SecondaryCategory]
    skills: List[SkillResult]
    entities: ExtractedEntities
    processingStatus: str
