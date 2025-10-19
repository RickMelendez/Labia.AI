# Labia.AI - Deployment Guide

**Production Domain**: https://labia.chat
**Staging Domain**: https://staging.labia.chat
**API Endpoints**: https://api.labia.chat (prod), https://api.staging.labia.chat (staging)

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Cloudflare DNS Configuration](#cloudflare-dns-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Database Setup](#database-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Troubleshooting](#troubleshooting)

---

## Infrastructure Overview

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│              (DNS, SSL/TLS, DDoS Protection)            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer (Optional)                │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌──────────────────────┐
│  Frontend (Mobile)    │       │  Backend API         │
│  - React Native       │       │  - FastAPI           │
│  - Expo/EAS Build     │       │  - Docker Container  │
│  - App Store/Play     │       │  - Port 8000         │
└───────────────────────┘       └──────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
        ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
        │  PostgreSQL     │   │  Redis Cache    │   │  LLM Providers  │
        │  - Port 5432    │   │  - Port 6379    │   │  - OpenAI       │
        │  - Managed DB   │   │  - Managed      │   │  - Anthropic    │
        └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Deployment Options

| Option | Best For | Cost | Complexity |
|--------|----------|------|------------|
| **AWS (Recommended)** | Production, scalability | $$$ | Medium |
| **DigitalOcean** | Small-medium apps | $$ | Low |
| **Railway.app** | Quick deployment | $$ | Very Low |
| **Render.com** | Simple hosting | $$ | Low |
| **Fly.io** | Global edge deployment | $$ | Medium |

---

## Prerequisites

### Required Accounts
- [ ] Domain purchased (labia.chat)
- [ ] Cloudflare account (free tier OK)
- [ ] Cloud provider account (AWS, DigitalOcean, etc.)
- [ ] OpenAI or Anthropic API key
- [ ] GitHub account (for CI/CD)

### Required Tools
```bash
# Install these on your local machine
brew install docker          # Docker Desktop
brew install kubectl         # Kubernetes CLI
brew install terraform       # Infrastructure as Code (optional)
brew install gh              # GitHub CLI
npm install -g eas-cli       # Expo Application Services
```

### Cost Estimation

**Monthly Costs (Production)**:
| Service | Tier | Cost/Month |
|---------|------|------------|
| **Domain (.chat)** | - | $1-2 |
| **Cloudflare** | Free | $0 |
| **Backend Server** | 2 vCPU, 4GB RAM | $20-50 |
| **PostgreSQL** | Managed DB (small) | $15-25 |
| **Redis** | Managed Cache (small) | $10-20 |
| **LLM API** | Usage-based | $50-200* |
| **Monitoring** | Free tier | $0-20 |
| **Total** | | **$96-317/month** |

*LLM costs depend heavily on usage. With caching (50-80% hit rate), expect $50-100/month for moderate traffic.

---

## Environment Setup

### 1. Staging vs Production Environments

Create separate environments for testing and production:

| Environment | Domain | Purpose |
|-------------|--------|---------|
| **Development** | localhost:8000 | Local development |
| **Staging** | staging.labia.chat | Pre-production testing |
| **Production** | labia.chat | Live users |

### 2. Environment Variables

Create `.env.production` and `.env.staging` files:

#### Backend Production (.env.production)
```bash
# Environment
ENVIRONMENT=production
DEBUG=False
APP_NAME=Labia.AI

# Database (use managed PostgreSQL)
DATABASE_URL=postgresql://user:password@prod-db.labia.chat:5432/labiaai

# Redis (use managed Redis)
REDIS_URL=redis://prod-redis.labia.chat:6379/0
REDIS_CACHE_TTL=3600
REDIS_RATE_LIMIT_TTL=86400

# LLM Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-prod-your-openai-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Security (CHANGE THESE!)
SECRET_KEY=<generate-strong-random-key-32-chars>
JWT_SECRET_KEY=<generate-strong-random-key-64-chars>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=https://labia.chat,https://www.labia.chat,https://api.labia.chat

# Rate Limiting
RATE_LIMIT_FREE=10
RATE_LIMIT_PRO=100
RATE_LIMIT_PREMIUM=-1

# Default Settings
DEFAULT_CULTURAL_STYLE=boricua
DEFAULT_TONE=chill
```

#### Backend Staging (.env.staging)
```bash
# Same as production but with staging URLs
ENVIRONMENT=staging
DEBUG=True  # More verbose logging
DATABASE_URL=postgresql://user:password@staging-db.labia.chat:5432/labiaai_staging
REDIS_URL=redis://staging-redis.labia.chat:6379/0
ALLOWED_ORIGINS=https://staging.labia.chat,https://api.staging.labia.chat

# Use cheaper LLM for testing
OPENAI_MODEL=gpt-3.5-turbo  # Cheaper for testing
```

### 3. Generate Strong Secrets

```bash
# Generate SECRET_KEY (32 chars)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT_SECRET_KEY (64 chars)
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Cloudflare DNS Configuration

### Step 1: Add Domain to Cloudflare

1. Log in to https://dash.cloudflare.com/
2. Click "Add Site"
3. Enter `labia.chat`
4. Select **Free** plan
5. Cloudflare scans existing DNS records
6. Click "Continue"

### Step 2: Update Nameservers at Registrar

Cloudflare provides 2 nameservers (example):
```
carter.ns.cloudflare.com
nola.ns.cloudflare.com
```

Go to your domain registrar (Namecheap, GoDaddy, etc.):
1. Find DNS/Nameserver settings
2. Replace existing nameservers with Cloudflare's
3. Save changes
4. Wait 24-48 hours for propagation

### Step 3: Configure DNS Records

In Cloudflare dashboard, add these DNS records:

#### Production DNS Records

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | labia.chat | `[Backend Server IP]` | ✅ Proxied | Auto |
| A | www | `[Backend Server IP]` | ✅ Proxied | Auto |
| A | api | `[Backend Server IP]` | ✅ Proxied | Auto |
| CNAME | admin | labia.chat | ✅ Proxied | Auto |

#### Staging DNS Records

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | staging | `[Staging Server IP]` | ✅ Proxied | Auto |
| A | api.staging | `[Staging Server IP]` | ✅ Proxied | Auto |

**Note**: Keep "Proxied" (orange cloud) enabled for DDoS protection and SSL.

### Step 4: SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **"Full (strict)"**
3. Go to **SSL/TLS** → **Edge Certificates**
4. Enable:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

Cloudflare automatically provisions SSL certificates within 15 minutes.

### Step 5: Page Rules (Optional but Recommended)

Add these page rules for better performance:

1. **Redirect www to non-www**:
   - URL: `www.labia.chat/*`
   - Setting: Forwarding URL (301 Permanent Redirect)
   - Destination: `https://labia.chat/$1`

2. **Cache API responses** (be careful with auth endpoints):
   - URL: `api.labia.chat/api/v1/openers/examples*`
   - Settings: Cache Level = Standard, Edge Cache TTL = 1 hour

---

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

See `docker-compose.yml` and `Dockerfile` in the repository.

```bash
# Build and push Docker image
docker build -t labia-ai-backend:latest ./backend
docker tag labia-ai-backend:latest your-registry/labia-ai-backend:latest
docker push your-registry/labia-ai-backend:latest

# Deploy on server
ssh your-server
docker pull your-registry/labia-ai-backend:latest
docker-compose up -d
```

### Option 2: AWS Deployment

See `docs/AWS-DEPLOYMENT.md` for detailed AWS setup with:
- ECS/Fargate for containers
- RDS for PostgreSQL
- ElastiCache for Redis
- ALB for load balancing

### Option 3: Railway.app (Easiest)

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects Dockerfile
5. Add environment variables from `.env.production`
6. Click "Deploy"
7. Railway provides a URL, add CNAME in Cloudflare

### Option 4: Render.com

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port 8000`
5. Add environment variables
6. Click "Create Web Service"

---

## Frontend Deployment

### React Native Mobile App

#### Using Expo Application Services (EAS)

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
eas login
```

2. **Configure EAS**:
```bash
cd frontend
eas build:configure
```

This creates `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "API_BASE_URL": "http://localhost:8000/api/v1"
      }
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "API_BASE_URL": "https://api.staging.labia.chat/api/v1"
      }
    },
    "production": {
      "env": {
        "API_BASE_URL": "https://api.labia.chat/api/v1"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

3. **Build for iOS**:
```bash
eas build --platform ios --profile production
```

4. **Build for Android**:
```bash
eas build --platform android --profile production
```

5. **Submit to App Stores**:
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## Database Setup

### Option 1: Managed PostgreSQL (Recommended)

**AWS RDS**:
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier labia-ai-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username labiaai \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name my-subnet-group
```

**DigitalOcean Managed Database**:
- Go to https://cloud.digitalocean.com/databases
- Click "Create Database Cluster"
- Select PostgreSQL 15
- Choose $15/month plan (1GB RAM, 10GB storage)
- Copy connection string

### Option 2: Self-Hosted PostgreSQL

See `docker-compose.yml` for PostgreSQL container setup.

### Run Database Migrations

```bash
cd backend
source venv/bin/activate

# Set production database URL
export DATABASE_URL="postgresql://user:pass@prod-db:5432/labiaai"

# Run migrations
alembic upgrade head

# Verify
alembic current
```

---

## Monitoring & Logging

### 1. Application Monitoring

**Sentry** (Error Tracking):
```bash
pip install sentry-sdk
```

Add to `backend/src/main.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/project-id",
    integrations=[FastApiIntegration()],
    environment="production",
    traces_sample_rate=0.1,
)
```

### 2. Logging

Logs are already configured in `backend/src/core/logging.py`.

Production logs go to:
- `backend/logs/app.log` (daily rotation)
- `backend/logs/errors/` (error-only logs)

**Centralized Logging Options**:
- **CloudWatch** (AWS)
- **Logtail** (Simple, $10/month)
- **Datadog** (Enterprise, $$$$)

### 3. Metrics & Performance

**Prometheus + Grafana**:
```bash
pip install prometheus-fastapi-instrumentator
```

Add to `backend/src/main.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

Access metrics at: `https://api.labia.chat/metrics`

---

## SSL/TLS Configuration

### Backend SSL Certificate

If not using Cloudflare proxy, install SSL on your server:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d api.labia.chat

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
```

### Verify SSL Configuration

```bash
# Test SSL
curl -vI https://api.labia.chat

# Check SSL grade
# Visit: https://www.ssllabs.com/ssltest/
```

---

## CI/CD Pipeline

See `.github/workflows/deploy.yml` for GitHub Actions pipeline.

**Features**:
- ✅ Automated testing on PRs
- ✅ Docker build & push
- ✅ Automatic deployment to staging
- ✅ Manual approval for production
- ✅ Database migrations
- ✅ Health checks

---

## Troubleshooting

### DNS Not Resolving

```bash
# Check DNS propagation
nslookup labia.chat
dig labia.chat

# Online tool
# https://dnschecker.org/
```

**Common issues**:
- Nameservers not updated at registrar
- DNS propagation delay (wait 24-48 hours)
- Cloudflare proxy disabled (orange cloud should be ON)

### SSL Certificate Errors

```bash
# Check certificate
openssl s_client -connect api.labia.chat:443 -servername api.labia.chat
```

**Common issues**:
- Cloudflare SSL mode set to "Flexible" instead of "Full (strict)"
- Server doesn't have valid SSL certificate
- Mixed content (HTTP + HTTPS)

### Backend Not Responding

```bash
# Check if service is running
ssh your-server
docker ps
docker logs labia-ai-backend

# Check if port is open
netstat -tuln | grep 8000
```

### Database Connection Errors

```bash
# Test database connection
psql "postgresql://user:pass@host:5432/dbname"

# Check PostgreSQL logs
docker logs postgres-container
```

### High LLM Costs

**Solutions**:
1. Increase cache TTL (currently 1 hour)
2. Switch to cheaper models (GPT-3.5 instead of GPT-4)
3. Implement request throttling
4. Use Anthropic Claude (often cheaper)

---

## Health Check Endpoints

Monitor these endpoints:

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /api/v1/health` | Overall health | 200 OK with system status |
| `GET /api/v1/ping` | Simple liveness | 200 OK with "pong" |
| `GET /docs` | API documentation | 200 OK (Swagger UI) |

**Setup automated monitoring**:
- UptimeRobot (free, https://uptimerobot.com/)
- Pingdom
- AWS CloudWatch Alarms

---

## Rollback Procedure

If deployment fails:

```bash
# Rollback Docker container
docker-compose down
docker-compose up -d --scale backend=0  # Stop current
docker pull your-registry/labia-ai-backend:previous-version
docker-compose up -d

# Rollback database migration
alembic downgrade -1  # Go back one version
```

---

## Security Checklist

- [ ] Environment variables stored securely (not in git)
- [ ] Strong secrets generated for JWT and SECRET_KEY
- [ ] Database not publicly accessible
- [ ] Redis password protected
- [ ] CORS configured correctly (only allowed origins)
- [ ] Rate limiting enabled
- [ ] SSL/TLS configured (HTTPS only)
- [ ] Cloudflare proxy enabled (DDoS protection)
- [ ] API keys rotated regularly
- [ ] Logs don't contain sensitive data
- [ ] Dependencies updated (run `pip audit`)

---

## Post-Deployment Checklist

- [ ] DNS records configured correctly
- [ ] SSL certificate active and valid
- [ ] Backend health check passing
- [ ] Database migrations applied
- [ ] Redis cache working
- [ ] LLM API calls successful
- [ ] Mobile app connects to API
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## Support & Resources

**Documentation**:
- Backend: `docs/BACKEND-COMPLETE-SUMMARY.md`
- Frontend: `docs/FRONTEND-IMPLEMENTATION-SUMMARY.md`
- API: `docs/API-USAGE-EXAMPLES.md`

**External Resources**:
- Cloudflare Docs: https://developers.cloudflare.com/
- Expo Docs: https://docs.expo.dev/
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/

---

**Last Updated**: October 19, 2025
**Version**: 1.0
**Status**: Ready for Production Deployment 🚀
