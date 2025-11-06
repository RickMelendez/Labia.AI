"""
Script to create test users
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from src.infrastructure.database import get_async_db_context, UserModel, ProfileModel
from src.core.security import get_password_hash
from datetime import datetime
import uuid


async def create_test_user():
    """Create a test user with email and password"""

    email = "rickmelendez001@gmail.com"
    password = "password123"
    name = "Rick Melendez"

    async with get_async_db_context() as db:
        # Check if user already exists
        result = await db.execute(select(UserModel).where(UserModel.email == email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"✓ Usuario ya existe: {email}")
            print(f"  ID: {existing_user.id}")
            print(f"  Plan: {existing_user.plan}")
            return existing_user

        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(password)

        new_user = UserModel(
            id=user_id,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            plan="free",
            daily_suggestions_used=0,
            daily_limit=10,
            created_at=datetime.utcnow()
        )

        db.add(new_user)

        # Create user profile
        profile = ProfileModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            name=name,
            cultural_style="boricua",
            default_tone="chill",
            interests=["música", "tecnología", "playa"],
            age_range="25-34",
            emoji_ratio=0.3,
            created_at=datetime.utcnow()
        )

        db.add(profile)

        await db.commit()

        print(f"✓ Usuario creado exitosamente!")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        print(f"  ID: {user_id}")
        print(f"  Plan: free")
        print(f"  Límite diario: 10 sugerencias")

        return new_user


if __name__ == "__main__":
    print("Creando usuario de prueba...")
    print("-" * 50)

    try:
        asyncio.run(create_test_user())
        print("-" * 50)
        print("✓ Usuario listo para usar!")
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
