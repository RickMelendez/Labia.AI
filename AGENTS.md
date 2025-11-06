# Repository Guidelines

## Project Structure & Module Organization
- `backend/src`: FastAPI service (Clean Architecture: domain, application, infrastructure, presentation).
- `backend/tests`: Pytest suite; config in `backend/pytest.ini`.
- `backend/alembic`: Database migrations; versions in `backend/alembic/versions`.
- `frontend/src`: Expo/React Native TypeScript app (UI, navigation, stores, services).
- `frontend/assets`: Icons and images.
- `docs/`: Architecture, deployment, API usage, testing guides.
- `k8s/`, `nginx/`, `docker-compose*.yml`: Ops and local dev.

## Build, Test, and Development Commands
- Backend (local): `cd backend && pip install -r requirements.txt && uvicorn src.main:app --reload`.
- Backend (Docker): `docker-compose up --build` (Postgres, Redis, API, auto-migrations).
- Tests (backend): `cd backend && pytest` or coverage `pytest --cov=src tests/`.
- Frontend: `cd frontend && npm install && npm run start` (or `npm run ios|android|web`).

## Coding Style & Naming Conventions
- Python: Black (line length 120), Flake8, MyPy.
  - Run: `black src tests -l 120 && flake8 src tests && mypy src` (from `backend`).
  - Naming: `snake_case` for modules/functions, `CamelCase` for classes.
- TypeScript/React Native: 2‑space indent, semicolons on, JSX in `.tsx`.
  - Naming: `PascalCase` components/screens (e.g., `TrainerScreen.tsx`), `camelCase` variables/hooks.

## Testing Guidelines
- Framework: Pytest (async ready) with markers in `backend/pytest.ini` (`unit`, `integration`, `slow`).
- Layout: tests in `backend/tests`, files `test_*.py`.
- Coverage: target ≥ 80% for new/changed backend code. HTML report: `pytest --cov=src --cov-report=html`.

## Commit & Pull Request Guidelines
- Commits: imperative, present tense, concise (e.g., `Add opener API`, `Fix tone mapping`). Group coherent changes.
- PRs: clear description, linked issues, how to test. Include screenshots/GIFs for UI and sample requests for API. Update `docs/` for behavior or endpoint changes.

## Security & Configuration Tips
- Never commit secrets. Copy `.env.example` to `.env` and set keys locally or via Docker env.
- Migrations: create with `alembic revision --autogenerate -m "message"`; apply with `alembic upgrade head`.
- Respect Clean Architecture boundaries; avoid cross‑layer imports.

