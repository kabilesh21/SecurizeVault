from typing import List
from .models import SkillInput, CareerRecommendation

class CareerMapper:
    CAREERS = [
        {
            "name": "AI/ML Engineer",
            "skills": {"python", "tensorflow", "pytorch", "machine learning", "deep learning", "sql", "go", "data analysis"},
            "description": "Builds, trains, and deploys machine learning and deep learning models to solve complex business problems."
        },
        {
            "name": "Full Stack Developer",
            "skills": {"react", "javascript", "java", "spring boot", "mysql", "html", "css", "typescript", "git"},
            "description": "Designs and implements both client-side and server-side logic, managing data persistence, RESTful APIs, and frontend layouts."
        },
        {
            "name": "Data Analyst",
            "skills": {"python", "sql", "mysql", "data analysis", "excel", "tableau"},
            "description": "Analyzes datasets to identify trends, create visualizations, and generate actionable business insights."
        },
        {
            "name": "Backend Developer",
            "skills": {"java", "spring boot", "mysql", "docker", "kubernetes", "aws", "rest api", "git"},
            "description": "Develops robust server-side APIs, manages databases, and ensures system scalability and security."
        },
        {
            "name": "Frontend Developer",
            "skills": {"react", "typescript", "javascript", "html", "css", "tailwind", "bootstrap", "next.js", "git"},
            "description": "Creates responsive, interactive, and visually stunning web user interfaces using modern libraries and frameworks."
        }
    ]

    @classmethod
    def recommend_careers(cls, skills: List[SkillInput]) -> List[CareerRecommendation]:
        user_skill_set = {s.name.strip().lower() for s in skills}
        recommendations = []

        for career in cls.CAREERS:
            required = career["skills"]
            matched = user_skill_set.intersection(required)
            
            if not matched:
                continue

            # Calculate match ratio
            ratio = len(matched) / len(required)
            
            # Boost score based on matching skills count
            confidence = min(0.95, 0.4 + (ratio * 0.6))
            
            # Only recommend if confidence meets a decent threshold (e.g., > 0.50)
            if confidence > 0.50:
                matched_str = ", ".join(sorted(list(matched)))
                reason = f"Based on your profile skills in: {matched_str}. Matches {len(matched)} of {len(required)} core competencies."
                recommendations.append(CareerRecommendation(
                    name=career["name"],
                    confidence=round(confidence, 2),
                    reason=reason
                ))

        # Sort recommendations by confidence descending
        recommendations.sort(key=lambda r: r.confidence, reverse=True)
        return recommendations
