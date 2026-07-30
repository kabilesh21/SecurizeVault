from typing import List, Dict, Any
from .date_extractor import extract_dates
from .date_normalizer import normalize_display_date
from .event_generator import generate_events
from .event_ranker import rank_events
from .milestone_detector import detect_milestones
from .skill_growth_analyzer import analyze_skill_growth, get_top_growing_skills
from .journey_insight_generator import generate_insights

def build_timeline(
    user_id: int,
    documents: List[Dict[str, Any]],
    skills: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Main timeline builder pipeline:
    1. Extract and normalize dates for each document
    2. Generate raw timeline events
    3. Rank events by importance
    4. Detect milestones
    5. Analyze skill growth
    6. Generate journey insights
    7. Return combined payload
    """

    if not documents:
        return {
            "events": [],
            "milestones": [],
            "insights": [{
                "type": "EMPTY_STATE",
                "title": "No Documents Found",
                "description": "Upload certificates, projects, internships, and achievements to build your digital journey.",
                "confidence": 1.0,
            }],
            "processingStatus": "COMPLETED",
        }

    # Step 1: Extract and normalize dates per document
    date_map: Dict[int, Dict[str, Any]] = {}
    for doc in documents:
        doc_id = doc.get("id")
        start, end, precision, source = extract_dates(
            doc_id=doc_id,
            ocr_text=doc.get("ocrText"),
            doc_title=doc.get("title", ""),
            uploaded_at=doc.get("uploadedAt"),
            entities=entities,
        )
        display = normalize_display_date(start, end, precision)
        date_map[doc_id] = {
            "startDate": start,
            "endDate": end,
            "datePrecision": precision,
            "dateSource": source,
            "displayDate": display,
        }

    # Step 2: Generate events
    events = generate_events(documents, skills, entities, date_map)

    # Step 3: Rank events
    events = rank_events(events, relationships)

    # Step 4: Sort chronologically
    events.sort(key=lambda e: (e.get("startDate") or "9999-12-31"))

    # Step 5: Detect milestones
    milestones = detect_milestones(events)

    # Step 6: Skill growth
    skill_timeline = analyze_skill_growth(events, skills)

    # Step 7: Generate insights
    insights = generate_insights(events, skill_timeline, milestones)

    return {
        "events": events,
        "milestones": milestones,
        "insights": insights,
        "processingStatus": "COMPLETED",
    }
