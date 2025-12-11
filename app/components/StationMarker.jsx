import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const StationIcon = L.icon({
  iconUrl: "https://icons.veryicon.com/png/o/transport/traffic-icon/train-station.png",
  iconSize: [16, 16],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default StationIcon;