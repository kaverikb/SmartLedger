from fastapi import APIRouter, Query
from app.services.query_engine import answer_query

router = APIRouter()


@router.get("/ask")
def ask_question(query: str = Query(..., description="User query")):
    try:
        result = answer_query(query)

        # ✅ Just pass through
        if "answer" in result:
            return result

        # fallback safety (in case something weird happens)
        return {
            "answer": "Something went wrong while processing your request."
        }

    except Exception as e:
        print("🔥 Chat route error:", e)
        return {
            "answer": "Server error while processing your query."
        }