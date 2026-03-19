# Labia.AI 🇵🇷

> AI-powered conversation assistant for Puerto Rico and Latin American markets

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React_Native-0.73-blue.svg)](https://reactnative.dev/)

Labia.AI helps users craft **authentic, culturally-adapted** conversation openers and responses for dating apps (Tinder, Bumble) and social media. Specifically designed for **Puerto Rican and Latin American markets** with regional slang, communication styles, and cultural nuances.

## ✨ Key Features

- 🇵🇷 **Cultural Personalization**: Region-specific styles (Boricua, Mexicano, Colombiano, Argentino, Español)
- 🤖 **Smart AI Generation**: Context-aware responses with 3 different tones (Genuine, Flirty, Direct)
- 🛡️ **Content Safety**: Built-in filters for inappropriate content
- 🎮 **Gamified Learning**: Daily missions and achievements (Phase 2)
- 🔒 **Privacy-First**: Local processing, no permanent conversation storage
- 🌐 **Multi-Provider LLM**: Support for OpenAI and Anthropic Claude

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector for embeddings
- **AI Provider**: OpenAI GPT-4
- **Auth**: JWT tokens
- **Deployment**: Docker + AWS EKS

### Frontend
- **Framework**: React Native (iOS/Android)
- **State Management**: Zustand
- **Styling**: React Native Paper / NativeWind
- **i18n**: i18next

## Project Structure

Built with **Clean Architecture** principles for maintainability and testability.

```
labia-ai/
├── backend/                    # FastAPI backend (Clean Architecture)
│   ├── src/
│   │   ├── presentation/       # API routes, middleware, dependencies
│   │   │   ├── api/           # FastAPI routers (auth, openers, responses, etc.)
│   │   │   ├── middleware/    # Request processing (CORS, rate limiting, logging)
│   │   │   └── dependencies/  # Dependency injection
│   │   ├── application/        # Use cases and service protocols
│   │   │   └── services/      # Service interfaces (ports)
│   │   ├── domain/            # Core business logic (no external dependencies)
│   │   │   ├── entities/      # Business entities (User, Profile, Conversation)
│   │   │   ├── value_objects/ # Immutable values (Email, Country)
│   │   │   └── repositories/  # Repository interfaces
│   │   ├── infrastructure/    # External concerns & implementations
│   │   │   ├── database/      # SQLAlchemy models, migrations
│   │   │   ├── cache/         # Redis caching
│   │   │   └── external_services/  # LLM providers (OpenAI, Anthropic)
│   │   ├── core/              # Cross-cutting concerns
│   │   │   ├── config.py      # Environment configuration
│   │   │   ├── security.py    # Authentication, JWT, password hashing
│   │   │   ├── logging.py     # Structured logging
│   │   │   └── exceptions.py  # Custom exceptions
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # Unit and integration tests
│   ├── alembic/               # Database migrations
│   └── requirements.txt
├── frontend/                  # React Native app (Clean Architecture)
│   ├── src/
│   │   ├── presentation/      # UI layer
│   │   │   └── hooks/        # Custom React hooks
│   │   ├── screens/           # App screens (Chat, Profile, Trainer, etc.)
│   │   ├── components/        # Reusable UI components
│   │   ├── navigation/        # React Navigation setup
│   │   ├── application/       # Use cases and business logic
│   │   │   ├── use-cases/    # Business operations
│   │   │   ├── dto/          # Data transfer objects
│   │   │   └── ports/        # Service interfaces
│   │   ├── domain/            # Core domain logic
│   │   │   ├── entities/     # Domain models
│   │   │   ├── repositories/ # Repository interfaces
│   │   │   ├── services/     # Domain services
│   │   │   └── value-objects/ # Immutable values
│   │   ├── infrastructure/    # External integrations
│   │   │   ├── api/          # Backend API clients
│   │   │   ├── storage/      # AsyncStorage wrappers
│   │   │   ├── device/       # Device services (haptics, clipboard)
│   │   │   └── di/           # Dependency injection container
│   │   ├── store/             # Zustand state management
│   │   ├── core/              # Constants, configuration
│   │   ├── theme/             # App theming
│   │   └── types/             # TypeScript types
│   ├── assets/                # Images, fonts
│   └── package.json
├── infrastructure/             # Deployment configurations
│   ├── docker/                # Dockerfiles
│   ├── kubernetes/            # K8s manifests
│   └── terraform/             # Infrastructure as Code
└── docs/                      # Documentation
    ├── API-USAGE-EXAMPLES.md
    ├── DEPLOYMENT-GUIDE.md
    ├── INFRASTRUCTURE.md
    ├── system-design.md
    └── testing-guide.md
```

## Key Features

### Phase 1 (MVP)
- ✅ Opening line generator (3 styles: genuine, flirty, direct)
- ✅ Response generator with context analysis
- ✅ Cultural profiles (5 countries/regions)
- ✅ Basic user profiles and preferences
- ✅ Content safety filters

### Phase 2
- ⏳ Conversation trainer (gamified missions)
- ⏳ Voice mode (TTS with regional accents)
- ⏳ Advanced personalization with user feedback
- ⏳ Translation between Spanish dialects

### Phase 3
- 📋 Social features (compare progress with friends)
- 📋 Premium features (coach mode, unlimited suggestions)
- 📋 Analytics dashboard

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure environment variables
alembic upgrade head      # Run migrations
uvicorn src.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env      # Configure environment variables
npm run ios               # or npm run android
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/labiaai
OPENAI_API_KEY=sk-...
SECRET_KEY=your-secret-key
ENVIRONMENT=development
```

### Frontend (.env)
```
API_URL=http://localhost:8000
```

## API Documentation

### Development
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production
- Website: https://labia.chat
- API: https://api.labia.chat
- Swagger UI: https://api.labia.chat/docs
- ReDoc: https://api.labia.chat/redoc

## Contributing

This is a private project. Please contact the maintainers for contribution guidelines.

## License

Proprietary - All rights reserved

## Documentation

- System Design: `docs/system-design.md`
- Deployment Guide: `docs/DEPLOYMENT-GUIDE.md`
- Testing Guide: `docs/testing-guide.md`
- API Usage Examples: `docs/API-USAGE-EXAMPLES.md`
- Infrastructure: `docs/INFRASTRUCTURE.md`
