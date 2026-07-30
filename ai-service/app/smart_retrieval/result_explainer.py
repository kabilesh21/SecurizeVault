from typing import Dict, Any, List

def explain_match(result: Dict[str, Any], query: str, intent: str) -> str:
    """
    Generates a natural language explanation for why a document matched.
    """
    meta = result["metadata"]
    matched_skills = result.get("matchedSkills", [])
    matched_categories = result.get("matchedCategories", [])
    matched_entities = result.get("matchedEntities", [])
    
    title = meta.get("title", "Document")
    category = meta.get("primaryCategory", "document").lower().replace("_", " ")
    
    # 1. Intent based matches
    if intent == "RESUME_SEARCH" and category == "resume":
        if "latest" in query.lower():
            return "Matched because this is your most recently updated CV/Resume."
        return "Matched because this matches your search for resumes."

    if intent == "CERTIFICATE_SEARCH" and category == "certification":
        if matched_skills:
            return f"Matched because this certificate validates your {', '.join(matched_skills[:2])} skill(s)."
        return "Matched because this document is classified as a professional certification."

    if intent == "PROJECT_SEARCH" and category in ["project", "project_report"]:
        if matched_skills:
            return f"Matched because this project document demonstrates your application of {', '.join(matched_skills[:2])}."
        return "Matched because this document is related to your technical projects."

    if intent == "INTERNSHIP_SEARCH" and category in ["internship", "internship_letter"]:
        if matched_skills:
            return f"Matched because this internship validates work experience utilizing {', '.join(matched_skills[:2])}."
        return "Matched because this is an internship offer or completion letter."

    # 2. General skill based match
    if matched_skills:
        skill_str = ", ".join(matched_skills[:2])
        if len(matched_skills) > 2:
            skill_str += f" and {len(matched_skills) - 2} other(s)"
        return f"Matched due to high semantic relevance to {skill_str}."

    # 3. Year based match
    if matched_entities:
        return f"Matched because this matches your profile activities from {', '.join(matched_entities)}."

    # 4. Semantic fallback
    score = result.get("relevanceScore", 0.0)
    if score >= 0.8:
        return f"Highly relevant match based on semantic similarity to your query."
    elif score >= 0.6:
        return f"Matched due to context overlap with your profile."
    else:
        return f"Possible background match for your search."
