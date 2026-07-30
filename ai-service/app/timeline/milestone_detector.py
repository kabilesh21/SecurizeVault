from typing import List, Dict, Any, Optional

MILESTONE_RULES = [
    ("CERTIFICATION", "FIRST_CERTIFICATION", "First Certification", 80),
    ("PROJECT", "FIRST_PROJECT", "First Project", 80),
    ("INTERNSHIP", "FIRST_INTERNSHIP", "First Internship", 90),
    ("ACHIEVEMENT", "FIRST_ACHIEVEMENT", "First Achievement", 85),
    ("LEADERSHIP", "FIRST_LEADERSHIP", "First Leadership Role", 82),
    ("GITHUB", "FIRST_GITHUB", "First GitHub Repository", 65),
    ("PORTFOLIO", "FIRST_PORTFOLIO", "First Portfolio Item", 65),
    ("ACADEMIC", "FIRST_ACADEMIC", "First Academic Record", 60),
]

def detect_milestones(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detects milestone labels from the timeline events list.
    """
    milestones = []
    seen_types = set()

    # Sort by startDate ascending for chronological first-detection
    sorted_events = sorted(
        events,
        key=lambda e: (e.get("startDate") or "9999-12-31")
    )

    for event in sorted_events:
        etype = event.get("eventType", "OTHER")
        temp_id = event.get("temporaryId")

        for rule_type, milestone_type, label, score in MILESTONE_RULES:
            if etype == rule_type and milestone_type not in seen_types:
                seen_types.add(milestone_type)
                milestones.append({
                    "eventTemporaryId": temp_id,
                    "milestoneType": milestone_type,
                    "label": label,
                    "importanceScore": score,
                })

    # Detect highest importance event
    if sorted_events:
        top_event = max(sorted_events, key=lambda e: e.get("importanceScore", 0))
        # Only add if not already covered
        existing_ids = {m["eventTemporaryId"] for m in milestones}
        if top_event.get("temporaryId") not in existing_ids:
            milestones.append({
                "eventTemporaryId": top_event.get("temporaryId"),
                "milestoneType": "MAJOR_ACHIEVEMENT",
                "label": "Major Achievement",
                "importanceScore": top_event.get("importanceScore", 70),
            })

        # Latest event
        latest = sorted_events[-1]
        latest_ids = {m["eventTemporaryId"] for m in milestones}
        if latest.get("temporaryId") not in latest_ids:
            milestones.append({
                "eventTemporaryId": latest.get("temporaryId"),
                "milestoneType": "LATEST_ACHIEVEMENT",
                "label": "Latest Achievement",
                "importanceScore": latest.get("importanceScore", 60),
            })

    return milestones
