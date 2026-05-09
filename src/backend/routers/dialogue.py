"""流式对话SSE端点"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from llm.client import get_llm_client
from llm.fallback import fallback_dialogue_response
from llm.prompts import DIALOGUE_SYSTEM_PROMPT, LEARNING_PATH
from ..services.profile_service import build_profile
from ..schemas import PathPlanRequest, SearchQuery

router = APIRouter(prefix="/api", tags=["dialogue"])


class ChatRequest(BaseModel):
    student_id: str = ""
    message: str


@router.get("/dialogue")
async def stream_chat(student_id: str = "", message: str = ""):
    """SSE流式对话端点"""
    client = get_llm_client()
    context = DIALOGUE_SYSTEM_PROMPT
    if student_id:
        profile = build_profile(student_id)
        if profile:
            keywords = ", ".join([k for k, _ in profile.get("interest_keywords", [])[:10]])
            context += f"\n\n当前学生信息：专业{profile.get('major')}，年级{profile.get('grade')}，兴趣关键词：{keywords}"

    async def generate():
        try:
            async for token in client.stream_safe(message, system=context):
                yield f"data: {token}\n\n"
        except Exception as e:
            yield f"data: {fallback_dialogue_response(message)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.post("/student/{student_id}/path")
async def plan_path(student_id: str, request: PathPlanRequest):
    """学习路径规划"""
    from llm.fallback import fallback_learning_path
    profile = build_profile(student_id)
    client = get_llm_client()
    domains = ", ".join([f"{k}({v:.0%})" for k, v in profile.get("domain_weights", {}).items()][:5])
    keywords = ", ".join([k for k, _ in profile.get("interest_keywords", [])[:10]])
    prompt = LEARNING_PATH.format(domains=domains, mastery_levels="根据课内成绩推断", goal=request.goal, available_books="[需查询馆藏]")
    response = await client.chat_safe(prompt)
    if response.startswith("[智能助手暂时不可用"):
        steps = fallback_learning_path(request.goal)
        return {"steps": steps, "fallback": True}
    steps = [s.strip() for s in response.split("\n") if s.strip() and s.strip()[0].isdigit()]
    if not steps:
        steps = fallback_learning_path(request.goal)
        return {"steps": steps, "fallback": True}
    return {"steps": [{"order": i + 1, "description": step} for i, step in enumerate(steps)]}


@router.get("/search")
async def semantic_search(q: str = "", student_id: str = ""):
    """语义搜索端点（LLM增强 + 关键词降级）"""
    if not q:
        return {"results": []}
    from ..database import SessionLocal
    from ..models import Book

    # Try LLM interpretation first
    try:
        from llm.client import get_llm_client
        client = get_llm_client()
        # Ask LLM to extract search keywords from natural language query
        prompt = f"从以下查询中提取3-5个关键词用于图书馆检索，只输出空格分隔的关键词：{q}"
        llm_response = await client.chat_safe(prompt)
        search_keywords = llm_response.strip().split()
    except Exception:
        import re
        search_keywords = [t.strip() for t in re.split(r'[，,、\s]+', q) if t.strip()]

    # Keyword search in database
    db = SessionLocal()
    try:
        books = db.query(Book).all()
        results = []
        for book in books:
            score = sum(1 for kw in search_keywords if kw.lower() in (book.title + book.summary).lower())
            if score > 0:
                results.append({
                    "item_id": book.book_id, "title": book.title, "author": book.author,
                    "score": min(score / len(search_keywords), 1.0),
                    "available": book.available_copies > 0,
                    "clc_number": book.clc_number,
                    "summary": book.summary[:100] + "..." if len(book.summary) > 100 else book.summary,
                })
        results.sort(key=lambda x: x["score"], reverse=True)
        return {"results": results[:10]}
    finally:
        db.close()
