"""
Generate JWT token for testing without database
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.security import create_access_token, create_refresh_token, hash_password
from src.core.config import settings

# Test user credentials
TEST_USER_EMAIL = "rickmelendez001@gmail.com"
TEST_USER_PASSWORD = "password123"
TEST_USER_NAME = "Rick Melendez"
TEST_USER_ID = "test-user-001"

def main():
    print("=" * 60)
    print("CREDENCIALES DE PRUEBA PARA LABIA.AI")
    print("=" * 60)
    print()

    # Display user credentials
    print("EMAIL:", TEST_USER_EMAIL)
    print("PASSWORD:", TEST_USER_PASSWORD)
    print("NAME:", TEST_USER_NAME)
    print("USER ID:", TEST_USER_ID)
    print()

    # Generate password hash (for when database is ready)
    hashed_password = hash_password(TEST_USER_PASSWORD)
    print("PASSWORD HASH (para la base de datos):")
    print(f"   {hashed_password}")
    print()

    # Generate access token
    access_token = create_access_token(
        data={
            "sub": TEST_USER_EMAIL,
            "user_id": TEST_USER_ID,
            "plan": "free",
            "email": TEST_USER_EMAIL
        }
    )

    # Generate refresh token
    refresh_token = create_refresh_token(
        data={
            "sub": TEST_USER_EMAIL,
            "user_id": TEST_USER_ID
        }
    )

    print("ACCESS TOKEN (valido por 30 minutos):")
    print(f"   {access_token}")
    print()

    print("REFRESH TOKEN (valido por 7 dias):")
    print(f"   {refresh_token}")
    print()

    print("-" * 60)
    print("COMO USAR:")
    print("-" * 60)
    print()
    print("1. Para hacer requests al API, incluye este header:")
    print(f'   Authorization: Bearer {access_token}')
    print()
    print("2. Ejemplo con curl:")
    print(f'''
   curl -X GET http://localhost:8000/api/v1/profile \\
     -H "Authorization: Bearer {access_token}"
''')
    print()
    print("3. En Postman/Insomnia:")
    print("   - Type: Bearer Token")
    print(f"   - Token: {access_token}")
    print()
    print("=" * 60)

    # Save to file for easy access
    output_file = Path(__file__).parent / "test_credentials.txt"
    with open(output_file, "w") as f:
        f.write("LABIA.AI TEST CREDENTIALS\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Email: {TEST_USER_EMAIL}\n")
        f.write(f"Password: {TEST_USER_PASSWORD}\n")
        f.write(f"Name: {TEST_USER_NAME}\n")
        f.write(f"User ID: {TEST_USER_ID}\n\n")
        f.write(f"Access Token:\n{access_token}\n\n")
        f.write(f"Refresh Token:\n{refresh_token}\n\n")
        f.write(f"Password Hash:\n{hashed_password}\n")

    print(f"\nCredenciales guardadas en: {output_file}")
    print()

if __name__ == "__main__":
    main()
