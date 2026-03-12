from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.password_hash import hash_password, verify_password
from app.utils.jwt_handler import create_token

def register_user(db: Session, user):
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def login_user(db: Session, email, password):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    token = create_token({"user_id": str(user.id), "role": user.role})

    return token
