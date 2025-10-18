# Labia.AI - Testing Guide

## Overview

This guide covers all testing approaches for Labia.AI, including unit tests, integration tests, API testing with Postman, and manual testing scenarios.

---

## 🧪 Unit Tests

### Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test file
pytest tests/test_ai_service.py

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "test_opener"
```

### Test Structure

```
backend/tests/
├── test_ai_service.py          # AI service tests
├── test_openers_api.py         # Openers endpoint tests
├── test_responses_api.py       # Responses endpoint tests (TODO)
├── test_llm_provider.py        # LLM provider tests (TODO)
├── test_prompt_templates.py    # Prompt template tests (TODO)
└── conftest.py                 # Pytest fixtures
```

### Coverage Report

```bash
# Generate HTML coverage report
pytest --cov=src --cov-report=html tests/

# Open in browser
open htmlcov/index.html
```

**Target Coverage**: > 80%

---

## 🔌 API Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Select `docs/Labia.AI-Postman-Collection.json`
4. Collection will be imported with all endpoints

### Environment Setup

1. Create new environment: **Labia.AI Local**
2. Add variables:
   ```
   base_url = http://localhost:8000
   api_version = v1
   access_token = (leave empty for now)
   ```
3. Save and select environment

### Test Suites

#### 1. Health & Status Tests

✅ **Health Check**
```
GET {{base_url}}/api/{{api_version}}/health
Expected: 200 OK
```

✅ **Ping**
```
GET {{base_url}}/api/{{api_version}}/ping
Expected: {"message": "pong"}
```

#### 2. Openers Tests

✅ **Generate Puerto Rican Openers**
```json
POST {{base_url}}/api/{{api_version}}/openers
{
  "bio": "Me encanta la playa y el reggaeton. Fan de Bad Bunny 🐰",
  "interests": ["playa", "música", "deportes"],
  "cultural_style": "boricua",
  "num_suggestions": 3
}
```

Expected Response:
```json
{
  "success": true,
  "openers": [
    {
      "text": "¡Wepa! Vi que eres fan de Bad Bunny...",
      "tone": "genuino",
      "cultural_style": "boricua",
      "confidence": 0.85
    },
    // ... 2 more openers
  ],
  "cultural_style": "boricua"
}
```

✅ **Test All Cultural Styles**

Run the **Cultural Styles Test Suite** folder in Postman to test all 5 styles:
- Boricua (Puerto Rican) - Uses "wepa", "chévere", "brutal"
- Mexicano - Uses "wey", "chido", "neta"
- Colombiano - Uses "parce", "chimba", "bacano"
- Argentino - Uses "che", "boludo", "copado"
- Español - Uses "tío/tía", "guay", "mola"

✅ **Error Test - Invalid Style**
```json
POST {{base_url}}/api/{{api_version}}/openers
{
  "bio": "Test",
  "interests": [],
  "cultural_style": "invalid_style",
  "num_suggestions": 3
}
```
Expected: 400 Bad Request with error message

#### 3. Responses Tests

✅ **Generate Responses - Early Stage**
```json
POST {{base_url}}/api/{{api_version}}/responses
{
  "received_message": "Hola! Me gustó tu perfil. ¿Cómo estuvo tu día?",
  "cultural_style": "boricua",
  "relationship_stage": "early",
  "num_suggestions": 3
}
```

✅ **Generate Responses with Context**
```json
POST {{base_url}}/api/{{api_version}}/responses
{
  "received_message": "Me encanta tu sentido del humor!",
  "cultural_style": "boricua",
  "conversation_context": [
    "Hola! ¿Cómo estás?",
    "Todo bien! Vi que te gusta la música"
  ],
  "shared_interests": ["música", "playa"],
  "relationship_stage": "building",
  "num_suggestions": 3
}
```

#### 4. Content Safety Tests

✅ **Safe Content Check**
```json
POST {{base_url}}/api/{{api_version}}/responses/safety-check
{
  "text": "Hola, ¿cómo estás? Me gustaría conocerte mejor."
}
```
Expected: `{"is_safe": true}`

✅ **Unsafe Content Check**
```json
POST {{base_url}}/api/{{api_version}}/responses/safety-check
{
  "text": "[Insert inappropriate content for testing]"
}
```
Expected: `{"is_safe": false, "reason": "..."}`

✅ **Rewrite Inappropriate Message**
```json
POST {{base_url}}/api/{{api_version}}/responses/rewrite?cultural_style=boricua
{
  "text": "[Inappropriate message to rewrite]"
}
```
Expected: Respectful rewritten version

---

## 🧑‍💻 Manual Testing Scenarios

### Scenario 1: First-Time Puerto Rican User

**Goal**: Test complete flow for a Puerto Rican user looking for conversation help

1. **Generate opener for Bad Bunny fan**
   - Bio: "Amante de Bad Bunny, la playa y el mofongo 🐰🏖️"
   - Expected: Openers use "wepa", reference reggaeton/playa
   - Verify: 3 different tones (genuino, coqueto, directo)

2. **Generate response to received message**
   - Message: "¡Wepa! También soy fan de Benito. ¿Viste su último concierto?"
   - Expected: Response continues Puerto Rican style
   - Verify: Natural flow, uses local expressions

3. **Test content safety**
   - Try inappropriate opener
   - Expected: Blocked or rewritten

### Scenario 2: Mexican User

**Goal**: Verify Mexican cultural style works correctly

1. **Generate opener for taco lover**
   - Bio: "Taquero de corazón 🌮 Fan de los tacos al pastor"
   - Style: mexicano
   - Expected: Uses "wey", "chido", "al chile"

2. **Compare with Puerto Rican style**
   - Same bio, different style
   - Expected: Different slang, tone

### Scenario 3: Multi-Stage Conversation

**Goal**: Test different relationship stages

1. **Early stage**
   - Message: "Hola"
   - Stage: early
   - Expected: Friendly, asks questions

2. **Building stage**
   - Message: "Me gusta hablar contigo"
   - Stage: building
   - Expected: More personal, flirty

3. **Advanced stage**
   - Message: "¿Nos vemos pronto?"
   - Stage: advanced
   - Expected: Confident, suggests meeting

### Scenario 4: Error Handling

**Goal**: Test system resilience

1. **Invalid cultural style**
   - Style: "invalid"
   - Expected: 400 error with clear message

2. **Bio too short**
   - Bio: "Hi"
   - Expected: 422 validation error

3. **Missing API key** (if not configured)
   - Expected: 500 error (graceful)

---

## 🔥 Load Testing

### Using Locust

Create `locustfile.py`:

```python
from locust import HttpUser, task, between

class LabiaAIUser(HttpUser):
    wait_time = between(1, 3)
    host = "http://localhost:8000"

    @task(3)
    def generate_opener(self):
        self.client.post("/api/v1/openers", json={
            "bio": "Me gusta la playa y la música",
            "interests": ["playa", "música"],
            "cultural_style": "boricua",
            "num_suggestions": 3
        })

    @task(2)
    def generate_response(self):
        self.client.post("/api/v1/responses", json={
            "received_message": "Hola, ¿cómo estás?",
            "cultural_style": "boricua",
            "relationship_stage": "early",
            "num_suggestions": 3
        })

    @task(1)
    def health_check(self):
        self.client.get("/api/v1/health")
```

Run load test:
```bash
locust -f locustfile.py

# Open http://localhost:8089
# Configure: 100 users, 10 spawn rate
```

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Response Time (p95) | < 3s | LLM latency included |
| Request Rate | 100 req/s | Single instance |
| Error Rate | < 1% | Excluding rate limits |
| Availability | 99.9% | With proper monitoring |

---

## 🐛 Debugging Tests

### Pytest Options

```bash
# Stop on first failure
pytest -x

# Show print statements
pytest -s

# Run last failed tests
pytest --lf

# Run specific test
pytest tests/test_ai_service.py::TestAIConversationService::test_generate_openers_success

# Debug with pdb
pytest --pdb
```

### Logging During Tests

```python
# In test file
import logging
logging.basicConfig(level=logging.DEBUG)

# Or use caplog fixture
def test_something(caplog):
    caplog.set_level(logging.DEBUG)
    # ... test code
    assert "Expected log message" in caplog.text
```

---

## 📊 Test Reporting

### Generate Reports

```bash
# JUnit XML (for CI/CD)
pytest --junitxml=test-results.xml

# HTML Report
pytest --html=test-report.html --self-contained-html

# Coverage Report
pytest --cov=src --cov-report=html --cov-report=term
```

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=src --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## ✅ Test Checklist

### Before Each Release

- [ ] All unit tests pass (`pytest`)
- [ ] Coverage > 80% (`pytest --cov`)
- [ ] All Postman tests pass
- [ ] Manual test scenarios completed
- [ ] Load test passed (100 concurrent users)
- [ ] Error scenarios tested
- [ ] Content safety filters verified
- [ ] All cultural styles tested
- [ ] API documentation updated
- [ ] Logs reviewed for errors

### Puerto Rico Market Specific Tests

- [ ] Puerto Rican slang used correctly ("wepa", "chévere", "brutal")
- [ ] Tone matches Boricua communication style
- [ ] Reggaeton references work naturally
- [ ] Beach culture references appropriate
- [ ] "Janguear" usage correct
- [ ] Diminutives used appropriately (-ito/-ita)

---

## 🎯 Test Data Examples

### Puerto Rican Bios for Testing

```python
PUERTO_RICAN_BIOS = [
    "Me encanta la playa de Luquillo y el mofongo 🏖️",
    "Fan de Bad Bunny y Daddy Yankee 🐰",
    "Jangueando siempre, buscando una pana chévere",
    "Trabajo en San Juan, amo el coquito y la música",
    "Fotógrafo del Viejo San Juan 📸"
]
```

### Mexican Bios for Testing

```python
MEXICAN_BIOS = [
    "Taquero apasionado, busco wey/weyita con buen humor 🌮",
    "Fan de los tacos al pastor y las películas de terror",
    "Chilango de corazón, amo la ciudad y las quesadillas"
]
```

### Colombian Bios for Testing

```python
COLOMBIAN_BIOS = [
    "Parcero salsero, amo bailar y el café ☕",
    "De Medellín, buscando llave para rumbear",
    "Chef aficionado, hago la mejor bandeja paisa"
]
```

---

## 🚀 Quick Start Testing

```bash
# 1. Start backend
cd backend
uvicorn src.main:app --reload

# 2. Run unit tests (separate terminal)
pytest -v

# 3. Test with Postman
# Import collection and run tests

# 4. Manual test
curl -X POST "http://localhost:8000/api/v1/openers" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Me encanta la playa y Bad Bunny 🐰",
    "interests": ["playa", "música"],
    "cultural_style": "boricua",
    "num_suggestions": 3
  }'
```

---

## 📝 Notes

- Always test with realistic Puerto Rican / Latin data
- Verify cultural appropriateness of generated content
- Test content safety filters thoroughly
- Monitor LLM token usage during testing
- Keep test API keys separate from production

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
