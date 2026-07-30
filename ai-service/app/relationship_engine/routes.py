from fastapi import APIRouter, HTTPException
from .models import RelationshipAnalysisRequest, RelationshipAnalysisResponse, NodeResponse, RelationshipResponse, CareerRecommendation
from .relationship_rules import RelationshipRules
from .career_mapper import CareerMapper

router = APIRouter(
    prefix="/relationships",
    tags=["relationships"]
)

@router.post("/analyze", response_model=RelationshipAnalysisResponse)
async def analyze_relationships(request: RelationshipAnalysisRequest):
    try:
        # 1. Extract nodes and relationships using rules engine
        nodes, relationships = RelationshipRules.extract_relationships(
            request.documents,
            request.skills,
            request.entities
        )
        
        # 2. Extract Career Path suggestions
        career_paths = CareerMapper.recommend_careers(request.skills)
        
        # 3. Add Career Path nodes if recommendations exist
        for cp in career_paths:
            cp_temp_id = f"career-{cp.name.lower().replace(' ', '-')}"
            
            # Register Career Path node
            nodes.append(NodeResponse(
                temporaryId=cp_temp_id,
                type="CAREER_PATH",
                name=cp.name,
                description=f"Recommended Career Profile: {cp.name}. {cp.reason}",
                metadata={"confidence": cp.confidence}
            ))
            
            # Draw relationship: Skills/Internship supports Career Path
            # (We will link each matching skill to the career path node)
            for skill_node in [n for n in nodes if n.type == 'SKILL']:
                skill_lower = skill_node.name.lower()
                # Find matching careers
                for career in CareerMapper.CAREERS:
                    if career["name"] == cp.name and skill_lower in career["skills"]:
                        relationships.append(RelationshipResponse(
                            source=skill_node.temporaryId,
                            target=cp_temp_id,
                            type="SUPPORTS",
                            confidence=0.88,
                            evidence=f"Competency in '{skill_node.name}' supports career path as '{cp.name}'.",
                            generationMethod="RULE_BASED"
                        ))

        # 4. Filter out relationships below threshold (default 0.70)
        filtered_relationships = [r for r in relationships if r.confidence >= 0.70]

        return RelationshipAnalysisResponse(
            nodes=nodes,
            relationships=filtered_relationships,
            careerPaths=career_paths,
            processingStatus="COMPLETED"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze relationships: {str(e)}")
