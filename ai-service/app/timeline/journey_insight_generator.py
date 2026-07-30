from typing import List, Dict, Any
from collections import Counter

def generate_insights(
    events: List[Dict[str, Any]],
    skill_timeline: Dict[str, List[Dict[str, Any]]],
    milestones: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generates human-readable journey insights from timeline events and skill growth.
    """
    insights = []

    if not events:
        insights.append({
            "type": "EMPTY_STATE",
            "title": "No Journey Data Found",
            "description": "Upload certificates, projects, internships, and achievements to unlock your digital journey insights.",
            "confidence": 1.0,
        })
        return insights

    # --- Insight 1: Most Active Year ---
    year_counts: Counter = Counter()
    for event in events:
        start = event.get("startDate")
        if start:
            year_counts[start.split("-")[0]] += 1

    if year_counts:
        most_active_year, count = year_counts.most_common(1)[0]
        insights.append({
            "type": "ACTIVE_PERIOD",
            "title": f"Most Active Year: {most_active_year}",
            "description": f"Your strongest period of growth was {most_active_year}, with {count} recorded milestone(s) in this year.",
            "confidence": 0.9,
        })

    # --- Insight 2: Top Growing Skill ---
    if skill_timeline:
        top_skill = None
        top_count = 0
        for skill, appearances in skill_timeline.items():
            if len(appearances) > top_count:
                top_count = len(appearances)
                top_skill = skill

        if top_skill:
            appearances = skill_timeline[top_skill]
            types = [a["eventType"] for a in appearances]
            desc_parts = []
            if "CERTIFICATION" in types:
                desc_parts.append("certification")
            if "PROJECT" in types:
                desc_parts.append("project work")
            if "INTERNSHIP" in types:
                desc_parts.append("professional internship")
            if "GITHUB" in types:
                desc_parts.append("open-source contributions")

            progression_str = " through ".join(desc_parts) if desc_parts else "multiple activities"
            insights.append({
                "type": "SKILL_GROWTH",
                "title": f"{top_skill} Skill Growth",
                "description": f"{top_skill} progressed from {progression_str}, appearing across {top_count} documented milestone(s).",
                "confidence": 0.88,
            })

    # --- Insight 3: Career Focus ---
    type_counts = Counter(e.get("eventType", "OTHER") for e in events)
    top_type, top_type_count = type_counts.most_common(1)[0]
    type_label_map = {
        "CERTIFICATION": "professional certifications",
        "PROJECT": "technical projects",
        "INTERNSHIP": "industry internships",
        "ACADEMIC": "academic milestones",
        "GITHUB": "open-source development",
        "PORTFOLIO": "portfolio building",
    }
    type_label = type_label_map.get(top_type, top_type.lower().replace("_", " "))
    insights.append({
        "type": "CAREER_FOCUS",
        "title": "Primary Focus Area",
        "description": f"Your journey shows a primary focus on {type_label}, with {top_type_count} recorded event(s) in this category.",
        "confidence": 0.82,
    })

    # --- Insight 4: Total Journey Span ---
    sorted_events = sorted(events, key=lambda e: e.get("startDate") or "9999")
    first = sorted_events[0]
    last = sorted_events[-1]
    if first.get("startDate") and last.get("startDate"):
        first_year = first["startDate"].split("-")[0]
        last_year = last["startDate"].split("-")[0]
        if first_year == last_year:
            span_desc = f"Your documented journey began and continued in {first_year}."
        else:
            year_diff = int(last_year) - int(first_year)
            span_desc = f"Your documented journey spans {year_diff} year(s), from {first_year} to {last_year}."
        insights.append({
            "type": "JOURNEY_SPAN",
            "title": "Journey Timeline Span",
            "description": span_desc,
            "confidence": 0.95,
        })

    return insights
