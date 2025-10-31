# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Labia.AI is an AI-powered conversation assistant specifically designed for Puerto Rico and Latin American markets. It helps users craft culturally-adapted conversation openers and responses for dating apps (Tinder, Bumble) and social media using region-specific slang, communication styles, and cultural nuances.

**Target Markets**: 🇵🇷 Puerto Rico (primary), 🇲🇽 Mexico, 🇨🇴 Colombia, 🇦🇷 Argentina, 🇪🇸 Spain

## Development Commands

### Frontend Setup and Running

```bash
# Initial setup
cd frontend
npm install  # Install dependencies (818 packages)

# Start development server
npm start

# Run on specific platform
npm run ios       # iOS simulator (Mac only)
npm run android   # Android emulator
npm run web       # Web browser

# Clear cache and restart
npm start -- --reset-cache
```

**Important**: When testing on physical devices, update `src/constants/index.ts` with your computer's IP address instead of `localhost`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.XXX:8000/api/v1'  // Your computer's IP
  : 'https://api.labia.ai/api/v1';
```

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

### Infrastructure & Deployment

```bash
# Build production Docker image
docker build -t labia-ai-backend:latest .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d

# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n labia-ai
kubectl logs -f -n labia-ai -l app=labia-ai

# Scale deployment
kubectl scale deployment/labia-ai-backend --replicas=3 -n labia-ai

# Trigger CI/CD pipeline
gh workflow run deploy.yml --ref main
```

**Production Domains**:
- Website: https://labia.chat
- API: https://api.labia.chat
- Staging: https://staging.labia.chat
- Staging API: https://api.staging.labia.chat

## Architecture

### Frontend Architecture

The frontend is a React Native mobile application built with Expo and TypeScript:

**Navigation Structure**:
- **RootNavigator** (`src/navigation/RootNavigator.tsx`): Conditional navigation between onboarding and main app
- **OnboardingNavigator** (`src/navigation/OnboardingNavigator.tsx`): Stack navigation for 4-screen onboarding flow
- **MainNavigator** (`src/navigation/MainNavigator.tsx`): Bottom tab navigation for main app (Chat, Trainer, Profile)

**State Management**:
- **appStore** (`src/store/appStore.ts`): Global app state using Zustand
  - User data, cultural style, tone preferences
  - Onboarding completion status
  - AsyncStorage persistence
- **chatStore** (`src/store/chatStore.ts`): Chat-specific state
  - Conversation mode (openers vs responses)
  - Message history and suggestions
  - Loading states

**API Integration**:
- **API Client** (`src/services/api.ts`): Complete API client with all backend endpoints
  - Openers: generate, preview, examples
  - Responses: generate, safety-check, rewrite, examples
  - Auth: register, login, refresh (designed, not yet connected)
  - Axios-based with TypeScript types
  - Error handling and timeout configuration

**Screen Components**:
- **Onboarding**: SplashScreen, TutorialScreen, CountrySelectionScreen, ProfileSetupScreen
- **Main App**: ChatScreen (main feature), TrainerScreen (placeholder), ProfileScreen

**Reusable Components** (`src/components/common/`):
- SuggestionCard: Display AI-generated suggestions with copy/regenerate
- CulturalStylePicker: Horizontal scroll of 5 country options
- ToneSelector: Horizontal scroll of 5 tone chips
- LoadingIndicator: Loading states with cultural messages

**Design System** (`src/constants/index.ts`):
- 5 cultural styles with flags and descriptions
- 5 conversation tones with emojis
- Latino-themed color palette (vibrant pinks, purples, golds)
- Multiple gradient definitions

### Backend Clean Architecture Layers

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

### Connection Strategy (`src/main.py:56-81`)

**Graceful Degradation Pattern**:
```python
@app.on_event("startup")
async def startup_event():
    # Check database connection
    db_connected = await check_database_connection()
    if db_connected:
        logger.info(f"✅ Database connected")
    else:
        logger.warning("⚠️  Database connection failed - running without persistence")

    # Initialize Redis cache
    try:
        redis_client = get_redis_client()
        if await redis_client.ping():
            logger.info(f"✅ Redis cache connected")
        else:
            logger.warning("⚠️  Redis ping failed - caching disabled")
    except Exception as e:
        logger.warning(f"⚠️  Redis connection failed: {e} - caching disabled")
```

**Key Design Points**:
- App **continues running** even if DB/Redis unavailable
- Database failures logged as warnings, not errors
- Redis failures don't crash the app
- Cache operations (get/set) handle disconnected state gracefully
- Production should use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)

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

**Current Status**: Migrations defined in `backend/alembic/versions/` but database not actively used for MVP (app functions without persistence).

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

**Overall Progress: ~88%** (Backend: 75%, Frontend: 100% MVP, Infrastructure: 90%)

### ✅ Backend Complete (75%)
- 17 REST API endpoints with full functionality
- Multi-provider LLM integration (OpenAI GPT-4, Anthropic Claude)
- Cultural context system (5 markets with authentic slang)
- Content safety checking and rewriting
- Intelligent LLM response caching (50-80% cost savings)
- JWT authentication system (backend ready, not connected to UI)
- Redis-backed rate limiting (plan-based)
- PostgreSQL database integration (schema ready, not actively used)
- Error handling & structured logging
- 15+ unit tests (75% coverage)
- Docker configuration
- ~120 pages comprehensive documentation

### ✅ Frontend Complete (100% MVP)
- React Native + Expo + TypeScript setup
- Complete navigation system (Root, Main, Onboarding, Auth)
- Onboarding flow (4 screens: Splash, Tutorial, Country Selection, Profile Setup)
- Main screens (Chat Assistant, Trainer placeholder, Profile)
- Auth screens (Login, Signup with social login placeholders)
- State management with Zustand + AsyncStorage
- Full API client integration (all endpoints including auth)
- Reusable UI components (SuggestionCard, CulturalStylePicker, ToneSelector, Modals, etc.)
- Beautiful Latino-themed UI with dating icons and gradients
- Toast notification system for UX feedback
- 5 cultural styles + 5 conversation tones
- Copy to clipboard functionality
- Loading states and error handling
- Feedback buttons (thumbs up/down)
- ~6,500 lines of TypeScript/TSX code

### ✅ Infrastructure & DevOps Complete (90%)
- Production-ready Dockerfile with multi-stage build
- Docker Compose for local development and production
- Kubernetes manifests (deployment, services, ingress)
- Nginx reverse proxy configuration with SSL
- GitHub Actions CI/CD pipeline (test, build, deploy)
- Environment configurations (dev, staging, production)
- Health checks and monitoring setup
- Auto-scaling configuration (HPA)
- Comprehensive deployment documentation

### ⚠️ Partially Complete (3%)
- Database migrations defined but not run
- Backend connected but data not persisted to database yet
- Some backend tests need fixes (15/20 passing)
- Auth flow designed but not enabled in app (commented out)
- Actual cloud infrastructure not yet provisioned

### ❌ Not Started (9%)
- Conversation history persistence
- Trainer module implementation (gamification, missions)
- Voice mode with regional accents
- Dark mode
- Social login integration (Google, Apple)
- Email verification flow
- Forgot password flow
- Cloud provider setup (AWS/DigitalOcean/Railway)
- Production monitoring dashboards
- Payment integration for Pro/Premium plans

See `docs/DEVELOPMENT-PROGRESS.md` and `docs/PROJECT-STATUS-UPDATED.md` for detailed progress tracking.

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

## Infrastructure & Deployment

### Docker Configuration

**Files**:
- `Dockerfile` - Multi-stage production build (optimized for size and security)
- `docker-compose.yml` - Local development stack (PostgreSQL, Redis, Backend)
- `docker-compose.prod.yml` - Production stack (Backend, Nginx, no DBs - use managed)
- `.dockerignore` - Files excluded from Docker image

**Key Features**:
- Multi-stage build reduces image size to ~200-300 MB
- Non-root user for security
- Health checks built-in
- Layer caching optimization
- 4 Uvicorn workers for production

### Kubernetes Deployment

**Files in `k8s/`**:
- `deployment.yml` - Backend deployment with HPA (auto-scaling 2-10 replicas)
- `postgres.yml` - PostgreSQL StatefulSet (for non-managed DB option)
- `redis.yml` - Redis deployment (for non-managed Redis option)

**Features**:
- Horizontal Pod Autoscaler (CPU > 70%, Memory > 80%)
- Nginx Ingress with SSL (cert-manager + Let's Encrypt)
- Health check probes (liveness, readiness)
- Resource limits and requests configured
- Rolling update strategy

**Recommended Setup**: Use managed PostgreSQL and Redis (AWS RDS/ElastiCache, DigitalOcean, etc.) instead of K8s-hosted databases for production.

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):

**On Pull Request**:
1. Run backend tests with pytest
2. Run linting (black, flake8)
3. Security scan with Trivy
4. Generate coverage report

**On Push to `develop`** (Staging):
1. Run tests
2. Build and push Docker image to GHCR
3. Deploy to staging server via SSH
4. Run database migrations
5. Health check
6. Slack notification

**On Push to `main`** (Production):
1. Run tests
2. Build and push Docker image
3. Deploy to production (AWS ECS example provided)
4. Run database migrations
5. Health check
6. Slack notification (success/failure)

**Required GitHub Secrets**:
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`
- `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (if using AWS)
- `SLACK_WEBHOOK_URL` (for notifications)

### Environment Files

Backend has three environment configurations:
- `.env` - Local development (localhost)
- `.env.staging` - Staging environment (staging.labia.chat)
- `.env.production` - Production environment (labia.chat)

**Critical Production Variables**:
```bash
# Must generate strong secrets!
SECRET_KEY=<strong-random-32-chars>
JWT_SECRET_KEY=<strong-random-64-chars>

# Use managed database/Redis URLs
DATABASE_URL=postgresql://user:pass@prod-db:5432/labiaai
REDIS_URL=redis://:password@prod-redis:6379/0

# Production API keys
OPENAI_API_KEY=sk-prod-...
ANTHROPIC_API_KEY=sk-ant-prod-...

# CORS for production
ALLOWED_ORIGINS=https://labia.chat,https://www.labia.chat,https://api.labia.chat
```

### Deployment Options

**Recommended Platforms**:
1. **AWS** (ECS/Fargate + RDS + ElastiCache) - Best for scale, ~$100-200/month
2. **DigitalOcean** (App Platform + Managed DB) - Simple, ~$50-100/month
3. **Railway.app** - Easiest, auto-deploy from GitHub, ~$50-100/month
4. **Render.com** - Simple PaaS, ~$50-100/month

See `docs/DEPLOYMENT-GUIDE.md` for detailed deployment instructions including:
- Cloudflare DNS configuration
- SSL/TLS setup
- Database migrations in production
- Monitoring and logging setup
- Cost optimization strategies
- Troubleshooting guide

## Documentation

All comprehensive documentation is located in `docs/`:

**Architecture & Design**:
- `system-design.md` - Full architecture documentation (25 pages)
- `DIAGRAMS-GUIDE.md` - How to view/edit diagrams
- `uml-diagram.drawio` - UML class diagram
- `architecture-diagram.drawio` - System architecture diagram

**Project Status & Progress**:
- `PROJECT-STATUS-UPDATED.md` - Current project status (80% complete)
- `FINAL-SUMMARY.md` - Backend completion summary
- `checklist.md` - Development progress tracking

**Implementation Details**:
- `BACKEND-COMPLETE-SUMMARY.md` - Backend overview (17 endpoints, 5 cultures)
- `FRONTEND-IMPLEMENTATION-SUMMARY.md` - Frontend overview (7 screens, Expo + RN)
- `implementation-summary.md` - What's been built
- `API-USAGE-EXAMPLES.md` - Complete API examples with curl commands

**Infrastructure & Deployment**:
- `DEPLOYMENT-GUIDE.md` - Complete deployment guide (Cloudflare, AWS, K8s, etc.)
- `INFRASTRUCTURE.md` - Infrastructure documentation (Docker, K8s, CI/CD, scaling)

**Testing & Operations**:
- `testing-guide.md` - Testing procedures
- `Labia.AI-Postman-Collection.json` - API test collection (20+ requests)

**Other**:
- `DELIVERABLES-SUMMARY.md` - Project deliverables
- `README.md` - Documentation index

## Critical Architecture Details

### Request Flow & Middleware Execution Order

**Middleware Stack** (defined in `src/main.py:33-36`):

```python
app.add_middleware(ErrorHandlerMiddleware)        # Added 1st = Executes LAST
app.add_middleware(RequestLoggingMiddleware)      # Added 2nd = Executes 3rd
app.add_middleware(RateLimiterMiddleware)         # Added 3rd = Executes 2nd
app.add_middleware(CORSMiddleware, ...)           # Added 4th = Executes 1st (outermost)
```

**Execution Order for Incoming Requests**:
1. **CORSMiddleware** (outermost) - Handles CORS preflight/headers
2. **RateLimiterMiddleware** - Checks rate limits before processing
3. **RequestLoggingMiddleware** - Logs request details and timing
4. **ErrorHandlerMiddleware** (innermost) - Catches all exceptions from above layers
5. → **Route Handler** - Your endpoint code executes

**Why This Matters**: ErrorHandlerMiddleware is innermost so it catches exceptions from all other middleware and route handlers, providing consistent error responses.

### Intelligent Caching Strategy

**Cache Key Generation** (`src/presentation/api/openers.py:117-126`, `responses.py:156-166`):

```python
# 1. Create deterministic cache data structure
cache_data = {
    "bio": request.bio,
    "interests": sorted(request.interests),  # Sorted for consistency!
    "cultural_style": request.cultural_style,
    "user_interests": sorted(request.user_interests) if request.user_interests else None,
    "num_suggestions": request.num_suggestions
}

# 2. Generate MD5 hash
cache_hash = hashlib.md5(json.dumps(cache_data, sort_keys=True).encode()).hexdigest()

# 3. Create namespaced cache key
cache_key = f"opener:{cultural_style}:{cache_hash}"  # e.g., "opener:boricua:a1b2c3d4e5f6..."
```

**Cache Strategy**:
- **Openers**: TTL = 3600s (1 hour) - Static bios don't change often
- **Responses**: TTL = 1800s (30 min) - Conversation context more dynamic
- **Sorting**: Ensures `["music", "beach"]` == `["beach", "music"]` (same cache key)
- **Expected Savings**: 50-80% reduction in LLM API calls

**Cache Hit Flow**:
```
Request → Check cache → HIT? → Return cached response (instant, no LLM call)
                      → MISS? → Call LLM → Cache result → Return response
```

### Frontend-Backend Type Contract

**Critical Synchronization Points**:

1. **Cultural Styles Must Match Exactly**:
   - Frontend: `CULTURAL_STYLES` in `frontend/src/constants/index.ts:13-44`
   - Backend: `valid_styles` in `backend/src/presentation/api/openers.py:110`
   - Values: `boricua`, `mexicano`, `colombiano`, `argentino`, `español`
   - ⚠️ **If mismatch**: Backend returns 400 error "Invalid cultural_style"

2. **Tone Generation**:
   - Frontend: 5 tones defined (`chill`, `elegant`, `intellectual`, `playero`, `minimalist`)
   - Backend: Generates 3 fixed tones per request (`genuino`, `coqueto`, `directo`)
   - Note: Frontend tones are UI preferences; backend always generates 3 standard tones

3. **API Base URL Configuration**:
   - Development: `frontend/src/constants/index.ts:6-8`
   - **Important**: When testing on physical devices, change to your computer's IP:
     ```typescript
     export const API_BASE_URL = __DEV__
       ? 'http://192.168.0.126:8000/api/v1'  // Replace with YOUR IP
       : 'https://api.labia.chat/api/v1';
     ```
   - Find IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### State Management Architecture

**Frontend Stores** (Zustand):

1. **appStore** (`src/store/appStore.ts`):
   - Global application state
   - Persisted to AsyncStorage automatically
   - Keys: user, isAuthenticated, culturalStyle, defaultTone
   - Methods: `setUser()`, `setToken()`, `setCulturalStyle()`, `logout()`
   - Initialization: `initializeAppStore()` called on app start

2. **chatStore** (`src/store/chatStore.ts`):
   - Ephemeral chat state (not persisted)
   - Keys: currentConversation, messages, isGenerating, error
   - Methods: `addMessage()`, `setIsGenerating()`, `clearMessages()`

**AsyncStorage Keys** (`src/constants/index.ts:158-166`):
```typescript
STORAGE_KEYS = {
  USER_PROFILE: '@labia_user_profile',
  CULTURAL_STYLE: '@labia_cultural_style',
  DEFAULT_TONE: '@labia_default_tone',
  AUTH_TOKEN: '@labia_auth_token',
  ONBOARDING_COMPLETED: '@labia_onboarding_completed',
}
```

### LLM Provider Architecture

**Provider Selection Flow** (`src/presentation/api/openers.py:64-84`):

```python
def get_ai_service() -> AIConversationService:
    # 1. Read environment variable
    llm_provider_type = LLMProvider(settings.LLM_PROVIDER)  # "openai" or "anthropic"

    # 2. Select appropriate API key and model
    if llm_provider_type == LLMProvider.OPENAI:
        api_key = settings.OPENAI_API_KEY
        model = settings.OPENAI_MODEL  # "gpt-4-turbo-preview"
    elif llm_provider_type == LLMProvider.ANTHROPIC:
        api_key = settings.ANTHROPIC_API_KEY
        model = settings.ANTHROPIC_MODEL  # "claude-3-5-sonnet-20241022"

    # 3. Validate API key exists
    if not api_key:
        raise HTTPException(status_code=500, detail=f"API key not configured")

    # 4. Factory creates appropriate provider
    llm_provider = LLMProviderFactory.create(llm_provider_type, api_key, model)

    # 5. Return service wrapping provider
    return AIConversationService(llm_provider)
```

**Key Design**:
- **Dependency Injection**: Each endpoint request gets fresh AI service instance
- **Stateless**: No shared state between requests
- **Failsafe**: Missing API key = immediate 500 error (not runtime failure)

### Windows Development Notes

**Virtual Environment Activation**:
```bash
# Git Bash / MINGW64 (recommended)
source venv/Scripts/activate

# CMD
venv\Scripts\activate.bat

# PowerShell
venv\Scripts\Activate.ps1
```

**Path Separators**:
- Backend uses forward slashes (`/`) internally
- Windows tools use backslashes (`\`)
- Git Bash handles both correctly

## Performance Targets

**API Response Times**:
- Cached requests: <100ms (Redis lookup only)
- LLM requests (OpenAI GPT-4): 2-5 seconds (network + generation)
- LLM requests (Anthropic Claude): 3-7 seconds (network + generation)
- Health check: <50ms

**Caching Performance**:
- Cache Hit Rate Target: >70% in production
- Openers TTL: 3600s (1 hour)
- Responses TTL: 1800s (30 minutes)
- Expected LLM Cost Savings: 50-80%

**Database Performance**:
- Query time target: <100ms
- Connection pooling: Enabled (SQLAlchemy)
- Note: Database not actively used in MVP (queries minimal)

**Reliability Targets**:
- Uptime: 99.9%
- Error Rate: <1%
- Graceful degradation: App runs without Redis/DB if unavailable

**Current Focus**: Functionality over optimization. Performance optimization planned for Phase 4.
