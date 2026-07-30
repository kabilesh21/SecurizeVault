from typing import List, Dict, Any

# Base weights for each event type
EVENT_TYPE_BASE_SCORE = {
    "INTERNSHIP": 85,
    "CERTIFICATION": 70,
    "PROJECT": 75,
    "ACHIEVEMENT": 80,
    "LEADERSHIP": 78,
    "ACADEMIC": 60,
    "CAREER_MILESTONE": 90,
    "GITHUB": 65,
    "PORTFOLIO": 65,
    "SKILL_MILESTONE": 55,
    "OTHER": 45,
}

def rank_events(
    events: List[Dict[str, Any]],
    relationships: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Calculates importance_score for each event based on:
      - Event type base weight (40%)
      - Related skills count (25%)
      - Related relationship count (25%)
      - Date source quality (10%)
    """
    # Build a mapping of doc_id -> relationship count
    doc_relationship_count: Dict[int, int] = {}
    for rel in relationships:
        for doc_id in [rel.get("sourceNodeId"), rel.get("targetNodeId")]:
            if doc_id:
                doc_relationship_count[doc_id] = doc_relationship_count.get(doc_id, 0) + 1

    for event in events:
        event_type = event.get("eventType", "OTHER")
        base = EVENT_TYPE_BASE_SCORE.get(event_type, 50)

        # Skills component (each skill adds ~3 points up to max 25)
        skills = event.get("relatedSkills", [])
        skill_bonus = min(len(skills) * 3, 25)

        # Relationships component (each relationship adds ~4 points up to max 25)
        doc_ids = event.get("relatedDocuments", [])
        rel_count = sum(doc_relationship_count.get(d, 0) for d in doc_ids)
        rel_bonus = min(rel_count * 4, 25)

        # Date source component
        date_source = event.get("dateSource", "UNKNOWN")
        date_bonus = {
            "DOCUMENT_CONTENT": 10,
            "DOCUMENT_TITLE": 8,
            "UPLOAD_DATE_FALLBACK": 2,
            "UNKNOWN": 0,
        }.get(date_source, 0)

        raw_score = base + skill_bonus + rel_bonus + date_bonus
        # Normalize to 0–100
        final_score = max(0, min(100, round(raw_score)))
        event["importanceScore"] = final_score

    return events
