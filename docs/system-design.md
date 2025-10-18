# Labia.AI - System Design Document

## Executive Summary

Labia.AI is an AI-powered conversation assistant specifically designed for the Puerto Rican and Latin American markets. The system helps users craft culturally-authentic conversation openers and responses for dating apps and social media.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Mobile     │  │     Web      │  │   Desktop    │         │
│  │  (React      │  │  (Next.js)   │  │   (Tauri)    │         │
│  │   Native)    │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI (Python 3.11+)                                   │  │
│  │  • CORS Middleware                                        │  │
│  │  • Error Handler Middleware                               │  │
│  │  • Request Logging Middleware                             │  │
│  │  • Rate Limiting Middleware (TODO)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  Presentation      │  │   Use Cases         │               │
│  │  (API Endpoints)   │  │  (Business Logic)   │               │
│  │                    │  │                     │               │
│  │ • Openers API      │  │ • Generate Openers  │               │
│  │ • Responses API    │  │ • Generate Response │               │
│  │ • Safety API       │  │ • Check Safety      │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                          │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │   Redis    │  │   External   │  │  PostgreSQL │            │
│  │   Cache    │  │     LLM      │  │  Database   │            │
│  │            │  │              │  │             │            │
│  │ • Openers  │  │ • OpenAI     │  │ • Users     │            │
│  │ • Responses│  │ • Anthropic  │  │ • Messages  │            │
│  │ • Sessions │  │ • Prompts    │  │ • Profiles  │            │
│  └────────────┘  └──────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. API Gateway

**Technology**: FastAPI (Python 3.11+)

**Responsibilities**:
- HTTP request routing
- Authentication & authorization
- Rate limiting
- Request validation
- Error handling
- Logging & monitoring

**Middleware Stack** (execution order):
1. **CORS Middleware** - Handle cross-origin requests
2. **Request Logging** - Log all incoming requests
3. **Error Handler** - Catch and format errors
4. **Rate Limiter** (TODO) - Prevent abuse

### 2. LLM Provider Abstraction

**Purpose**: Provide consistent interface for multiple AI providers

```python
┌─────────────────────────────────┐
│   BaseLLMProvider (Interface)    │
├─────────────────────────────────┤
│  + generate(messages)            │
│  + generate_multiple(messages)   │
└─────────────────────────────────┘
          ▲          ▲
          │          │
    ┌─────┘          └─────┐
    │                      │
┌───────────┐      ┌───────────────┐
│  OpenAI   │      │  Anthropic    │
│ Provider  │      │   Provider    │
└───────────┘      └───────────────┘
```

**Features**:
- Provider switching (OpenAI ⇄ Anthropic)
- Unified message format
- Error handling & retries
- Token counting & cost tracking

### 3. Cultural Context System

**Core Feature**: Regional personalization for Latin markets

**Supported Styles**:
| Style | Region | Key Slang | Tone |
|-------|--------|-----------|------|
| `boricua` | Puerto Rico | wepa, chévere, brutal, janguear | Warm, expressive, playful |
| `mexicano` | Mexico | wey, chido, neta, al chile | Friendly, indirect |
| `colombiano` | Colombia | parce, chimba, bacano | Very friendly, positive |
| `argentino` | Argentina | che, boludo, copado | Direct, sarcastic |
| `español` | Spain | tío/tía, guay, mola | Direct, witty |

**Implementation**:
```python
CULTURAL_CONTEXTS = {
    "boricua": CulturalContext(
        name="Puerto Rican",
        slang_examples=["wepa", "brutal", "chévere"],
        communication_style="Warm, expressive",
        humor_style="Self-deprecating, wordplay",
        formality_level="Casual and friendly"
    ),
    # ... other contexts
}
```

### 4. Prompt Engineering System

**Three-Tier Prompt Strategy**:

1. **System Prompt** - Sets cultural context and rules
2. **User Prompt** - Provides specific input (bio, message)
3. **Response Format** - Ensures consistent output

**Prompt Types**:
- **Opener Generation** - 3 tones (genuino, coqueto, directo)
- **Response Generation** - Context-aware with relationship stage
- **Content Safety** - Filter inappropriate content
- **Message Rewrite** - Fix inappropriate messages

---

## Data Flow

### Opener Generation Flow

```
User Request
    │
    ├─> [1] Validate Input
    │       • Bio length (10-1000 chars)
    │       • Cultural style (valid enum)
    │       • Num suggestions (1-3)
    │
    ├─> [2] Check Cache (TODO)
    │       • Key: hash(bio + interests + style)
    │       • TTL: 1 hour
    │
    ├─> [3] Generate Prompts
    │       • Build system prompt with cultural context
    │       • Build user prompt with bio/interests
    │       • For each tone (genuino, coqueto, directo)
    │
    ├─> [4] Call LLM Provider
    │       • Send to OpenAI/Anthropic
    │       • Temperature: 0.8 (creative)
    │       • Max tokens: 150
    │
    ├─> [5] Process Response
    │       • Parse generated text
    │       • Create ConversationOpener objects
    │       • Calculate confidence scores
    │
    ├─> [6] Safety Check (optional)
    │       • Filter inappropriate content
    │       • Block if unsafe
    │
    ├─> [7] Cache Result (TODO)
    │       • Store for 1 hour
    │
    └─> [8] Return to User
            • JSON response with 3 openers
```

### Response Generation Flow

```
User Request
    │
    ├─> [1] Validate Input
    │       • Message length (1-2000 chars)
    │       • Relationship stage (early/building/advanced)
    │
    ├─> [2] Analyze Context
    │       • Extract previous messages
    │       • Identify shared interests
    │       • Determine conversation tone
    │
    ├─> [3] Generate Prompts
    │       • System prompt with stage guidance
    │       • Include conversation history
    │       • For each tone
    │
    ├─> [4] Call LLM Provider
    │       • Temperature: 0.8
    │       • Max tokens: 200
    │
    ├─> [5] Process & Return
            • Create ConversationResponse objects
            • Add follow-up suggestions
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    country VARCHAR(2) NOT NULL,
    plan VARCHAR(20) DEFAULT 'free',
    tone_default VARCHAR(50) DEFAULT 'chill',
    daily_suggestions_used INT DEFAULT 0,
    last_suggestion_reset TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    age_range VARCHAR(20),
    interests TEXT[],
    tone VARCHAR(50) DEFAULT 'chill',
    emoji_ratio DECIMAL(3,2) DEFAULT 0.3,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    tone VARCHAR(50),
    lang VARCHAR(10) DEFAULT 'es',
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Feedback Table
```sql
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    message_id INT REFERENCES messages(id),
    user_id INT REFERENCES users(id),
    thumb_up BOOLEAN,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Caching Strategy (Redis)

### Cache Keys

```
# Opener Cache
opener:{hash(bio+interests+style)} -> JSON
TTL: 1 hour

# Response Cache
response:{hash(message+context+style)} -> JSON
TTL: 30 minutes

# User Rate Limit
rate_limit:user:{user_id}:{date} -> INT
TTL: 24 hours

# Session Cache
session:{session_id} -> JSON
TTL: 7 days
```

### Cache Invalidation

- **Time-based**: TTL expiration
- **Event-based**: User feedback (negative rating)
- **Manual**: Admin override

---

## Error Handling

### Exception Hierarchy

```
LabiaAIException (Base)
│
├─> LLMProviderException (503)
│   └─> Provider timeout, API errors
│
├─> ContentSafetyException (400)
│   └─> Unsafe content detected
│
├─> RateLimitException (429)
│   └─> Too many requests
│
├─> ValidationException (422)
│   └─> Invalid input
│
├─> AuthenticationException (401)
│   └─> Invalid credentials
│
├─> AuthorizationException (403)
│   └─> Insufficient permissions
│
└─> DatabaseException (500)
    └─> DB connection, query errors
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {
      "field": "value",
      "context": "additional info"
    }
  },
  "timestamp": 1234567890.123
}
```

---

## Logging Strategy

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General operational events
- **WARNING**: Important events (rate limits, unsafe content)
- **ERROR**: Errors that need attention
- **CRITICAL**: System failures

### Structured Logging

All logs are JSON-formatted with standard fields:

```json
{
  "timestamp": "2025-10-18T10:30:00.000Z",
  "level": "INFO",
  "service": "labia-ai",
  "event": "llm_request",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "duration_ms": 1234.56,
  "success": true,
  "user_id": "user_123",
  "cultural_style": "boricua"
}
```

### Log Events

1. **HTTP Request**
   - Method, path, status, duration
   - User ID, IP address

2. **LLM Request**
   - Provider, model, tokens used
   - Success/failure, duration

3. **Content Safety Check**
   - Text length, is_safe, reason
   - Cultural style

4. **Rate Limit Check**
   - User ID, endpoint, limit, used
   - Exceeded (yes/no)

5. **Database Operation**
   - Operation type, table, duration
   - Rows affected

6. **Cache Operation**
   - Operation (GET/SET/DELETE)
   - Key, hit/miss, TTL

---

## Security

### Authentication (TODO)

- **JWT Tokens** - Access & refresh tokens
- **Password Hashing** - bcrypt with salt
- **Token Expiration** - 7 days for access token

### Rate Limiting

| Plan | Daily Limit | Burst Limit |
|------|-------------|-------------|
| Free | 10 suggestions | 3/minute |
| Pro | 100 suggestions | 10/minute |
| Premium | Unlimited | 30/minute |

### Content Safety

1. **Input Validation** - Length, format checks
2. **LLM Safety Check** - Analyze content
3. **Output Filtering** - Block inappropriate responses
4. **Rewrite Option** - Fix unsafe messages

### Data Privacy

- **No permanent storage** of conversation content
- **Local processing** for screenshots
- **Encryption** - TLS for transport, AES for storage
- **GDPR Compliance** - User data deletion on request

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Latency (p95) | < 2s | TBD |
| LLM Latency (p95) | < 3s | TBD |
| Cache Hit Rate | > 40% | N/A (not implemented) |
| Uptime | 99.9% | TBD |
| Error Rate | < 1% | TBD |

---

## Scalability

### Horizontal Scaling

- **Stateless API** - Can run multiple instances
- **Load Balancer** - Distribute traffic (AWS ALB)
- **Database** - PostgreSQL with read replicas
- **Cache** - Redis Cluster for high availability

### Optimization Strategies

1. **Response Caching** - Reduce LLM calls
2. **Prompt Optimization** - Reduce token usage
3. **Connection Pooling** - Database & Redis
4. **Async I/O** - Non-blocking operations
5. **CDN** - Static assets (future)

---

## Monitoring & Observability

### Metrics (Prometheus)

- Request rate, error rate, latency
- LLM tokens used, cost
- Cache hit rate
- Database query performance

### Logs (ELK Stack / CloudWatch)

- Structured JSON logs
- Searchable by user_id, event type
- Retention: 30 days (standard), 90 days (errors)

### Alerts

- API error rate > 5%
- LLM provider downtime
- Database connection failures
- Rate limit exceeded (per user)

---

## Deployment

### Infrastructure

```
AWS EKS (Kubernetes)
│
├─> API Pods (FastAPI)
│   └─> Autoscaling: 2-10 pods
│
├─> PostgreSQL RDS
│   └─> Multi-AZ, automated backups
│
├─> Redis ElastiCache
│   └─> Cluster mode, 2 replicas
│
└─> S3 (Logs, Backups)
```

### CI/CD Pipeline

```
Git Push (main branch)
    │
    ├─> GitHub Actions
    │       • Run tests (pytest)
    │       • Lint code (black, flake8)
    │       • Security scan (bandit)
    │
    ├─> Build Docker Image
    │       • Tag with commit SHA
    │       • Push to ECR
    │
    └─> Deploy to EKS
            • Rolling update
            • Health checks
            • Rollback on failure
```

---

## Future Enhancements

### Phase 2 Features

1. **Voice Mode** - TTS with regional accents
2. **Conversation Trainer** - Gamified learning
3. **Advanced Analytics** - User insights dashboard
4. **Multi-language** - English, Portuguese support

### Technical Improvements

1. **GraphQL API** - More flexible queries
2. **WebSocket** - Real-time suggestions
3. **Vector DB** - Semantic search (Pinecone/Weaviate)
4. **A/B Testing** - Compare prompt effectiveness
5. **ML Models** - Fine-tuned models for Latin markets

---

## Testing Strategy

### Unit Tests
- **Coverage Target**: > 80%
- **Tools**: pytest, pytest-asyncio
- **Mock**: LLM providers, database

### Integration Tests
- **API Endpoints**: Test all routes
- **Database**: Test queries, transactions
- **Cache**: Test Redis operations

### Load Tests
- **Tool**: Locust / k6
- **Scenarios**:
  - 100 concurrent users
  - 1000 requests/minute

### E2E Tests
- **Tool**: Playwright / Cypress
- **Flows**: Complete user journeys

---

## Cost Estimation

### Monthly Costs (1000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI API | ~500K tokens/day | $150 |
| AWS EKS | 3 nodes (t3.medium) | $75 |
| PostgreSQL RDS | db.t3.small | $30 |
| Redis ElastiCache | cache.t3.micro | $15 |
| Data Transfer | 100 GB | $10 |
| **Total** | | **~$280/month** |

### Revenue Model

- **Free**: $0 (10 suggestions/day)
- **Pro**: $4.99/month (100 suggestions/day)
- **Premium**: $9.99/month (unlimited + voice)

---

## Appendix

### API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/openers` | POST | Generate openers |
| `/api/v1/openers/preview` | POST | Preview single opener |
| `/api/v1/openers/examples` | GET | Get examples |
| `/api/v1/responses` | POST | Generate responses |
| `/api/v1/responses/safety-check` | POST | Check content safety |
| `/api/v1/responses/rewrite` | POST | Rewrite message |
| `/api/v1/responses/examples` | GET | Get response examples |

### Cultural Context References

- Puerto Rican Spanish: [PR Slang Dictionary](https://example.com)
- Mexican Spanish: [MX Slang Guide](https://example.com)
- Colombian Spanish: [CO Expressions](https://example.com)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Authors**: Labia.AI Engineering Team
