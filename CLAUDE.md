# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Labia.AI is an AI-powered conversation assistant specifically designed for Puerto Rico and Latin American markets. It helps users craft culturally-adapted conversation openers and responses for dating apps (Tinder, Bumble) and social media using region-specific slang, communication styles, and cultural nuances.

**Target Markets**: 🇵🇷 Puerto Rico (primary), 🇲🇽 Mexico, 🇨🇴 Colombia, 🇦🇷 Argentina, 🇪🇸 Spain

## Development Commands

### Backend Setup and Running

```bash
# Initial setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Required: Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env

# Database migrations
alembic upgrade head

# Run development server
uvicorn src.main:app --reload

# API documentation available at:
# - http://localhost:8000/docs (Swagger)
# - http://localhost:8000/redoc (ReDoc)
```

### Testing

```bash
# Run all tests
cd backend
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_ai_service.py -v

# Run specific test
pytest tests/test_openers_api.py::test_generate_openers -v
```

### Database Operations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current version
alembic current
```

### Docker Development

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up

# Start with optional tools (pgAdmin, Redis Commander)
docker-compose --profile tools up

# Start only database services
docker-compose up postgres redis

# Stop all services
docker-compose down

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up
```

### Code Quality

```bash
cd backend

# Format code
black src/ tests/ --line-length 120

# Lint code
flake8 src/ tests/

# Type checking
mypy src/
```

## Architecture

### Clean Architecture Layers

The backend follows **Domain-Driven Design (DDD)** with clean architecture:

1. **Domain Layer** (`src/domain/`)
   - **Entities**: Core business objects (User, Profile, Conversation, Message, Mission)
   - **Value Objects**: Immutable objects (Email, Country)
   - **Repositories**: Abstract interfaces for data access
   - No dependencies on infrastructure or frameworks

2. **Infrastructure Layer** (`src/infrastructure/`)
   - **External Services**: LLM providers (OpenAI, Anthropic), AI service
   - **Database**: SQLAlchemy models, database connection
   - **Cache**: Redis client for caching and rate limiting
   - Implements domain repository interfaces

3. **Presentation Layer** (`src/presentation/`)
   - **API Routes**: FastAPI endpoints organized by feature
   - **Middleware**: Error handling, request logging, rate limiting
   - Maps HTTP requests/responses to domain operations

4. **Core** (`src/core/`)
   - **Config**: Pydantic settings loaded from environment
   - **Exceptions**: Custom exception hierarchy (9 types)
   - **Logging**: Structured JSON logging with Loguru
   - **Security**: JWT utilities, password hashing

### LLM Provider Abstraction

Multi-provider LLM architecture supporting both OpenAI and Anthropic:

- **`BaseLLMProvider`**: Abstract base class defining provider interface
- **`OpenAIProvider`**: Implementation for GPT-4 Turbo
- **`AnthropicProvider`**: Implementation for Claude 3.5 Sonnet
- **`AIConversationService`**: High-level service using providers
- **`PromptTemplates`**: Cultural context and prompts for 5 markets

Switch providers via `LLM_PROVIDER` environment variable (`openai` or `anthropic`).

### Cultural Contexts

Five distinct cultural styles with unique slang, communication patterns, and humor:

1. **boricua** (Puerto Rico) - Primary focus, warm/expressive, uses "wepa", "chévere", "brutal"
2. **mexicano** (Mexico) - Friendly, uses "wey", "chido", "neta"
3. **colombiano** (Colombia) - Very warm, uses "parce", "bacano", "chimba"
4. **argentino** (Argentina) - Direct with voseo, uses "che", "boludo", "copado"
5. **español** (Spain) - Uses vosotros, "tío", "mola", "guay"

Each context includes slang dictionaries, communication styles, humor preferences, and formality levels in `src/infrastructure/external_services/prompt_templates.py`.

### API Structure

All endpoints under `/api/v1` prefix:

**Health Endpoints**:
- `GET /api/v1/health` - Health check with system status
- `GET /api/v1/ping` - Simple ping/pong

**Opener Endpoints** (`presentation/api/openers.py`):
- `POST /api/v1/openers` - Generate 3 conversation openers (different tones)
- `POST /api/v1/openers/preview` - Preview single opener
- `GET /api/v1/openers/examples` - Get example openers by cultural style

**Response Endpoints** (`presentation/api/responses.py`):
- `POST /api/v1/responses` - Generate conversation responses
- `POST /api/v1/responses/safety-check` - Check content safety
- `POST /api/v1/responses/rewrite` - Rewrite inappropriate messages
- `GET /api/v1/responses/examples` - Get response examples

### Error Handling

Comprehensive exception hierarchy in `src/core/exceptions.py`:

1. `LLMProviderException` (503) - AI provider errors, includes retry logic
2. `ContentSafetyException` (400) - Unsafe/inappropriate content detected
3. `RateLimitException` (429) - Rate limit exceeded
4. `ValidationException` (422) - Invalid request data
5. `AuthenticationException` (401) - Authentication failures
6. `AuthorizationException` (403) - Permission denied
7. `DatabaseException` (500) - Database operation errors
8. `ConfigurationException` (500) - Missing/invalid configuration
9. `CacheException` (500) - Redis/cache errors

All exceptions are caught by `ErrorHandlerMiddleware` and return consistent JSON error responses.

### Logging Strategy

Structured logging with different outputs for dev vs production:

- **Development**: Color-coded console logs (human-readable)
- **Production**: JSON-formatted logs for parsing
- **Log Files**: Daily rotation, 30-day retention (90 days for errors)
- **Event Types**: HTTP requests, LLM calls, content safety checks, rate limits, database ops, errors

Key logger usage:
```python
from src.core.logging import StructuredLogger

logger = StructuredLogger(service_name="my-service")
logger.log_http_request(method, path, status, duration)
logger.log_llm_call(provider, model, tokens, success)
logger.log_error(operation, error, context)
```

## Database Schema

PostgreSQL with pgvector for embeddings (schema defined but not fully implemented):

### Core Tables
- **users**: User accounts with auth, plan (free/pro/premium)
- **profiles**: User preferences (cultural_style, default_tone, interests)
- **conversations**: Conversation threads
- **messages**: Individual messages with tone tracking
- **missions**: Gamification missions (Phase 2 feature)

### Key Relationships
- User 1:1 Profile
- User 1:N Conversations
- Conversation 1:N Messages

See `backend/alembic/versions/` for full schema DDL.

## Testing Strategy

### Test Files
- `tests/test_ai_service.py` - AI service unit tests (15+ tests)
- `tests/test_openers_api.py` - API endpoint tests (10+ tests)
- `docs/Labia.AI-Postman-Collection.json` - API integration tests (20+ requests)

### Mocking
Tests mock external dependencies:
- LLM providers (OpenAI/Anthropic) - avoid API costs
- Database operations - use in-memory SQLite
- Redis cache - use fakeredis

### Coverage Target
>80% coverage on core components (AI service, API endpoints, domain entities).

## Configuration

### Environment Variables

Required settings in `.env`:

```bash
# LLM Provider (choose one)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
# OR
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Database (when implementing persistence)
DATABASE_URL=postgresql://labiaai:labiaai@localhost:5432/labiaai

# Redis (when implementing caching)
REDIS_URL=redis://localhost:6379/0

# Security (change in production!)
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
SECRET_KEY=your-secret-key-change-in-production
```

See `.env.example` for complete configuration options.

### Default Settings
- **Cultural Style**: `boricua` (Puerto Rican)
- **Tone**: `chill` (relaxed, friendly)
- **Rate Limits**: Free=10/day, Pro=100/day, Premium=unlimited

## Development Status

### ✅ Completed (40% overall)
- Backend API core (8 endpoints)
- Multi-provider LLM integration (OpenAI, Anthropic)
- Cultural context system (5 markets)
- Content safety checking
- Error handling & structured logging
- Unit & API tests
- Docker configuration
- Comprehensive documentation

### ⚠️ Partially Complete
- Database schema defined but not connected to API
- Authentication system designed but not implemented
- Redis caching designed but not implemented
- Rate limiting designed but not implemented

### ❌ Not Started
- Frontend (React Native mobile app)
- Gamification features (missions, achievements)
- Voice mode with regional accents
- Deployment to AWS/cloud
- Monitoring & observability

See `docs/checklist.md` for detailed progress tracking.

## Key Implementation Notes

### When Working with LLM Providers
- Always handle `LLMProviderException` for API failures
- Include retry logic with exponential backoff
- Validate API keys in settings before making calls
- Use appropriate token limits per model (GPT-4: 8K, Claude: 200K)

### When Adding New Cultural Contexts
1. Add context to `CULTURAL_CONTEXTS` in `prompt_templates.py`
2. Include slang examples, communication style, humor, formality
3. Update prompt templates for openers and responses
4. Add test cases for the new cultural style
5. Update API documentation

### When Creating New Endpoints
1. Define Pydantic request/response models
2. Add route in appropriate router file (`openers.py`, `responses.py`, etc.)
3. Include the router in `src/main.py`
4. Use custom exceptions for error handling
5. Add structured logging for operations
6. Write unit tests and add to Postman collection

### Content Safety
All user-generated content and AI responses go through safety checking:
- Inappropriate language detection
- Sexual/explicit content filtering
- Offensive language detection
- Automatic rewriting of flagged content

See `AIConversationService.check_content_safety()` for implementation.

## Puerto Rico Market Focus

This app is **Puerto Rico-first** - the Boricua cultural context is the default and most developed:

- References Bad Bunny, reggaeton, beach culture
- Uses authentic Puerto Rican slang naturally
- Warm, expressive, playful communication style
- Self-deprecating humor with wordplay
- Cultural touchstones: "wepa", "chévere", "brutal", "janguear"

When testing or demonstrating features, prioritize Boricua examples.

## Documentation

Comprehensive docs in `docs/`:
- `system-design.md` - Full architecture documentation (25 pages)
- `checklist.md` - Development progress tracking
- `testing-guide.md` - Testing procedures
- `implementation-summary.md` - What's been built
- `DIAGRAMS-GUIDE.md` - How to view/edit diagrams
- `uml-diagram.drawio` - UML class diagram
- `architecture-diagram.drawio` - System architecture diagram
- `Labia.AI-Postman-Collection.json` - API test collection

## Common Tasks

### Adding a New Tone
1. Update `PromptTemplates.get_opener_system_prompt()` with tone description
2. Add tone examples in prompt templates
3. Update API request validation to include new tone
4. Test with each cultural style

### Debugging LLM Issues
1. Check `logs/errors/` for detailed error logs
2. Verify API key is set correctly in `.env`
3. Check token usage (may hit rate limits)
4. Review prompt templates for clarity
5. Test with smaller inputs first

### Running Local Full Stack
```bash
# Terminal 1: Start infrastructure
docker-compose up postgres redis

# Terminal 2: Start backend
cd backend
source venv/bin/activate
uvicorn src.main:app --reload

# Terminal 3: Run tests or make requests
pytest
# or
curl http://localhost:8000/api/v1/health
```

## Performance Targets

- API Response Time: <3 seconds (including LLM call)
- Database Queries: <100ms
- Cache Hit Rate: >70%
- Uptime: 99.9%
- Error Rate: <1%

Currently focused on functionality over optimization.
