"""
Database Configuration
PostgreSQL connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager, asynccontextmanager
from typing import Generator, AsyncGenerator
from loguru import logger

from ...core.config import settings
from .models import Base


# ==================== Sync Database (for migrations) ====================

# Create sync engine
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG
)

# Create sync session factory
SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)


@contextmanager
def get_sync_db() -> Generator[Session, None, None]:
    """
    Sync database session (for migrations and scripts)

    Usage:
        with get_sync_db() as db:
            users = db.query(UserModel).all()
    """
    db = SyncSessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()


# ==================== Async Database (for FastAPI) ====================

# Convert sync URL to async URL for asyncpg
async_database_url = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Create async engine
async_engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async database session dependency for FastAPI

    Usage in FastAPI:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_async_db)):
            result = await db.execute(select(UserModel))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_async_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Async database session context manager

    Usage:
        async with get_async_db_context() as db:
            result = await db.execute(select(UserModel))
            users = result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            await session.close()


# ==================== Database Initialization ====================

def create_tables():
    """
    Create all tables in the database

    WARNING: This should only be used in development
    For production, use Alembic migrations
    """
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=sync_engine)
    logger.info("Database tables created successfully")


def drop_tables():
    """
    Drop all tables from the database

    WARNING: This will delete all data!
    Only use in development/testing
    """
    logger.warning("Dropping all database tables...")
    Base.metadata.drop_all(bind=sync_engine)
    logger.warning("All database tables dropped")


async def check_database_connection() -> bool:
    """
    Check if database connection is working

    Returns:
        bool: True if connection is successful
    """
    try:
        async with async_engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def get_database_info() -> dict:
    """
    Get database configuration info

    Returns:
        dict: Database configuration
    """
    return {
        "url": settings.DATABASE_URL.split("@")[-1],  # Hide credentials
        "pool_size": 10,
        "max_overflow": 20,
        "echo": settings.DEBUG
    }
