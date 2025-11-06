"""
Agent Assistant API
Provides a helpful AI assistant for guidance, ideas, rewrites, and troubleshooting.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ...presentation.dependencies.ai import get_ai_service
from ...application.services.conversation import ConversationService
from ...infrastructure.cache.redis_client import get_redis, RedisClient


router = APIRouter()


class AssistRequest(BaseModel):
    query: str = Field(..., min_length=5, max_length=2000, description="User question or goal")
    cultural_style: str = Field(default="boricua")
    mode: str = Field(default="coach", description="coach|ideas|rewrite|troubleshoot")
    conversation_context: Optional[List[str]] = None
    goal: Optional[str] = None
    num_suggestions: int = Field(default=3, ge=1, le=5)


class AssistResponse(BaseModel):
    success: bool
    suggestions: List[str]
    cultural_style: str
    mode: str


@router.post("/agent/assist", response_model=AssistResponse)
async def assist(
    request: AssistRequest,
    ai: ConversationService = Depends(get_ai_service),
    cache: RedisClient = Depends(get_redis),
):
    try:
        cache_key = f"assist:{request.cultural_style}:{request.mode}:{hash(request.query)}"
        cached = await cache.get(cache_key)
        if cached:
            return AssistResponse(**cached)

        # type: ignore - our DI returns AIConversationService which implements assist
        suggestions: List[str] = await ai.assist(  # type: ignore[attr-defined]
            query=request.query,
            cultural_style=request.cultural_style,
            mode=request.mode,
            conversation_context=request.conversation_context or [],
            goal=request.goal,
            n=request.num_suggestions,
        )

        resp = AssistResponse(
            success=True,
            suggestions=suggestions[: request.num_suggestions],
            cultural_style=request.cultural_style,
            mode=request.mode,
        )

        await cache.set(cache_key, resp.model_dump(), ttl=900)
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

