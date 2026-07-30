from typing import Dict, Any

INTENT_KEYWORDS = {
    "RESUME_SEARCH": ["resume", "cv", "resumes", "curriculum vitae"],
    "CERTIFICATE_SEARCH": ["certificate", "certificates", "certification", "certifications", "credential", "credentials", "certified"],
    "PROJECT_SEARCH": ["project", "projects", "developed", "built", "coded", "application", "system", "program"],
    "INTERNSHIP_SEARCH": ["internship", "internships", "placement", "letter of completion", "intern letter", "work experience"],
    "ACHIEVEMENT_SEARCH": ["achievement", "achievements", "award", "awards", "prize", "won", "1st place", "place in the university"],
    "ACADEMIC_SEARCH": ["academic", "academics", "college", "university", "marks", "grade", "gpa", "transcript", "degree", "diploma"],
    "PORTFOLIO_SEARCH": ["portfolio", "website", "personal site"],
    "GITHUB_SEARCH": ["github", "repository", "repos", "repo"],
    "TIMELINE_SEARCH": ["timeline", "journey", "milestone", "milestones", "growth", "career path", "history", "chronological"],
    "RELATIONSHIP_SEARCH": ["connected to", "relationship", "relationships", "linked", "related", "bridge", "connection", "connections"],
    "LATEST_DOCUMENT_SEARCH": ["latest document", "newest document", "most recent upload", "uploaded last", "recent file"],
}

def classify_intent(query: str) -> Dict[str, Any]:
    normalized = query.lower().strip()
    
    # 1. Match intent by keyword triggers
    highest_intent = "GENERAL_SEARCH"
    highest_match_count = 0
    
    for intent, keywords in INTENT_KEYWORDS.items():
        match_count = 0
        for kw in keywords:
            # Simple substring check
            if kw in normalized:
                match_count += 1
        
        if match_count > highest_match_count:
            highest_match_count = match_count
            highest_intent = intent

    # Refine intent for "latest resume" queries
    if highest_intent == "RESUME_SEARCH" and any(word in normalized for word in ["latest", "recent", "newest"]):
        # LATEST_DOCUMENT_SEARCH covers resumes too if requested as a resume
        pass

    confidence = 0.5
    if highest_match_count > 0:
        confidence = min(0.5 + (highest_match_count * 0.15), 0.98)
    else:
        # Fallback intents based on patterns
        if normalized.startswith("show my ") or normalized.startswith("find my "):
            confidence = 0.65
            highest_intent = "DOCUMENT_SEARCH"
        else:
            confidence = 0.45
            highest_intent = "GENERAL_SEARCH"

    return {
        "name": highest_intent,
        "confidence": confidence
    }
