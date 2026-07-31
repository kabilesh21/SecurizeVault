from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SearchRequest(BaseModel):
    query: str
    userId: int
    limit: Optional[int] = 10
    filters: Optional[Dict[str, Any]] = None

class SearchResult(BaseModel):
    documentId: int
    title: str
    resultType: str  # e.g., PROJECT, CERTIFICATE, etc.
    description: str
    matchedSkills: List[str] = []
    relevanceScore: float
    explanation: str
    organization: Optional[str] = None
    displayDate: Optional[str] = None
    confidenceScore: float = 1.0

class SearchResponse(BaseModel):
    query: str
    intent: Dict[str, Any]  # {"name": str, "confidence": float}
    filters: Dict[str, Any]
    results: List[SearchResult]
    suggestions: List[str]
    processingStatus: str
    explanation: Optional[str] = None

class IndexRequest(BaseModel):
    documentId: int
    userId: int
    documentName: str
    category: str
    skills: List[str]
    textContent: str
    metadata: Optional[Dict[str, Any]] = None

class IndexResponse(BaseModel):
    status: str
    message: str

class StatusResponse(BaseModel):
    status: str
    documentsIndexed: int
    mode: str
