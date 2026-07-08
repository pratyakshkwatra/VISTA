from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.antigravity import Agent, LocalAgentConfig
from core.config import settings

router = APIRouter(prefix="/copilot", tags=["copilot"])

class CopilotRequest(BaseModel):
    query: str

class CopilotResponse(BaseModel):
    response: str

@router.post("/ask", response_model=CopilotResponse)
async def ask_copilot(req: CopilotRequest):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    config = LocalAgentConfig(
        api_key=settings.GEMINI_API_KEY,
        model_name="gemini-2.5-flash",
        system_instruction="You are VISTA Fusion AI Copilot, an expert in urban pollution intelligence. Keep answers concise, factual, and based on the provided context."
    )
    
    try:
        async with Agent(config) as agent:
            response = await agent.chat(req.query)
            text_response = await response.text()
            return {"response": text_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
