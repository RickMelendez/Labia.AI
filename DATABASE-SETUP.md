# Database Setup Instructions

## Prerequisites

- Docker Desktop installed and running
- OR PostgreSQL 15+ installed locally

## Option 1: Using Docker (Recommended)

### Start Database Services

```bash
cd backend
docker-compose up -d postgres redis
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### Verify Services are Running

```bash
docker ps
```

You should see containers named `labia-ai-postgres` and `labia-ai-redis`.

### Run Database Migrations

```bash
cd backend
source venv/Scripts/activate  # Windows Git Bash
# OR
# venv\Scripts\activate.bat    # Windows CMD
# OR
# source venv/bin/activate     # Mac/Linux

alembic upgrade head
```

### Verify Migrations

```bash
alembic current
```

Should show: `2025_10_18_0001 (head)`

## Option 2: Local PostgreSQL

### Install PostgreSQL

**Windows**:
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for `postgres` user

**Mac**:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE labiaai;
CREATE USER labiaai WITH PASSWORD 'labiaai';
GRANT ALL PRIVILEGES ON DATABASE labiaai TO labiaai;
\q
```

### Update .env File

Ensure `.env` has the correct DATABASE_URL:
```
DATABASE_URL=postgresql://labiaai:labiaai@localhost:5432/labiaai
```

### Run Migrations

```bash
cd backend
source venv/Scripts/activate  # Or appropriate command for your OS
alembic upgrade head
```

## Troubleshooting

### Error: "connection refused"

**Docker**: Make sure Docker Desktop is running
```bash
docker-compose up -d postgres
```

**Local**: Make sure PostgreSQL service is running
```bash
# Windows: Check Services app
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### Error: "database does not exist"

Create the database manually:
```bash
psql -U postgres -c "CREATE DATABASE labiaai;"
```

### Error: "role does not exist"

Create the user:
```bash
psql -U postgres -c "CREATE USER labiaai WITH PASSWORD 'labiaai';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE labiaai TO labiaai;"
```

### View Current Migration Status

```bash
alembic current
alembic history
```

### Rollback Migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback all
alembic downgrade base
```

## What the Migrations Do

### Migration 1: Initial Schema (2025_10_18_0000)

Creates tables:
- `users` - User accounts with authentication
- `profiles` - User preferences (cultural style, tone, interests)
- `conversations` - Conversation threads
- `messages` - Individual messages with AI metadata
- `missions` - Gamification challenges
- `user_missions` - User progress on missions

### Migration 2: Seed Missions (2025_10_18_0001)

Populates initial missions:
1. **Primera Conexión** (Easy, 10 XP)
2. **Maestro Cultural** (Medium, 25 XP)
3. **Políglota del Flow** (Medium, 30 XP)
4. **Conversador Activo** (Hard, 50 XP)
5. **Practicante Constante** (Hard, 75 XP)

## Verify Everything Works

```bash
# Start backend
cd backend
source venv/Scripts/activate
uvicorn src.main:app --reload

# In another terminal, test health endpoint
curl http://localhost:8000/api/v1/health

# Should return:
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "llm": "configured"
  }
}
```

## Next Steps

Once database is running and migrations are applied:

1. Backend will automatically persist:
   - User accounts
   - Conversation history
   - Mission progress
   - Usage statistics

2. Frontend will sync data:
   - Login/logout will use database
   - Conversations saved automatically
   - Mission progress tracked

3. Test the full stack:
   - Create an account via Signup screen
   - Generate some openers
   - Check Profile screen for usage stats
   - Complete missions in Trainer
   - View history in (to be added) History tab
