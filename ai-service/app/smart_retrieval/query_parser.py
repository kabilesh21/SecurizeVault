import re
from typing import Dict, Any, List

# Common skills and technologies list to match query keywords
COMMON_SKILLS = [
    "python", "java", "react", "javascript", "spring boot", "mysql", "hibernate", 
    "docker", "kubernetes", "c++", "c#", "html", "css", "machine learning", 
    "deep learning", "nlp", "artificial intelligence", "ai", "data science", 
    "data analysis", "tableau", "aws", "gcp", "azure", "git", "github", 
    "tensorflow", "pytorch", "rest api", "backend", "frontend", "full stack"
]

def parse_query(query: str) -> Dict[str, Any]:
    """
    Parses natural language query to extract category filters, skills, years, and sorting preferences.
    """
    normalized_query = query.lower().strip()
    
    # 1. Extracted values
    extracted = {
        "category": None,
        "skills": [],
        "year": None,
        "sort": None,  # LATEST, OLDEST
    }

    # 2. Extract Year (matches any 4 digit year like 2024, 2025, 2026)
    year_match = re.search(r'\b(20\d{2}|19\d{2})\b', normalized_query)
    if year_match:
        extracted["year"] = int(year_match.group(1))

    # 3. Extract Category Filter
    category_mappings = {
        "certificate": "CERTIFICATION",
        "certification": "CERTIFICATION",
        "credential": "CERTIFICATION",
        "project": "PROJECT",
        "development": "PROJECT",
        "report": "PROJECT",
        "internship": "INTERNSHIP",
        "placement": "INTERNSHIP",
        "letter": "INTERNSHIP",
        "resume": "RESUME",
        "cv": "RESUME",
        "portfolio": "PORTFOLIO",
        "github": "GITHUB",
        "academic": "ACADEMIC",
        "coursework": "ACADEMIC",
        "achievement": "ACHIEVEMENT",
        "award": "ACHIEVEMENT"
    }
    
    for key, val in category_mappings.items():
        if key in normalized_query:
            extracted["category"] = val
            break

    # 4. Extract Skills (simple substring matching against common skills)
    for skill in COMMON_SKILLS:
        # Match using word boundaries where possible to avoid substring match issues
        pattern = rf'\b{re.escape(skill)}\b'
        if re.search(pattern, normalized_query):
            extracted["skills"].append(skill.title())
            
    # Handle synonyms
    if "artificial intelligence" in normalized_query or " ai " in normalized_query or normalized_query.startswith("ai ") or normalized_query.endswith(" ai"):
        if "AI" not in extracted["skills"]:
            extracted["skills"].append("AI")
    if "ml" in normalized_query or "machine learning" in normalized_query:
        if "Machine Learning" not in extracted["skills"]:
            extracted["skills"].append("Machine Learning")

    # 5. Sorting preferences
    if any(word in normalized_query for word in ["latest", "recent", "newest", "most recent"]):
        extracted["sort"] = "LATEST"
    elif any(word in normalized_query for word in ["oldest", "first", "earliest"]):
        extracted["sort"] = "OLDEST"

    return extracted
