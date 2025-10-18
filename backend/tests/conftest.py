"""
Pytest configuration and fixtures
"""
import sys
from pathlib import Path

# Add backend src to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from unittest.mock import Mock, AsyncMock


@pytest.fixture
def mock_openai_provider():
    """Mock OpenAI provider for testing"""
    provider = Mock()
    provider.generate_completion = AsyncMock(return_value="Mock response from OpenAI")
    provider.provider_name = "openai"
    provider.model_name = "gpt-4-turbo-preview"
    return provider


@pytest.fixture
def mock_anthropic_provider():
    """Mock Anthropic provider for testing"""
    provider = Mock()
    provider.generate_completion = AsyncMock(return_value="Mock response from Anthropic")
    provider.provider_name = "anthropic"
    provider.model_name = "claude-3-5-sonnet-20241022"
    return provider


@pytest.fixture
def sample_bio():
    """Sample user bio for testing"""
    return "Me encanta la playa y Bad Bunny 🐰"


@pytest.fixture
def sample_interests():
    """Sample user interests for testing"""
    return ["playa", "música", "reggaeton"]


@pytest.fixture
def sample_conversation_context():
    """Sample conversation context for testing"""
    return {
        "their_message": "Hola! ¿Cómo estás?",
        "conversation_history": [],
        "their_bio": "Me gusta el café y los atardeceres",
        "your_bio": "Fotógrafo apasionado por la naturaleza"
    }
