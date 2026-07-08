"use client";
import { useEffect, useRef, useState } from 'react';

interface Incident {
  lat: number;
  lng: number;
  description?: string;
  [key: string]: any;
}

interface LiveMapProps {
  timelineFactor: number;
  showPredictions: boolean;
  coords: [number, number];
  zoom: number;
  liveIncidents: Incident[];
}

export default function LiveMap({ timelineFactor, showPredictions, coords, zoom, liveIncidents }: LiveMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [heatData] = useState(() => {
    // Generate static heat background once
    const pts = [];
    for(let i=0; i<300; i++) {
        const lat = 28.5 + (Math.random() * 0.4);
        const lng = 77.0 + (Math.random() * 0.5);
        const dist = Math.sqrt(Math.pow(lat - 28.6, 2) + Math.pow(lng - 77.2, 2));
        const intensity = Math.max(0, 0.6 - dist * 2) * Math.random();
        if (intensity > 0.1) pts.push([lat, lng, intensity]);
    }
    return pts;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!(window as any).L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script1 = document.createElement('script');
        script1.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
          script2.onload = initMap;
          document.head.appendChild(script2);
        };
        document.head.appendChild(script1);
    } else {
        initMap();
    }

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const initMap = () => {
    if (!containerRef.current) return;
    const L = (window as any).L;
    
    // Add pulsing CSS
    if (!document.getElementById('pulse-css')) {
        const style = document.createElement('style');
        style.id = 'pulse-css';
        style.innerHTML = '@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 180, 171, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(255, 180, 171, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 180, 171, 0); } }';
        document.head.appendChild(style);
    }

    const map = L.map(containerRef.current, { zoomControl: false }).setView([coords[0], coords[1]], zoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    setIsLoaded(true);
  };

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    
    // Clear old layers
    map.eachLayer((layer: any) => {
      if (layer.options && (layer.options.id === 'heat' || layer.options.id === 'prediction' || layer.options.icon)) {
        map.removeLayer(layer);
      }
    });

    // Render Markers
    liveIncidents.forEach((inc: any) => {
        const icon = L.divIcon({
            className: 'custom-icon',
            html: '<div style="background-color: #ffb4ab; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #93000a; box-shadow: 0 0 15px #ffb4ab; animation: pulse 2s infinite;"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        L.marker([inc.lat, inc.lng], {icon, id: 'marker'}).addTo(map).bindPopup(`<b>Live Incident</b><br>${inc.description}`);
    });

    // Calculate Drift
    const timePassed = 24 + timelineFactor;
    const driftLat = -(timePassed / 24) * 0.12; 
    const driftLng = (timePassed / 24) * 0.12;
    
    const currentHeat = heatData.map((p: any) => [
        p[0] + driftLat, p[1] + driftLng, Math.max(0, p[2] + Math.sin(timePassed + p[0]*100)*0.15)
    ]);

    liveIncidents.forEach((inc: any) => {
        for(let j=0; j<20; j++) {
            currentHeat.push([
                inc.lat + (Math.random()-0.5)*0.05, 
                inc.lng + (Math.random()-0.5)*0.05, 
                0.8
            ]);
        }
    });

    if (showPredictions) {
        L.heatLayer(currentHeat.map((p:any) => [p[0], p[1], p[2]]), {
            radius: 25, blur: 20, maxZoom: 11,
            gradient: {0.4: 'cyan', 0.6: 'blue', 0.8: 'purple', 1.0: 'magenta'},
            id: 'prediction'
        }).addTo(map);
    } else {
        L.heatLayer(currentHeat, {
            radius: 20, blur: 15, maxZoom: 11,
            gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'},
            id: 'heat'
        }).addTo(map);
    }
  }, [timelineFactor, showPredictions, liveIncidents, isLoaded, heatData]);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
        mapRef.current.flyTo([coords[0], coords[1]], zoom, {animate: true, duration: 1.5});
    }
  }, [coords, zoom, isLoaded]);

  return <div ref={containerRef} className="w-full h-full bg-[#102034] relative z-0" />;
}
