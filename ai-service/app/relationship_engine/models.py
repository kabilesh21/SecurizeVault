from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Request Payload Models
class DocumentInput(BaseModel):
    id: int
    title: str
    originalName: str
    category: Optional[str] = None
    ocrText: Optional[str] = None

class SkillInput(BaseModel):
    name: str
    confidence: float
    documentId: Optional[int] = None

class EntityInput(BaseModel):
    type: str  # ORGANIZATION, DATE, TECHNOLOGY, etc.
    value: str
    confidence: float
    documentId: Optional[int] = None

class RelationshipAnalysisRequest(BaseModel):
    userId: int
    documents: List[DocumentInput] = []
    skills: List[SkillInput] = []
    entities: List[EntityInput] = []

# Response Payload Models
class NodeResponse(BaseModel):
    temporaryId: str
    type: str  # DOCUMENT, SKILL, PROJECT, INTERNSHIP, CAREER_PATH, etc.
    referenceId: Optional[int] = None
    name: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    sourceDocumentId: Optional[int] = None

class RelationshipResponse(BaseModel):
    source: str  # temporaryId
    target: str  # temporaryId
    type: str  # CERTIFIES, USES, CONTRIBUTES_TO, etc.
    confidence: float
    evidence: str
    generationMethod: str

class CareerRecommendation(BaseModel):
    name: str
    confidence: float
    reason: str

class RelationshipAnalysisResponse(BaseModel):
    nodes: List[NodeResponse]
    relationships: List[RelationshipResponse]
    careerPaths: List[CareerRecommendation]
    processingStatus: str
