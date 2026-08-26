import re
from typing import Dict, List
from app.categorization.text_preprocessor import tokenize

def extract_entities(text: str, file_name: str = "") -> Dict[str, List[str]]:
    """
    Extracts structured entities (organizations, technologies, dates, keywords, titles)
    from text using rule-based regular expressions and text pattern mapping.
    """
    results = {
        "title": [],
        "organization": [],
        "technologies": [],
        "dates": [],
        "keywords": []
    }
    
    if not text:
        # Fallback to filename details if empty
        if file_name:
            results["title"] = [file_name.split(".")[0]]
        return results
        
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # 1. Extracted Title
    if lines:
        results["title"] = [lines[0][:100]]
    elif file_name:
        results["title"] = [file_name.split(".")[0]]

    # 2. Organization Extraction
    org_patterns = [
        r'\b(?:university|college|school|institute|academy|polytechnic|institutions)\b',
        r'\b(?:pvt\s+ltd|private\s+limited|corp|corporation|inc|incorporated|solutions|technologies|ltd|limited|company|association|foundation|group)\b'
    ]
    
    found_orgs = []
    for line in lines:
        for pattern in org_patterns:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for m in matches:
                # Extract surrounding context as the org name (e.g. 3-4 words before/after)
                words = line.split()
                # Find index of matched token
                matched_word = m.group(0).lower()
                for idx, w in enumerate(words):
                    if matched_word in w.lower():
                        start = max(0, idx - 3)
                        end = min(len(words), idx + 3)
                        org_phrase = " ".join(words[start:end])
                        org_phrase = re.sub(r'[^\w\s\-\.]', '', org_phrase).strip()
                        if len(org_phrase) > 5 and org_phrase not in found_orgs:
                            found_orgs.append(org_phrase)
                            
    results["organization"] = found_orgs[:3] # Limit to top 3 orgs

    # 3. Technologies & Languages (Quick lookup)
    tech_keywords = [
        "python", "java", "c\\+\\+", "c#", "javascript", "typescript", "ruby", "php", "golang", "swift",
        "react", "angular", "vue", "next\\.js", "spring boot", "django", "flask", "fastapi", "express",
        "mysql", "postgresql", "mongodb", "sqlite", "redis", "cassandra", "dynamodb", "oracle",
        "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "jenkins", "terraform", "ansible",
        "html", "css", "bootstrap", "tailwind", "sass", "graphql", "rest api", "tensorFlow", "pytorch",
        "scikit-learn", "numpy", "pandas", "spark", "hadoop", "kafka"
    ]
    
    found_tech = []
    text_lower = text.lower()
    for tech in tech_keywords:
        pattern = r'\b' + tech + r'\b'
        if re.search(pattern, text_lower):
            # Format nicely
            pretty_name = tech.replace("\\", "").title()
            if pretty_name == "Spring Boot":
                pretty_name = "Spring Boot"
            elif pretty_name == "Next.Js":
                pretty_name = "Next.js"
            elif pretty_name == "Rest Api":
                pretty_name = "REST API"
            elif pretty_name == "C++":
                pretty_name = "C++"
            elif pretty_name == "Css":
                pretty_name = "CSS"
            elif pretty_name == "Html":
                pretty_name = "HTML"
            found_tech.append(pretty_name)
            
    results["technologies"] = found_tech

    # 4. Dates Extraction
    date_patterns = [
        r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b',
        r'\b\d{2}/\d{2}/\d{4}\b',
        r'\b(?:19|20)\d{2}\b' # standalone years
    ]
    
    found_dates = []
    for pattern in date_patterns:
        matches = re.finditer(pattern, text_lower)
        for m in matches:
            date_val = m.group(0).strip().title()
            if date_val not in found_dates:
                found_dates.append(date_val)
                
    results["dates"] = found_dates[:4]

    # 5. Keywords Extraction (frequent words/phrases)
    # Exclude small words, tech keywords already extracted
    words = tokenize(text)
    freq = {}
    for w in words:
        if len(w) > 4 and w.title() not in found_tech:
            freq[w] = freq.get(w, 0) + 1
            
    sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    results["keywords"] = [k[0] for k in sorted_keywords[:6]]

    return results
