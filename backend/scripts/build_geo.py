import json
import urllib.request
import os

url = "https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson"
print("Downloading GeoJSON...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())

geo_data = {
    'India (National)': {
        'coords': [22.5937, 78.9629],
        'zoom': 5,
        'districts': {
            'All India': {'coords': [22.5937, 78.9629], 'zoom': 5}
        }
    }
}

def get_centroid(geometry):
    coords = []
    def extract_coords(arr):
        if isinstance(arr[0], (int, float)):
            coords.append(arr)
        else:
            for item in arr:
                extract_coords(item)
    
    extract_coords(geometry['coordinates'])
    if not coords:
        return [0,0]
    
    min_lng = min(c[0] for c in coords)
    max_lng = max(c[0] for c in coords)
    min_lat = min(c[1] for c in coords)
    max_lat = max(c[1] for c in coords)
    
    return [(min_lat + max_lat) / 2, (min_lng + max_lng) / 2]

print("Processing GeoJSON features...")
for feature in data['features']:
    props = feature['properties']
    geom = feature['geometry']
    state = props.get('NAME_1')
    district = props.get('NAME_2')
    
    if not state or not district:
        continue
        
    centroid = get_centroid(geom)
    
    if state not in geo_data:
        geo_data[state] = {
            'coords': centroid,
            'zoom': 6,
            'districts': {}
        }
    
    geo_data[state]['districts'][district] = {
        'coords': centroid,
        'zoom': 10
    }

for state, sdata in geo_data.items():
    if state == 'India (National)':
        continue
    districts = sdata['districts']
    if districts:
        avg_lat = sum(d['coords'][0] for d in districts.values()) / len(districts)
        avg_lng = sum(d['coords'][1] for d in districts.values()) / len(districts)
        sdata['coords'] = [avg_lat, avg_lng]

output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/lib/geoData.ts'))

lines = ["export const geoData: Record<string, any> = {"]
for state, sdata in geo_data.items():
    lines.append(f"  '{state}': {{")
    lines.append(f"    coords: [{sdata['coords'][0]:.4f}, {sdata['coords'][1]:.4f}],")
    lines.append(f"    zoom: {sdata['zoom']},")
    lines.append(f"    districts: {{")
    for district, ddata in sdata['districts'].items():
        d_name = district.replace("'", "\\'")
        lines.append(f"      '{d_name}': {{ coords: [{ddata['coords'][0]:.4f}, {ddata['coords'][1]:.4f}], zoom: {ddata['zoom']} }},")
    lines.append("    }")
    lines.append("  },")
lines.append("};")

os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w') as f:
    f.write("\n".join(lines))

print(f"Generated {output_path} with {len(geo_data)-1} states.")
