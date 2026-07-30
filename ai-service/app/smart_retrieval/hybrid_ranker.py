from typing import List, Dict, Any

def rank_results(
    vector_results: List[tuple], 
    parsed_query: Dict[str, Any], 
    intent: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Ranks the database results based on semantic similarity and query filters.
    Each vector_result is a tuple: (metadata_dict, similarity_score)
    """
    ranked_list = []
    
    target_category = parsed_query.get("category")
    target_skills = [s.lower() for s in parsed_query.get("skills", [])]
    target_year = parsed_query.get("year")
    
    for meta, base_score in vector_results:
        score = base_score
        matched_skills = []
        matched_categories = []
        matched_entities = []

        # 1. Category boost
        doc_category = meta.get("primaryCategory", "").upper()
        if target_category:
            # Map alternate naming (e.g., CERTIFICATION vs CERTIFICATE)
            cat_aliases = {
                "CERTIFICATION": ["CERTIFICATE", "CERTIFICATION"],
                "PROJECT": ["PROJECT", "PROJECT_REPORT"],
                "INTERNSHIP": ["INTERNSHIP", "INTERNSHIP_LETTER"],
                "RESUME": ["RESUME"],
                "PORTFOLIO": ["PORTFOLIO", "PORTFOLIO_LINK"],
                "GITHUB": ["GITHUB", "GITHUB_REPO"]
            }
            
            is_match = False
            if target_category == doc_category:
                is_match = True
            elif target_category in cat_aliases:
                if doc_category in cat_aliases[target_category]:
                    is_match = True
            
            if is_match:
                score += 0.15
                matched_categories.append(doc_category)

        # 2. Skill match boost
        doc_skills = [s.lower() for s in meta.get("skills", [])]
        for skill in target_skills:
            if skill in doc_skills:
                score += 0.12
                # Capitalize nicely
                matched_skills.append(skill.title())
            elif any(skill in ds for ds in doc_skills):
                score += 0.08
                matched_skills.append(skill.title())

        # 3. Year match boost
        doc_dates = meta.get("dates", [])
        doc_year = None
        if "year" in meta and meta["year"]:
            try:
                doc_year = int(meta["year"])
            except:
                pass
        
        # Check if year is in doc_dates
        if target_year:
            year_str = str(target_year)
            year_matched = False
            if doc_year == target_year:
                year_matched = True
            elif any(year_str in d for d in doc_dates):
                year_matched = True
            elif year_str in meta.get("documentName", "") or year_str in meta.get("title", ""):
                year_matched = True
                
            if year_matched:
                score += 0.12
                matched_entities.append(f"Year {target_year}")

        # 4. Keyword matches in Title/DocumentName
        title_lower = meta.get("title", "").lower()
        doc_name_lower = meta.get("documentName", "").lower()
        
        # Exact keyword match in title
        for skill in target_skills:
            if skill in title_lower or skill in doc_name_lower:
                score += 0.08

        # Bound score to [0.0, 1.0]
        final_score = max(0.0, min(1.0, score))
        
        # Construct output entry
        ranked_list.append({
            "metadata": meta,
            "relevanceScore": final_score,
            "matchedSkills": matched_skills,
            "matchedCategories": matched_categories,
            "matchedEntities": matched_entities
        })

    # Sort descending by final score
    ranked_list.sort(key=lambda x: x["relevanceScore"], reverse=True)
    return ranked_list
