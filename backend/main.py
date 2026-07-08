from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import engine, Base
from sqlalchemy import text
import os

# Import models so Base.metadata knows about them
from models.user import User
from models.incident import Incident

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        await conn.run_sync(Base.metadata.create_all)
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
