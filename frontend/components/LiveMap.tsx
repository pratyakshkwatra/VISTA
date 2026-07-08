"use client";
import { useState, useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL } from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

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
  onIncidentClick?: (inc: Incident) => void;
}

export default function LiveMap({ timelineFactor, showPredictions, coords, zoom, liveIncidents, onIncidentClick }: LiveMapProps) {
  const [viewState, setViewState] = useState({
    longitude: coords[1],
    latitude: coords[0],
    zoom: zoom - 1, // DeckGL zoom is slightly different
    pitch: 45,
    bearing: 0
  });

  useMemo(() => {
    setViewState(v => ({...v, longitude: coords[1], latitude: coords[0], zoom: zoom - 1, transitionDuration: 1000}));
  }, [coords, zoom]);

  const data = liveIncidents.map(i => ({
    position: [i.lng, i.lat],
    confidence: i.confidence || 0.8,
    ...i
  }));

  const layers = [
    new HexagonLayer({
      id: 'heatmap',
      data,
      pickable: true,
      extruded: true,
      radius: 2000,
      elevationScale: showPredictions ? 20 : 50,
      getPosition: (d: any) => d.position,
      getElevationValue: (points: any[]) => {
         return points.reduce((acc, pt) => acc + (pt.confidence || 1), 0);
      },
      getColorValue: (points: any[]) => {
         return points.reduce((acc, pt) => acc + (pt.confidence || 1), 0);
      },
      colorRange: showPredictions 
        ? [
            [0, 255, 255], [0, 150, 255], [100, 0, 255], [255, 0, 255], [255, 50, 255], [255, 100, 255]
          ]
        : [
            [1, 152, 189], [73, 227, 206], [216, 254, 181], [254, 237, 177], [254, 173, 84], [209, 55, 78]
          ],
      opacity: 0.8,
      transitions: {
        elevationScale: 2000,
        getFillColor: 2000,
      }
    }),
    new ScatterplotLayer({
      id: 'markers',
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 50,
      radiusMinPixels: 4,
      radiusMaxPixels: 15,
      lineWidthMinPixels: 2,
      getPosition: (d: any) => d.position,
      getFillColor: [255, 180, 171],
      getLineColor: [147, 0, 10],
      onClick: (info: any) => {
        if (info.object && onIncidentClick) {
          onIncidentClick(info.object);
        }
      }
    })
  ];

  return (
    <div className="w-full h-full relative z-0">
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        getTooltip={(info: any) => {
          if (info.layer?.id === 'markers' && info.object) {
             return info.object.description || 'Incident';
          }
          if (info.layer?.id === 'heatmap' && info.object) {
             return `Density: ${info.object.points.length} Reports`;
          }
          return null;
        }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>
    </div>
  );
}
