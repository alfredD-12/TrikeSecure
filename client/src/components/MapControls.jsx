import { LocateFixed, Plus, Minus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import '../styles/MapControls.css';

const DEFAULT_CENTER = [12.8797, 121.7740];

export default function MapControls({ mapRef }) {
  const { userPickup } = useApp();

  function recenterMap() {
    if (userPickup) {
      mapRef.current?.flyTo([userPickup.lat, userPickup.lng], 17, { duration: 0.8 });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 0.8 }),
        () => mapRef.current?.flyTo(DEFAULT_CENTER, 6, { duration: 0.8 }),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      mapRef.current?.flyTo(DEFAULT_CENTER, 6, { duration: 0.8 });
    }
  }
  function zoomIn()  { mapRef.current?.zoomIn(); }
  function zoomOut() { mapRef.current?.zoomOut(); }

  return (
    <div className="map-controls">
      <button className="map-control-btn" onClick={recenterMap} title="Recenter Map">
        <LocateFixed size={20} className="text-gray-700" />
      </button>
      <button className="map-control-btn" onClick={zoomIn} title="Zoom In">
        <Plus size={20} className="text-gray-700" />
      </button>
      <button className="map-control-btn" onClick={zoomOut} title="Zoom Out">
        <Minus size={20} className="text-gray-700" />
      </button>
    </div>
  );
}
