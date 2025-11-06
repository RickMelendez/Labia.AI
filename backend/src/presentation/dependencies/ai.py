"""
Presentation dependencies for AI services.
Wires infrastructure providers into the application-level interface.
"""
from fastapi import HTTPException

from ...core.config import settings
from ...infrastructure.external_services.llm_provider import (
    LLMProviderFactory,
    LLMProvider,
)
from ...infrastructure.external_services.ai_service import AIConversationService
from ...application.services.conversation import ConversationService


def get_ai_service() -> ConversationService:
    """Factory dependency that returns an application-level conversation service.

    Presentation depends on the ConversationService interface; wiring of concrete
    providers happens here (composition root responsibility).
    """
    provider_type = LLMProvider(settings.LLM_PROVIDER)

    if provider_type == LLMProvider.OPENAI:
        api_key = settings.OPENAI_API_KEY
        model = settings.OPENAI_MODEL
    elif provider_type == LLMProvider.ANTHROPIC:
        api_key = settings.ANTHROPIC_API_KEY
        model = settings.ANTHROPIC_MODEL
    else:
        raise HTTPException(status_code=500, detail=f"Unsupported LLM provider: {settings.LLM_PROVIDER}")

    if not api_key:
        raise HTTPException(status_code=500, detail=f"API key not configured for {settings.LLM_PROVIDER}")

    llm = LLMProviderFactory.create(provider_type, api_key, model)
    return AIConversationService(llm)

