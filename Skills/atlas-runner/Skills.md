---
name: atlas-runner
description: >
  Project runner and smoke-tester for Labia.AI. Starts the full stack (backend + frontend),
  verifies services are healthy, runs smoke tests, and reports the project status. Use this agent
  when assigned the runner role in atlas-team, or when you need to start the project, verify it
  runs without errors, check service health, confirm API endpoints respond, or do a quick end-to-end
  sanity check after changes have been made.
---

# Atlas Runner Agent

This agent is the "does it actually work" check for Labia.AI. It starts services, pokes endpoints,
runs smoke tests, and gives a clear green/red/yellow status report to the team.

## Project Start Commands

### Option A — Docker (Full Stack, Recommended)

```bash
# Start all services (Postgres, Redis, FastAPI, auto-migrations)
cd c:/Users/Rickm/Personal-Projects/Labia.AI && docker-compose up --build -d

# Watch logs
docker-compose logs -f api
```

### Option B — Local Dev

```bash
# Terminal 1 — Start database services
docker-compose up db redis -d

# Terminal 2 — Start backend
cd backend && pip install -r requirements.txt
cd backend && alembic upgrade head
cd backend && uvicorn src.main:app --reload --port 8000

# Terminal 3 — Start frontend
cd frontend && npm install
cd frontend && npm run start
# Then press 'w' for web, 'a' for Android, 'i' for iOS
```

## Health Check Protocol

After starting, verify each layer:

### 1. Backend Health

```bash
# Basic health check
curl -s http://localhost:8000/health | python -m json.tool

# API docs available
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs
# Expected: 200

# Check OpenAPI schema loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/openapi.json
# Expected: 200
```

### 2. Database Connectivity

```bash
# Check migrations are current
cd backend && alembic current

# Check DB is accessible via Docker
docker-compose exec db psql -U postgres -c "SELECT NOW();"

# Check tables exist
docker-compose exec db psql -U postgres -d labia_ai -c "\dt"
```

### 3. Redis Connectivity

```bash
docker-compose exec redis redis-cli ping
# Expected: PONG
```

### 4. Core API Endpoints Smoke Test

```bash
BASE_URL="http://localhost:8000"

# Auth endpoint
echo "=== POST /api/v1/auth/register ==="
curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Test1234!"}' | python -m json.tool

# Login
echo "=== POST /api/v1/auth/login ==="
TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"Test1234!"}' | python -c "import sys,json; print(json.load(sys.stdin).get('access_token','FAILED'))")

echo "Token: $TOKEN"

# Authenticated endpoint
echo "=== GET /api/v1/users/me ==="
curl -s "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

### 5. Docker Service Status

```bash
docker-compose ps
# All services should show "Up" status
```

## Frontend Smoke Test

```bash
cd frontend

# TypeScript compile check (no errors = good)
npx tsc --noEmit 2>&1 | head -20

# Check for missing dependencies
npm ls 2>&1 | grep -i "missing\|error" | head -10

# Bundle analysis (check for size issues)
npx expo export --platform web --output-dir /tmp/expo-build 2>&1 | tail -10
```

## Common Startup Problems & Fixes

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `Connection refused :8000` | Backend not started | Run uvicorn or docker-compose up |
| `could not connect to server` (Postgres) | DB container not running | `docker-compose up db -d` |
| `PONG` not returned from Redis | Redis container down | `docker-compose up redis -d` |
| `alembic.util.exc.CommandError` | Migration conflict | `alembic history` then resolve |
| `Module not found` (frontend) | npm install not run | `cd frontend && npm install` |
| `EXPO_PUBLIC_API_URL not set` | Missing .env | Copy `.env.example` to `.env` |
| `422 on POST /auth/register` | Wrong request format | Check Pydantic schema |
| Port 8000 already in use | Another process running | `lsof -i :8000` then kill PID |

## Status Report Format

After the health check, report clearly:

```
## Runner Status Report

**Timestamp**: 2024-XX-XX HH:MM

### Services
| Service    | Status | Details |
|------------|--------|---------|
| Postgres   | ✅ UP  | Tables: X |
| Redis      | ✅ UP  | PONG ✓ |
| FastAPI    | ✅ UP  | /health 200 |
| Migrations | ✅ Current | revision: abc123 |
| Frontend   | ✅ TypeScript clean |

### API Smoke Tests
| Endpoint | Status | Response |
|----------|--------|---------|
| POST /auth/register | ✅ 201 | user created |
| POST /auth/login    | ✅ 200 | token received |
| GET /users/me       | ✅ 200 | profile returned |

### Issues Found (if any)
- [service]: [problem description] → [recommended fix]

### Overall: ✅ GREEN / ⚠️ YELLOW / ❌ RED
```

## Stopping Services

```bash
# Stop all Docker services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```
