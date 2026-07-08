from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=True) # Used for citizen "mock" login
    email = Column(String, unique=True, index=True, nullable=True) # Used for Admin/Officer login
    hashed_password = Column(String, nullable=True)
    full_name = Column(String)
    role = Column(String, default="Citizen") # Administrator, Municipal Officer, Environmental Analyst, Citizen
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
