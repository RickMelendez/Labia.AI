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

```
labia-ai/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Config, security
│   │   ├── models/   # SQLAlchemy models
│   │   ├── services/ # Business logic
│   │   └── llm/      # LLM provider layer
│   ├── alembic/      # Database migrations
│   └── tests/
├── frontend/          # React Native app
│   ├── src/
│   │   ├── screens/  # App screens
│   │   ├── components/
│   │   ├── services/ # API calls
│   │   ├── store/    # State management
│   │   └── utils/
│   └── assets/
└── docs/              # Documentation
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
