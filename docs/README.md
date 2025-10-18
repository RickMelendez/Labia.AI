# Labia.AI - Documentation

Welcome to the Labia.AI documentation repository. This folder contains all the technical documentation, diagrams, and guides for the project.

---

## 📚 Documentation Files

### 📋 **Product & Planning**

#### 1. **[checklist.md](./checklist.md)** ✅
Complete development checklist based on the PRD (Product Requirements Document).

**Contents**:
- ✅ Funcionalidades Clave (6 sections)
- ✅ Diseño UI/UX (3 sections)
- ✅ Arquitectura y Tecnología (5 sections)
- ✅ Seguridad y Moderación (2 sections)
- ✅ Base de Datos (2 sections)
- ✅ API y Backend (3 sections)
- ✅ Frontend (3 sections)
- ✅ Testing (3 sections)
- ✅ Deployment (4 sections)
- ✅ Roadmap de Fases (6 phases)

**Progress Summary**:
- Overall: 40% complete
- Backend Core: 70% ✅
- Infrastructure: 40% ⚠️
- Frontend: 0% ❌
- Deployment: 0% ❌

**Use this for**: Sprint planning, feature tracking, progress monitoring

---

### 🏗️ **Architecture & Design**

#### 2. **[system-design.md](./system-design.md)** 📐
Complete system design document with architecture diagrams (in text format).

**Contents**:
- Executive Summary
- High-Level Architecture
- Component Details (API Gateway, LLM, Cultural Context)
- Data Flow Diagrams
- Database Schema
- Caching Strategy (Redis)
- Error Handling
- Logging Strategy
- Security
- Performance Targets
- Scalability
- Monitoring & Observability
- Deployment
- Future Enhancements
- Testing Strategy
- Cost Estimation

**Use this for**: Understanding system architecture, onboarding new developers, technical decisions

---

#### 3. **[uml-diagram.drawio](./uml-diagram.drawio)** 📊
UML Class Diagram showing the domain model and relationships.

**How to open**:
1. Go to [diagrams.net](https://app.diagrams.net/) (formerly draw.io)
2. Click "Open Existing Diagram"
3. Select this file

**Includes**:
- **Domain Layer** (yellow):
  - User, Profile, Conversation, Message, Mission entities
  - Relationships between entities

- **Infrastructure Layer** (green):
  - BaseLLMProvider interface
  - OpenAIProvider, AnthropicProvider implementations
  - AIConversationService
  - PromptTemplates
  - CulturalContext

- **Presentation Layer** (red):
  - API Routers (Openers, Responses)
  - Middleware (ErrorHandler, Logger)

**Use this for**: Understanding entity relationships, domain modeling, code structure

---

#### 4. **[architecture-diagram.drawio](./architecture-diagram.drawio)** 🏛️
System Architecture Diagram showing all layers and components.

**How to open**:
1. Go to [diagrams.net](https://app.diagrams.net/)
2. Click "Open Existing Diagram"
3. Select this file

**Layers**:
1. **Client Layer** (purple):
   - Mobile App (React Native)
   - Web App (Next.js)
   - Desktop App (Future)

2. **API Gateway Layer** (yellow):
   - FastAPI Application
   - Middleware Stack (CORS, Logging, Error Handler, Rate Limiter, Auth)

3. **Application Layer** (green):
   - API Endpoints (/openers, /responses, /safety-check, /auth, /profile, /missions)
   - Services (AI Service, User Service, Auth Service)

4. **Infrastructure Layer** (red):
   - LLM Providers (OpenAI, Anthropic, Prompt Templates)
   - Database (PostgreSQL, Vector Store)
   - Cache (Redis)
   - Monitoring (Logs, Prometheus, Sentry)

5. **Deployment Layer** (gray - future):
   - Docker, Kubernetes, AWS, CI/CD, CDN

**Color Legend**:
- 🟦 Blue = Implemented
- ⬜ Gray (dashed) = Pending/Future
- Solid lines = Active connections
- Dashed lines = Future connections

**Status Indicators**:
- ✅ API Gateway: 70%
- ✅ Application Layer: 65%
- ⚠️ Infrastructure: 40%
- ❌ Client Layer: 0%
- ❌ Deployment: 0%

**Use this for**: System overview, deployment planning, infrastructure decisions

---

### 🧪 **Testing & Quality**

#### 5. **[testing-guide.md](./testing-guide.md)** 🔬
Comprehensive testing documentation.

**Contents**:
- Unit Tests (pytest)
- API Testing with Postman
- Manual Testing Scenarios
- Load Testing (Locust)
- Debugging Tests
- Test Reporting
- CI/CD Integration
- Test Checklist
- Puerto Rico Market Specific Tests
- Test Data Examples
- Quick Start Testing

**Includes**:
- How to run tests
- Coverage requirements (>80%)
- Cultural style testing
- Error scenario testing
- Performance testing

**Use this for**: Quality assurance, test automation, bug prevention

---

#### 6. **[Labia.AI-Postman-Collection.json](./Labia.AI-Postman-Collection.json)** 📮
Complete Postman collection with 20+ API requests.

**How to import**:
1. Open Postman
2. Click "Import"
3. Select this file
4. Set environment variables:
   - `base_url` = http://localhost:8000
   - `api_version` = v1

**Test Suites**:
1. **Health & Status** (3 requests)
   - Health check
   - Ping
   - Root welcome

2. **Conversation Openers** (6 requests)
   - Generate Puerto Rican openers
   - Generate Mexican openers
   - Generate Colombian openers
   - Preview single opener
   - Get examples
   - Error test (invalid style)

3. **Conversation Responses** (4 requests)
   - Early stage responses
   - With context
   - Advanced stage
   - Get examples

4. **Content Safety** (3 requests)
   - Safe content check
   - Unsafe content check
   - Rewrite inappropriate message

5. **Cultural Styles Test Suite** (5 requests)
   - Test all 5 cultural styles

**Use this for**: API testing, integration testing, demo purposes

---

### 📝 **Implementation & Summary**

#### 7. **[implementation-summary.md](./implementation-summary.md)** 📊
Complete summary of what's been built.

**Contents**:
- What We've Built (7 major components)
- Completed Components (detailed breakdown)
- Project Structure
- Quick Start Guide
- API Examples
- Cultural Styles Showcase
- Technical Highlights
- Metrics & Observability
- Security Features
- What's Next (TODO)
- Documentation Index

**Highlights**:
- ✅ 5 Cultural Styles (Boricua-first)
- ✅ AI-Powered Generation (OpenAI & Anthropic)
- ✅ Complete API (8+ endpoints)
- ✅ Error Handling (9 exception types)
- ✅ Structured Logging (JSON format)
- ✅ Comprehensive Tests (25+ tests)
- ✅ API Documentation (Postman + Swagger)
- ✅ System Design Docs

**Use this for**: Quick reference, status updates, handoff documentation

---

## 🎯 Quick Links by Role

### For **Product Managers**:
1. Start with: [checklist.md](./checklist.md) - See progress and roadmap
2. Review: [implementation-summary.md](./implementation-summary.md) - Understand what's built
3. Check: [system-design.md](./system-design.md) - Technical capabilities

### For **Developers**:
1. Start with: [system-design.md](./system-design.md) - Understand architecture
2. Review: [uml-diagram.drawio](./uml-diagram.drawio) - See code structure
3. Test with: [Labia.AI-Postman-Collection.json](./Labia.AI-Postman-Collection.json) - API testing
4. Refer to: [testing-guide.md](./testing-guide.md) - Testing procedures

### For **QA Engineers**:
1. Start with: [testing-guide.md](./testing-guide.md) - Complete testing guide
2. Use: [Labia.AI-Postman-Collection.json](./Labia.AI-Postman-Collection.json) - API tests
3. Reference: [checklist.md](./checklist.md) - Features to test

### For **DevOps Engineers**:
1. Start with: [architecture-diagram.drawio](./architecture-diagram.drawio) - System overview
2. Review: [system-design.md](./system-design.md) - Deployment section
3. Check: [checklist.md](./checklist.md) - Deployment tasks

### For **Designers**:
1. Start with: [checklist.md](./checklist.md) - UI/UX requirements
2. Review: Original PRD in main project folder
3. Check: Implementation status for frontend

---

## 📊 Documentation Statistics

| Document | Pages | Status | Last Updated |
|----------|-------|--------|--------------|
| checklist.md | ~15 | ✅ Complete | 2025-10-18 |
| system-design.md | ~25 | ✅ Complete | 2025-10-18 |
| testing-guide.md | ~12 | ✅ Complete | 2025-10-18 |
| implementation-summary.md | ~20 | ✅ Complete | 2025-10-18 |
| uml-diagram.drawio | 1 diagram | ✅ Complete | 2025-10-18 |
| architecture-diagram.drawio | 1 diagram | ✅ Complete | 2025-10-18 |
| Postman Collection | 20+ requests | ✅ Complete | 2025-10-18 |

**Total Documentation**: ~90 pages + 2 diagrams + API collection

---

## 🔄 How to Update Documentation

### When adding new features:
1. Update [checklist.md](./checklist.md) - Mark as completed
2. Update [implementation-summary.md](./implementation-summary.md) - Add to "What's Built"
3. Update [system-design.md](./system-design.md) if architecture changes
4. Update diagrams if structure changes
5. Add tests to [Postman Collection](./Labia.AI-Postman-Collection.json)

### When modifying architecture:
1. Update [architecture-diagram.drawio](./architecture-diagram.drawio) - Visual changes
2. Update [system-design.md](./system-design.md) - Text description
3. Update [uml-diagram.drawio](./uml-diagram.drawio) if domain model changes

### When deploying:
1. Update [checklist.md](./checklist.md) - Deployment status
2. Update [system-design.md](./system-design.md) - Deployment section
3. Update [architecture-diagram.drawio](./architecture-diagram.drawio) - Deployment layer

---

## 🎨 Diagram Viewing Instructions

### Option 1: Online (Recommended)
1. Go to https://app.diagrams.net/
2. Click "Open Existing Diagram"
3. Select the .drawio file
4. View and edit online

### Option 2: Desktop App
1. Download draw.io desktop from https://github.com/jgraph/drawio-desktop/releases
2. Install the app
3. Open .drawio files directly

### Option 3: VS Code
1. Install "Draw.io Integration" extension
2. Open .drawio files in VS Code
3. Edit diagrams inline

---

## 📧 Contact & Support

For questions about documentation:
- **Project Lead**: [Your Name]
- **Technical Lead**: [Your Name]
- **Documentation**: This README

For technical issues:
- See [implementation-summary.md](./implementation-summary.md) - "What's Next" section
- Check [checklist.md](./checklist.md) - Blockers section

---

## 📜 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-18 | Initial documentation complete | Claude Code |
| | | - All 7 documents created | |
| | | - UML & Architecture diagrams | |
| | | - Postman collection | |
| | | - 40% implementation complete | |

---

**Next Documentation Update**: After completing Database + Auth implementation (Sprint 1-2)

---

> 🇵🇷 **¡Wepa!** Built with ❤️ for Puerto Rico and Latin America
