"""
Responses API
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import hashlib
import json

from ...presentation.dependencies.ai import get_ai_service
from ...application.services.conversation import ConversationService
from ...infrastructure.cache.redis_client import get_redis, RedisClient


router = APIRouter()


class ResponseRequest(BaseModel):
    received_message: str = Field(..., min_length=1, max_length=2000)
    cultural_style: str = Field(default="boricua")
    conversation_context: Optional[List[str]] = None
    shared_interests: Optional[List[str]] = None
    relationship_stage: str = Field(default="early")
    num_suggestions: int = Field(default=3, ge=1, le=5)
    target_tone: Optional[str] = Field(default=None, description="UI tone: chill|elegant|intellectual|playero|minimalist")


class ConversationResponseModel(BaseModel):
    text: str
    tone: str
    cultural_style: str
    follow_up_suggestion: Optional[str] = None


class ResponsesListResponse(BaseModel):
    success: bool
    suggestions: List[ConversationResponseModel]
    cultural_style: str
    relationship_stage: str
    suggestions_remaining: Optional[int] = None


@router.post("/responses", response_model=ResponsesListResponse)
async def generate_responses(
    request: ResponseRequest,
    ai: ConversationService = Depends(get_ai_service),
    cache: RedisClient = Depends(get_redis),
):
    # Normalize legacy spellings to canonical values
    normalization_map = {
        "espanol": "español",
        "espaA\u0010ol": "español",
        "espaA�ol": "español",
    }
    cs = normalization_map.get(request.cultural_style, request.cultural_style)
    valid_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]
    if cs not in valid_styles:
        raise HTTPException(status_code=400, detail="Invalid cultural_style")
    request.cultural_style = cs

    cache_key_data = {
        "received_message": request.received_message,
        "cultural_style": request.cultural_style,
        "target_tone": request.target_tone,
        "conversation_context": request.conversation_context or [],
        "shared_interests": sorted(request.shared_interests) if request.shared_interests else None,
        "relationship_stage": request.relationship_stage,
        "num_suggestions": request.num_suggestions,
    }
    cache_key = f"response:{request.cultural_style}:{hashlib.md5(json.dumps(cache_key_data, sort_keys=True).encode()).hexdigest()}"

    cached = await cache.get(cache_key)
    if cached:
        return ResponsesListResponse(**cached)

    items = await ai.generate_responses(
        received_message=request.received_message,
        cultural_style=request.cultural_style,
        conversation_context=request.conversation_context,
        shared_interests=request.shared_interests,
        relationship_stage=request.relationship_stage,
        num_suggestions=request.num_suggestions,
        target_tone=request.target_tone,
    )

    suggestions = [
        ConversationResponseModel(
            text=i.text,
            tone=i.tone,
            cultural_style=i.cultural_style,
            follow_up_suggestion=i.follow_up_suggestion,
        )
        for i in items
    ]

    resp = ResponsesListResponse(
        success=True,
        suggestions=suggestions,
        cultural_style=request.cultural_style,
        relationship_stage=request.relationship_stage,
    )
    await cache.set(cache_key, resp.model_dump(), ttl=1800)
    return resp

