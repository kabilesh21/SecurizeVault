import re
from typing import Dict, List

SKILLS_DICTIONARY = {
    # Programming Languages
    "Java": ["java", "jdk", "j2ee"],
    "Python": ["python", "py", "anaconda"],
    "C++": ["c\\+\\+", "cpp"],
    "C": ["\\bc\\b"],
    "C#": ["c#", "c-sharp"],
    "JavaScript": ["javascript", "js", "ecmascript"],
    "TypeScript": ["typescript", "ts"],
    "Go": ["golang", "\\bgo\\b"],
    "Ruby": ["ruby", "rails"],
    "PHP": ["php"],
    "Swift": ["swift"],
    "Kotlin": ["kotlin"],
    "SQL": ["sql", "structured query language"],
    
    # Frameworks & Libraries
    "React": ["react", "reactjs", "react.js"],
    "Angular": ["angular", "angularjs"],
    "Vue": ["vue", "vuejs", "vue.js"],
    "Next.js": ["nextjs", "next.js"],
    "Spring Boot": ["spring boot", "springboot", "spring framework"],
    "Hibernate": ["hibernate", "jpa"],
    "Django": ["django"],
    "Flask": ["flask"],
    "FastAPI": ["fastapi"],
    "Express": ["express", "expressjs", "express.js"],
    "Node.js": ["nodejs", "node.js"],
    
    # Databases
    "MySQL": ["mysql"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MongoDB": ["mongodb", "mongo"],
    "SQLite": ["sqlite"],
    "Redis": ["redis"],
    
    # DevOps & Cloud
    "Docker": ["docker", "dockerfile"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3"],
    "Azure": ["azure"],
    "GCP": ["gcp", "google cloud platform"],
    "Git": ["git", "github", "gitlab"],
    "Jenkins": ["jenkins", "ci/cd"],
    
    # ML & AI
    "Machine Learning": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
    "Deep Learning": ["deep learning", "dl", "neural networks"],
    "Natural Language Processing": ["nlp", "natural language processing", "text processing"],
    "Computer Vision": ["computer vision", "cv"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch"],
    "Scikit-Learn": ["scikit-learn", "sklearn"],
    "Data Analysis": ["data analysis", "data analytics", "pandas", "numpy"]
}

def extract_skills(text: str) -> List[Dict[str, any]]:
    """
    Scans the text for technical skills using the dictionary patterns.
    Computes confidence score based on the frequency and context.
    """
    results = []
    if not text:
        return results
        
    text_lower = text.lower()
    
    for skill_name, aliases in SKILLS_DICTIONARY.items():
        matches_count = 0
        for alias in aliases:
            # Handle boundary checks appropriately
            pattern = alias if "\\b" in alias else r'\b' + alias + r'\b'
            matches = re.findall(pattern, text_lower)
            matches_count += len(matches)
            
        if matches_count > 0:
            # Base confidence: 0.7 for one match
            # Scale up to 0.95 for multiple matches
            confidence = 0.70 + min(matches_count - 1, 5) * 0.05
            
            # Extra context checks (proximity to experience verbs)
            context_bonus = 0.0
            experience_keywords = ["experience", "proficient", "projects", "developed", "skilled", "implemented"]
            for kw in experience_keywords:
                if kw in text_lower:
                    # check if skill is within 100 characters of experience keywords
                    # simple mock logic for context
                    context_bonus = 0.05
                    break
                    
            confidence = min(confidence + context_bonus, 0.95)
            
            results.append({
                "name": skill_name,
                "confidence": round(confidence, 2)
            })
            
    # Sort skills by confidence descending
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results
