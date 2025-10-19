# Labia.AI - Infrastructure Documentation

**Production Domain**: https://labia.chat
**Staging Domain**: https://staging.labia.chat
**Last Updated**: October 19, 2025

---

## Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Docker Setup](#docker-setup)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Configuration](#environment-configuration)
6. [Database Management](#database-management)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling Strategy](#scaling-strategy)
9. [Disaster Recovery](#disaster-recovery)
10. [Cost Optimization](#cost-optimization)

---

## Infrastructure Overview

### Architecture Components

```
Production Stack:
├── Cloudflare DNS & CDN
├── Nginx Reverse Proxy (SSL Termination)
├── Backend API (FastAPI)
│   ├── 3+ replicas (auto-scaling)
│   └── Health checks & graceful shutdown
├── PostgreSQL Database (Managed)
│   ├── Primary instance
│   └── Read replicas (optional)
├── Redis Cache (Managed)
│   ├── Cache layer
│   └── Rate limiting
└── External Services
    ├── OpenAI/Anthropic APIs
    ├── Monitoring (Sentry, Prometheus)
    └── Logging (CloudWatch, Logtail)
```

### Infrastructure Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Backend container image |
| `docker-compose.yml` | Local development stack |
| `docker-compose.prod.yml` | Production stack |
| `.dockerignore` | Files to exclude from image |
| `k8s/deployment.yml` | Kubernetes backend deployment |
| `k8s/postgres.yml` | Kubernetes PostgreSQL setup |
| `k8s/redis.yml` | Kubernetes Redis setup |
| `nginx/nginx.conf` | Nginx reverse proxy config |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `backend/.env.production` | Production environment variables |
| `backend/.env.staging` | Staging environment variables |

---

## Docker Setup

### Local Development

Start all services locally:

```bash
# Start PostgreSQL + Redis + Backend
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Clean restart (removes volumes)
docker-compose down -v && docker-compose up -d
```

Access services:
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- pgAdmin: http://localhost:5050 (start with `--profile tools`)
- Redis Commander: http://localhost:8081 (start with `--profile tools`)

### Production Docker

Build and deploy production image:

```bash
# Build production image
docker build -t labia-ai-backend:latest .

# Tag for registry
docker tag labia-ai-backend:latest ghcr.io/your-org/labia-ai-backend:latest

# Push to registry
docker push ghcr.io/your-org/labia-ai-backend:latest

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Dockerfile Best Practices

Our Dockerfile implements:
- ✅ Multi-stage build (smaller image size)
- ✅ Non-root user (security)
- ✅ Health checks
- ✅ Layer caching optimization
- ✅ Python dependencies cached
- ✅ Minimal base image (python:3.11-slim)

**Image Size**: ~200-300 MB (optimized)

---

## Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
brew install kubectl

# Install helm (optional)
brew install helm

# Configure kubectl for your cluster
# AWS EKS example:
aws eks update-kubeconfig --region us-east-1 --name labia-ai-cluster
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/deployment.yml

# Deploy PostgreSQL (or use managed DB)
kubectl apply -f k8s/postgres.yml

# Deploy Redis (or use managed Redis)
kubectl apply -f k8s/redis.yml

# Verify deployments
kubectl get pods -n labia-ai
kubectl get svc -n labia-ai

# Check logs
kubectl logs -n labia-ai -l app=labia-ai,component=backend --tail=100 -f

# Get pod details
kubectl describe pod -n labia-ai <pod-name>
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment/labia-ai-backend --replicas=5 -n labia-ai

# Horizontal Pod Autoscaler (HPA) is configured for auto-scaling:
# - Min replicas: 2
# - Max replicas: 10
# - Target CPU: 70%
# - Target Memory: 80%

# Check HPA status
kubectl get hpa -n labia-ai
kubectl describe hpa labia-ai-backend-hpa -n labia-ai
```

### Updating Deployment

```bash
# Update image
kubectl set image deployment/labia-ai-backend \
  backend=ghcr.io/your-org/labia-ai-backend:v1.2.0 \
  -n labia-ai

# Monitor rollout
kubectl rollout status deployment/labia-ai-backend -n labia-ai

# Rollback if needed
kubectl rollout undo deployment/labia-ai-backend -n labia-ai
```

### Ingress & SSL

The Kubernetes deployment includes:
- Nginx Ingress Controller
- cert-manager for automatic SSL (Let's Encrypt)
- Rate limiting (10 req/sec)
- Force HTTPS redirect

Domains configured:
- `api.labia.chat` → Backend service
- `labia.chat/api` → Backend service (alternative path)

---

## CI/CD Pipeline

### GitHub Actions Workflow

The pipeline (`.github/workflows/deploy.yml`) includes:

**On Pull Requests**:
1. ✅ Run backend tests
2. ✅ Run linting (black, flake8)
3. ✅ Security scan (Trivy)
4. ✅ Generate test coverage report

**On Push to `develop`**:
1. ✅ Run tests
2. ✅ Build Docker image
3. ✅ Push to container registry
4. ✅ Deploy to staging
5. ✅ Run health checks
6. ✅ Notify Slack

**On Push to `main`**:
1. ✅ Run tests
2. ✅ Build Docker image
3. ✅ Push to container registry
4. ✅ Deploy to production (AWS ECS)
5. ✅ Run database migrations
6. ✅ Run health checks
7. ✅ Notify Slack (success/failure)

### Required GitHub Secrets

Add these secrets in GitHub repository settings:

```bash
# Container Registry
GITHUB_TOKEN  # Automatically provided by GitHub

# API Keys
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Staging Deployment
STAGING_HOST          # staging.labia.chat IP
STAGING_USER          # SSH user
STAGING_SSH_KEY       # SSH private key

# Production Deployment
PROD_HOST            # production server IP
PROD_USER            # SSH user
PROD_SSH_KEY         # SSH private key

# AWS (if using ECS/EKS)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Notifications
SLACK_WEBHOOK_URL    # For deployment notifications
```

### Manual Deployment Trigger

```bash
# Trigger deployment manually
gh workflow run deploy.yml --ref main
```

---

## Environment Configuration

### Environment Files

| File | Environment | Usage |
|------|-------------|-------|
| `.env` | Development | Local development |
| `.env.staging` | Staging | Pre-production testing |
| `.env.production` | Production | Live deployment |

### Critical Environment Variables

**Must Change in Production**:
```bash
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=<strong-random-32-chars>

# Generate with: python -c "import secrets; print(secrets.token_urlsafe(64))"
JWT_SECRET_KEY=<strong-random-64-chars>

# Database (use managed DB URL)
DATABASE_URL=postgresql://user:pass@prod-db:5432/labiaai

# Redis (use managed Redis URL)
REDIS_URL=redis://:password@prod-redis:6379/0

# LLM API Keys (production keys, not test keys)
OPENAI_API_KEY=sk-prod-...
ANTHROPIC_API_KEY=sk-ant-prod-...
```

### CORS Configuration

Production:
```bash
ALLOWED_ORIGINS=https://labia.chat,https://www.labia.chat,https://api.labia.chat
```

Staging:
```bash
ALLOWED_ORIGINS=https://staging.labia.chat,https://api.staging.labia.chat
```

---

## Database Management

### Managed Database Recommendations

**AWS RDS PostgreSQL**:
```bash
# Recommended specs for production:
- Instance: db.t3.small (2 vCPU, 2GB RAM)
- Storage: 20GB SSD (auto-scaling enabled)
- Multi-AZ: Enabled (high availability)
- Backups: Automated daily, 7-day retention
- Cost: ~$30-50/month
```

**DigitalOcean Managed Database**:
```bash
# Basic plan:
- 1GB RAM, 10GB storage
- Automated backups
- Cost: ~$15/month
```

### Database Migrations

```bash
# Apply migrations in production
docker exec labia-ai-backend alembic upgrade head

# Or via Kubernetes:
kubectl exec -n labia-ai -it <backend-pod> -- alembic upgrade head

# Check current version
kubectl exec -n labia-ai -it <backend-pod> -- alembic current

# Rollback one migration
kubectl exec -n labia-ai -it <backend-pod> -- alembic downgrade -1
```

### Database Backups

**Automated Backups** (recommended):
- Enable daily backups on managed database
- Retention: 7 days minimum, 30 days recommended

**Manual Backup**:
```bash
# Backup database
pg_dump -h prod-db.labia.chat -U labiaai -d labiaai > backup.sql

# Restore database
psql -h prod-db.labia.chat -U labiaai -d labiaai < backup.sql
```

---

## Monitoring & Logging

### Application Monitoring

**Sentry (Error Tracking)**:
```python
# Already configured in src/main.py
# Add SENTRY_DSN to environment variables
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Prometheus + Grafana**:
```bash
# Metrics endpoint exposed at /metrics
# Configure Prometheus to scrape:
curl https://api.labia.chat/metrics
```

### Health Checks

Monitor these endpoints:

```bash
# Overall health
curl https://api.labia.chat/api/v1/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "llm": "configured"
  }
}
```

### Log Aggregation

**Option 1: AWS CloudWatch** (if using AWS):
```bash
# Logs automatically sent to CloudWatch Logs
# Configure in docker-compose or ECS task definition
```

**Option 2: Logtail**:
```bash
# Simple log aggregation
# Sign up at https://logtail.com
# Add token to environment:
LOGTAIL_TOKEN=your-token
```

**Option 3: Self-hosted (ELK Stack)**:
- Elasticsearch
- Logstash
- Kibana

---

## Scaling Strategy

### Vertical Scaling (Increase Resources)

```bash
# Update resource limits in k8s/deployment.yml
resources:
  requests:
    cpu: 1000m      # 1 CPU → 2 CPUs
    memory: 2Gi     # 2GB → 4GB
  limits:
    cpu: 4000m      # 4 CPUs
    memory: 8Gi     # 8GB
```

### Horizontal Scaling (Add More Instances)

**Auto-scaling is configured**:
- Min: 2 replicas
- Max: 10 replicas
- Triggers: CPU > 70% or Memory > 80%

**Manual scaling**:
```bash
kubectl scale deployment/labia-ai-backend --replicas=5 -n labia-ai
```

### Database Scaling

1. **Read Replicas** (for read-heavy workloads)
2. **Connection Pooling** (already implemented with SQLAlchemy)
3. **Vertical scaling** (increase instance size)

### Redis Scaling

1. **Increase memory** (current: 1GB → 2-4GB)
2. **Redis Cluster** (for massive scale)
3. **Separate cache instances** (cache vs rate-limiting)

---

## Disaster Recovery

### Backup Strategy

**Daily Backups**:
- ✅ Database: Automated daily via managed DB
- ✅ Redis: Persistence enabled (AOF + RDB)
- ✅ Logs: 30-day retention
- ✅ Code: Git repository

**Backup Locations**:
- Database backups: Managed DB provider
- Container images: GitHub Container Registry
- Infrastructure configs: Git repository
- Secrets: AWS Secrets Manager / HashiCorp Vault

### Recovery Procedures

**Database Restore**:
```bash
# Restore from automated backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier labia-ai-restored \
  --db-snapshot-identifier labia-ai-backup-2025-10-19
```

**Application Rollback**:
```bash
# Rollback to previous version
kubectl rollout undo deployment/labia-ai-backend -n labia-ai

# Or deploy specific version
kubectl set image deployment/labia-ai-backend \
  backend=ghcr.io/your-org/labia-ai-backend:v1.1.0 \
  -n labia-ai
```

### RTO & RPO Targets

- **RTO** (Recovery Time Objective): < 1 hour
- **RPO** (Recovery Point Objective): < 1 hour (based on backup frequency)

---

## Cost Optimization

### Current Monthly Costs (Estimated)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Domain (.chat) | - | $1-2 |
| Cloudflare | Free | $0 |
| Backend (2-3 instances) | 1 CPU, 2GB RAM each | $30-60 |
| PostgreSQL | Managed, 20GB | $15-30 |
| Redis | Managed, 1GB | $10-20 |
| LLM API (with 70% cache) | Usage-based | $30-100 |
| Monitoring | Free tier | $0-10 |
| **Total** | | **$86-222/month** |

### Cost Reduction Strategies

1. **Increase Cache TTL**:
   - Current: 1 hour
   - Increase to: 4-6 hours for openers
   - Savings: 50-80% on LLM costs

2. **Use Cheaper LLM Models**:
   - GPT-4 → GPT-3.5: 90% cost reduction
   - Claude Opus → Claude Haiku: 90% cost reduction
   - Tradeoff: Slightly lower quality

3. **Optimize Database**:
   - Enable connection pooling (already done)
   - Add read replicas only when needed
   - Use smaller instance initially

4. **Reserved Instances** (AWS):
   - 1-year commitment: 30-40% savings
   - 3-year commitment: 50-60% savings

5. **Spot Instances** (for non-critical workloads):
   - Staging environment: 70-90% savings

---

## Quick Reference Commands

### Docker
```bash
# Build
docker build -t labia-ai-backend .

# Run locally
docker-compose up -d

# View logs
docker-compose logs -f backend

# Clean restart
docker-compose down -v && docker-compose up -d
```

### Kubernetes
```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods -n labia-ai

# View logs
kubectl logs -f -n labia-ai -l app=labia-ai

# Scale
kubectl scale deployment/labia-ai-backend --replicas=3 -n labia-ai

# Exec into pod
kubectl exec -it -n labia-ai <pod-name> -- /bin/sh
```

### Database
```bash
# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Rollback
alembic downgrade -1
```

### Health Checks
```bash
# API health
curl https://api.labia.chat/api/v1/health

# Local health
curl http://localhost:8000/api/v1/health
```

---

## Support & Resources

**Documentation**:
- Deployment: `docs/DEPLOYMENT-GUIDE.md`
- Infrastructure: This file
- API: `docs/API-USAGE-EXAMPLES.md`

**External Resources**:
- Docker: https://docs.docker.com/
- Kubernetes: https://kubernetes.io/docs/
- FastAPI: https://fastapi.tiangolo.com/deployment/
- GitHub Actions: https://docs.github.com/en/actions

---

**Version**: 1.0
**Last Updated**: October 19, 2025
**Maintained by**: Labia.AI DevOps Team
