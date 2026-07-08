import asyncio
import httpx
import random
import os

API_URL = os.getenv("API_URL", "http://localhost:8000")

# Center around NCR
BASE_LAT = 28.6139
BASE_LNG = 77.2090

DESCRIPTIONS = [
    "Thick black smoke rising from industrial chimney.",
    "Large amount of construction dust blowing across the road.",
    "Open waste burning near the highway.",
    "Traffic congestion causing severe smog accumulation.",
    "Stubble burning detected in the outskirts.",
    "Unregulated generator running continuously."
]

async def seed_incident():
    lat = BASE_LAT + (random.random() - 0.5) * 0.4
    lng = BASE_LNG + (random.random() - 0.5) * 0.5
    desc = random.choice(DESCRIPTIONS)
    
    payload = {
        "description": desc,
        "latitude": lat,
        "longitude": lng
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_URL}/incidents/report", json=payload)
            print(f"[{response.status_code}] Seeded: {desc} at {lat:.4f}, {lng:.4f}")
    except Exception as e:
        print(f"Failed to seed incident: {e}")

async def main():
    print(f"Starting Realtime Seeder against {API_URL}...")
    while True:
        await seed_incident()
        await asyncio.sleep(random.randint(5, 12)) # Random interval between 5-12s

if __name__ == "__main__":
    asyncio.run(main())
