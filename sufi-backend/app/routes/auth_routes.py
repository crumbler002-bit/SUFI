from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.schemas.user_schema import UserCreate
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    from app.models.user import User as UserModel
    existing = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = register_user(db, user)
    from app.utils.jwt_handler import create_token
    token = create_token({"user_id": str(new_user.id), "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": str(new_user.id), "email": new_user.email, "name": new_user.name, "role": new_user.role},
    }

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    token, user = login_user(db, login_data.email, login_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "email": user.email, "name": user.name, "role": user.role},
    }
