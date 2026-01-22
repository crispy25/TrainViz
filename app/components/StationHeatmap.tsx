import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface HeatmapProps {
  stationFrequency: { [key: string]: number };
  stopCoords: { [key: string]: [number, number] };
  routeSegments?: { [key: string]: number };
}

const HeatmapMarkers = ({ stationFrequency, stopCoords }: HeatmapProps) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  const maxFreq = Math.max(...Object.values(stationFrequency), 1);

  const getColor = (freq: number) => {
    const intensity = freq / maxFreq;
    if (intensity > 0.8) return '#ef4444';
    if (intensity > 0.5) return '#f97316';
    if (intensity > 0.2) return '#eab308';
    return '#22c55e';
  };

  const getRadius = (freq: number) => {
    const intensity = freq / maxFreq;
    const baseRadius = 4 + (intensity * 10);
    return baseRadius * (zoom / 5);
  };

  return (
    <LayerGroup>
      {Object.entries(stopCoords).map(([name, coords]) => {
        const freq = stationFrequency[name] || 0;
        if (freq === 0) return null;

        return (
          <CircleMarker
            key={name}
            center={coords}
            pathOptions={{
              color: getColor(freq),
              fillColor: getColor(freq),
              fillOpacity: 0.7,
              weight: 1
            }}
            radius={getRadius(freq)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-sm font-bold">{name}</div>
              <div className="text-xs">Trains: {freq}</div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </LayerGroup>
  );
};

const StationHeatmap = (props: HeatmapProps) => {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-800 shadow-xl">
      <MapContainer 
        center={[46.0, 25.0]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <TileLayer 
          attribution='&copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a>'
          url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" 
        />
        <HeatmapMarkers {...props} />
      </MapContainer>
    </div>
  );
};

export default StationHeatmap;
