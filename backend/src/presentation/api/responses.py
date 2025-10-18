"""
Conversation Response Generation API
Endpoints for generating responses to messages
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
class ResponseRequest(BaseModel):
    """Request model for response generation"""
    received_message: str = Field(..., description="The message you received", min_length=1, max_length=2000)
    cultural_style: str = Field(
        default="boricua",
        description="Cultural style (boricua, mexicano, colombiano, argentino, español)"
    )
    conversation_context: Optional[List[str]] = Field(
        default=None,
        description="Previous messages for context (last 3-5 messages)"
    )
    shared_interests: Optional[List[str]] = Field(
        default=None,
        description="Common interests to reference"
    )
    relationship_stage: str = Field(
        default="early",
        description="Stage of relationship (early, building, advanced)"
    )
    num_suggestions: int = Field(default=3, ge=1, le=3, description="Number of suggestions (1-3)")

    class Config:
        json_schema_extra = {
            "example": {
                "received_message": "Hola! Me encantó tu perfil. ¿Qué tal tu día?",
                "cultural_style": "boricua",
                "conversation_context": [],
                "shared_interests": ["música", "playa"],
                "relationship_stage": "early",
                "num_suggestions": 3
            }
        }


class ConversationResponseModel(BaseModel):
    """Response model for a single conversation response"""
    text: str = Field(..., description="The response text")
    tone: str = Field(..., description="Tone used (genuino, coqueto, directo)")
    cultural_style: str = Field(..., description="Cultural style used")
    follow_up_suggestion: Optional[str] = Field(None, description="Suggested follow-up question")


class ResponsesListResponse(BaseModel):
    """Response model for list of responses"""
    success: bool
    responses: List[ConversationResponseModel]
    cultural_style: str
    relationship_stage: str
    suggestions_remaining: Optional[int] = None


class ContentSafetyRequest(BaseModel):
    """Request model for content safety check"""
    text: str = Field(..., description="Text to check for safety", min_length=1, max_length=2000)

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hola, ¿cómo estás? Me gustaría conocerte mejor."
            }
        }


class ContentSafetyResponse(BaseModel):
    """Response model for content safety check"""
    is_safe: bool
    reason: Optional[str] = None
    suggestion: Optional[str] = None


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


@router.post("/responses", response_model=ResponsesListResponse)
async def generate_responses(
    request: ResponseRequest,
    ai_service: AIConversationService = Depends(get_ai_service)
):
    """
    Generate conversation responses to received messages

    This endpoint analyzes the received message and conversation context to generate
    culturally-adapted responses in 3 different tones:
    - Genuino (Genuine/Warm)
    - Coqueto (Flirty/Playful)
    - Directo (Direct/Clear)

    Perfect for keeping the conversation flowing naturally!
    """
    try:
        logger.info(f"Generating responses with {request.cultural_style} style")

        # Validate cultural style
        valid_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]
        if request.cultural_style not in valid_styles:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid cultural_style. Must be one of: {', '.join(valid_styles)}"
            )

        # Validate relationship stage
        valid_stages = ["early", "building", "advanced"]
        if request.relationship_stage not in valid_stages:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid relationship_stage. Must be one of: {', '.join(valid_stages)}"
            )

        # Generate responses
        responses = await ai_service.generate_responses(
            received_message=request.received_message,
            cultural_style=request.cultural_style,
            conversation_context=request.conversation_context,
            shared_interests=request.shared_interests,
            relationship_stage=request.relationship_stage,
            num_suggestions=request.num_suggestions
        )

        # Convert to response format
        response_models = [
            ConversationResponseModel(
                text=response.text,
                tone=response.tone,
                cultural_style=response.cultural_style,
                follow_up_suggestion=response.follow_up_suggestion
            )
            for response in responses
        ]

        logger.info(f"Successfully generated {len(response_models)} responses")

        return ResponsesListResponse(
            success=True,
            responses=response_models,
            cultural_style=request.cultural_style,
            relationship_stage=request.relationship_stage,
            suggestions_remaining=None  # TODO: Implement with user auth
        )

    except Exception as e:
        logger.error(f"Error generating responses: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating responses: {str(e)}"
        )


@router.post("/responses/safety-check", response_model=ContentSafetyResponse)
async def check_content_safety(
    request: ContentSafetyRequest,
    ai_service: AIConversationService = Depends(get_ai_service)
):
    """
    Check if content is safe and appropriate

    This endpoint analyzes text for:
    - Offensive language
    - Sexual content
    - Harassment or abuse
    - Discrimination
    - Personal information exposure
    """
    try:
        logger.info("Checking content safety")

        result = await ai_service.check_content_safety(request.text)

        response = ContentSafetyResponse(
            is_safe=result["is_safe"],
            reason=result.get("reason")
        )

        # If unsafe, provide a rewritten suggestion
        if not result["is_safe"]:
            logger.warning(f"Unsafe content detected: {result.get('reason')}")
            # TODO: Could optionally add rewritten suggestion here

        return response

    except Exception as e:
        logger.error(f"Error checking content safety: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking content safety: {str(e)}"
        )


@router.post("/responses/rewrite")
async def rewrite_message(
    request: ContentSafetyRequest,
    cultural_style: str = "boricua",
    ai_service: AIConversationService = Depends(get_ai_service)
):
    """
    Rewrite an inappropriate message to be respectful

    Takes a potentially inappropriate message and rewrites it to be
    respectful while maintaining the core intent (if salvageable).
    """
    try:
        logger.info(f"Rewriting message with {cultural_style} style")

        # Validate cultural style
        valid_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]
        if cultural_style not in valid_styles:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid cultural_style. Must be one of: {', '.join(valid_styles)}"
            )

        rewritten = await ai_service.rewrite_inappropriate_message(
            text=request.text,
            cultural_style=cultural_style
        )

        return {
            "success": True,
            "original": request.text,
            "rewritten": rewritten,
            "cultural_style": cultural_style
        }

    except Exception as e:
        logger.error(f"Error rewriting message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error rewriting message: {str(e)}"
        )


@router.get("/responses/examples")
async def get_response_examples():
    """
    Get example responses for different scenarios

    Returns pre-made examples showing how the AI responds in different contexts.
    """
    examples = {
        "early_stage": {
            "received": "Hola! Vi tu perfil y me pareció interesante. ¿Cómo estás?",
            "responses": [
                {
                    "text": "¡Hola! Todo bien por aquí 😊 Gracias por escribir. ¿Y tú qué tal? Vi que te gusta la música, ¿qué estás escuchando últimamente?",
                    "tone": "genuino",
                    "style": "boricua"
                },
                {
                    "text": "Wepa! Me alegra que te haya gustado mi perfil 😏 Aquí chilling. ¿Qué fue lo que más te llamó la atención?",
                    "tone": "coqueto",
                    "style": "boricua"
                }
            ]
        },
        "building_stage": {
            "received": "Jaja me encanta tu sentido del humor! Deberíamos seguir hablando",
            "responses": [
                {
                    "text": "¡Claro que sí! Me gusta cómo fluye la conversación contigo 😄 ¿Tienes WhatsApp o prefieres seguir por acá?",
                    "tone": "genuino",
                    "style": "boricua"
                }
            ]
        }
    }

    return {
        "success": True,
        "examples": examples,
        "note": "Example responses showing different conversation stages and tones"
    }
