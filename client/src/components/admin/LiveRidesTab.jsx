import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Clock, Car, Users, Loader2, RefreshCw, AlertCircle, User, Route } from 'lucide-react';
import { getAdminLiveRides } from '../../api';

/* ── Status config ── */
const STATUS_CFG = {
  waiting:     { label: 'Waiting',     color: '#f59e0b', bg: 'bg-amber-400/10  text-amber-300  border-amber-400/20',  dot: '#f59e0b' },
  accepted:    { label: 'Accepted',    color: '#3b82f6', bg: 'bg-blue-400/10   text-blue-300   border-blue-400/20',   dot: '#3b82f6' },
  arrived:     { label: 'Arrived',     color: '#a78bfa', bg: 'bg-violet-400/10 text-violet-300 border-violet-400/20', dot: '#a78bfa' },
  in_progress: { label: 'In Ride',     color: '#22c55e', bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20', dot: '#22c55e' },
};

const POLL_MS = 10_000;

function fmt(v) {
  if (!v) return '--';
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STEPS = [
  { key: 'accepted',    label: 'ACCEPTED' },
  { key: 'arrived',     label: 'ARRIVED'  },
  { key: 'in_progress', label: 'IN RIDE'  },
  { key: 'done',        label: 'DONE'     },
];

const STEP_INDEX = { waiting: -1, accepted: 0, arrived: 1, in_progress: 2, done: 3 };

function RideStatusBar({ status }) {
  const currentIdx = STEP_INDEX[status] ?? -1;
  // waiting = 0%, accepted = 25%, arrived = 50%, in_progress = 75%, done = 100%
  const barFill = currentIdx < 0 ? 0 : ((currentIdx + 1) / STEPS.length) * 100;
  return (
    <div className="mb-3">
      {/* Labels */}
      <div className="flex justify-between mb-1.5">
        {STEPS.map((step, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <span
              key={step.key}
              className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                active ? 'text-emerald-400'
                : done  ? 'text-emerald-600'
                : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          );
        })}
      </div>
      {/* Track */}
      <div className="relative h-[3px] rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${barFill}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
        />
      </div>
    </div>
  );
}

/* ── Leaflet map (lazy-loaded) ── */
function LiveMap({ rides, selectedId, onSelect, dm }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});

  // Init map once
  useEffect(() => {
    let map;
    import('leaflet').then(L => {
      if (!containerRef.current || mapRef.current) return;

      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      map = L.map(containerRef.current, {
        center: [14.054, 120.645],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer(
        dm
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 },
      ).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line

  // Update markers when rides change
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      const map = mapRef.current;
      if (!map) return;

      const seen = new Set();

      rides.forEach(ride => {
        const cfg  = STATUS_CFG[ride.status] || STATUS_CFG.waiting;
        const hasDriverLoc = ride.driverLat != null && ride.driverLng != null;
        const lat  = hasDriverLoc ? ride.driverLat  : ride.pickupLat;
        const lng  = hasDriverLoc ? ride.driverLng  : ride.pickupLng;

        if (!lat || !lng) return;

        const isSelected = ride.requestId === selectedId;
        const key = `r-${ride.requestId}`;
        seen.add(key);

        const icon = L.divIcon({
          className: '',
          iconSize:  [isSelected ? 44 : 36, isSelected ? 44 : 36],
          iconAnchor:[isSelected ? 22 : 18, isSelected ? 44 : 36],
          html: `<div style="
            width:${isSelected ? 44 : 36}px;height:${isSelected ? 44 : 36}px;
            border-radius:50%;background:${cfg.color};
            border:${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.5)'};
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 16px ${cfg.color}60;
            cursor:pointer;transition:all .2s;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>`,
        });

        if (markersRef.current[key]) {
          markersRef.current[key].setLatLng([lat, lng]).setIcon(icon);
        } else {
          const marker = L.marker([lat, lng], { icon })
            .addTo(map)
            .on('click', () => onSelect(ride.requestId));

          const popup = L.popup({ className: 'rides-popup' }).setContent(`
            <div style="font-family:system-ui;padding:4px 2px;min-width:160px">
              <p style="font-weight:900;font-size:13px;margin:0 0 4px">${ride.commuterName || 'Commuter'}</p>
              <p style="font-size:11px;color:#94a3b8;margin:0 0 2px">${ride.pickupLocation || '--'}</p>
              <p style="font-size:11px;color:#94a3b8;margin:0">→ ${ride.dropoffLocation || '--'}</p>
              ${ride.driverName ? `<p style="font-size:11px;font-weight:700;margin:4px 0 0;color:${cfg.color}">Driver: ${ride.driverName}</p>` : ''}
              <p style="font-size:11px;font-weight:700;margin:4px 0 0">₱${Number(ride.fareAmount||0).toFixed(2)}</p>
            </div>
          `);
          marker.bindPopup(popup);
          markersRef.current[key] = marker;
        }
      });

      // Remove stale markers
      Object.keys(markersRef.current).forEach(key => {
        if (!seen.has(key)) {
          markersRef.current[key].remove();
          delete markersRef.current[key];
        }
      });
    });
  }, [rides, selectedId, onSelect]);

  // Pan to selected
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const ride = rides.find(r => r.requestId === selectedId);
    if (!ride) return;
    const lat = ride.driverLat ?? ride.pickupLat;
    const lng = ride.driverLng ?? ride.pickupLng;
    if (lat && lng) mapRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
  }, [selectedId, rides]);

  return (
    <div className="relative h-full w-full">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} className="h-full w-full rounded-2xl overflow-hidden" />
    </div>
  );
}

/* ── Ride card in sidebar ── */
function RideCard({ ride, selected, dm, onSelect }) {
  const cfg = STATUS_CFG[ride.status] || STATUS_CFG.waiting;
  return (
    <button
      type="button"
      onClick={() => onSelect(ride.requestId)}
      className="w-full text-left rounded-xl p-3.5 transition-all duration-200"
      style={{
        background: selected
          ? `${cfg.color}14`
          : dm ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${selected ? cfg.color + '55' : dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: selected ? `0 0 0 1px ${cfg.color}30, 0 4px 16px ${cfg.color}18` : 'none',
      }}
    >
      {/* Progress bar — top */}
      <RideStatusBar status={ride.status} />

      {/* Route */}
      <div className="flex flex-col gap-0.5 mb-2">
        <div className="flex items-start gap-1.5">
          <MapPin size={10} className="shrink-0 text-emerald-400 mt-0.5" />
          <p className={`text-[11px] font-semibold leading-tight ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{ride.pickupLocation || 'No pickup'}</p>
        </div>
        <div className="flex items-start gap-1.5">
          <Navigation size={10} className="shrink-0 text-red-400 mt-0.5" />
          <p className={`text-[11px] font-semibold leading-tight ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{ride.dropoffLocation || 'No dropoff'}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-black ${dm ? 'text-white' : 'text-gray-900'}`}>₱{Number(ride.fareAmount || 0).toFixed(2)}</span>
        {ride.plateNumber && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            <Car size={10} /> {ride.plateNumber}
          </span>
        )}
        {ride.driverName && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${dm ? 'text-gray-400' : 'text-gray-500'} truncate max-w-[100px]`}>
            <User size={10} /> {ride.driverName}
          </span>
        )}
        <span className={`ml-auto flex items-center gap-1 text-[10px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
          <Clock size={10} /> {fmt(ride.requestTime)}
        </span>
      </div>

      {/* Driver GPS age */}
      {ride.driverLocationAge != null && (
        <p className={`mt-1 text-[10px] font-bold ${
          ride.driverLocationAge < 30 ? 'text-emerald-400' : 'text-amber-400'
        }`}>
          📡 Driver location {ride.driverLocationAge}s ago
        </p>
      )}
    </button>
  );
}

/* ── Main Tab ── */
export default function LiveRidesTab({ dm }) {
  const [rides, setRides]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRides = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const result = await getAdminLiveRides();
    if (Array.isArray(result)) {
      setRides(result);
      setError(null);
      setLastRefresh(new Date());
    } else {
      setError(result.message || 'Failed to load live rides.');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchRides(false);
    const interval = setInterval(() => fetchRides(true), POLL_MS);
    return () => clearInterval(interval);
  }, [fetchRides]);

  const counts = {
    total:      rides.length,
    waiting:    rides.filter(r => r.status === 'waiting').length,
    active:     rides.filter(r => ['accepted','arrived','in_progress'].includes(r.status)).length,
  };

  return (
    <div className="flex flex-col gap-4 h-full" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Header bar */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <Route size={17} className="text-red-400" />
          <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>Live Rides</h2>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2">
          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-black ${dm ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {counts.total} total
          </span>
          <span className="rounded-lg px-2.5 py-1 text-[11px] font-black bg-amber-400/10 text-amber-300">
            {counts.waiting} waiting
          </span>
          <span className="rounded-lg px-2.5 py-1 text-[11px] font-black bg-emerald-400/10 text-emerald-300">
            {counts.active} active
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {lastRefresh && (
            <p className={`text-[10px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          )}
          <button
            onClick={() => fetchRides(true)}
            disabled={refreshing}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black transition disabled:opacity-60 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="shrink-0 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Map + sidebar */}
      {loading ? (
        <div className={`flex flex-1 items-center justify-center gap-3 rounded-2xl ${dm ? 'bg-white/3' : 'bg-white'}`}
          style={{ border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <Loader2 size={20} className="animate-spin text-red-400" />
          <span className={dm ? 'text-gray-400' : 'text-gray-500'}>Loading live rides…</span>
        </div>
      ) : (
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Map */}
          <div className="flex-1 min-w-0 rounded-2xl overflow-hidden" style={{
            border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
          }}>
            {rides.length > 0 ? (
              <LiveMap rides={rides} selectedId={selectedId} onSelect={setSelectedId} dm={dm} />
            ) : (
              <div className={`h-full flex flex-col items-center justify-center gap-3 ${dm ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                <Car size={40} className={dm ? 'text-gray-700' : 'text-gray-300'} />
                <p className={`text-sm font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>No active rides right now</p>
                <p className={`text-xs font-semibold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>Refreshes every 10 seconds</p>
              </div>
            )}
          </div>

          {/* Sidebar list */}
          <div className="w-80 shrink-0 flex flex-col min-h-0 rounded-2xl overflow-hidden" style={{
            background: dm ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div className={`px-4 py-3 shrink-0 ${dm ? 'border-b border-white/6' : 'border-b border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                All Ride Requests · {rides.length}
              </p>
            </div>

            {rides.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className={`text-sm font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>No rides to show</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {rides.map(ride => (
                  <RideCard
                    key={ride.requestId}
                    ride={ride}
                    selected={selectedId === ride.requestId}
                    dm={dm}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .rides-popup .leaflet-popup-content-wrapper {
          background: #1e293b;
          color: #e2e8f0;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .rides-popup .leaflet-popup-tip { background: #1e293b; }
      `}</style>
    </div>
  );
}
