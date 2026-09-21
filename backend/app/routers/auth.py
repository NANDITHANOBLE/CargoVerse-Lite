from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.auth_schema import TraderRegister, ProviderRegisterUser, LoginRequest, Token
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/trader", response_model=Token)
def register_trader(payload: TraderRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        name=payload.name,
        company_name=payload.company_name,
        email=payload.email,
        phone=payload.phone,
        iec_number=payload.iec_number,
        password_hash=hash_password(payload.password),
        role=RoleEnum.trader,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(access_token=token, role=user.role.value, user_id=user.id)

@router.post("/register/provider", response_model=Token)
def register_provider_user(payload: ProviderRegisterUser, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        name=payload.contact_name,
        company_name=payload.company_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=RoleEnum.provider,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(access_token=token, role=user.role.value, user_id=user.id)

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token({"sub": user.id, "role": user.role.value}, remember_me=payload.remember_me)
    return Token(access_token=token, role=user.role.value, user_id=user.id)