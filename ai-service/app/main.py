import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ingestion
from app.categorization import routes as categorization
from app.relationship_engine import routes as relationships
from app.timeline import routes as timeline
from app.smart_retrieval import router as smart_retrieval

app = FastAPI(
    title="MemoryVerse AI Service",
    description="Python FastAPI service for Document Processing, OCR, and AI Tasks",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ingestion.router, tags=["Ingestion"])
app.include_router(categorization.router, tags=["Categorization"])
app.include_router(relationships.router, tags=["Relationships"])
app.include_router(timeline.router, tags=["Timeline"])
app.include_router(smart_retrieval, tags=["Smart Retrieval"])

@app.on_event("startup")
async def startup_event():
    try:
        from app.smart_retrieval.embedding_service import get_model
        # Call get_model to trigger loading/downloading SentenceTransformer on startup
        get_model()
    except Exception as e:
        print(f"Warning: startup pre-load failed: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "MemoryVerse AI Ingestion Engine",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
