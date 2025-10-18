# Labia.AI API - Usage Examples

**Version**: 1.0
**Base URL**: `http://localhost:8000`
**API Docs**: `http://localhost:8000/docs`

---

## 🚀 Quick Start

### 1. Start the Server

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn src.main:app --reload
```

### 2. Configure API Keys

Add your LLM API key to `backend/.env`:

```bash
# For OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here

# OR for Anthropic
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

## 📋 API Endpoints Overview

### Health & Status
- `GET /` - Welcome message
- `GET /api/v1/health` - Health check
- `GET /api/v1/ping` - Ping/pong

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token

### AI Features (Main Value!)
- `POST /api/v1/openers` - Generate conversation openers
- `POST /api/v1/openers/preview` - Preview single opener
- `GET /api/v1/openers/examples` - Get examples
- `POST /api/v1/responses` - Generate responses
- `POST /api/v1/responses/safety-check` - Check content safety
- `POST /api/v1/responses/rewrite` - Rewrite inappropriate text
- `GET /api/v1/responses/examples` - Get response examples

### Conversations
- `GET /api/v1/conversations` - List conversations
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/{id}` - Get conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation

---

## 🇵🇷 Conversation Openers Examples

### Example 1: Generate Puerto Rican Style Openers

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/openers" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Me encanta la playa y Bad Bunny 🐰. Trabajo en marketing digital.",
    "interests": ["playa", "música", "marketing"],
    "cultural_style": "boricua",
    "num_suggestions": 3
  }'
```

**Response**:
```json
{
  "success": true,
  "openers": [
    {
      "text": "¡Wepa! Vi que eres fan de Bad Bunny. ¿Cuál es tu canción favorita del último album? Yo quedé loco con 'Tití Me Preguntó' 🎵",
      "tone": "genuino",
      "cultural_style": "boricua",
      "confidence": 0.92
    },
    {
      "text": "Oye, me llamó la atención tu perfil 😏 ¿Marketing digital? Seguro sabes cómo vender... pero ¿sabes janguear en la playa? 🏖️",
      "tone": "coqueto",
      "cultural_style": "boricua",
      "confidence": 0.88
    },
    {
      "text": "Hola! Marketing + Bad Bunny + playa = combo perfecto. ¿Charlamos?",
      "tone": "directo",
      "cultural_style": "boricua",
      "confidence": 0.85
    }
  ],
  "cultural_style": "boricua",
  "suggestions_remaining": null
}
```

### Example 2: Mexican Style (Mexicano)

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/openers" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Amante del café, los tacos y los atardeceres. Ingeniero de software.",
    "interests": ["café", "comida", "tecnología"],
    "cultural_style": "mexicano",
    "num_suggestions": 3
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "openers": [
    {
      "text": "¡Qué onda! Vi que te late el café. ¿Tú eres más de café de olla o espresso? Yo soy team café de olla 100% ☕",
      "tone": "genuino",
      "cultural_style": "mexicano",
      "confidence": 0.90
    },
    {
      "text": "Ingeniero + tacos + atardeceres... wey, ¿eres real o te diseñó ChatGPT? 😂 ¿Cuál es tu taquería favorita?",
      "tone": "coqueto",
      "cultural_style": "mexicano",
      "confidence": 0.87
    },
    {
      "text": "Hola! Ingeniero de software aquí también. ¿Qué stack usas? ¿Y qué taco es el mejor?",
      "tone": "directo",
      "cultural_style": "mexicano",
      "confidence": 0.83
    }
  ],
  "cultural_style": "mexicano",
  "suggestions_remaining": null
}
```

---

## 💬 Conversation Responses Examples

### Example 3: Generate Response to a Message (Early Stage)

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "received_message": "Hola! Me encantó tu perfil. ¿Qué tal tu día?",
    "cultural_style": "boricua",
    "conversation_context": [],
    "shared_interests": ["música", "playa"],
    "relationship_stage": "early",
    "num_suggestions": 3
  }'
```

**Response**:
```json
{
  "success": true,
  "responses": [
    {
      "text": "¡Hola! Gracias, brutal tu perfil también 😊 Mi día fue chevere, trabajando pero ya pensando en el fin de semana. ¿Y el tuyo? ¿Hiciste algo cool?",
      "tone": "genuino",
      "cultural_style": "boricua",
      "follow_up_suggestion": "¿Qué música has estado escuchando?"
    },
    {
      "text": "Wepa! Me alegra que te gustara 😏 Mi día mejoró ahora que me escribiste. ¿Tú eres de playa o de ciudad?",
      "tone": "coqueto",
      "cultural_style": "boricua",
      "follow_up_suggestion": "¿Cuál es tu spot favorito?"
    },
    {
      "text": "¡Hola! Todo bien, gracias. Vi que te gusta la música. ¿Qué estás escuchando últimamente?",
      "tone": "directo",
      "cultural_style": "boricua",
      "follow_up_suggestion": null
    }
  ],
  "cultural_style": "boricua",
  "relationship_stage": "early",
  "suggestions_remaining": null
}
```

### Example 4: Colombian Style (Building Stage)

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "received_message": "Parce, ¿te provoca salir este fin de semana?",
    "cultural_style": "colombiano",
    "conversation_context": [
      "Hola! ¿Cómo vas?",
      "Todo bien parce, ¿y vos?",
      "Bacano! Hablando de planes..."
    ],
    "shared_interests": ["salir", "música"],
    "relationship_stage": "building",
    "num_suggestions": 3
  }'
```

---

## 🔐 Authentication Examples

### Example 5: Register a New User

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123!",
    "name": "Juan Rivera",
    "country": "PR",
    "age_range": "26-35",
    "cultural_style": "boricua"
  }'
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "name": "Juan Rivera",
    "country": "PR",
    "plan": "free",
    "cultural_style": "boricua",
    "is_verified": false,
    "created_at": "2025-10-18T15:30:00Z"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 1800
  }
}
```

### Example 6: Login

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 🛡️ Content Safety Examples

### Example 7: Check Content Safety

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/responses/safety-check" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola, ¿cómo estás? Me gustaría conocerte mejor."
  }'
```

**Response** (Safe):
```json
{
  "is_safe": true,
  "reason": null,
  "suggestion": null
}
```

**Response** (Unsafe):
```json
{
  "is_safe": false,
  "reason": "Contains inappropriate language",
  "suggestion": "Try a more respectful approach"
}
```

### Example 8: Rewrite Inappropriate Content

**Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/responses/rewrite" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "[inappropriate message]",
    "cultural_style": "boricua"
  }'
```

---

## 📚 Get Examples

### Example 9: Get Opener Examples

**Request**:
```bash
curl "http://localhost:8000/api/v1/openers/examples?cultural_style=boricua"
```

**Response**:
```json
{
  "success": true,
  "examples": {
    "boricua": [
      "¡Wepa! Vi tu perfil y quedé...",
      "Oye, me llamó la atención...",
      "Hola! Me gusta tu estilo..."
    ]
  }
}
```

---

## 🎯 Cultural Styles Available

### 🇵🇷 Boricua (Puerto Rico)
- **Slang**: "wepa", "chévere", "brutal", "janguear"
- **Style**: Warm, expressive, playful
- **Best for**: Puerto Rican users, Caribbean vibes

### 🇲🇽 Mexicano (Mexico)
- **Slang**: "wey", "chido", "neta", "al chile"
- **Style**: Friendly, humorous, indirect rejections
- **Best for**: Mexican users, friendly approach

### 🇨🇴 Colombiano (Colombia)
- **Slang**: "parce", "bacano", "chimba", "gonorrea"
- **Style**: Very warm, positive, friendly
- **Best for**: Colombian users, warm connections

### 🇦🇷 Argentino (Argentina)
- **Slang**: "che", "boludo", "copado", "zarpado"
- **Style**: Direct, confident, uses voseo
- **Best for**: Argentine users, direct approach

### 🇪🇸 Español (Spain)
- **Slang**: "tío", "mola", "guay", "flipar"
- **Style**: Direct, uses vosotros
- **Best for**: Spanish users, European Spanish

---

## ⚡ Performance & Caching

### Cache Behavior

**Openers**:
- Cache TTL: 1 hour
- Same bio + interests = cache HIT
- Saves ~$0.02-0.05 per hit

**Responses**:
- Cache TTL: 30 minutes
- Same message + context = cache HIT
- Saves ~$0.01-0.03 per hit

### Cache Headers (Future)
```
X-Cache-Status: HIT | MISS
X-Cache-Key: opener:boricua:abc123...
```

---

## 🔄 Rate Limiting

### Free Plan
- 10 requests/day
- Applies to openers + responses endpoints

### Pro Plan
- 100 requests/day

### Premium Plan
- Unlimited requests

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1697654400
```

---

## 🐛 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid cultural_style. Must be one of: boricua, mexicano, colombiano, argentino, español",
    "details": {}
  },
  "timestamp": 1697654321.123
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily rate limit exceeded. Upgrade to Pro for more requests.",
    "details": {
      "limit": 10,
      "reset_at": 1697654400
    }
  },
  "timestamp": 1697654321.123
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "details": {}
  },
  "timestamp": 1697654321.123
}
```

---

## 📊 Testing with Postman

Import the collection: `docs/Labia.AI-Postman-Collection.json`

Contains 20+ pre-configured requests for all endpoints.

---

## 🎓 Best Practices

1. **Cultural Style**: Always match the user's location
   - Puerto Rico → `boricua`
   - Mexico → `mexicano`
   - etc.

2. **Context**: Provide conversation history for better responses
   - Last 3-5 messages work best
   - More context = better responses

3. **Caching**: Identical requests get cached results
   - Faster response times
   - Lower costs
   - Same quality

4. **Safety**: Use safety-check before sending messages
   - Prevents inappropriate content
   - Better user experience

5. **Rate Limits**: Monitor X-RateLimit headers
   - Upgrade plan when needed
   - Cache reduces API calls

---

## 💡 Tips for Best Results

### For Openers:
- Include bio with personality details
- Add interests array
- Use cultural_style matching target
- Request 3 suggestions for variety

### For Responses:
- Provide conversation context
- Specify relationship_stage accurately
- Include shared_interests when known
- Use follow_up_suggestions

### For Both:
- Start with default cultural_style
- Test different tones
- Monitor cache performance
- Use safety checks

---

**Ready to build something amazing?** 🚀

Check out the full API docs at `/docs` when running locally!
