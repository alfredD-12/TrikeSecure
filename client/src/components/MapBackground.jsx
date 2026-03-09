import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../contexts/AppContext';
import '../styles/MapBackground.css';

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [12.8797, 121.7740]; // Philippines center — fallback only
const DEFAULT_ZOOM = 6;

const trikeIconHtml = `
  <div style="background:#22c55e;border:4px solid white;border-radius:50%;width:44px;height:44px;
    box-shadow:0 6px 20px rgba(34,197,94,0.4),0 0 0 8px rgba(34,197,94,0.1);
    display:flex;align-items:center;justify-content:center;animation:pulse-ring 2s ease-out infinite;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 7l3-3 3 3M3 7v13h18V7l-3-3-3 3"></path>
      <rect x="8" y="10" width="8" height="6" rx="1" fill="white"></rect>
    </svg>
  </div>`;

const trikeIcon = L.divIcon({
  className: 'custom-div-icon',
  html: trikeIconHtml,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -30],
});

// Inner component that can access the map instance for external controls
function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// Handles map clicks when pick mode is active
function MapClickHandler() {
  const { pinTarget, setPinTarget, setUserPickup, setDestination, setDestinationPin } = useApp();
  useMapEvents({
    click: async (e) => {
      if (!pinTarget) return;
      const { lat, lng } = e.latlng;
      let label;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const parts = data.display_name?.split(',') ?? [];
        label = parts.slice(0, 3).join(',').trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      } catch {
        label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      if (pinTarget === 'from') {
        setUserPickup({ lat, lng, label });
      } else if (pinTarget === 'to') {
        setDestination(label);
        setDestinationPin({ lat, lng, label });
      }
      setPinTarget(null);
    },
  });
  return null;
}

// Red destination drop-pin icon
const destIconHtml = `
  <div style="position:relative;width:32px;height:42px;">
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C9.37 2 4 7.37 4 14c0 9.25 12 26 12 26s12-16.75 12-26c0-6.63-5.37-12-12-12z" fill="#dc2626" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="white"/>
    </svg>
  </div>`;

const destIcon = L.divIcon({
  className: '',
  html: destIconHtml,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
});

// Draws OSRM road route between pickup and destination
function RouteLayer() {
  const { userPickup, destinationPin } = useApp();
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    // Remove old route
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (!userPickup || !destinationPin) return;

    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${userPickup.lng},${userPickup.lat};${destinationPin.lng},${destinationPin.lat}` +
      `?overview=full&geometries=geojson`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const coords = data?.routes?.[0]?.geometry?.coordinates;
        if (!coords) return;
        // OSRM returns [lng, lat], Leaflet needs [lat, lng]
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        polylineRef.current = L.polyline(latLngs, {
          color: '#1d4ed8',
          weight: 6,
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map);
        // Fit map to show entire route
        map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });
      })
      .catch(() => {});

    return () => {
      if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    };
  }, [userPickup, destinationPin, map]);

  return null;
}

const pickupIconHtml = `
  <div style="background:#2563eb;border:4px solid white;border-radius:50%;width:38px;height:38px;
    box-shadow:0 4px 14px rgba(37,99,235,0.55),0 0 0 8px rgba(37,99,235,0.15);
    display:flex;align-items:center;justify-content:center;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`;

const pickupIcon = L.divIcon({
  className: 'custom-div-icon',
  html: pickupIconHtml,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -42],
});

// Tile layer that reacts to dark mode changes
function DarkAwareTileLayer({ darkMode }) {
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <TileLayer
      key={tileUrl}
      url={tileUrl}
      maxZoom={20}
      minZoom={3}
      attribution="&copy; OpenStreetMap contributors"
    />
  );
}

// Google Maps-style real-time blue dot for commuter
function UserLocationDot() {
  const { view } = useApp();
  const map = useMap();
  const [pos, setPos] = useState(null); // { lat, lng, accuracy }
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (view !== 'commuter') return;
    if (!navigator.geolocation) return;

    const dotHtml = `
      <div class="user-location-dot">
        <div class="user-location-dot__ring"></div>
        <div class="user-location-dot__core"></div>
      </div>`;

    const dotIcon = L.divIcon({
      className: '',
      html: dotHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setPos({ lat, lng, accuracy });

        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], { icon: dotIcon, zIndexOffset: 1000, interactive: false }).addTo(map);
          circleRef.current = L.circle([lat, lng], {
            radius: accuracy,
            color: '#2563eb',
            fillColor: '#2563eb',
            fillOpacity: 0.1,
            weight: 1,
            interactive: false,
          }).addTo(map);
        } else {
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
          circleRef.current.setRadius(accuracy);
        }
      },
      null,
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
      if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }
    };
  }, [view, map]);

  return null;
}

// On first mount, tries to get the device's GPS to center the map
function UserLocationInit() {
  const map = useMap();
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      },
      () => { /* permission denied — keep default center */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);
  return null;
}

// Flies the map to the latest pin (pickup or destination)
function FlyToPoint() {
  const { userPickup, destinationPin } = useApp();
  const map = useMap();
  const prevPickup = useRef(null);
  const prevDest = useRef(null);
  useEffect(() => {
    if (userPickup && userPickup !== prevPickup.current) {
      prevPickup.current = userPickup;
      // Only fly if no route yet (route layer will fitBounds when both are set)
      if (!destinationPin) map.flyTo([userPickup.lat, userPickup.lng], 17, { duration: 1.2 });
    }
  }, [userPickup]);
  useEffect(() => {
    if (destinationPin && destinationPin !== prevDest.current) {
      prevDest.current = destinationPin;
      // Route layer will fitBounds — just a quick fly while waiting for OSRM
      map.flyTo([destinationPin.lat, destinationPin.lng], 16, { duration: 1.0 });
    }
  }, [destinationPin]);
  return null;
}

export default function MapBackground({ mapRef }) {
  const { darkMode, userPickup, destinationPin, pinTarget, view } = useApp();
  const isCommuter = view === 'commuter';

  return (
    <div id="map-container" style={{ cursor: pinTarget ? 'crosshair' : 'grab' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom
        inertia
        inertiaDeceleration={3000}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController mapRef={mapRef} />
        <MapClickHandler />
        <FlyToPoint />
        <RouteLayer />
        <UserLocationInit />
        <UserLocationDot />
        <DarkAwareTileLayer darkMode={darkMode} />
        {/* Destination marker — red drop pin */}
        {destinationPin && (
          <Marker position={[destinationPin.lat, destinationPin.lng]} icon={destIcon}>
            <Popup>
              <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '160px' }}>
                <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px', marginBottom: '2px' }}>📍 Destination</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{destinationPin.label}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {/* User pickup marker — only shown when a pickup is set */}
        {userPickup && (
          <>
            <Marker position={[userPickup.lat, userPickup.lng]} icon={pickupIcon}>
              <Popup>
                <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '13px', marginBottom: '2px' }}>📍 Your Pickup</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>{userPickup.label}</div>
                </div>
              </Popup>
            </Marker>
            {userPickup.fromGps && (
              <Circle
                center={[userPickup.lat, userPickup.lng]}
                radius={userPickup.accuracy || 30}
                pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.12, weight: 1.5 }}
              />
            )}
          </>
        )}
        {/* Trike terminal marker — only shown in driver view */}
        {!isCommuter && (
          <Marker position={DEFAULT_CENTER} icon={trikeIcon}>
          <Popup>
            <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '180px' }}>
              <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '15px', marginBottom: '4px' }}>Tricycle Terminal</div>
              <div style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#22c55e', fontSize: '16px' }}>🚖</span>
                <span>Tricycle Terminal</span>
              </div>
              <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                Available Now
              </div>
            </div>
          </Popup>
        </Marker>
        )}
      </MapContainer>
    </div>
  );
}
