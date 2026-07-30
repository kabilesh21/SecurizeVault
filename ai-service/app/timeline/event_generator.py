from typing import List, Dict, Any, Optional

CATEGORY_TO_EVENT_TYPE = {
    "CERTIFICATES": "CERTIFICATION",
    "RESUMES": "CAREER_MILESTONE",
    "PROJECT_REPORTS": "PROJECT",
    "INTERNSHIP_LETTERS": "INTERNSHIP",
    "PORTFOLIO_LINKS": "PORTFOLIO",
    "GITHUB_REPOS": "GITHUB",
    "ACADEMIC_DOCUMENTS": "ACADEMIC",
    "OTHER_PROFESSIONAL": "OTHER",
    "OTHER_ACADEMIC": "ACADEMIC",
}

def _resolve_event_type(category: Optional[str], title: str) -> str:
    if not category:
        # Fallback: keyword detection from title
        title_lower = title.lower()
        if any(k in title_lower for k in ["certif", "course", "training"]):
            return "CERTIFICATION"
        if any(k in title_lower for k in ["intern", "trainee"]):
            return "INTERNSHIP"
        if any(k in title_lower for k in ["project", "build", "develop"]):
            return "PROJECT"
        if any(k in title_lower for k in ["github", "repo"]):
            return "GITHUB"
        if any(k in title_lower for k in ["portfolio", "showcase"]):
            return "PORTFOLIO"
        if any(k in title_lower for k in ["semester", "academic", "university", "college", "degree", "b.tech", "m.tech"]):
            return "ACADEMIC"
        return "OTHER"
    return CATEGORY_TO_EVENT_TYPE.get(category, "OTHER")

def _build_title(doc: Dict[str, Any], event_type: str, entities: List[Dict[str, Any]]) -> str:
    base_title = doc.get("title", "").strip()
    if not base_title or base_title.lower() in ("untitled", "unknown"):
        # Derive from original file name
        base_title = doc.get("originalName", "").replace("_", " ").replace("-", " ").rsplit(".", 1)[0].title()

    # Find organization from entities
    org_entities = [
        e for e in entities
        if e.get("documentId") == doc.get("id") and e.get("type") == "ORGANIZATION"
    ]
    org = org_entities[0]["value"].strip() if org_entities else None

    prefix_map = {
        "CERTIFICATION": "Completed",
        "INTERNSHIP": "Completed",
        "PROJECT": "Developed",
        "GITHUB": "Published",
        "PORTFOLIO": "Published",
        "ACADEMIC": "Completed",
        "CAREER_MILESTONE": "Career",
        "ACHIEVEMENT": "Achieved",
        "SKILL_MILESTONE": "Developed",
        "LEADERSHIP": "Led",
        "OTHER": ""
    }
    prefix = prefix_map.get(event_type, "")
    if prefix:
        return f"{prefix} {base_title}"
    return base_title

def _build_description(
    doc: Dict[str, Any],
    event_type: str,
    skills: List[str],
    org: Optional[str],
    entities: List[Dict[str, Any]]
) -> str:
    title = doc.get("title", "this document")
    skill_str = ", ".join(skills[:5]) if skills else "multiple skills"
    org_part = f" at {org}" if org else ""

    desc_map = {
        "CERTIFICATION": f"Completed the {title} certification{org_part}, demonstrating expertise in {skill_str}.",
        "INTERNSHIP": f"Completed an internship as part of {title}{org_part}, applying {skill_str} in a professional environment.",
        "PROJECT": f"Built and developed {title}, leveraging {skill_str} to create a complete technical solution.",
        "GITHUB": f"Published {title} as a public GitHub repository showcasing skills in {skill_str}.",
        "PORTFOLIO": f"Added {title} to the professional portfolio demonstrating work in {skill_str}.",
        "ACADEMIC": f"Completed {title}{org_part} academic milestone, building academic foundations.",
        "CAREER_MILESTONE": f"Career milestone represented by {title}, demonstrating professional progression with {skill_str}.",
        "ACHIEVEMENT": f"Achieved recognition through {title}, demonstrating excellence and competency in {skill_str}.",
        "LEADERSHIP": f"Took on a leadership role in {title}, coordinating teams and developing organizational skills.",
        "SKILL_MILESTONE": f"Reached a significant skill milestone in {skill_str} as documented in {title}.",
        "OTHER": f"Completed {title}{org_part}, demonstrating growth in {skill_str}.",
    }
    return desc_map.get(event_type, f"Completed {title}.")

def generate_events(
    documents: List[Dict[str, Any]],
    skills: List[Dict[str, Any]],
    entities: List[Dict[str, Any]],
    date_map: Dict[int, Dict[str, Any]]  # doc_id -> {startDate, endDate, precision, source}
) -> List[Dict[str, Any]]:
    events = []
    for i, doc in enumerate(documents):
        doc_id = doc.get("id")
        category = doc.get("category")
        event_type = _resolve_event_type(category, doc.get("title", ""))

        # Collect skills for this document
        doc_skills = [
            s["name"] for s in skills
            if s.get("documentId") == doc_id
        ]

        # Organization
        org_entities = [
            e for e in entities
            if e.get("documentId") == doc_id and e.get("type") == "ORGANIZATION"
        ]
        org = org_entities[0]["value"].strip() if org_entities else None

        # Technology keywords
        tech_entities = [
            e["value"] for e in entities
            if e.get("documentId") == doc_id and e.get("type") == "TECHNOLOGY"
        ]

        # Keyword entities
        kw_entities = [
            e["value"] for e in entities
            if e.get("documentId") == doc_id and e.get("type") == "KEYWORD"
        ]

        title = _build_title(doc, event_type, entities)
        description = _build_description(doc, event_type, doc_skills, org, entities)

        date_info = date_map.get(doc_id, {})
        start_date = date_info.get("startDate")
        end_date = date_info.get("endDate")
        date_precision = date_info.get("datePrecision", "UNKNOWN")
        date_source = date_info.get("dateSource", "UNKNOWN")
        display_date = date_info.get("displayDate", "Unknown Date")

        events.append({
            "temporaryId": f"event-doc-{doc_id}",
            "title": title,
            "description": description,
            "eventType": event_type,
            "startDate": start_date,
            "endDate": end_date,
            "displayDate": display_date,
            "datePrecision": date_precision,
            "dateSource": date_source,
            "importanceScore": 50,  # Will be ranked later
            "confidenceScore": 0.85,
            "relatedDocuments": [doc_id],
            "relatedSkills": doc_skills,
            "organization": org,
            "technologies": tech_entities[:8],
            "keywords": kw_entities[:10],
        })
    return events
