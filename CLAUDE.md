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

**Overall Progress: 80%** (Backend: 75%, Frontend: 80%, Infrastructure: 95%)

### ✅ Backend Complete (75%)
- 17 REST API endpoints with full functionality
- Multi-provider LLM integration (OpenAI GPT-4, Anthropic Claude)
- Cultural context system (5 markets with authentic slang)
- Content safety checking and rewriting
- Intelligent LLM response caching (50-80% cost savings)
- JWT authentication system
- Redis-backed rate limiting (plan-based)
- PostgreSQL database integration
- Error handling & structured logging
- 15+ unit tests (75% coverage)
- Docker configuration
- ~120 pages comprehensive documentation

### ✅ Frontend Complete (80%)
- React Native + Expo + TypeScript setup
- Complete navigation system (Root, Main, Onboarding)
- Onboarding flow (4 screens: Splash, Tutorial, Country Selection, Profile Setup)
- Main screens (Chat Assistant, Trainer placeholder, Profile)
- State management with Zustand + AsyncStorage
- Full API client integration
- Reusable UI components (SuggestionCard, CulturalStylePicker, ToneSelector, etc.)
- Beautiful Latino-themed UI with gradients
- 5 cultural styles + 5 conversation tones
- Copy to clipboard functionality
- Loading states and error handling
- ~3,500 lines of TypeScript/TSX code

### ✅ Infrastructure & DevOps Complete (95%)
- Production-ready Dockerfile with multi-stage build
- Docker Compose for local development and production
- Kubernetes manifests (deployment, services, ingress)
- Nginx reverse proxy configuration with SSL
- GitHub Actions CI/CD pipeline (test, build, deploy)
- Environment configurations (dev, staging, production)
- Health checks and monitoring setup
- Auto-scaling configuration (HPA)
- Comprehensive deployment documentation

### ⚠️ Partially Complete (5%)
- Database migrations defined but not run
- Backend connected but data not persisted to database yet
- Some backend tests need fixes (15/20 passing)
- Actual cloud infrastructure not yet provisioned

### ❌ Not Started (15%)
- Authentication UI (login/register screens in frontend)
- Conversation history persistence
- Trainer module implementation (gamification)
- Voice mode with regional accents
- Dark mode
- Cloud provider setup (AWS/DigitalOcean/Railway)
- DNS and SSL certificate configuration
- Production monitoring dashboards

See `docs/PROJECT-STATUS-UPDATED.md` for detailed progress tracking.

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

## Common Tasks

### Running the Full Stack Locally

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn src.main:app --reload
# Backend running at http://localhost:8000

# Terminal 2: Start frontend
cd frontend
npm start
# Scan QR with Expo Go or press 'i' for iOS / 'a' for Android
```

**Testing the Integration**:
1. Open app on device/simulator
2. Complete onboarding flow (choose Boricua 🇵🇷)
3. In Chat screen, enter a bio: "Le gusta Bad Bunny y la playa"
4. Tap "Generar Sugerencias"
5. See 3 culturally-adapted openers!

### Adding a New Cultural Context

**Backend** (`backend/src/infrastructure/external_services/prompt_templates.py`):
1. Add context to `CULTURAL_CONTEXTS` dictionary with slang, communication style, humor, formality
2. Update prompt templates for openers and responses
3. Add test cases for the new cultural style

**Frontend** (`frontend/src/constants/index.ts`):
4. Add new cultural style to `CULTURAL_STYLES` array with flag emoji, name, description
5. Update type definitions if needed
6. Test UI with new option

### Adding a New Tone

**Backend**:
1. Update `PromptTemplates.get_opener_system_prompt()` with tone description
2. Add tone examples in prompt templates
3. Update API request validation to include new tone

**Frontend**:
4. Add tone to `TONES` array in `src/constants/index.ts` with emoji and description
5. Update type definitions
6. Test with each cultural style

### Adding a New Screen (Frontend)

1. Create screen component in `frontend/src/screens/[Category]/[ScreenName].tsx`
2. Add to appropriate navigator in `frontend/src/navigation/`
3. Update navigation types in `frontend/src/types/index.ts`
4. Add any necessary state to Zustand stores
5. Test navigation flow

### Debugging LLM Issues

1. Check backend logs in `backend/logs/errors/` for detailed error logs
2. Verify API key is set correctly in `backend/.env`
3. Check token usage (may hit rate limits)
4. Review prompt templates for clarity in `backend/src/infrastructure/external_services/prompt_templates.py`
5. Test with smaller inputs first
6. Use `/api/v1/docs` to test endpoints directly

### Debugging Frontend Issues

1. Check Metro bundler terminal for errors
2. Open React Native debugger (shake device → "Debug")
3. Check if backend is running: `curl http://localhost:8000/api/v1/health`
4. Verify API_BASE_URL in `frontend/src/constants/index.ts`
5. On physical devices, use computer's IP address, not `localhost`
6. Check AsyncStorage: Clear app data if state is corrupted

### Deploying to Production

**Option 1: Railway.app (Easiest)**:
1. Create account at https://railway.app
2. Connect GitHub repository
3. Railway auto-detects Dockerfile
4. Add environment variables from `.env.production`
5. Deploy
6. Configure custom domain in Cloudflare

**Option 2: Kubernetes**:
```bash
# Configure kubectl for your cluster
# AWS EKS example:
aws eks update-kubeconfig --region us-east-1 --name labia-ai-cluster

# Create namespace and secrets
kubectl create namespace labia-ai
kubectl create secret generic labia-ai-secrets \
  --from-literal=SECRET_KEY=<strong-key> \
  --from-literal=JWT_SECRET_KEY=<jwt-key> \
  --from-literal=OPENAI_API_KEY=<api-key> \
  -n labia-ai

# Deploy all services
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n labia-ai
kubectl logs -f -n labia-ai -l app=labia-ai

# Scale manually if needed
kubectl scale deployment/labia-ai-backend --replicas=5 -n labia-ai
```

**Option 3: AWS ECS** (see `.github/workflows/deploy.yml` for automated deployment):
```bash
# Configure AWS CLI
aws configure

# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag labia-ai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/labia-ai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/labia-ai-backend:latest

# Update ECS service
aws ecs update-service --cluster labia-ai-prod --service labia-ai-backend --force-new-deployment
```

### Setting Up CI/CD

1. Add required secrets to GitHub repository settings
2. Push to `develop` branch for staging deployment
3. Push to `main` branch for production deployment
4. Monitor in GitHub Actions tab

**Required Secrets** (Settings → Secrets and variables → Actions):
```bash
OPENAI_API_KEY
ANTHROPIC_API_KEY
STAGING_HOST
STAGING_USER
STAGING_SSH_KEY
PROD_HOST
PROD_USER
PROD_SSH_KEY
AWS_ACCESS_KEY_ID (if using AWS)
AWS_SECRET_ACCESS_KEY (if using AWS)
SLACK_WEBHOOK_URL (optional, for notifications)
```

### Monitoring Production

```bash
# Check health
curl https://api.labia.chat/api/v1/health

# Check Kubernetes pods
kubectl get pods -n labia-ai
kubectl describe pod <pod-name> -n labia-ai

# View logs
kubectl logs -f -n labia-ai -l app=labia-ai --tail=100

# Check HPA (auto-scaling)
kubectl get hpa -n labia-ai
kubectl describe hpa labia-ai-backend-hpa -n labia-ai

# View metrics (if Prometheus enabled)
curl https://api.labia.chat/metrics
```

## Performance Targets

- API Response Time: <3 seconds (including LLM call)
- Database Queries: <100ms
- Cache Hit Rate: >70%
- Uptime: 99.9%
- Error Rate: <1%

Currently focused on functionality over optimization.
