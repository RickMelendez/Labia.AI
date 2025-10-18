# Labia.AI Backend - Clean Architecture

## Architecture Overview

This backend follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/              # Enterprise Business Rules (innermost layer)
│   ├── entities/        # Core business objects (User, Message, etc.)
│   ├── value_objects/   # Immutable domain concepts (Email, Country, etc.)
│   ├── repositories/    # Repository interfaces (abstractions)
│   └── services/        # Domain services (business logic)
│
├── application/         # Application Business Rules
│   ├── use_cases/       # Application-specific business rules
│   ├── dtos/            # Data Transfer Objects
│   └── interfaces/      # Port interfaces (for external services)
│
├── infrastructure/      # Frameworks & Drivers (outermost layer)
│   ├── database/        # SQLAlchemy models, migrations
│   ├── external_services/ # OpenAI, payment providers, etc.
│   └── repositories/    # Repository implementations
│
└── presentation/        # Interface Adapters
    ├── api/             # FastAPI routes and controllers
    ├── middleware/      # HTTP middleware
    └── dependencies/    # Dependency injection
```

## Dependency Rule

Dependencies only point inward:
- **Domain** has no dependencies (pure business logic)
- **Application** depends only on Domain
- **Infrastructure** depends on Domain and Application
- **Presentation** depends on all layers (composition root)

## Key Principles

1. **Entities** contain enterprise-wide business rules
2. **Use Cases** orchestrate the flow of data and contain application-specific rules
3. **Interfaces/Ports** define contracts for external dependencies
4. **Adapters** implement interfaces and connect to external systems
5. **Dependency Injection** wires everything together at runtime

## Quick Start

### 1. Setup Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Run the Server

```bash
# From the backend directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/ping` - Simple ping

### Conversation Openers
- `POST /api/v1/openers` - Generate conversation openers
- `POST /api/v1/openers/preview` - Preview single opener
- `GET /api/v1/openers/examples` - Get example openers

### Responses
- `POST /api/v1/responses` - Generate conversation responses
- `POST /api/v1/responses/safety-check` - Check content safety
- `POST /api/v1/responses/rewrite` - Rewrite inappropriate message
- `GET /api/v1/responses/examples` - Get example responses

## Cultural Styles

The API supports the following cultural styles:
- `boricua` - Puerto Rican (default for Puerto Rico market)
- `mexicano` - Mexican
- `colombiano` - Colombian
- `argentino` - Argentine
- `español` - Spanish (Spain)

## Example Usage

### Generate Puerto Rican Opener

```bash
curl -X POST "http://localhost:8000/api/v1/openers" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Me encanta la playa y el reggaeton. Fan de Bad Bunny 🐰",
    "interests": ["playa", "música", "deportes"],
    "cultural_style": "boricua",
    "num_suggestions": 3
  }'
```

### Generate Response

```bash
curl -X POST "http://localhost:8000/api/v1/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "received_message": "Hola! Qué tal tu día?",
    "cultural_style": "boricua",
    "relationship_stage": "early",
    "num_suggestions": 3
  }'
```

## Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=src tests/
```

