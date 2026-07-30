import math
import re

class SemanticMatcher:
    @staticmethod
    def _get_ngrams(text: str, n: int = 3) -> list:
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)
        if len(text) < n:
            return [text]
        return [text[i:i+n] for i in range(len(text) - n + 1)]

    @classmethod
    def similarity(cls, text1: str, text2: str) -> float:
        """Computes Cosine Similarity based on 3-gram occurrences."""
        if not text1 or not text2:
            return 0.0
            
        ngrams1 = cls._get_ngrams(text1)
        ngrams2 = cls._get_ngrams(text2)
        
        # Count frequencies
        freq1 = {}
        for g in ngrams1:
            freq1[g] = freq1.get(g, 0) + 1
            
        freq2 = {}
        for g in ngrams2:
            freq2[g] = freq2.get(g, 0) + 1
            
        # Unique ngrams
        all_ngrams = set(freq1.keys()).union(set(freq2.keys()))
        
        # Compute dot product and magnitudes
        dot_product = 0.0
        mag1 = 0.0
        mag2 = 0.0
        
        for g in all_ngrams:
            v1 = freq1.get(g, 0)
            v2 = freq2.get(g, 0)
            dot_product += v1 * v2
            mag1 += v1 * v1
            mag2 += v2 * v2
            
        if mag1 == 0 or mag2 == 0:
            return 0.0
            
        return dot_product / (math.sqrt(mag1) * math.sqrt(mag2))

    @classmethod
    def jaccard_overlap(cls, text1: str, text2: str) -> float:
        """Computes Jaccard Similarity based on unique words."""
        if not text1 or not text2:
            return 0.0
            
        words1 = set(re.findall(r'\b\w+\b', text1.lower()))
        words2 = set(re.findall(r'\b\w+\b', text2.lower()))
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)
