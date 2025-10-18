# Labia.AI - Development Checklist

> Basado en el PRD (Product Requirements Document)

**Última actualización**: 2025-10-18
**Estado general**: 40% completado

---

## 📋 Índice

- [1. Funcionalidades Clave](#1-funcionalidades-clave)
- [2. Diseño UI/UX](#2-diseño-uiux)
- [3. Arquitectura y Tecnología](#3-arquitectura-y-tecnología)
- [4. Seguridad y Moderación](#4-seguridad-y-moderación)
- [5. Base de Datos](#5-base-de-datos)
- [6. API y Backend](#6-api-y-backend)
- [7. Frontend](#7-frontend)
- [8. Testing](#8-testing)
- [9. Deployment](#9-deployment)
- [10. Roadmap de Fases](#10-roadmap-de-fases)

---

## 1. Funcionalidades Clave

### 1.1 Generador de Aperturas
- [x] **Entrada**: Biografía o descripción de la otra persona
- [x] **Salida**: Tres aperturas distintas
  - [x] Genuina/amistosa
  - [x] Coqueta/humorística
  - [x] Directa/concisa
- [x] **Proceso**: Análisis de intereses, fotos y palabras clave
- [x] **Características adicionales**:
  - [x] Sugerencia de dos "follow-ups" (parcial - en prompts)
  - [x] Modo "seguro" que filtra frases inadecuadas
- [ ] Copiar texto de perfiles de Tinder/Bumble/Instagram directamente
- [ ] Análisis de fotos (OCR/Vision API)

**Estado**: ✅ 80% - Core completado, falta integración con apps

---

### 1.2 Generador de Respuestas
- [x] **Entrada**: Mensaje recibido o captura de pantalla
- [x] **Análisis contextual**: Tono, hora del mensaje, relación entre interlocutores
- [x] **Salida**: Tres respuestas con distintos tonos
  - [x] Genuino
  - [x] Ingenioso/coqueto
  - [x] Directo
- [x] **Control de tono**: Intensidad del coqueteo, nivel de humor, número de emojis
- [x] **Opción de reescritura**: Ajustar longitud, romanticismo
- [ ] Pregunta abierta opcional para mantener conversación
- [ ] Análisis de capturas de pantalla (OCR)
- [ ] Referencias a intereses compartidos automáticas

**Estado**: ✅ 75% - Core completado, falta OCR y mejoras

---

### 1.3 Perfiles y Presets
- [x] **Estilos por país**:
  - [x] Boricua (Puerto Rico)
  - [x] Mexicano
  - [x] Colombiano
  - [x] Argentino
  - [x] Español (España)
- [x] **Presets de tono**: Chill, elegante, intelectual, playero, minimalista
- [ ] **Entrenamiento inicial**: Preguntas rápidas para crear perfil
  - [ ] Edad deseada de interlocutores
  - [ ] Intereses principales
  - [ ] Nivel de coqueteo
- [ ] Guardar presets personalizados del usuario
- [ ] Ajuste de ratio de emojis por preset

**Estado**: ⚠️ 60% - Estilos creados, falta personalización de usuario

---

### 1.4 Entrenador de Labia (Módulo de aprendizaje)
- [ ] **Misiones diarias**: Ejercicios con situaciones reales
  - [ ] Contestar mensaje con doble sentido
  - [ ] Iniciar conversación en un bar
  - [ ] Mantener conversación interesante
- [ ] **Puntuación y logros**:
  - [ ] "Rookie de labia"
  - [ ] "Pro del piquete"
  - [ ] "Master del flow"
- [ ] **Feedback de IA**: Análisis de calidad de respuestas
- [ ] **Sistema de progreso**: Tracking de mejoras
- [ ] **Desbloqueo de niveles**

**Estado**: ❌ 0% - No iniciado (Fase 2)

---

### 1.5 Modo Cultural y Traducción
- [x] **Traducción entre dialectos**: Mantener tono adecuado (parcial en prompts)
- [ ] **Ejemplos de expresiones locales**: Equivalentes en otros países
- [ ] **Traductor en tiempo real**: Español ↔ Inglés
- [ ] **Sugerencias de jerga local**: Basadas en contexto

**Estado**: ⚠️ 30% - Base cultural creada, falta traductor

---

### 1.6 Voice Mode (Premium)
- [ ] **TTS (Text-to-Speech)**: Generar voz natural
- [ ] **Acentos regionales**: Adaptar al país elegido
  - [ ] Acento puertorriqueño
  - [ ] Acento mexicano
  - [ ] Acento colombiano
  - [ ] Acento argentino
  - [ ] Acento español
- [ ] **Preview de voz**: Escuchar antes de enviar
- [ ] **Integración con Voice API**: OpenAI TTS o ElevenLabs

**Estado**: ❌ 0% - No iniciado (Fase 3)

---

## 2. Diseño UI/UX

### 2.1 Principios Generales de UX
- [x] **Simplificar interfaz**: Solo navegación y controles necesarios
- [x] **Optimizar experiencias clave**: 80% del tiempo en pantalla de chat
- [x] **Diseño modular y reutilizable**: Componentes reusables
- [x] **Micro-interacciones**: Animaciones apropiadas (diseñado)
- [ ] **Espacio eficiente**: Navegación intuitiva
- [ ] **Diseño para usuarios activos**: Completar acciones con una mano
- [ ] **Búsqueda y filtrado**: Buscador en lista de chats

**Estado**: ⚠️ 50% - Diseñado en PRD, pendiente implementación

---

### 2.2 Mejores Prácticas de Diseño de Chat
- [ ] **Pantalla de lista de chats (Chat index)**:
  - [ ] Vista previa del último mensaje y hora
  - [ ] Campo de búsqueda para filtrar contactos
  - [ ] Acciones rápidas (silenciar, eliminar, marcar como leído)
  - [ ] Indicadores de presencia
  - [ ] Contador de mensajes no leídos
  - [ ] Resaltar conversaciones con actividad reciente

- [ ] **Pantalla de chat**:
  - [ ] Distinguir claramente quién envía cada mensaje
  - [ ] Hora de envío y recibos de lectura
  - [ ] Bordes redondeados en burbujas
  - [ ] Alineamiento coherente (izquierda/derecha)
  - [ ] Micro-interacciones (envío/recepción, indicador de escritura)
  - [ ] Agrupar mensajes del mismo tiempo
  - [ ] Responder a mensajes específicos
  - [ ] Previsualización de archivos
  - [ ] Reacciones a mensajes

**Estado**: ❌ 0% - No iniciado (Frontend)

---

### 2.3 Wireframes y Diseño Visual
- [x] **Wireframe conceptual**: Creado en PRD
- [ ] **Wireframes de alta fidelidad**: Figma/Sketch
- [ ] **Paletas de colores**: Vibrant gradients latinos
- [ ] **Cartas y burbujas redondeadas**: Estilo amigable
- [ ] **Iconos y emoticonos**: Elementos divertidos
- [ ] **Tipografía amigable**: Fuentes legibles
- [ ] **Dark mode**: Soporte para modo oscuro
- [ ] **Responsive design**: Adaptable a diferentes pantallas

**Estado**: ⚠️ 20% - Solo wireframe conceptual

---

## 3. Arquitectura y Tecnología

### 3.1 Frontend
- [ ] **React Native**: App móvil iOS/Android
  - [ ] Configuración inicial
  - [ ] Navegación (React Navigation)
  - [ ] State management (Zustand/Redux)
  - [ ] Componentes base
- [ ] **Internacionalización (i18n)**: i18next
- [ ] **Accesibilidad**:
  - [ ] Soporte para lectores de pantalla
  - [ ] Navegación por teclado
  - [ ] Tamaño de fuente ajustable
  - [ ] Alto contraste
- [ ] **UI Library**: React Native Paper / NativeWind

**Estado**: ❌ 0% - No iniciado

---

### 3.2 Backend
- [x] **FastAPI (Python)**: Framework principal
- [x] **Endpoints REST**:
  - [x] `/openers` - Generar aperturas
  - [x] `/replies` - Generar respuestas
  - [x] `/feedback` - Feedback de usuario
  - [x] `/profile` - Perfil de usuario
  - [ ] `/missions` - Misiones gamificadas
  - [ ] `/auth` - Autenticación
- [x] **Motor de IA (LLMProvider)**:
  - [x] Capa de abstracción
  - [x] Soporte OpenAI
  - [x] Soporte Anthropic
  - [x] Prompts en base de datos (diseñado)
- [ ] **Rate Limiting**: Control por plan
- [ ] **Webhooks**: Para eventos externos

**Estado**: ✅ 70% - Core completado, falta auth y gamificación

---

### 3.3 Almacenamiento
- [ ] **PostgreSQL**: Base de datos principal
  - [ ] Configuración y conexión
  - [ ] Modelos SQLAlchemy
  - [ ] Migraciones Alembic
- [ ] **Vector Store (pgvector/Chroma)**:
  - [ ] Almacenar embeddings de conversaciones
  - [ ] Búsqueda semántica
  - [ ] Estilos de usuario
- [ ] **Redis Cache**:
  - [ ] Caché de respuestas generadas
  - [ ] Sesiones de usuario
  - [ ] Rate limiting
- [ ] **S3/Cloud Storage**: Imágenes y archivos

**Estado**: ❌ 5% - Solo esquemas diseñados

---

### 3.4 Seguridad
- [x] **Autenticación JWT**: Diseñado
  - [ ] Implementado
  - [ ] Refresh tokens
- [ ] **Cifrado de tokens**: TLS
- [x] **Filtros de contenido**: Content safety
- [ ] **Protección de menores**: Verificación de edad
- [ ] **No almacenar conversaciones sensibles**: Solo metadatos
- [ ] **GDPR compliance**: Data deletion

**Estado**: ⚠️ 40% - Safety filters ok, falta auth completo

---

### 3.5 Infraestructura
- [ ] **Docker**: Containerización
  - [ ] Dockerfile backend
  - [ ] Docker Compose (dev)
- [ ] **Kubernetes (EKS)**: Orchestración
- [ ] **Monitorización**:
  - [ ] Prometheus (métricas)
  - [ ] Grafana (dashboards)
  - [ ] Sentry (error tracking)
- [ ] **CI/CD**:
  - [ ] GitHub Actions
  - [ ] Automated tests
  - [ ] Deployment pipeline

**Estado**: ❌ 0% - No iniciado

---

## 4. Seguridad y Moderación

### 4.1 Filtros de Contenido
- [x] **Filtro de contenido ofensivo y NSFW**:
  - [x] Detección de contenido inapropiado
  - [x] Bloqueo automático
  - [x] Sugerencia de alternativa segura
- [x] **Modo de respeto**: Reescribir mensajes inapropiados
- [ ] **Lista negra de palabras**: Por idioma y cultura
- [ ] **Análisis de imágenes**: Detectar contenido NSFW en screenshots

**Estado**: ✅ 80% - Core completado, falta image analysis

---

### 4.2 Protección de Menores y Privacidad
- [ ] **Verificación de edad**: Durante registro
- [ ] **Bloqueo de contenido para menores**
- [x] **Encriptación local**: Procesar en dispositivo (diseñado)
- [ ] **No almacenar conversaciones permanentemente**
- [ ] **Cumplimiento GDPR/CCPA**:
  - [ ] Data export
  - [ ] Data deletion
  - [ ] Privacy policy

**Estado**: ⚠️ 20% - Solo diseño conceptual

---

## 5. Base de Datos

### 5.1 Tablas Principales
- [ ] **users**:
  - [ ] id, email, hashed_password, country
  - [ ] plan, tone_default
  - [ ] daily_suggestions_used, last_suggestion_reset
  - [ ] created_at
- [ ] **profiles**:
  - [ ] id, user_id, name, age_range
  - [ ] interests, tone, emoji_ratio
  - [ ] created_at
- [ ] **conversations**:
  - [ ] id, user_id, title, created_at
- [ ] **messages**:
  - [ ] id, conversation_id, role, text
  - [ ] tone, lang, timestamp
- [ ] **missions**:
  - [ ] id, title, description, difficulty
  - [ ] xp_reward
- [ ] **user_missions**:
  - [ ] id, user_id, mission_id, status
  - [ ] score, completed_at
- [ ] **feedback**:
  - [ ] id, message_id, user_id, thumb_up
  - [ ] note
- [ ] **safety_logs**:
  - [ ] id, user_id, reason, text
  - [ ] timestamp

**Estado**: ❌ 0% - Esquemas definidos, no implementados

---

### 5.2 Migraciones
- [ ] **Alembic setup**: Configuración inicial
- [ ] **Migración inicial**: Crear todas las tablas
- [ ] **Scripts de seed**: Data inicial
- [ ] **Backup strategy**: Automated backups

**Estado**: ❌ 0% - No iniciado

---

## 6. API y Backend

### 6.1 Endpoints Core (Implementados)
- [x] `GET /api/v1/health` - Health check
- [x] `POST /api/v1/openers` - Generar aperturas
- [x] `POST /api/v1/openers/preview` - Preview de apertura
- [x] `GET /api/v1/openers/examples` - Ejemplos
- [x] `POST /api/v1/responses` - Generar respuestas
- [x] `POST /api/v1/responses/safety-check` - Verificar seguridad
- [x] `POST /api/v1/responses/rewrite` - Reescribir mensaje
- [x] `GET /api/v1/responses/examples` - Ejemplos

**Estado**: ✅ 100% - Completado

---

### 6.2 Endpoints Pendientes
- [ ] **Autenticación**:
  - [ ] `POST /api/v1/auth/register` - Registro
  - [ ] `POST /api/v1/auth/login` - Login
  - [ ] `POST /api/v1/auth/refresh` - Refresh token
  - [ ] `POST /api/v1/auth/logout` - Logout
  - [ ] `POST /api/v1/auth/forgot-password` - Recuperar contraseña

- [ ] **Perfil de Usuario**:
  - [ ] `GET /api/v1/profile` - Obtener perfil
  - [ ] `PUT /api/v1/profile` - Actualizar perfil
  - [ ] `PUT /api/v1/profile/preferences` - Preferencias
  - [ ] `DELETE /api/v1/profile` - Eliminar cuenta

- [ ] **Conversaciones**:
  - [ ] `GET /api/v1/conversations` - Listar conversaciones
  - [ ] `POST /api/v1/conversations` - Crear conversación
  - [ ] `GET /api/v1/conversations/{id}` - Obtener conversación
  - [ ] `DELETE /api/v1/conversations/{id}` - Eliminar

- [ ] **Misiones (Gamificación)**:
  - [ ] `GET /api/v1/missions` - Listar misiones
  - [ ] `GET /api/v1/missions/daily` - Misiones diarias
  - [ ] `POST /api/v1/missions/{id}/complete` - Completar misión
  - [ ] `GET /api/v1/missions/progress` - Progreso del usuario

- [ ] **Feedback**:
  - [ ] `POST /api/v1/feedback` - Enviar feedback
  - [ ] `GET /api/v1/feedback/stats` - Estadísticas

**Estado**: ❌ 0% - No iniciado

---

### 6.3 Servicios de Dominio
- [x] **AIConversationService**: Generación de contenido
- [ ] **UserService**: Gestión de usuarios
- [ ] **AuthService**: Autenticación y autorización
- [ ] **MissionService**: Gamificación
- [ ] **FeedbackService**: Análisis de feedback
- [ ] **CacheService**: Gestión de caché Redis

**Estado**: ⚠️ 20% - Solo AI service

---

## 7. Frontend

### 7.1 Pantallas Principales
- [ ] **Onboarding**:
  - [ ] Splash screen
  - [ ] Tutorial (2-3 slides)
  - [ ] Selección de país y tono
  - [ ] Preguntas de perfil inicial

- [ ] **Chat Assistant** (pantalla principal):
  - [ ] Lista de conversaciones
  - [ ] Campo de entrada (bio/mensaje)
  - [ ] Área de sugerencias generadas
  - [ ] Selector de tono
  - [ ] Botones de acción (copiar, regenerar)

- [ ] **Entrenador**:
  - [ ] Misiones diarias
  - [ ] Progreso gamificado
  - [ ] Indicador de dificultad
  - [ ] Botón para comenzar misión

- [ ] **Perfil**:
  - [ ] Historial de conversaciones
  - [ ] Editar preferencias
  - [ ] Configuración de suscripción
  - [ ] Estadísticas de uso

**Estado**: ❌ 0% - No iniciado

---

### 7.2 Componentes Reutilizables
- [ ] **MessageBubble**: Burbuja de mensaje
- [ ] **SuggestionCard**: Tarjeta de sugerencia
- [ ] **ToneSelector**: Selector de tono
- [ ] **CulturalStylePicker**: Selector de estilo cultural
- [ ] **MissionCard**: Tarjeta de misión
- [ ] **ProgressBar**: Barra de progreso
- [ ] **LoadingIndicator**: Indicador de carga
- [ ] **ErrorMessage**: Mensaje de error
- [ ] **BottomSheet**: Sheet modal

**Estado**: ❌ 0% - No iniciado

---

### 7.3 Navegación
- [ ] **Bottom Tab Navigation**:
  - [ ] Inicio/Chat
  - [ ] Entrenador
  - [ ] Perfil
- [ ] **Stack Navigation**: Para sub-pantallas
- [ ] **Deep Linking**: Para notificaciones
- [ ] **Gestos**: Swipe, pull-to-refresh

**Estado**: ❌ 0% - No iniciado

---

## 8. Testing

### 8.1 Backend Testing
- [x] **Unit Tests**: 25+ tests
  - [x] AI Service (15 tests)
  - [x] API Endpoints (10 tests)
  - [ ] User Service
  - [ ] Auth Service
  - [ ] Mission Service
- [x] **Test Coverage**: > 80% (parcial)
- [x] **Mocking**: LLM providers, database
- [ ] **Integration Tests**: API + DB
- [ ] **Load Tests**: Locust/k6

**Estado**: ✅ 60% - Core testing ok, falta full coverage

---

### 8.2 Frontend Testing
- [ ] **Unit Tests**: Components
- [ ] **Integration Tests**: Screens
- [ ] **E2E Tests**: Playwright/Detox
- [ ] **Visual Regression**: Chromatic

**Estado**: ❌ 0% - No iniciado

---

### 8.3 API Testing
- [x] **Postman Collection**: 20+ requests
- [x] **Automated Tests**: Postman scripts
- [ ] **Performance Tests**: Response times
- [ ] **Security Tests**: OWASP Top 10

**Estado**: ✅ 70% - Collection ok, falta automation

---

## 9. Deployment

### 9.1 Containerización
- [ ] **Dockerfile**: Backend
- [ ] **Dockerfile**: Frontend (si web)
- [ ] **Docker Compose**: Dev environment
- [ ] **.dockerignore**: Optimización

**Estado**: ❌ 0% - No iniciado

---

### 9.2 Cloud Infrastructure
- [ ] **AWS Setup**:
  - [ ] EKS Cluster
  - [ ] RDS PostgreSQL
  - [ ] ElastiCache Redis
  - [ ] S3 Buckets
  - [ ] CloudFront CDN
- [ ] **Terraform/CloudFormation**: Infrastructure as Code
- [ ] **Networking**:
  - [ ] VPC configuration
  - [ ] Security groups
  - [ ] Load balancer

**Estado**: ❌ 0% - No iniciado

---

### 9.3 CI/CD
- [ ] **GitHub Actions**:
  - [ ] Test pipeline
  - [ ] Build pipeline
  - [ ] Deploy pipeline
- [ ] **Environments**:
  - [ ] Development
  - [ ] Staging
  - [ ] Production
- [ ] **Automated rollbacks**
- [ ] **Blue/green deployment**

**Estado**: ❌ 0% - No iniciado

---

### 9.4 Monitoring & Observability
- [ ] **Prometheus**: Metrics
- [ ] **Grafana**: Dashboards
- [ ] **Sentry**: Error tracking
- [ ] **CloudWatch**: AWS logs
- [ ] **Uptime monitoring**: Pingdom/UptimeRobot
- [ ] **Alerts**: PagerDuty/Slack

**Estado**: ❌ 0% - No iniciado

---

## 10. Roadmap de Fases

### Fase 1: Preproducción (2 semanas)
- [x] Diseño de marca (conceptual en PRD)
- [x] Elaboración de prompts
- [x] Definición de requerimientos
- [ ] Diseño UI completo en Figma
- [ ] Logo y paleta de colores final

**Estado**: ✅ 70% - Backend ready, falta diseño UI

---

### Fase 2: Arquitectura & Backend (3 semanas)
- [x] Desarrollo de endpoints `/openers`, `/replies`
- [x] Integración con LLM
- [x] Diseño de base de datos
- [ ] `/profile`, `/missions` endpoints
- [ ] Implementación de base de datos
- [ ] Sistema de autenticación

**Estado**: ✅ 65% - Core endpoints ok, falta DB y auth

---

### Fase 3: Frontend MVP (4 semanas)
- [ ] Construcción de app móvil (React Native/Flutter)
- [ ] Pantalla de inicio
- [ ] Pantalla de chat
- [ ] Pantalla de perfil
- [ ] Integración con API
- [ ] Funcionalidades de apertura y respuesta

**Estado**: ❌ 0% - No iniciado

---

### Fase 4: Entrenador & Gamificación (2 semanas)
- [ ] Módulo de misiones
- [ ] Sistema de puntos y logros
- [ ] Interfaz de progreso
- [ ] Feedback de IA

**Estado**: ❌ 0% - No iniciado

---

### Fase 5: Beta y Feedback (2 semanas)
- [ ] Lanzamiento a grupo limitado de usuarios
- [ ] Recolección de feedback
- [ ] Iteración de prompts y UI
- [ ] Bug fixes

**Estado**: ❌ 0% - No iniciado

---

### Fase 6: Lanzamiento Público (1 semana)
- [ ] Despliegue en App Store
- [ ] Despliegue en Google Play
- [ ] Campaña de marketing
- [ ] Monitoring y soporte

**Estado**: ❌ 0% - No iniciado

---

## 📊 Resumen por Categoría

| Categoría | Completado | En Progreso | Pendiente | Total | % |
|-----------|------------|-------------|-----------|-------|---|
| **Funcionalidades Core** | 3 | 2 | 1 | 6 | 50% |
| **UI/UX** | 1 | 1 | 3 | 5 | 20% |
| **Backend API** | 8 | 0 | 12 | 20 | 40% |
| **Database** | 0 | 0 | 8 | 8 | 0% |
| **Frontend** | 0 | 0 | 15 | 15 | 0% |
| **Testing** | 2 | 1 | 4 | 7 | 30% |
| **Security** | 2 | 1 | 5 | 8 | 25% |
| **Deployment** | 0 | 0 | 10 | 10 | 0% |
| **Gamificación** | 0 | 0 | 5 | 5 | 0% |

---

## 🎯 Próximos Pasos Inmediatos

### Sprint Actual (Semana 1-2)

**Prioridad Alta** 🔴:
1. [ ] Implementar autenticación JWT completa
2. [ ] Configurar PostgreSQL y crear modelos SQLAlchemy
3. [ ] Implementar endpoints de perfil de usuario
4. [ ] Crear primeras migraciones Alembic

**Prioridad Media** 🟡:
5. [ ] Configurar Redis para caché
6. [ ] Implementar rate limiting por usuario
7. [ ] Crear tests de integración (API + DB)
8. [ ] Docker setup para desarrollo

**Prioridad Baja** 🟢:
9. [ ] Wireframes de alta fidelidad en Figma
10. [ ] Investigar React Native vs Flutter para frontend

---

## 📈 Métricas de Progreso

**Overall Progress**: 40% ████████░░░░░░░░░░░░

- ✅ **Backend Core**: 70% ██████████████░░░░░░
- ⚠️ **Database**: 5% █░░░░░░░░░░░░░░░░░░░
- ⚠️ **Security**: 40% ████████░░░░░░░░░░░░
- ❌ **Frontend**: 0% ░░░░░░░░░░░░░░░░░░░░
- ⚠️ **Testing**: 60% ████████████░░░░░░░░
- ❌ **Deployment**: 0% ░░░░░░░░░░░░░░░░░░░░

---

## 🎉 Logros Destacados

✅ **Completados**:
- Sistema de IA con 5 contextos culturales (Boricua, Mexicano, Colombiano, Argentino, Español)
- API REST completa con 8 endpoints funcionales
- Sistema robusto de manejo de errores (9 tipos de excepciones)
- Logging estructurado con JSON
- 25+ pruebas unitarias con cobertura >80% en componentes core
- Colección de Postman con 20+ requests
- Documentación completa (System Design, Testing Guide, PRD)
- Prompt engineering culturalmente adaptado

---

## 🚧 Bloqueadores Actuales

1. **Sin base de datos**: Necesario para users, auth, conversations
2. **Sin autenticación**: Requerido para features de usuario
3. **Sin frontend**: No hay interfaz para usuarios finales
4. **Sin caché**: Performance limitada sin Redis

---

## 📝 Notas

- El backend está **production-ready** para testing con API keys
- El sistema de prompts culturales está **optimizado para Puerto Rico**
- La arquitectura está **preparada para escalar**
- El código sigue **Clean Architecture (DDD)**

---

**Próxima revisión**: Después de implementar auth + DB (Sprint 1-2)

**Contacto**: [Tu email/contacto]
