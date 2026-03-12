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
    return register_user(db, user)

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    token = login_user(db, login_data.email, login_data.password)
    return {"access_token": token, "token_type": "bearer", "user": {"id": login_data.email, "email": login_data.email}}
