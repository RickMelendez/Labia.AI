"""
External Services Package
Handles integrations with external APIs and services
"""
from .llm_provider import (
    BaseLLMProvider,
    OpenAIProvider,
    AnthropicProvider,
    LLMProviderFactory,
    LLMProvider,
    LLMMessage
)
from .ai_service import (
    AIConversationService,
    ConversationOpener,
    ConversationResponse
)
from .prompt_templates import (
    PromptTemplates,
    PromptBuilder,
    CULTURAL_CONTEXTS
)

__all__ = [
    "BaseLLMProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "LLMProviderFactory",
    "LLMProvider",
    "LLMMessage",
    "AIConversationService",
    "ConversationOpener",
    "ConversationResponse",
    "PromptTemplates",
    "PromptBuilder",
    "CULTURAL_CONTEXTS",
]
