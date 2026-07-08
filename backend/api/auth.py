from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt

from core.database import get_db
from core.config import settings
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

class OTPRequest(BaseModel):
    phone_number: str

@router.post("/send-otp")
async def send_otp(req: OTPRequest):
    # Mock OTP send - just bypass and pretend it worked
    # In a real app, this would integrate with Twilio/AWS SNS
    return {"message": "OTP sent successfully", "mock_otp": "1234"}

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Citizen Mock Login (Phone + OTP)
    if req.phone_number and req.otp:
        # Bypass validation: Any OTP works, or autofilled "1234"
        if req.otp != "1234" and req.otp != "bypass":
            pass # We just let it pass for the MVP, or we can force "1234"
            
        result = await db.execute(select(User).where(User.phone_number == req.phone_number))
        user = result.scalars().first()
        
        if not user:
            # Auto register citizen
            user = User(phone_number=req.phone_number, role="Citizen", full_name="Citizen User")
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        return {"access_token": access_token, "token_type": "bearer", "role": user.role}
        
    # 2. Officer/Admin Login (Email + Password mock)
    if req.email and req.password:
        if req.password != "password": # Mock check
            raise HTTPException(status_code=400, detail="Invalid password")
            
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalars().first()
        
        if not user:
            # Auto register mock officer
            user = User(email=req.email, role="Municipal Officer", full_name="Mock Officer")
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
        return {"access_token": access_token, "token_type": "bearer", "role": user.role}

    raise HTTPException(status_code=400, detail="Provide either phone+otp or email+password")
