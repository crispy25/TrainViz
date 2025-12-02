import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const trainIcon = L.icon({
  iconUrl: 'https://icons.veryicon.com/png/o/object/material-design-icons/train-21.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

L.Marker.prototype.options.icon = trainIcon;