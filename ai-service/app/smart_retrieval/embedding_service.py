import os
import logging
from typing import List

logger = logging.getLogger("smart_retrieval")

# Caching the model instance
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformers/all-MiniLM-L6-v2...")
            # Load locally or download and cache
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer: {e}. Fallback to mock embeddings.")
            _model = "FALLBACK"
    return _model

def generate_embedding(text: str) -> List[float]:
    model = get_model()
    if model == "FALLBACK" or model is None:
        # Generate deterministic mock embedding of length 384 based on character hash values
        # This keeps the math identical and ensures no crashes
        import hashlib
        h = hashlib.sha256(text.encode('utf-8')).digest()
        embedding = []
        for i in range(384):
            val = (h[i % 32] + (i * 13)) % 256
            embedding.append((val / 128.0) - 1.0)
        # Normalize to unit vector
        magnitude = sum(x*x for x in embedding) ** 0.5
        if magnitude > 0:
            embedding = [x / magnitude for x in embedding]
        return embedding
    
    # Generate real embedding using all-MiniLM-L6-v2 (dim=384)
    embeddings = model.encode([text])
    return embeddings[0].tolist()
