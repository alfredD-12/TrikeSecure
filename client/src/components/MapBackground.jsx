import { Fragment, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../contexts/AppContext';
import { API_URL } from '../services/api';
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

// Tracks whether the map is currently being dragged/panned
function MapMovementHandler() {
  const { setIsMapMoving, pinTarget } = useApp();
  useMapEvents({
    movestart: () => {
      if (pinTarget === 'to') setIsMapMoving(true);
    },
    moveend: () => {
      setIsMapMoving(false);
    }
  });
  return null;
}

// Handles map clicks when pick mode is active
function MapClickHandler() {
  const { view, pinTarget, setPinTarget, setUserPickup, setDestination, setDestinationPin } = useApp();
  useMapEvents({
    click: async (e) => {
      if (view === 'commuter') {
        const sheet = document.getElementById('commuter-sheet');
        if (sheet) {
          const collapseTo = Math.max(0, sheet.offsetHeight - 100);
          sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
          sheet.style.transform = `translateY(${collapseTo}px)`;
        }
      }

      // 'to' destination is now handled by center-pin confirm, not click
      if (!pinTarget || pinTarget === 'to') return;

      const { lat, lng } = e.latlng;
      let label;
      try {
        const res = await fetch(
          `${API_URL}/geocode/reverse?lat=${lat}&lon=${lng}&lang=en`
        );
        const data = await res.json();
        const props = data.features?.[0]?.properties;
        label = props?.formatted
          ? props.formatted.split(',').slice(0, 3).join(',').trim()
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      } catch {
        label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      if (pinTarget === 'from') {
        setUserPickup({ lat, lng, label });
        setPinTarget(null);
      }
    },
  });
  return null;
}


// Red destination drop-pin icon
const destIconHtml = `
  <div style="display: flex; align-items: center; justify-content: center;">
    <svg width="54" height="66" viewBox="-4 -4 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="v-pin-svg">
      <path d="M16 2C9.37 2 4 7.37 4 14c0 9.25 12 26 12 26s12-16.75 12-26c0-6.63-5.37-12-12-12z" fill="#ef4444" class="v-pin-path" stroke-width="4"/>
      <circle cx="16" cy="14" r="5.5" fill="white"/>
    </svg>
  </div>`;

const destIcon = L.divIcon({
  className: '',
  html: destIconHtml,
  iconSize: [54, 66],
  iconAnchor: [27, 66], // Tip is horizontally centered and vertically at the bottom of the bounding box
  popupAnchor: [0, -66],
});

// Fetches a road-following route via the backend OSRM proxy (/api/route).
// The public OSRM demo server blocks browser cross-origin requests, so we
// proxy through our own server. Falls back to a straight line on failure.
async function fetchRoute(startLng, startLat, endLng, endLat, signal) {
  const straight = [[startLat, startLng], [endLat, endLng]];
  try {
    const params = new URLSearchParams({ startLng, startLat, endLng, endLat });
    const res = await fetch(`${API_URL}/route?${params}`, { signal });
    if (!res.ok) return straight;
    const data = await res.json();
    return data.coords?.length >= 2 ? data.coords : straight;
  } catch {
    return straight;
  }
}

// Fetches a multi-stop OSRM route from an array of { lng, lat } waypoints.
async function fetchMultiRoute(waypoints, signal) {
  if (!waypoints || waypoints.length < 2) return null;
  const coordsStr = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
  const [f, l] = [waypoints[0], waypoints[waypoints.length - 1]];
  const straight = [[f.lat, f.lng], [l.lat, l.lng]];
  try {
    const res = await fetch(`${API_URL}/route?waypoints=${encodeURIComponent(coordsStr)}`, { signal });
    if (!res.ok) return straight;
    const data = await res.json();
    return data.coords?.length >= 2 ? data.coords : straight;
  } catch {
    return straight;
  }
}

// Greedy nearest-neighbor ordering of driver stops (client-side mirror of server algorithm).
// Respects pickup-before-dropoff constraint (interleaved allowed).
function buildDriverWaypoints(rides, driverPos) {
  const pickedUp = new Set(rides.filter((r) => r.status === 'in_progress').map((r) => r.requestId));
  let remaining = [];
  for (const ride of rides) {
    if (['accepted', 'arrived'].includes(ride.status) && ride.pickupLat != null) {
      remaining.push({ type: 'pickup', requestId: ride.requestId, lat: Number(ride.pickupLat), lng: Number(ride.pickupLng) });
    }
    if (ride.dropoffLat != null) {
      remaining.push({ type: 'dropoff', requestId: ride.requestId, lat: Number(ride.dropoffLat), lng: Number(ride.dropoffLng) });
    }
  }
  const result = [];
  let cur = driverPos || (remaining[0] ? { lat: remaining[0].lat, lng: remaining[0].lng } : null);
  while (remaining.length > 0 && cur) {
    const eligible = remaining.filter((s) => s.type === 'pickup' || pickedUp.has(s.requestId));
    if (!eligible.length) break;
    let nearest = null, minD = Infinity;
    for (const s of eligible) {
      const d = Math.hypot(s.lat - cur.lat, s.lng - cur.lng);
      if (d < minD) { minD = d; nearest = s; }
    }
    if (!nearest) break;
    result.push(nearest);
    remaining = remaining.filter((s) => !(s.type === nearest.type && s.requestId === nearest.requestId));
    if (nearest.type === 'pickup') pickedUp.add(nearest.requestId);
    cur = { lat: nearest.lat, lng: nearest.lng };
  }
  return result;
}

// Draws OSRM road route between pickup and destination
function RouteLayer() {
  const { userPickup, destinationPin, activeCommuterRide, activeDriverRide } = useApp();
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    // Remove old route
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (activeCommuterRide || activeDriverRide || !userPickup || !destinationPin) return;

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    fetchRoute(
      userPickup.lng, userPickup.lat,
      destinationPin.lng, destinationPin.lat,
      controller.signal
    ).then(latLngs => {
      clearTimeout(timeoutId);
      if (!isMounted || !map || !map.getContainer()) return;
      polylineRef.current = L.polyline(latLngs, {
        color: '#1d4ed8',
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });
    }).catch(() => { clearTimeout(timeoutId); });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
      if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    };
  }, [userPickup, destinationPin, activeCommuterRide, activeDriverRide, map]);

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

const commuterRequestIconHtml = `
  <div style="background:#f97316;border:4px solid white;border-radius:50%;width:40px;height:40px;
    box-shadow:0 6px 20px rgba(249,115,22,0.4),0 0 0 8px rgba(249,115,22,0.15);
    display:flex;align-items:center;justify-content:center;animation:pulse-ring 2s ease-out infinite;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  </div>`;

const commuterRequestIcon = L.divIcon({
  className: 'custom-div-icon',
  html: commuterRequestIconHtml,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
});

// Tile layer that reacts to dark mode changes
const STADIA_API_KEY = import.meta.env.VITE_STADIA_API_KEY || '';

function DarkAwareTileLayer({ darkMode }) {
  if (darkMode) {
    const stadiaDarkUrl = STADIA_API_KEY
      ? `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`
      : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

    return (
      <TileLayer
        key="alidade-smooth-dark"
        url={stadiaDarkUrl}
        maxZoom={20}
        minZoom={3}
        attribution="&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors"
      />
    );
  }

  return (
    <TileLayer
      key="voyager"
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      maxZoom={20}
      minZoom={3}
      attribution="&copy; OpenStreetMap contributors &copy; CARTO"
    />
  );
}

// Google Maps-style real-time blue dot for the current account
function UserLocationDot() {
  const { view, setLiveLocation } = useApp();
  const map = useMap();
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!['commuter', 'driver'].includes(view)) return;
    if (!navigator.geolocation) return;

    let isMounted = true;
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
        if (!isMounted) return;
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        // Publish to context so CommuterView GPS button can read it instantly
        setLiveLocation({ lat, lng, accuracy });

        if (!map || !map.getContainer()) return; // Map might be destroyed

        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], { icon: dotIcon, zIndexOffset: 1000, interactive: false }).addTo(map);
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
      },
      null,
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 30000 }
    );

    return () => {
      isMounted = false;
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
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

// Self-contained commuter-request pin layer with accept action
function CommuterRequestMarkers() {
  const { pendingRides, setPendingRides, activeDriverRides, setActiveDriverRides } = useApp();
  const [acceptingId, setAcceptingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  function haversineKm(lat1, lng1, lat2, lng2) {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function fmtDist(lat1, lng1, lat2, lng2) {
    const km = haversineKm(lat1, lng1, lat2, lng2);
    if (km == null) return null;
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  }

  async function acceptFromMap(rideId) {
    setAcceptingId(rideId);
    setErrorId(null);
    try {
      const res = await fetch(`${API_URL}/rides/${rideId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.ride) {
          setActiveDriverRides((prev) => [...prev.filter((r) => r.requestId !== data.ride.requestId), data.ride]);
        }
        setPendingRides((prev) => prev.filter((r) => r.request_id !== rideId));
      } else {
        setErrorId(rideId);
        setTimeout(() => setErrorId(null), 3000);
      }
    } catch {
      setErrorId(rideId);
      setTimeout(() => setErrorId(null), 3000);
    } finally {
      setAcceptingId(null);
    }
  }

  if (activeDriverRides.length >= 6) {
    return null; // at tricycle capacity — hide map accept pins
  }

  return (
    <>
      {pendingRides
        .filter(r => r.pickup_lat != null && r.pickup_lng != null)
        .map(r => {
          const dist = fmtDist(r.pickup_lat, r.pickup_lng, r.dropoff_lat, r.dropoff_lng);
          const isAccepting = acceptingId === r.request_id;
          return (
            <Fragment key={r.request_id}>
            <Circle
              center={[r.pickup_lat, r.pickup_lng]}
              radius={180}
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 2, opacity: 0.45 }}
            />
            <Marker position={[r.pickup_lat, r.pickup_lng]} icon={commuterRequestIcon}>
              <Popup minWidth={220}>
                <div className="v-ride-toast" style={{ animation: 'none' }}>
                  <div className="v-ride-toast__header">
                    <div className="v-ride-toast__label">
                      <div className="v-ride-toast__label-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      Ride Request
                    </div>
                  </div>

                  <div className="v-ride-toast__route">
                    <div className="v-ride-toast__route-row">
                      <span className="v-ride-toast__dot v-ride-toast__dot--pickup" />
                      <span className="v-ride-toast__route-text">{r.pickup_location || 'Pickup'}</span>
                    </div>
                    <div className="v-ride-toast__route-row">
                      <span className="v-ride-toast__dot v-ride-toast__dot--dropoff" />
                      <span className="v-ride-toast__route-text">{r.dropoff_location || 'Dropoff'}</span>
                    </div>
                  </div>

                  <div className="v-ride-toast__pills">
                    {r.fare_amount != null && (
                      <div className="v-ride-toast__pill v-ride-toast__pill--fare">
                        <span className="v-ride-toast__pill-label">Fare</span>
                        <span className="v-ride-toast__pill-value">₱{Number(r.fare_amount).toFixed(2)}</span>
                      </div>
                    )}
                    {dist && (
                      <div className="v-ride-toast__pill v-ride-toast__pill--dist">
                        <span className="v-ride-toast__pill-label">Distance</span>
                        <span className="v-ride-toast__pill-value">{dist}</span>
                      </div>
                    )}
                  </div>

                  <div className="v-ride-toast__actions">
                    <button
                      className="v-ride-toast__btn-accept"
                      disabled={isAccepting}
                      onClick={() => acceptFromMap(r.request_id)}
                    >
                      {isAccepting ? 'Accepting…' : '✓ Accept Ride'}
                    </button>
                  </div>

                  {errorId === r.request_id && (
                    <p className="v-ride-toast__note" style={{ color: '#dc2626', marginTop: '6px' }}>
                      Already taken — refreshing…
                    </p>
                  )}

                  <p className="v-ride-toast__note">Exact pickup unlocks after accepting.</p>
                </div>
              </Popup>
            </Marker>
            </Fragment>
          );
        })
      }
    </>
  );
}


function getActiveMapRide(view, activeDriverRide, activeCommuterRide) {
  return view === 'driver' ? activeDriverRide : activeCommuterRide;
}

function ActiveRidePickupMarker() {
  const { view, activeDriverRides, activeCommuterRide } = useApp();

  if (view === 'commuter') {
    // Commuter view: show single pickup marker
    const ride = activeCommuterRide;
    if (!ride || ride.pickupLat == null || ride.pickupLng == null) return null;
    return (
      <Marker position={[ride.pickupLat, ride.pickupLng]} icon={pickupIcon}>
        <Popup>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '190px' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px', marginBottom: '2px' }}>Pickup Point</div>
            <div style={{ color: '#1f2937', fontSize: '13px', fontWeight: 700 }}>{ride.commuter?.fullName || 'Commuter'}</div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{ride.pickupLocation || 'Pickup location'}</div>
          </div>
        </Popup>
      </Marker>
    );
  }

  // Driver view: show pickup markers for all rides not yet in_progress
  const pickupRides = activeDriverRides.filter(
    (r) => ['accepted', 'arrived'].includes(r.status) && r.pickupLat != null && r.pickupLng != null,
  );
  if (pickupRides.length === 0) return null;

  return (
    <>
      {pickupRides.map((ride, idx) => (
        <Marker key={`pickup-${ride.requestId}`} position={[ride.pickupLat, ride.pickupLng]} icon={pickupIcon}>
          <Popup>
            <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '190px' }}>
              <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px', marginBottom: '2px' }}>
                Pickup {String.fromCharCode(65 + idx)}
              </div>
              <div style={{ color: '#1f2937', fontSize: '13px', fontWeight: 700 }}>{ride.commuter?.fullName || 'Commuter'}</div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{ride.pickupLocation || 'Pickup location'}</div>
              <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>Exact pickup — shared after acceptance.</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function ActiveRideDropoffMarker() {
  const { view, activeDriverRides, activeCommuterRide } = useApp();

  if (view === 'commuter') {
    const ride = activeCommuterRide;
    if (!ride || ride.dropoffLat == null || ride.dropoffLng == null) return null;
    return (
      <Marker position={[ride.dropoffLat, ride.dropoffLng]} icon={destIcon}>
        <Popup>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '190px' }}>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px', marginBottom: '2px' }}>Dropoff</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{ride.dropoffLocation || 'Destination'}</div>
          </div>
        </Popup>
      </Marker>
    );
  }

  // Driver view: show dropoff markers ONLY for in_progress rides (destination hidden until started)
  const dropoffRides = activeDriverRides.filter((r) => r.status === 'in_progress' && r.dropoffLat != null && r.dropoffLng != null);
  if (dropoffRides.length === 0) return null;

  return (
    <>
      {dropoffRides.map((ride, idx) => (
        <Marker key={`dropoff-${ride.requestId}`} position={[ride.dropoffLat, ride.dropoffLng]} icon={destIcon}>
          <Popup>
            <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '190px' }}>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px', marginBottom: '2px' }}>Dropoff {String.fromCharCode(65 + idx)}</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>{ride.dropoffLocation || 'Destination'}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function ActiveRideDriverMarker() {
  const { view, activeCommuterRide } = useApp();
  const location = activeCommuterRide?.driverLocation;

  if (view !== 'commuter' || location?.lat == null || location?.lng == null) {
    return null;
  }

  return (
    <Marker position={[location.lat, location.lng]} icon={trikeIcon}>
      <Popup>
        <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '180px' }}>
          <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '13px', marginBottom: '2px' }}>Driver Location</div>
          <div style={{ color: '#1f2937', fontSize: '13px', fontWeight: 700 }}>
            {activeCommuterRide.driver?.fullName || 'Your driver'}
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>Updating while your ride is active.</div>
        </div>
      </Popup>
    </Marker>
  );
}

function ActiveRideRouteLayer() {
  const { view, activeDriverRides, activeCommuterRide, liveLocation } = useApp();
  const map = useMap();
  const polylineRef = useRef(null);
  const lastFitKeyRef = useRef(null);

  const isDriver = view === 'driver';

  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // ── Commuter view: single-ride route (pickup → dropoff) ─────────────
    if (!isDriver) {
      const ride = activeCommuterRide;
      if (!ride) return undefined;
      const start = ride.pickupLat != null ? { lat: ride.pickupLat, lng: ride.pickupLng } : null;
      const end = ride.dropoffLat != null ? { lat: ride.dropoffLat, lng: ride.dropoffLng } : null;
      if (!start || !end) return undefined;

      let isMounted = true;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      fetchRoute(start.lng, start.lat, end.lng, end.lat, controller.signal).then((latLngs) => {
        clearTimeout(timeoutId);
        if (!isMounted || !map || !map.getContainer()) return;
        polylineRef.current = L.polyline(latLngs, { color: '#16a34a', weight: 6, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }).addTo(map);
        const fitKey = `commuter-${ride.requestId}-${ride.status}`;
        if (lastFitKeyRef.current !== fitKey) {
          lastFitKeyRef.current = fitKey;
          map.fitBounds(polylineRef.current.getBounds(), { padding: [70, 70] });
        }
      }).catch(() => { clearTimeout(timeoutId); });

      return () => { isMounted = false; controller.abort(); clearTimeout(timeoutId); if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; } };
    }

    // ── Driver view: multi-stop optimized route ─────────────────────────
    if (activeDriverRides.length === 0) return undefined;

    const driverPos = liveLocation?.lat != null ? { lat: liveLocation.lat, lng: liveLocation.lng } : null;
    const stops = buildDriverWaypoints(activeDriverRides, driverPos);
    if (stops.length === 0) return undefined;

    // Build full waypoints: driver position + ordered stops
    const allWaypoints = driverPos ? [driverPos, ...stops] : stops;
    if (allWaypoints.length < 2) return undefined;

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    fetchMultiRoute(allWaypoints, controller.signal).then((latLngs) => {
      clearTimeout(timeoutId);
      if (!isMounted || !map || !map.getContainer()) return;
      polylineRef.current = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
        dashArray: activeDriverRides.some((r) => r.status === 'in_progress') ? null : '10, 6',
      }).addTo(map);

      const fitKey = `driver-${activeDriverRides.map((r) => `${r.requestId}:${r.status}`).join('|')}`;
      if (lastFitKeyRef.current !== fitKey) {
        lastFitKeyRef.current = fitKey;
        map.fitBounds(polylineRef.current.getBounds(), { padding: [70, 70] });
      }
    }).catch(() => { clearTimeout(timeoutId); });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
      if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    };
  }, [view, isDriver, activeDriverRides, activeCommuterRide, liveLocation, map]);

  return null;
}

export default function MapBackground({ mapRef }) {
  const { darkMode, userPickup, destinationPin, pinTarget, view, activeDriverRides, activeCommuterRide } = useApp();
  const isCommuter = view === 'commuter';
  const hasActiveMapRide = Boolean(view === 'commuter' ? activeCommuterRide : activeDriverRides.length > 0);

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
        <MapMovementHandler />
        <MapClickHandler />
        <FlyToPoint />
        <RouteLayer />
        <UserLocationInit />
        <UserLocationDot />
        <DarkAwareTileLayer darkMode={darkMode} />
        {/* Destination marker — red drop pin */}
        {destinationPin && !hasActiveMapRide && (
          <Marker position={[destinationPin.lat, destinationPin.lng]} icon={destIcon}>
            <Popup>
              <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '160px' }}>
                <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px', marginBottom: '2px' }}>📍 Destination</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{destinationPin.label}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {/* User pickup marker — only shown when pickup is set AND was NOT from GPS
           (GPS pickups are already visualized by the live UserLocationDot blue dot) */}
        {userPickup && !userPickup.fromGps && !hasActiveMapRide && (
          <Marker position={[userPickup.lat, userPickup.lng]} icon={pickupIcon}>
            <Popup>
              <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '4px', minWidth: '160px' }}>
                <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '13px', marginBottom: '2px' }}>📍 Your Pickup</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{userPickup.label}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {/* Trike terminal marker — only shown in driver view when no rides active */}
        {!isCommuter && activeDriverRides.length === 0 && (
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
        {/* Commuter request markers — pulsing orange pins, only in driver view */}
        {!isCommuter && <CommuterRequestMarkers />}
        <ActiveRideRouteLayer />
        <ActiveRidePickupMarker />
        <ActiveRideDropoffMarker />
        <ActiveRideDriverMarker />
      </MapContainer>
    </div>
  );
}
