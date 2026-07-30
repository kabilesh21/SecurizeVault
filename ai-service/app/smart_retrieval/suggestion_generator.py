from typing import List, Dict, Any

def generate_suggestions(
    query: str, 
    intent: str, 
    parsed_query: Dict[str, Any], 
    results: List[Dict[str, Any]]
) -> List[str]:
    """
    Generates relevant query suggestions based on search intents, inputs, and results.
    """
    suggestions = []
    
    target_skills = parsed_query.get("skills", [])
    target_category = parsed_query.get("category")
    target_year = parsed_query.get("year")

    # 1. Base suggestions if nothing matched
    if not results:
        return [
            "Show all my certificates",
            "Show my AI projects",
            "Show my latest resume",
            "Show internship documents"
        ]

    # Extract all skills present in matched search results
    all_matched_skills = set()
    for res in results:
        skills = res.get("metadata", {}).get("skills", [])
        for s in skills:
            if s:
                all_matched_skills.add(s)

    # 2. Case: Skill search
    if target_skills:
        skill = target_skills[0]
        suggestions.append(f"Show certificates related to {skill}")
        suggestions.append(f"Which projects use {skill}?")
        suggestions.append(f"Show internships related to {skill}")
    else:
        # Suggest based on top skills in result metadata
        top_skills = list(all_matched_skills)[:2]
        for s in top_skills:
            suggestions.append(f"Find projects using {s}")
            suggestions.append(f"Show certificates validating {s}")

    # 3. Case: Category based suggestions
    if intent == "CERTIFICATE_SEARCH":
        suggestions.append("Show my achievements")
        suggestions.append("What skills did I gain from my certificates?")
    elif intent == "PROJECT_SEARCH":
        suggestions.append("Show my most recent project")
        suggestions.append("Find projects connected to my internship")
    elif intent == "INTERNSHIP_SEARCH":
        suggestions.append("Show my latest resume")
        suggestions.append("Show projects connected to my internship")
    elif intent == "RESUME_SEARCH":
        suggestions.append("Show my certificates")
        suggestions.append("Show my most recent project")

    # 4. Year based suggestions
    if target_year:
        suggestions.append(f"Show projects from {target_year}")
        if target_year > 2020:
            suggestions.append(f"Show my achievements from {target_year - 1}")

    # Ensure suggestions are unique, don't match the input query, and limit to 4
    query_lower = query.lower()
    unique_suggs = []
    for s in suggestions:
        if s.lower() != query_lower and s not in unique_suggs:
            unique_suggs.append(s)
            
    # Default fallback
    if len(unique_suggs) < 2:
        unique_suggs.extend([
            "Show my machine learning projects",
            "Show all my certificates",
            "Find my Spring Boot project"
        ])

    return list(dict.fromkeys(unique_suggs))[:4]
