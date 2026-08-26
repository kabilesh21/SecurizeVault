import os
import pickle
import logging
import numpy as np
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("smart_retrieval")

CHROMA_DIR = "/app/chroma_db"
FALLBACK_FILE = "/app/chroma_db_fallback.pkl"

class FallbackVectorStore:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'rb') as f:
                    self.data = pickle.load(f)
                logger.info(f"Fallback store loaded {len(self.data)} documents.")
            except Exception as e:
                logger.error(f"Failed to load fallback store: {e}")
                self.data = []

    def _save(self):
        try:
            with open(self.filepath, 'wb') as f:
                pickle.dump(self.data, f)
        except Exception as e:
            logger.error(f"Failed to save fallback store: {e}")

    def add(self, document_id: int, user_id: int, embedding: List[float], metadata: Dict[str, Any]):
        # Remove if exists
        self.delete(document_id, user_id)
        self.data.append({
            "documentId": document_id,
            "userId": user_id,
            "embedding": embedding,
            "metadata": metadata
        })
        self._save()

    def delete(self, document_id: int, user_id: int):
        self.data = [item for item in self.data if not (item["documentId"] == document_id and item["userId"] == user_id)]
        self._save()

    def search(self, user_id: int, query_embedding: List[float], limit: int) -> List[Tuple[Dict[str, Any], float]]:
        user_items = [item for item in self.data if item["userId"] == user_id]
        if not user_items:
            return []

        results = []
        q_vec = np.array(query_embedding)
        
        # Normalize query vector
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        for item in user_items:
            db_vec = np.array(item["embedding"])
            db_norm = np.linalg.norm(db_vec)
            if db_norm > 0:
                db_vec = db_vec / db_norm
            
            # Cosine similarity is the dot product of normalized vectors
            sim = float(np.dot(q_vec, db_vec))
            results.append((item["metadata"], sim))

        # Sort descending by similarity
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

    def count(self, user_id: int) -> int:
        return len([item for item in self.data if item["userId"] == user_id])


# Global vector store instance
_vector_store = None
_mode = "NONE"

def init_vector_store():
    global _vector_store, _mode
    if _vector_store is not None:
        return _vector_store, _mode

    # Try ChromaDB first
    try:
        import chromadb
        logger.info("Initializing ChromaDB PersistentClient...")
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        
        # Get or create collection
        collection = client.get_or_create_collection(
            name="memoryverse_documents",
            metadata={"hnsw:space": "cosine"}
        )
        
        class ChromaWrapper:
            def __init__(self, coll):
                self.coll = coll

            def add(self, document_id: int, user_id: int, embedding: List[float], metadata: Dict[str, Any]):
                doc_id_str = f"doc_{user_id}_{document_id}"
                # Combine user_id and document_id in metadata for quick filtering
                meta = {**metadata, "userId": user_id, "documentId": document_id}
                # ChromaDB requires metadata fields to be of primitive types (str, int, float, bool)
                # Filter out lists or complex types or serialize them
                serialized_meta = {}
                for k, v in meta.items():
                    if v is None:
                        serialized_meta[k] = ""
                    elif isinstance(v, (list, dict)):
                        serialized_meta[k] = ",".join(map(str, v)) if isinstance(v, list) else str(v)
                    else:
                        serialized_meta[k] = v

                self.coll.upsert(
                    ids=[doc_id_str],
                    embeddings=[embedding],
                    metadatas=[serialized_meta],
                    documents=[serialized_meta.get("documentName", "")]
                )

            def delete(self, document_id: int, user_id: int):
                doc_id_str = f"doc_{user_id}_{document_id}"
                try:
                    self.coll.delete(ids=[doc_id_str])
                except Exception as e:
                    logger.warning(f"Error deleting from ChromaDB: {e}")

            def search(self, user_id: int, query_embedding: List[float], limit: int) -> List[Tuple[Dict[str, Any], float]]:
                results = self.coll.query(
                    query_embeddings=[query_embedding],
                    n_results=limit,
                    where={"userId": user_id}
                )
                
                output = []
                if results and "metadatas" in results and results["metadatas"]:
                    metadatas = results["metadatas"][0]
                    distances = results["distances"][0] if "distances" in results else [0.0] * len(metadatas)
                    for meta, dist in zip(metadatas, distances):
                        # Cosine distance to similarity: 1 - distance (or distance directly depending on space)
                        # Chroma's cosine distance is 1 - similarity, so similarity = 1 - distance
                        sim = 1.0 - float(dist)
                        
                        # Unserialize list fields if needed
                        deserialized_meta = {}
                        for k, v in meta.items():
                            if k in ["skills", "technologies", "categories", "keywords", "dates"]:
                                deserialized_meta[k] = v.split(",") if isinstance(v, str) and v else []
                            else:
                                deserialized_meta[k] = v
                        output.append((deserialized_meta, sim))
                return output

            def count(self, user_id: int) -> int:
                # Count items in collection by matching userId in metadata
                results = self.coll.get(where={"userId": user_id})
                return len(results["ids"]) if results and "ids" in results else 0

        _vector_store = ChromaWrapper(collection)
        _mode = "CHROMADB"
        logger.info("ChromaDB vector store successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize ChromaDB: {e}. Falling back to NumPy Persistent Store.")
        _vector_store = FallbackVectorStore(FALLBACK_FILE)
        _mode = "FALLBACK_NUMPY"

    return _vector_store, _mode

def get_vector_store():
    store, _ = init_vector_store()
    return store

def get_store_mode():
    _, mode = init_vector_store()
    return mode
