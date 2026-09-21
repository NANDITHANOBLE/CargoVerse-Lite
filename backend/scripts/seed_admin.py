"""
One-time script to create the first admin user.
Run with: python scripts/seed_admin.py
"""

import sys
from pathlib import Path

# Allow running this script directly from the backend/ folder
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.user import RoleEnum, User

Base.metadata.create_all(bind=engine)

ADMIN_EMAIL = "admin@cargoverse.ai"
ADMIN_PASSWORD = "AdminPass123!"
ADMIN_NAME = "CargoVerse Admin"

def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"Admin already exists: {ADMIN_EMAIL}")
            return

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=RoleEnum.admin,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin created successfully: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()