import requests
import random
import time

URL = "http://localhost:8000/incidents/report"

TYPES = ["Stubble Burning", "Industrial Emission", "Vehicle Idling", "Construction Dust", "Waste Burning"]
DESC_TEMPLATES = [
    "High confidence {type} detected via satellite imagery.",
    "Sensor grid anomaly indicating {type}.",
    "Citizen report verified regarding {type}.",
    "Sustained {type} pattern detected over last 2 hours.",
    "Severe {type} violating municipal regulations."
]

# Approximate bounding box for India
LAT_MIN, LAT_MAX = 8.4, 37.6
LNG_MIN, LNG_MAX = 68.7, 97.2

def generate_incident():
    type_ = random.choice(TYPES)
    desc = random.choice(DESC_TEMPLATES).format(type=type_)
    severity = random.choice(["Low", "Medium", "High", "Critical"])
    confidence = round(random.uniform(0.65, 0.99), 2)
    lat = round(random.uniform(LAT_MIN, LAT_MAX), 6)
    lng = round(random.uniform(LNG_MIN, LNG_MAX), 6)

    return {
        "description": desc,
        "type": type_,
        "severity": severity,
        "confidence": confidence,
        "lat": lat,
        "lng": lng
    }

print("Seeding 200 historical incidents to database...")

success_count = 0
for i in range(200):
    data = generate_incident()
    try:
        response = requests.post(URL, json=data)
        if response.status_code == 200:
            success_count += 1
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")
        break

print(f"Successfully seeded {success_count} incidents.")
