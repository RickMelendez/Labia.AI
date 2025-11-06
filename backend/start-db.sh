#!/bin/bash
# Script para iniciar base de datos y correr migraciones
# Uso: ./start-db.sh

set -e  # Exit on error

echo "🚀 Iniciando Base de Datos para Labia.AI"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "1️⃣  Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo ""
    echo "Por favor:"
    echo "  1. Abre Docker Desktop"
    echo "  2. Espera que esté completamente iniciado (30-60 segundos)"
    echo "  3. Ejecuta este script nuevamente"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"
echo ""

# Start PostgreSQL and Redis
echo "2️⃣  Iniciando PostgreSQL y Redis..."
docker-compose up -d postgres redis
echo ""

# Wait for PostgreSQL to be ready
echo "3️⃣  Esperando que PostgreSQL esté listo..."
sleep 5

# Try to connect to PostgreSQL
MAX_RETRIES=10
RETRY_COUNT=0
until docker exec labia-ai-postgres pg_isready -U labiaai > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo "   Esperando PostgreSQL... (intento $((RETRY_COUNT+1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ PostgreSQL no se pudo iniciar correctamente${NC}"
    echo "Revisa los logs: docker logs labia-ai-postgres"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL está listo${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment no encontrado${NC}"
    echo "Creando virtual environment..."
    python -m venv venv
    echo ""
fi

# Activate virtual environment
echo "4️⃣  Activando virtual environment..."
source venv/Scripts/activate
echo -e "${GREEN}✅ Virtual environment activado${NC}"
echo ""

# Install dependencies if needed
if ! python -c "import alembic" 2>/dev/null; then
    echo "5️⃣  Instalando dependencias..."
    pip install -r requirements.txt > /dev/null 2>&1
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    echo ""
else
    echo "5️⃣  Dependencias ya instaladas"
    echo ""
fi

# Run migrations
echo "6️⃣  Corriendo migraciones de base de datos..."
alembic upgrade head
echo ""

# Check migration status
echo "7️⃣  Verificando estado de migraciones..."
CURRENT_MIGRATION=$(alembic current 2>/dev/null | tail -1)
echo -e "${GREEN}✅ Migración actual: $CURRENT_MIGRATION${NC}"
echo ""

# Verify database connection
echo "8️⃣  Verificando conexión a base de datos..."
if python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from src.core.config import settings

async def test_connection():
    engine = create_async_engine(settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://'))
    async with engine.connect() as conn:
        await conn.execute('SELECT 1')
    await engine.dispose()

asyncio.run(test_connection())
print('✅ Conexión exitosa')
" 2>/dev/null; then
    echo -e "${GREEN}✅ Base de datos conectada correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo verificar la conexión (pero las migraciones corrieron)${NC}"
fi
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}🎉 ¡Base de Datos Lista!${NC}"
echo "========================================="
echo ""
echo "Servicios corriendo:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "labia-ai"
echo ""
echo "Próximos pasos:"
echo "  1. Inicia el backend: uvicorn src.main:app --reload"
echo "  2. Verifica health: curl http://localhost:8000/api/v1/health"
echo "  3. Inicia el frontend: cd ../frontend && npm start"
echo ""
echo "Comandos útiles:"
echo "  - Ver logs PostgreSQL: docker logs labia-ai-postgres"
echo "  - Ver logs Redis: docker logs labia-ai-redis"
echo "  - Detener servicios: docker-compose down"
echo "  - Conectar a DB: docker exec -it labia-ai-postgres psql -U labiaai -d labiaai"
echo ""
