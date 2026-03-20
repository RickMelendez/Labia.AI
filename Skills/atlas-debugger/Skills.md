---
name: atlas-debugger
description: >
  High-level systematic debugging for the Labia.AI project (FastAPI backend + Expo/React Native frontend).
  Use this skill whenever there is a bug, error, crash, unexpected behavior, broken API, failed test,
  runtime exception, or anything that is not working as expected. Covers Python/FastAPI, TypeScript/React Native,
  database issues, WebSocket failures, auth errors, and environment problems. Always invoke this skill before
  attempting random fixes — diagnose first, fix second.
---

# Atlas Debugger — High-Level Debugging Skill

Systematic, hypothesis-driven debugging for Labia.AI. This skill turns chaotic "it's broken" moments into
structured investigations that find root causes, not just symptoms.

## Project Context

- **Backend**: FastAPI (Clean Architecture) — `backend/src/` with domain, application, infrastructure, presentation layers
- **Frontend**: Expo/React Native TypeScript — `frontend/src/` with screens, components, store, navigation
- **Services**: Postgres, Redis, WebSocket (real-time features)
- **Tests**: Pytest (`backend/tests/`) with unit/integration/slow markers

## Debugging Protocol

### Phase 1 — Understand the Failure

Before touching any code, answer these:

1. **What is the exact symptom?** (error message, stack trace, wrong output, crash)
2. **Where does it manifest?** (backend API, frontend screen, database query, WebSocket)
3. **When did it start?** (after a specific change, always, intermittent)
4. **Is it reproducible?** (always / sometimes / only in prod)

Collect all available evidence: logs, stack traces, error responses, console output, network requests.

### Phase 2 — Localize the Problem

Use the Clean Architecture layers to narrow the blast radius:

```
Presentation layer (routers/controllers) → broken request/response?
Application layer (use cases/services)  → broken business logic?
Domain layer (entities/models)           → broken model/validation?
Infrastructure layer (repos/db/redis)    → broken data access?
Frontend (screens/components/store)      → broken UI state/render?
```

Run targeted diagnostics:

```bash
# Backend: check if server is healthy
cd backend && uvicorn src.main:app --reload

# Backend: run only the failing tests
cd backend && pytest tests/path/to/test_file.py -v

# Backend: run with detailed output
cd backend && pytest -s -v --tb=long

# Frontend: check for TypeScript errors
cd frontend && npx tsc --noEmit

# Frontend: check logs from Expo
cd frontend && npm run start
```

### Phase 3 — Form Hypotheses

List 2-4 candidate root causes ranked by probability. For each:
- What would be true if this is the cause?
- What evidence supports/refutes it?
- How do I test it cheaply?

### Phase 4 — Test Hypotheses

Test the most likely hypothesis first. Add targeted logging or assertions:

```python
# Backend: temporary diagnostic logging
import logging
logger = logging.getLogger(__name__)
logger.debug(f"[DEBUG] value at checkpoint: {variable!r}")
```

```typescript
// Frontend: temporary diagnostic logging
console.log('[DEBUG] component state:', JSON.stringify(state, null, 2));
```

Check the most common failure patterns:

| Layer | Common Bugs |
|-------|-------------|
| FastAPI routes | Missing `await`, wrong status code, validation error not caught |
| Pydantic models | Type mismatch, missing field, wrong validator |
| SQLAlchemy | Missing `await session.commit()`, wrong relationship loading, migration not applied |
| Redis | Key expiry, serialization, connection pool exhaustion |
| WebSocket | Disconnect not handled, event loop blocking, message format mismatch |
| React Native | Stale closure in useEffect, missing dependency array, async state race |
| Expo Navigation | Wrong screen params, missing route, navigator not mounted |
| Auth/JWT | Token expired, missing header, wrong secret |

### Phase 5 — Fix and Verify

1. Apply the minimal fix that addresses the root cause (not the symptom)
2. Re-run the failing test or reproduce the original bug — confirm it's gone
3. Run the full test suite to catch regressions:
   ```bash
   cd backend && pytest --cov=src tests/
   ```
4. Check TypeScript still compiles:
   ```bash
   cd frontend && npx tsc --noEmit
   ```
5. Remove any temporary debug logging

### Phase 6 — Document the Fix

Summarize:
- **Root cause**: one sentence
- **Fix applied**: what changed and why
- **Files touched**: list of files
- **Tests added/updated**: any new coverage

## Quick Reference — Environment Checks

```bash
# Is the backend running?
curl http://localhost:8000/health

# Check Docker services
docker-compose ps

# Check backend logs
docker-compose logs api --tail=50

# Check Redis
docker-compose exec redis redis-cli ping

# Check Postgres
docker-compose exec db psql -U postgres -c "\l"

# Apply pending migrations
cd backend && alembic upgrade head

# Check migration status
cd backend && alembic current
```

## Debugging by Error Type

### `422 Unprocessable Entity`
→ Pydantic validation failure. Check the request body against the schema. Log `request.body()` before the handler.

### `500 Internal Server Error`
→ Unhandled exception. Check `backend/logs/` or Docker logs. Look for the full traceback.

### `401 / 403 Unauthorized`
→ JWT expired or missing. Check the Authorization header format: `Bearer <token>`.

### `Cannot read property of undefined` (React Native)
→ State not initialized or async data not yet loaded. Add null check or loading guard.

### `ECONNREFUSED` / `Connection refused`
→ Backend not running or wrong port. Check Docker services and port mapping.

### `WebSocket connection failed`
→ Check `backend/src/infrastructure/websocket/` handler. Confirm the WS endpoint URL in frontend matches.

### Database migration conflict
→ Run `alembic history`, check for branch points, resolve with `alembic merge heads`.
