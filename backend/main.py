from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import engine, Base
import os
import asyncio
import random
from sqlalchemy import text, select
from core.websockets import manager
from core.database import AsyncSessionLocal

# Import models so Base.metadata knows about them
from models.user import User
from models.incident import Incident

async def background_seeder():
    # Wait for tables to be created
    await asyncio.sleep(2)
    
    async with AsyncSessionLocal() as session:
        # Check if incidents exist
        result = await session.execute(select(Incident).limit(1))
        existing = result.scalars().first()
        
        if not existing:
            # Seed 100 initial incidents in Delhi NCR
            print("Seeding initial incidents data...")
            incidents_to_add = []
            for _ in range(100):
                lat = 28.6139 + random.uniform(-0.15, 0.15)
                lng = 77.2090 + random.uniform(-0.15, 0.15)
                wkt_point = f"POINT({lng} {lat})"
                inc = Incident(
                    description=f"Auto-generated incident",
                    pollution_type=random.choice(["Smoke", "Dust", "Industrial", "Garbage Burning"]),
                    severity=random.choice(["Low", "Medium", "High", "Critical"]),
                    confidence_score=random.uniform(0.6, 1.0),
                    latitude=lat,
                    longitude=lng,
                    location=wkt_point,
                    status="Open"
                )
                incidents_to_add.append(inc)
            session.add_all(incidents_to_add)
            await session.commit()
            print("Successfully seeded 100 incidents.")
            
    # Real-time simulation loop
    while True:
        await asyncio.sleep(random.uniform(1.0, 4.0))
        async with AsyncSessionLocal() as session:
            lat = 28.6139 + random.uniform(-0.2, 0.2)
            lng = 77.2090 + random.uniform(-0.2, 0.2)
            wkt_point = f"POINT({lng} {lat})"
            
            p_type = random.choice(["Smoke", "Dust", "Industrial", "Vehicle Emissions"])
            severity = random.choice(["Low", "Medium", "High"])
            confidence = random.uniform(0.7, 1.0)
            
            new_inc = Incident(
                description=f"Live telemetry: {p_type}",
                pollution_type=p_type,
                severity=severity,
                confidence_score=confidence,
                latitude=lat,
                longitude=lng,
                location=wkt_point,
                status="Open"
            )
            session.add(new_inc)
            await session.commit()
            await session.refresh(new_inc)
            
            # Broadcast to connected clients
            await manager.broadcast({
                "id": new_inc.id,
                "description": new_inc.description,
                "type": p_type,
                "severity": severity,
                "confidence": confidence,
                "lat": lat,
                "lng": lng,
                "status": "Open",
                "created_at": new_inc.created_at.isoformat() if new_inc.created_at else None
            })

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        await conn.run_sync(Base.metadata.create_all)
        
    # Start the background seeder task
    asyncio.create_task(background_seeder())
    yield

app = FastAPI(
    title="VISTA API",
    description="Visual Intelligence for Spatial Toxicity Assessment",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:3005",
]
if os.getenv("NEXT_PUBLIC_API_URL"):
    origins.append(os.getenv("NEXT_PUBLIC_API_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api import auth, incidents, copilot, reports

app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(copilot.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {"message": "Welcome to VISTA API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from fastapi import WebSocket, WebSocketDisconnect
from core.websockets import manager

@app.websocket("/ws/incidents")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
