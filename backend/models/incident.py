from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=True)
    pollution_type = Column(String, nullable=True) # Smoke, Dust, Garbage Burning, etc.
    image_url = Column(String, nullable=True)
    
    # PostGIS geometry for spatial queries (SRID 4326 is WGS 84 standard for GPS)
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    
    # Store raw lat/lng for easier API responses if needed without PostGIS translation
    latitude = Column(Float)
    longitude = Column(Float)

    # AI Analysis results
    severity = Column(String, default="Unknown") # Low, Medium, High, Critical
    confidence_score = Column(Float, nullable=True)
    ai_metadata = Column(JSON, nullable=True)
    
    # Lifecycle
    status = Column(String, default="Reported") # Reported, Verified, Active, Mitigated, Closed
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Nullable for anonymous citizen reports
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
