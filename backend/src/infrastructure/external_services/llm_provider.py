"""
LLM Provider Abstraction Layer
Supports multiple AI providers (OpenAI, Anthropic) with consistent interface
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from enum import Enum
import openai
from anthropic import Anthropic
from loguru import logger


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class LLMMessage:
    """Standardized message format across providers"""

    def __init__(self, role: str, content: str):
        self.role = role  # system, user, assistant
        self.content = content

    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}


class BaseLLMProvider(ABC):
    """Base interface for LLM providers"""

    @abstractmethod
    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 500,
        **kwargs
    ) -> str:
        """Generate response from messages"""
        pass

    @abstractmethod
    async def generate_multiple(
        self,
        messages: List[LLMMessage],
        n: int = 3,
        temperature: float = 0.8,
        max_tokens: int = 500,
        **kwargs
    ) -> List[str]:
        """Generate multiple responses"""
        pass


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT provider implementation"""

    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model
        logger.info(f"Initialized OpenAI provider with model: {model}")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 500,
        **kwargs
    ) -> str:
        """Generate single response"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            raise

    async def generate_multiple(
        self,
        messages: List[LLMMessage],
        n: int = 3,
        temperature: float = 0.8,
        max_tokens: int = 500,
        **kwargs
    ) -> List[str]:
        """Generate multiple responses"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[msg.to_dict() for msg in messages],
                temperature=temperature,
                max_tokens=max_tokens,
                n=n,
                **kwargs
            )
            return [choice.message.content for choice in response.choices]
        except Exception as e:
            logger.error(f"OpenAI multiple generation error: {e}")
            raise


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude provider implementation"""

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.client = Anthropic(api_key=api_key)
        self.model = model
        logger.info(f"Initialized Anthropic provider with model: {model}")

    async def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 500,
        **kwargs
    ) -> str:
        """Generate single response"""
        try:
            # Extract system message if present
            system_msg = next((msg.content for msg in messages if msg.role == "system"), None)
            user_messages = [msg.to_dict() for msg in messages if msg.role != "system"]

            response = self.client.messages.create(
                model=self.model,
                system=system_msg,
                messages=user_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic generation error: {e}")
            raise

    async def generate_multiple(
        self,
        messages: List[LLMMessage],
        n: int = 3,
        temperature: float = 0.8,
        max_tokens: int = 500,
        **kwargs
    ) -> List[str]:
        """Generate multiple responses by calling API n times"""
        results = []
        for _ in range(n):
            result = await self.generate(messages, temperature, max_tokens, **kwargs)
            results.append(result)
        return results


class LLMProviderFactory:
    """Factory for creating LLM providers"""

    @staticmethod
    def create(
        provider: LLMProvider,
        api_key: str,
        model: Optional[str] = None
    ) -> BaseLLMProvider:
        """Create LLM provider instance"""
        if provider == LLMProvider.OPENAI:
            return OpenAIProvider(api_key, model or "gpt-4-turbo-preview")
        elif provider == LLMProvider.ANTHROPIC:
            return AnthropicProvider(api_key, model or "claude-3-5-sonnet-20241022")
        else:
            raise ValueError(f"Unsupported provider: {provider}")
