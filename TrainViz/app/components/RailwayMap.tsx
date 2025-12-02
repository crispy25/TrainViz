// components/RailwayMap.js
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './TrainMarker';


export default function RailwayMap() {
  return (
    <MapContainer
      center={[45.9432, 24.9668]} // Romania center
      zoom={7}
      style={{ height: '100vh', width: '100%' }}
    >
      {/* OpenStreetMap base layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* OpenRailwayMap overlay */}
      <TileLayer
        url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
        attribution='&copy; OpenRailwayMap contributors'
      />

    
      {/* Example train marker */}
      <Marker position={[44.4268, 26.1025]}/> {/* Bucharest */}
    </MapContainer>
  );
}
