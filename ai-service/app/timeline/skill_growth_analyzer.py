from typing import List, Dict, Any

def analyze_skill_growth(
    events: List[Dict[str, Any]],
    skills: List[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Maps each skill to a list of timeline events that use it,
    sorted chronologically to show progression.
    Returns: { skill_name: [{eventId, eventType, date, title}] }
    """
    skill_timeline: Dict[str, List[Dict[str, Any]]] = {}

    for event in sorted(events, key=lambda e: e.get("startDate") or "9999"):
        for skill in event.get("relatedSkills", []):
            if skill not in skill_timeline:
                skill_timeline[skill] = []
            skill_timeline[skill].append({
                "eventTemporaryId": event.get("temporaryId"),
                "eventType": event.get("eventType"),
                "date": event.get("startDate") or event.get("displayDate"),
                "title": event.get("title"),
            })

    return skill_timeline

def get_top_growing_skills(skill_timeline: Dict[str, List[Dict[str, Any]]], top_n: int = 5) -> List[str]:
    """
    Returns the top N skills with the most diverse event type appearances.
    """
    scored = []
    for skill, appearances in skill_timeline.items():
        unique_types = len({a["eventType"] for a in appearances})
        count = len(appearances)
        scored.append((skill, unique_types * 10 + count))
    
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored[:top_n]]
