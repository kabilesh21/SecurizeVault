from fastapi import APIRouter
from .models import TimelineGenerationRequest, TimelineGenerationResponse
from .timeline_builder import build_timeline

router = APIRouter(prefix="/timeline", tags=["Timeline"])

@router.post("/generate", response_model=TimelineGenerationResponse)
async def generate_timeline(request: TimelineGenerationRequest):
    """
    Generates a complete AI-powered timeline from the user's documents, skills,
    entities, and relationships. Returns events, milestones, and insights.
    """
    result = build_timeline(
        user_id=request.userId,
        documents=[d.dict() for d in request.documents],
        skills=[s.dict() for s in request.skills],
        entities=[e.dict() for e in request.entities],
        relationships=[r.dict() for r in request.relationships],
    )
    return result
