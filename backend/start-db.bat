@echo off
REM Script para iniciar base de datos en Windows
REM Uso: start-db.bat

echo.
echo ========================================
echo   Iniciando Base de Datos - Labia.AI
echo ========================================
echo.

REM Check if Docker is running
echo 1. Verificando Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta corriendo
    echo.
    echo Por favor:
    echo   1. Abre Docker Desktop
    echo   2. Espera que este completamente iniciado ^(30-60 segundos^)
    echo   3. Ejecuta este script nuevamente
    echo.
    pause
    exit /b 1
)
echo [OK] Docker esta corriendo
echo.

REM Start PostgreSQL and Redis
echo 2. Iniciando PostgreSQL y Redis...
docker-compose up -d postgres redis
echo.

REM Wait for PostgreSQL
echo 3. Esperando que PostgreSQL este listo...
timeout /t 5 /nobreak >nul

REM Check PostgreSQL readiness
set RETRY_COUNT=0
:wait_postgres
docker exec labia-ai-postgres pg_isready -U labiaai >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRY_COUNT+=1
    if %RETRY_COUNT% geq 10 (
        echo [ERROR] PostgreSQL no se inicio correctamente
        echo Revisa los logs: docker logs labia-ai-postgres
        pause
        exit /b 1
    )
    echo    Esperando PostgreSQL... ^(intento %RETRY_COUNT%/10^)
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo [OK] PostgreSQL esta listo
echo.

REM Activate virtual environment
echo 4. Activando virtual environment...
if not exist "venv\" (
    echo [INFO] Creando virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo [OK] Virtual environment activado
echo.

REM Check if dependencies are installed
echo 5. Verificando dependencias...
python -c "import alembic" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Instalando dependencias...
    pip install -r requirements.txt >nul 2>&1
    echo [OK] Dependencias instaladas
) else (
    echo [OK] Dependencias ya instaladas
)
echo.

REM Run migrations
echo 6. Corriendo migraciones de base de datos...
alembic upgrade head
echo.

REM Check migration status
echo 7. Verificando estado de migraciones...
alembic current
echo.

REM Summary
echo =========================================
echo   Base de Datos Lista!
echo =========================================
echo.
echo Servicios corriendo:
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr "labia-ai"
echo.
echo Proximos pasos:
echo   1. Inicia el backend: uvicorn src.main:app --reload
echo   2. Verifica health: curl http://localhost:8000/api/v1/health
echo   3. Inicia el frontend: cd ..\frontend ^&^& npm start
echo.
echo Comandos utiles:
echo   - Ver logs PostgreSQL: docker logs labia-ai-postgres
echo   - Ver logs Redis: docker logs labia-ai-redis
echo   - Detener servicios: docker-compose down
echo.
pause
