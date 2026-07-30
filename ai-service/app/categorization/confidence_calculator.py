from typing import Dict, List, Tuple

def calculate_confidence(scores: List[Tuple[str, float]]) -> Tuple[str, float, List[Dict[str, float]]]:
    """
    Determines the primary category and confidence, and extracts secondary categories.
    If the top score is below a threshold (0.2), it categorizes as 'OTHER_ACADEMIC' or 'UNKNOWN'.
    """
    if not scores:
        return "OTHER_ACADEMIC", 0.50, []
        
    top_category, top_score = scores[0]
    
    # Threshold check
    if top_score < 0.20:
        return "OTHER_ACADEMIC", 0.50, []
        
    primary_category = top_category
    primary_confidence = top_score
    
    # Secondary categories (those with confidence above 0.30, excluding primary)
    secondary_categories = []
    for cat, score in scores[1:]:
        if score > 0.30:
            secondary_categories.append({
                "name": cat,
                "confidence": score
            })
            
    return primary_category, primary_confidence, secondary_categories
