import math
from typing import Dict, List, Tuple
from app.categorization.text_preprocessor import tokenize
from app.categorization.category_profiles import CATEGORY_PROFILES

def get_cosine_similarity(vec1: Dict[str, int], vec2: Dict[str, int]) -> float:
    """
    Computes cosine similarity between two term-frequency dictionaries.
    """
    intersection = set(vec1.keys()) & set(vec2.keys())
    
    # Dot product
    dot_product = sum(vec1[x] * vec2[x] for x in intersection)
    
    # Magnitudes
    sum1 = sum(val ** 2 for val in vec1.values())
    sum2 = sum(val ** 2 for val in vec2.values())
    
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    
    if not denominator:
        return 0.0
    return float(dot_product) / denominator

def get_jaccard_similarity(set1: set, set2: set) -> float:
    """
    Computes Jaccard similarity between two sets.
    """
    if not set1 or not set2:
        return 0.0
    intersection = set1 & set2
    union = set1 | set2
    return float(len(intersection)) / len(union)

def classify_text(text: str, file_name: str = "") -> List[Tuple[str, float]]:
    """
    Classifies raw text using keyword frequency, cosine overlap, and Jaccard similarity.
    Returns a sorted list of (category, confidence_score) tuples.
    """
    doc_tokens = tokenize(text)
    doc_token_set = set(doc_tokens)
    
    # Term-frequency dict for document
    doc_tf = {}
    for t in doc_tokens:
        doc_tf[t] = doc_tf.get(t, 0) + 1
        
    scores = []
    
    # Classify against each profile
    for category, profile in CATEGORY_PROFILES.items():
        profile_keywords = profile["keywords"]
        weight = profile["weight"]
        
        # Build category profile TF representation
        profile_tf = {}
        for kw in profile_keywords:
            # Profile keywords might be multi-word, tokenize them
            kw_tokens = tokenize(kw)
            for kt in kw_tokens:
                profile_tf[kt] = profile_tf.get(kt, 0) + 1
                
        profile_token_set = set(profile_tf.keys())
        
        # Calculate scores
        cosine_score = get_cosine_similarity(doc_tf, profile_tf)
        jaccard_score = get_jaccard_similarity(doc_token_set, profile_token_set)
        
        # Combine Jaccard + Cosine with weighting
        combined_score = (jaccard_score * 0.4) + (cosine_score * 0.6)
        
        # Check explicit keyword mentions in raw text for extra evidence
        raw_text_lower = text.lower() if text else ""
        mentions = 0
        for kw in profile_keywords:
            if kw in raw_text_lower:
                mentions += 1
                
        mention_multiplier = 1.0 + (min(mentions, 5) * 0.08)
        
        # Incorporate file_name hints if available
        fn_hint = 0.0
        if file_name:
            fn_lower = file_name.lower()
            if category == "CERTIFICATE" and ("cert" in fn_lower or "license" in fn_lower or "credential" in fn_lower):
                fn_hint = 0.3
            elif category == "RESUME" and ("resume" in fn_lower or "cv" in fn_lower):
                fn_hint = 0.4
            elif category == "PROJECT_REPORT" and ("report" in fn_lower or "project" in fn_lower or "thesis" in fn_lower):
                fn_hint = 0.25
            elif category == "INTERNSHIP_LETTER" and ("intern" in fn_lower or "experience" in fn_lower or "offer" in fn_lower):
                fn_hint = 0.3
            elif category == "ACHIEVEMENT" and ("award" in fn_lower or "rank" in fn_lower or "win" in fn_lower or "prize" in fn_lower):
                fn_hint = 0.2
            elif category == "ACADEMICS" and ("transcript" in fn_lower or "marks" in fn_lower or "sem" in fn_lower or "grade" in fn_lower or "result" in fn_lower):
                fn_hint = 0.2
                
        final_category_score = (combined_score * mention_multiplier * weight) + fn_hint
        
        # Normalize score bounds
        final_category_score = min(max(final_category_score, 0.0), 1.0)
        
        scores.append((category, round(final_category_score, 4)))
        
    # Sort descending
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores
