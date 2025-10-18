"""
Conversation Opener Generation API
Endpoints for generating conversation starters
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from loguru import logger

from ...infrastructure.external_services import (
    AIConversationService,
    LLMProviderFactory,
    LLMProvider
)
from ...core.config import settings

router = APIRouter()


# Request/Response Models
class OpenerRequest(BaseModel):
    """Request model for opener generation"""
    bio: str = Field(..., description="Target person's bio or description", min_length=10, max_length=1000)
    interests: List[str] = Field(default=[], description="Target person's interests")
    cultural_style: str = Field(
        default="boricua",
        description="Cultural style (boricua, mexicano, colombiano, argentino, español)"
    )
    user_interests: Optional[List[str]] = Field(default=None, description="Your own interests")
    num_suggestions: int = Field(default=3, ge=1, le=3, description="Number of suggestions (1-3)")

    class Config:
        json_schema_extra = {
            "example": {
                "bio": "Me encanta la playa y el reggaeton. Trabajo en marketing digital. Fan de Bad Bunny 🐰",
                "interests": ["playa", "música", "marketing"],
                "cultural_style": "boricua",
                "user_interests": ["música", "deportes"],
                "num_suggestions": 3
            }
        }


class OpenerResponse(BaseModel):
    """Response model for a single opener"""
    text: str = Field(..., description="The conversation opener text")
    tone: str = Field(..., description="Tone used (genuino, coqueto, directo)")
    cultural_style: str = Field(..., description="Cultural style used")
    confidence: float = Field(..., description="Confidence score (0-1)")


class OpenersListResponse(BaseModel):
    """Response model for list of openers"""
    success: bool
    openers: List[OpenerResponse]
    cultural_style: str
    suggestions_remaining: Optional[int] = None


# Dependency to get AI service
def get_ai_service() -> AIConversationService:
    """Create AI service instance"""
    llm_provider_type = LLMProvider(settings.LLM_PROVIDER)

    if llm_provider_type == LLMProvider.OPENAI:
        api_key = settings.OPENAI_API_KEY
        model = settings.OPENAI_MODEL
    elif llm_provider_type == LLMProvider.ANTHROPIC:
        api_key = settings.ANTHROPIC_API_KEY
        model = settings.ANTHROPIC_MODEL
    else:
        raise ValueError(f"Unsupported LLM provider: {settings.LLM_PROVIDER}")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=f"API key not configured for {settings.LLM_PROVIDER}"
        )

    llm_provider = LLMProviderFactory.create(llm_provider_type, api_key, model)
    return AIConversationService(llm_provider)


@router.post("/openers", response_model=OpenersListResponse)
async def generate_openers(
    request: OpenerRequest,
    ai_service: AIConversationService = Depends(get_ai_service)
):
    """
    Generate conversation openers for dating apps

    This endpoint generates culturally-adapted conversation starters based on
    the target person's bio and interests. It returns 3 different tones:
    - Genuino (Genuine/Friendly)
    - Coqueto (Flirty/Playful)
    - Directo (Direct/Concise)

    Perfect for Puerto Rican and Latin American users!
    """
    try:
        logger.info(f"Generating openers with {request.cultural_style} style")

        # Validate cultural style
        valid_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]
        if request.cultural_style not in valid_styles:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid cultural_style. Must be one of: {', '.join(valid_styles)}"
            )

        # Generate openers
        openers = await ai_service.generate_openers(
            bio=request.bio,
            interests=request.interests,
            cultural_style=request.cultural_style,
            user_interests=request.user_interests,
            num_suggestions=request.num_suggestions
        )

        # Convert to response format
        opener_responses = [
            OpenerResponse(
                text=opener.text,
                tone=opener.tone,
                cultural_style=opener.cultural_style,
                confidence=opener.confidence
            )
            for opener in openers
        ]

        logger.info(f"Successfully generated {len(opener_responses)} openers")

        return OpenersListResponse(
            success=True,
            openers=opener_responses,
            cultural_style=request.cultural_style,
            suggestions_remaining=None  # TODO: Implement with user auth
        )

    except Exception as e:
        logger.error(f"Error generating openers: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating openers: {str(e)}"
        )


@router.post("/openers/preview")
async def preview_opener(
    request: OpenerRequest,
    ai_service: AIConversationService = Depends(get_ai_service)
):
    """
    Preview a single opener (for testing/demo purposes)

    Generates only one opener with the 'genuino' tone.
    Useful for quick previews without using full quota.
    """
    try:
        # Generate only one opener with genuine tone
        openers = await ai_service.generate_openers(
            bio=request.bio,
            interests=request.interests,
            cultural_style=request.cultural_style,
            user_interests=request.user_interests,
            num_suggestions=1
        )

        if not openers:
            raise HTTPException(status_code=500, detail="Failed to generate preview")

        return {
            "success": True,
            "preview": {
                "text": openers[0].text,
                "tone": openers[0].tone,
                "cultural_style": openers[0].cultural_style
            }
        }

    except Exception as e:
        logger.error(f"Error generating preview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/openers/examples")
async def get_examples():
    """
    Get example openers for different cultural styles

    Returns pre-made examples to help users understand the app's capabilities.
    """
    examples = {
        "boricua": [
            {
                "bio": "Amo la playa, el mofongo y Bad Bunny 🐰",
                "opener": "¡Wepa! Vi que eres fan de Benito, yo también. ¿Cuál es tu canción favorita de él? 🎵",
                "tone": "genuino"
            },
            {
                "bio": "Chef amateur que le gusta experimentar en la cocina",
                "opener": "Oye, chef! Me encantan las personas creativas en la cocina 👨‍🍳 ¿Cuál es tu plato signature?",
                "tone": "coqueto"
            }
        ],
        "mexicano": [
            {
                "bio": "Fan de los tacos al pastor y las películas de terror",
                "opener": "¿Tacos y terror? Ya veo que tienes buen gusto wey 😄 ¿Cuál es tu taquería favorita?",
                "tone": "genuino"
            }
        ],
        "colombiano": [
            {
                "bio": "Bailarín de salsa y amante del café",
                "opener": "¡Parcero! Bailarín de salsa, eso está chimba 💃 ¿Dónde aprendiste a bailar?",
                "tone": "genuino"
            }
        ]
    }

    return {
        "success": True,
        "examples": examples,
        "note": "These are example openers showing different cultural styles"
    }
