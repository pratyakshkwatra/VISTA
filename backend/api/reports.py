from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.incident import Incident
from reportlab.pdfgen import canvas
import os
import uuid

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("/generate")
async def generate_report(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).order_by(Incident.created_at.desc()).limit(100))
    incidents = result.scalars().all()
    
    filename = f"report_{uuid.uuid4().hex[:8]}.pdf"
    filepath = f"/tmp/{filename}"
    
    c = canvas.Canvas(filepath)
    c.drawString(100, 800, "VISTA Unified Audit Trail")
    c.drawString(100, 780, f"Total incidents logged in period: {len(incidents)}")
    
    y = 750
    for i, inc in enumerate(incidents[:30]):
        c.drawString(100, y, f"#{inc.id}: {inc.pollution_type} | Severity: {inc.severity}")
        c.drawString(100, y-15, f"Location: ({inc.latitude:.4f}, {inc.longitude:.4f}) | Conf: {inc.confidence_score}")
        y -= 35
        if y < 100:
            c.showPage()
            y = 800
    c.save()
    
    return FileResponse(filepath, media_type='application/pdf', filename=filename)
