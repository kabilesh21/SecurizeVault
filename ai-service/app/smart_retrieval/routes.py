from fastapi import APIRouter, HTTPException
from .models import SearchRequest, SearchResponse, SearchResult, IndexRequest, IndexResponse, StatusResponse
from .embedding_service import generate_embedding
from .vector_store import get_vector_store, get_store_mode
from .query_parser import parse_query
from .intent_classifier import classify_intent
from .hybrid_ranker import rank_results
from .result_explainer import explain_match
from .suggestion_generator import generate_suggestions
import logging

logger = logging.getLogger("smart_retrieval")

router = APIRouter(prefix="/search", tags=["Smart Retrieval"])

@router.post("/", response_model=SearchResponse)
async def perform_search(request: SearchRequest):
    """
    NLP search using hybrid vector similarity and metadata scoring.
    """
    try:
        query = request.query
        user_id = request.userId
        limit = request.limit or 10

        # 1. Classify intent
        intent_info = classify_intent(query)
        
        # 2. Parse query parameters (filters)
        filters = parse_query(query)

        # 3. Generate query embedding
        query_emb = generate_embedding(query)

        # 4. Query vector store
        store = get_vector_store()
        raw_results = store.search(user_id=user_id, query_embedding=query_emb, limit=limit * 2)

        # 5. Apply hybrid ranking
        ranked_items = rank_results(raw_results, filters, intent_info)

        # 6. Map and enrich results
        results = []
        for item in ranked_items[:limit]:
            meta = item["metadata"]
            score = item["relevanceScore"]
            
            # Skip low confidence results if appropriate (optional threshold)
            if score < 0.25:
                continue

            explanation_str = explain_match(item, query, intent_info["name"])

            res_obj = SearchResult(
                documentId=int(meta.get("documentId", 0)),
                title=meta.get("title", meta.get("documentName", "Untitled")),
                resultType=meta.get("primaryCategory", "OTHER"),
                description=meta.get("description", ""),
                matchedSkills=item["matchedSkills"],
                relevanceScore=score,
                explanation=explanation_str,
                organization=meta.get("organization"),
                displayDate=meta.get("displayDate") or meta.get("uploadDate"),
                confidenceScore=float(meta.get("confidenceScore", 1.0))
            )
            results.append(res_obj)

        # 7. Generate suggestion prompts
        suggestions = generate_suggestions(query, intent_info["name"], filters, ranked_items)

        # 8. Generate conversational explanation using Gemini API
        from app.utils.gemini import call_gemini
        
        retrieved_context = ""
        for i, res in enumerate(results):
            skills_str = ", ".join(res.matchedSkills) if res.matchedSkills else "None"
            retrieved_context += f"- Title: {res.title}, Category: {res.resultType}, Skills: {skills_str}, Organization: {res.organization or 'Unknown'}, Date: {res.displayDate or 'Unknown'}\n"
            
        gemini_prompt = f"""
        You are the MemoryVerse AI Assistant. Answer the student's question based on their portfolio documents.
        Student's question: "{query}"

        Student's Portfolio Details:
        {retrieved_context if retrieved_context else "No document credentials exist in the portfolio yet."}

        Provide a direct, conversational, and friendly response answering the question. Reference their specific certificates, skills, projects, or documents if available. Keep your response to 2-4 sentences. Do not mention "context" or "retrieved details" directly.
        """
        
        try:
            explanation_text = call_gemini(gemini_prompt).strip()
        except Exception:
            explanation_text = "I searched your profile but couldn't generate a conversational response right now."

        return SearchResponse(
            query=query,
            intent=intent_info,
            filters=filters,
            results=results,
            suggestions=suggestions,
            processingStatus="COMPLETED",
            explanation=explanation_text
        )

    except Exception as e:
        logger.error(f"Search endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/index", response_model=IndexResponse)
async def index_document(request: IndexRequest):
    """
    Indexes a document by generating embeddings and inserting into the vector store.
    """
    try:
        # Create searchable text representation
        text_rep = f"{request.documentName} {request.category}. "
        if request.textContent:
            text_rep += request.textContent[:3000] # Limit to first 3000 chars for efficiency
        
        if request.skills:
            text_rep += " Skills: " + ", ".join(request.skills) + "."

        if request.metadata:
            org = request.metadata.get("organization")
            if org:
                text_rep += f" Organization: {org}."
            techs = request.metadata.get("technologies")
            if techs:
                text_rep += " Technologies: " + ", ".join(techs) + "."

        # Generate embedding
        emb = generate_embedding(text_rep)

        # Construct metadata dictionary
        meta = {
            "documentId": request.documentId,
            "documentName": request.documentName,
            "title": request.metadata.get("title", request.documentName.split(".")[0]) if request.metadata else request.documentName.split(".")[0],
            "primaryCategory": request.category,
            "skills": request.skills,
            "technologies": request.metadata.get("technologies") if request.metadata else [],
            "organization": request.metadata.get("organization") if request.metadata else None,
            "displayDate": request.metadata.get("displayDate") if request.metadata else None,
            "uploadDate": request.metadata.get("uploadDate") if request.metadata else None,
            "description": request.metadata.get("description", "") if request.metadata else "",
            "confidenceScore": float(request.metadata.get("confidenceScore", 1.0)) if request.metadata else 1.0
        }

        # Store in vector database
        store = get_vector_store()
        store.add(
            document_id=request.documentId,
            user_id=request.userId,
            embedding=emb,
            metadata=meta
        )

        return IndexResponse(
            status="SUCCESS",
            message=f"Document {request.documentId} indexed successfully."
        )

    except Exception as e:
        logger.error(f"Index endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/index/{user_id}/{document_id}", response_model=IndexResponse)
async def delete_indexed_document(user_id: int, document_id: int):
    """
    Deletes an indexed document vector from the store.
    """
    try:
        store = get_vector_store()
        store.delete(document_id=document_id, user_id=user_id)
        return IndexResponse(
            status="SUCCESS",
            message=f"Document {document_id} for user {user_id} deleted from index."
        )
    except Exception as e:
        logger.error(f"Delete index endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=StatusResponse)
async def check_status(userId: int):
    """
    Returns index status and total document count.
    """
    try:
        store = get_vector_store()
        mode = get_store_mode()
        count = store.count(userId)
        return StatusResponse(
            status="ONLINE",
            documentsIndexed=count,
            mode=mode
        )
    except Exception as e:
        logger.error(f"Status endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
