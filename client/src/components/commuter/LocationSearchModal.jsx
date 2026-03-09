import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, MapPin, Loader2, Building2, TreePine, Landmark, Navigation, X } from 'lucide-react';

/* ── Category icon based on Nominatim "type" field ── */
function PlaceIcon({ type, category }) {
  const t = (type || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (c === 'amenity' || t.includes('hospital') || t.includes('school') || t.includes('university'))
    return <Landmark size={15} className="text-blue-400 shrink-0" />;
  if (c === 'shop' || t.includes('market') || t.includes('mall'))
    return <Building2 size={15} className="text-orange-400 shrink-0" />;
  if (c === 'leisure' || c === 'natural' || t.includes('park') || t.includes('beach'))
    return <TreePine size={15} className="text-green-500 shrink-0" />;
  return <MapPin size={15} className="text-red-400 shrink-0" />;
}

/**
 * LocationSearchModal
 *
 * Props:
 *   mode        — 'from' | 'to'
 *   onClose     — () => void
 *   onSelect    — ({ lat, lng, label }) => void
 *   mapRef      — Leaflet map ref for flying on select
 *   t           — translation fn
 */
export default function LocationSearchModal({ mode, onClose, onSelect, mapRef, t }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json&q=${encodeURIComponent(q)}&limit=7&addressdetails=1&countrycodes=ph`;
      const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 380);
  }

  function handleSelect(place) {
    const lat   = parseFloat(place.lat);
    const lng   = parseFloat(place.lon);
    const parts = place.display_name.split(',');
    const label = parts.slice(0, 3).join(',').trim();
    mapRef.current?.flyTo([lat, lng], 16, { duration: 1.2 });
    onSelect({ lat, lng, label });
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    else if (e.key === 'Escape') { onClose(); }
  }

  const isFrom = mode === 'from';
  const accentColor = isFrom ? 'text-blue-600' : 'text-red-600';
  const ringColor   = isFrom ? 'focus:ring-blue-500/30 focus:border-blue-500' : 'focus:ring-red-500/30 focus:border-red-500';
  const dotColor    = isFrom ? 'bg-blue-600' : 'bg-red-600';
  const dotBg       = isFrom ? 'bg-blue-100' : 'bg-red-100';
  const modeLabel   = isFrom
    ? (t?.('commuter-from') || 'From')
    : (t?.('commuter-going-to') || 'Going to');

  return (
    /* Slide-up overlay */
    <div className="fixed inset-0 z-[120] flex flex-col bg-white"
      style={{ animation: 'lsm-slide-in 0.28s cubic-bezier(0.16,1,0.3,1) both' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 shrink-0 transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Mode pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isFrom ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={`text-[11px] font-black uppercase tracking-wider ${accentColor}`}>{modeLabel}</span>
        </div>
      </div>

      {/* ── Search input ── */}
      <div className="px-4 pt-4 pb-2">
        <div className={`flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 transition-all focus-within:ring-2 ${ringColor} focus-within:bg-white`}>
          {loading
            ? <Loader2 size={18} className={`${accentColor} animate-spin shrink-0`} />
            : <Search size={18} className="text-gray-400 shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search places, landmarks…"
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 transition-all hover:bg-gray-300 active:scale-90"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Results list ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Loading skeleton */}
        {loading && results.length === 0 && (
          <div className="space-y-3 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <MapPin size={40} className="text-gray-200 mb-4" />
            <p className="text-sm font-bold text-gray-500">No results for</p>
            <p className="text-base font-black text-gray-800 mt-1">"{query}"</p>
            <p className="text-xs text-gray-400 mt-2">Try a different search term</p>
          </div>
        )}

        {/* Empty / initial state */}
        {!loading && query.length < 2 && (
          <div className="pt-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3 px-1">Quick picks</p>
            <div className="space-y-1">
              {[
                { emoji: '📍', name: 'BSU ARASOF', sub: 'Bolinao, Pangasinan' },
                { emoji: '🛒', name: 'Savemore',   sub: 'Supermarket' },
                { emoji: '⛪', name: 'Simbahan',   sub: 'Church' },
              ].map((place) => (
                <button
                  key={place.name}
                  onClick={() => setQuery(place.name)}
                  className="w-full flex items-center gap-4 px-3 py-3.5 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                    {place.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{place.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{place.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {results.length > 0 && (
          <ul className="pt-3 space-y-1" role="listbox">
            {results.map((place, i) => {
              const parts = place.display_name.split(',');
              const name  = parts[0];
              const sub   = parts.slice(1, 3).join(',').trim();
              return (
                <li
                  key={place.place_id}
                  role="option"
                  className={`flex items-center gap-4 px-3 py-3.5 rounded-2xl cursor-pointer transition-colors ${i === activeIdx ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'}`}
                  style={{ animationDelay: `${i * 30}ms` }}
                  onMouseDown={() => handleSelect(place)}
                  onTouchEnd={(e) => { e.preventDefault(); handleSelect(place); }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <PlaceIcon type={place.type} category={place.class} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400 font-medium truncate">{sub}</p>
                  </div>
                  <Navigation size={14} className="text-gray-300 shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <style>{`
        @keyframes lsm-slide-in {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        body.dark-mode .fixed.bg-white {
          background-color: #111827 !important;
        }
      `}</style>
    </div>
  );
}
