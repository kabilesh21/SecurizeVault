from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Input Request Models
class DocumentInput(BaseModel):
    id: int
    title: str
    originalName: str
    category: Optional[str] = None
    ocrText: Optional[str] = None
    uploadedAt: Optional[str] = None # ISO-8601 string

class SkillInput(BaseModel):
    id: Optional[int] = None
    name: str
    confidence: float
    documentId: Optional[int] = None

class EntityInput(BaseModel):
    id: Optional[int] = None
    type: str  # ORGANIZATION, DATE, TECHNOLOGY, etc.
    value: str
    confidence: float
    documentId: Optional[int] = None

class RelationshipInput(BaseModel):
    id: Optional[int] = None
    sourceNodeId: int
    targetNodeId: int
    relationshipType: str
    confidenceScore: float
    status: str

class TimelineGenerationRequest(BaseModel):
    userId: int
    documents: List[DocumentInput] = []
    skills: List[SkillInput] = []
    entities: List[EntityInput] = []
    relationships: List[RelationshipInput] = []

# Response Output Models
class TimelineEventResponse(BaseModel):
    temporaryId: str
    title: str
    description: str
    eventType: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    displayDate: str
    datePrecision: str
    dateSource: str
    importanceScore: int
    confidenceScore: float
    relatedDocuments: List[int] = []
    relatedSkills: List[str] = []
    organization: Optional[str] = None
    technologies: List[str] = []
    keywords: List[str] = []

class TimelineMilestoneResponse(BaseModel):
    eventTemporaryId: str
    milestoneType: str
    label: str
    importanceScore: int

class TimelineInsightResponse(BaseModel):
    type: str
    title: str
    description: str
    confidence: float

class TimelineGenerationResponse(BaseModel):
    events: List[TimelineEventResponse]
    milestones: List[TimelineMilestoneResponse]
    insights: List[TimelineInsightResponse]
    processingStatus: str
