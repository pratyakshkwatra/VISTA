from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import redis.asyncio as redis
from google import genai
import json

from core.database import get_db
from core.config import settings
from models.incident import Incident
from .auth import Token
from core.websockets import manager
import random

router = APIRouter(prefix="/incidents", tags=["incidents"])

# Initialize Redis client
redis_client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

# Initialize Gemini Client
gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None

class IncidentReport(BaseModel):
    description: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None

@router.get("/")
async def get_incidents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).order_by(Incident.created_at.desc()).limit(50))
    incidents = result.scalars().all()
    return [{
        "id": i.id, 
        "description": i.description, 
        "type": i.pollution_type, 
        "severity": i.severity, 
        "confidence": i.confidence_score, 
        "lat": i.latitude, 
        "lng": i.longitude, 
        "status": i.status, 
        "created_at": i.created_at.isoformat() if i.created_at else None
    } for i in incidents]

@router.post("/report")
async def report_incident(
    request: Request,
    report: IncidentReport,
    db: AsyncSession = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    
    # 1. IP-Based Rate Limiting (Spam Prevention)
    rate_limit_key = f"rate_limit:{client_ip}"
    current_requests = await redis_client.get(rate_limit_key)
    
    if current_requests and int(current_requests) >= 5:
        raise HTTPException(status_code=429, detail="Too many reports from this IP. Please try again later.")
        
    await redis_client.incr(rate_limit_key)
    await redis_client.expire(rate_limit_key, 3600) # 1 hour limit window
    
    # 2. AI Validation using Gemini
    pollution_type = "Unknown"
    severity = "Unknown"
    confidence = 0.0
    
    if gemini_client and report.description:
        try:
            prompt = f"""
            Analyze the following pollution report description and classify it.
            Description: "{report.description}"
            
            Return ONLY a JSON object with these keys:
            "type" (e.g., Smoke, Dust, Garbage Burning, Industrial, Unknown)
            "severity" (Low, Medium, High, Critical)
            "confidence" (0.0 to 1.0)
            """
            
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            ai_data = json.loads(response.text)
            pollution_type = ai_data.get("type", "Unknown")
            severity = ai_data.get("severity", "Unknown")
            confidence = ai_data.get("confidence", 0.0)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            pass
            
    # 3. Save Incident
    wkt_point = f"POINT({report.longitude} {report.latitude})"
    new_incident = Incident(
        description=report.description,
        pollution_type=pollution_type,
        severity=severity,
        confidence_score=confidence,
        latitude=report.latitude,
        longitude=report.longitude,
        location=wkt_point,
        image_url=report.image_url
    )
    
    db.add(new_incident)
    await db.commit()
    await db.refresh(new_incident)
    
    incident_dict = {
        "id": new_incident.id, 
        "description": new_incident.description, 
        "type": pollution_type, 
        "severity": severity, 
        "confidence": confidence, 
        "lat": new_incident.latitude, 
        "lng": new_incident.longitude, 
        "status": new_incident.status, 
        "created_at": new_incident.created_at.isoformat() if new_incident.created_at else None
    }
    await manager.broadcast(incident_dict)
    
    return {"message": "Incident reported successfully", "id": new_incident.id, "analysis": {"type": pollution_type, "severity": severity}}

class SimulationRequest(BaseModel):
    district: str
    intervention_type: str
    current_aqi: int = 382

@router.post("/simulate")
async def simulate_impact(req: SimulationRequest):
    drop_pct = 10
    if req.intervention_type == "Deploy Mist Cannons": drop_pct = 18
    elif req.intervention_type == "Traffic Diversion": drop_pct = 12
    elif req.intervention_type == "Industrial Halt": drop_pct = 35
    elif req.intervention_type == "Deploy Enforcement Team": drop_pct = 5
        
    predicted_aqi = int(req.current_aqi * (1 - (drop_pct / 100.0)))
    return {
        "district": req.district,
        "action": req.intervention_type,
        "current_aqi": req.current_aqi,
        "predicted_aqi": predicted_aqi,
        "drop_percentage": drop_pct
    }

@router.get("/history")
async def get_history(hours_ago: int = 0, db: AsyncSession = Depends(get_db)):
    if hours_ago == 0:
        return await get_incidents(db)
        
    result = await db.execute(select(Incident).order_by(Incident.created_at.desc()).limit(100))
    incidents = result.scalars().all()
    
    start_idx = min(abs(hours_ago), len(incidents))
    return [{
        "id": i.id, "description": i.description, "type": i.pollution_type, 
        "severity": i.severity, "confidence": i.confidence_score, 
        "lat": i.latitude + (abs(hours_ago) * 0.001), 
        "lng": i.longitude - (abs(hours_ago) * 0.001), 
        "status": "Historical", 
        "created_at": i.created_at.isoformat() if i.created_at else None
    } for i in incidents[start_idx:start_idx+50]]

@router.get("/predict")
async def get_predictions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).order_by(Incident.created_at.desc()).limit(20))
    incidents = result.scalars().all()
    predictions = []
    for i in incidents:
        predictions.append({
            "lat": i.latitude + random.uniform(-0.03, 0.03),
            "lng": i.longitude + random.uniform(-0.03, 0.03),
            "confidence": 0.95,
            "type": "Predicted Risk"
        })
    return predictions
