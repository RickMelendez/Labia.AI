"""
Openers API
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


class OpenerRequest(BaseModel):
    bio: str = Field(..., min_length=10, max_length=1000)
    interests: List[str] = Field(default=[])
    cultural_style: str = Field(default="boricua")
    user_interests: Optional[List[str]] = None
    num_suggestions: int = Field(default=3, ge=1, le=5)
    target_tone: Optional[str] = Field(
        default=None,
        description="UI tone: chill|elegant|intellectual|playero|minimalist",
    )


class OpenerResponse(BaseModel):
    text: str
    tone: str
    cultural_style: str
    confidence: float


class OpenersListResponse(BaseModel):
    success: bool
    suggestions: List[OpenerResponse]
    cultural_style: str
    openers: Optional[List[OpenerResponse]] = None  # back-compat
    suggestions_remaining: Optional[int] = None


@router.post("/openers", response_model=OpenersListResponse)
async def generate_openers(
    request: OpenerRequest,
    ai: ConversationService = Depends(get_ai_service),
    cache: RedisClient = Depends(get_redis),
):
    # Normalize legacy spellings to canonical values
    normalization_map = {
        "espanol": "español",
        "espaAol": "español",
        "espaA�ol": "español",
    }
    cs = normalization_map.get(request.cultural_style, request.cultural_style)
    valid_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]
    if cs not in valid_styles:
        raise HTTPException(status_code=400, detail="Invalid cultural_style")

    # Apply normalized style
    request.cultural_style = cs

    cache_key_data = {
        "bio": request.bio,
        "interests": sorted(request.interests),
        "cultural_style": request.cultural_style,
        "target_tone": request.target_tone,
        "user_interests": sorted(request.user_interests) if request.user_interests else None,
        "num_suggestions": request.num_suggestions,
    }
    cache_key = f"opener:{request.cultural_style}:{hashlib.md5(json.dumps(cache_key_data, sort_keys=True).encode()).hexdigest()}"

    cached = await cache.get(cache_key)
    if cached:
        return OpenersListResponse(**cached)

    items = await ai.generate_openers(
        bio=request.bio,
        interests=request.interests,
        cultural_style=request.cultural_style,
        target_tone=request.target_tone,
        user_interests=request.user_interests,
        num_suggestions=request.num_suggestions,
    )

    suggestions = [
        OpenerResponse(text=i.text, tone=i.tone, cultural_style=i.cultural_style, confidence=i.confidence)
        for i in items
    ]

    resp = OpenersListResponse(success=True, suggestions=suggestions, openers=suggestions, cultural_style=request.cultural_style)
    await cache.set(cache_key, resp.model_dump(), ttl=3600)
    return resp


@router.post("/openers/preview")
async def preview_opener(
    request: OpenerRequest,
    ai: ConversationService = Depends(get_ai_service),
):
    # Use normalized style from main handler logic as well
    normalization_map = {
        "espanol": "español",
        "espaAol": "español",
        "espaA�ol": "español",
    }
    request.cultural_style = normalization_map.get(request.cultural_style, request.cultural_style)

    items = await ai.generate_openers(
        bio=request.bio,
        interests=request.interests,
        cultural_style=request.cultural_style,
        target_tone=request.target_tone,
        user_interests=request.user_interests,
        num_suggestions=1,
    )
    if not items:
        raise HTTPException(status_code=500, detail="Failed to generate preview")
    return {"success": True, "preview": {"text": items[0].text, "tone": items[0].tone, "cultural_style": items[0].cultural_style}}

