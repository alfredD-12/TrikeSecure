import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Search, MapPin, Loader2, Building2, TreePine, Landmark, Navigation, X } from 'lucide-react';
import Fuse from 'fuse.js';

/* ── Local places database for fuzzy matching ── */
const LOCAL_PLACES = [
  { name: 'BSU ARASOF',          alt: 'Bulacan State University ARASOF Nasugbu', lat: 14.0714, lon: 120.6327, type: 'university', class: 'amenity', area: 'Nasugbu, Batangas' },
  { name: 'Savemore',            alt: 'Savemore Market Supermarket',            lat: 16.0433, lon: 119.9506, type: 'shop',       class: 'shop',    area: 'Bolinao, Pangasinan' },
  { name: 'Simbahan',            alt: 'Simbahan Church Chapel',                 lat: 16.0120, lon: 119.8920, type: 'church',     class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Municipal Hall',      alt: 'Municipal Hall Town Hall Government',    lat: 16.0141, lon: 119.8927, type: 'government', class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Public Market',       alt: 'Public Market Palengke Wet Market',      lat: 16.0140, lon: 119.8905, type: 'market',     class: 'shop',    area: 'Bolinao, Pangasinan' },
  { name: 'Health Center',       alt: 'Barangay Health Center Clinic',          lat: 16.0145, lon: 119.8935, type: 'hospital',   class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Barangay Hall',       alt: 'Barangay Hall Community Center',         lat: 16.0148, lon: 119.8910, type: 'government', class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Police Station',      alt: 'PNP Police Station',                     lat: 16.0139, lon: 119.8940, type: 'police',     class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Elementary School',   alt: 'Elementary School Public School',        lat: 16.0138, lon: 119.8915, type: 'school',     class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'National High School',alt: 'National High School Senior Junior',     lat: 16.0155, lon: 119.8925, type: 'school',     class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Gasoline Station',    alt: 'Gas Station Petron Shell Caltex',        lat: 16.0160, lon: 119.8950, type: 'fuel',       class: 'amenity', area: 'Bolinao, Pangasinan' },
  { name: 'Pharmacy',            alt: 'Pharmacy Drugstore Mercury TGP',         lat: 16.0137, lon: 119.8908, type: 'pharmacy',   class: 'shop',    area: 'Bolinao, Pangasinan' },
];

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
  const [suggestions, setSuggestions] = useState([]); // "Did you mean?" fallback
  const [loading, setLoading]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  // Fuse.js instance for fuzzy local matching
  const fuse = useMemo(() => new Fuse(LOCAL_PLACES, {
    keys: ['name', 'alt'],
    threshold: 0.55,      // very generous — catches heavy typos
    distance: 200,
    includeScore: true,
    minMatchCharLength: 2,
  }), []);

  // A broader fuse for "did you mean" suggestions (even looser matching)
  const suggestFuse = useMemo(() => new Fuse(LOCAL_PLACES, {
    keys: ['name', 'alt'],
    threshold: 0.7,       // very loose — will suggest even distant matches
    distance: 300,
    includeScore: true,
    minMatchCharLength: 1,
  }), []);

  // Auto-focus input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setSuggestions([]); setLoading(false); return; }
    setLoading(true);

    // 1. Fuzzy match locally (instant, typo-tolerant)
    const fuzzyHits = fuse.search(q).map(r => ({
      place_id:     `local-${r.item.name}`,
      lat:          r.item.lat,
      lon:          r.item.lon,
      display_name: `${r.item.name}, ${r.item.area}`,
      type:         r.item.type,
      class:        r.item.class,
      _local:       true,
      _score:       r.score,
    }));

    // Also get broader suggestions for "Did you mean?" fallback
    const broadHits = suggestFuse.search(q).slice(0, 5).map(r => ({
      place_id:     `suggest-${r.item.name}`,
      lat:          r.item.lat,
      lon:          r.item.lon,
      display_name: `${r.item.name}, ${r.item.area}`,
      type:         r.item.type,
      class:        r.item.class,
      _local:       true,
      _suggestion:  true,
    }));
    setSuggestions(broadHits);

    // Show local results immediately while API loads
    if (fuzzyHits.length > 0) {
      setResults(fuzzyHits);
    }

    // 2. Also query Geoapify Autocomplete API for broader results
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
      const url =
        `https://api.geoapify.com/v1/geocode/autocomplete` +
        `?text=${encodeURIComponent(q)}&limit=7&filter=countrycode:ph&lang=en&apiKey=${apiKey}`;
      const res  = await fetch(url);
      const data = await res.json();

      // Map Geoapify GeoJSON features to our internal format
      const apiResults = (data.features || []).map(f => ({
        place_id:     f.properties.place_id || `geo-${f.properties.lon}-${f.properties.lat}`,
        lat:          f.properties.lat,
        lon:          f.properties.lon,
        display_name: f.properties.formatted,
        type:         f.properties.result_type || '',
        class:        f.properties.category || '',
      }));

      // Merge: local fuzzy results first, then API results (deduped by name similarity)
      const localNames = new Set(fuzzyHits.map(h => h.display_name.split(',')[0].toLowerCase().trim()));
      const apiFiltered = apiResults.filter(p => {
        const apiName = p.display_name.split(',')[0].toLowerCase().trim();
        return !localNames.has(apiName);
      });
      setResults([...fuzzyHits, ...apiFiltered]);
    } catch {
      // If API fails, still show local fuzzy results
      if (fuzzyHits.length === 0) setResults([]);
    } finally {
      setLoading(false);
    }
  }, [fuse, suggestFuse]);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 380);
  }

  async function handleSelect(place) {
    let lat = parseFloat(place.lat);
    let lng = parseFloat(place.lon);
    const parts = place.display_name.split(',');
    const label = parts.slice(0, 3).join(',').trim();

    // For local fuzzy results, fetch accurate coordinates from Geoapify
    if (place._local) {
      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
        const name = parts[0].trim();
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(name + ', Philippines')}&limit=1&lang=en&apiKey=${apiKey}`
        );
        const data = await res.json();
        const f = data.features?.[0];
        if (f) {
          lat = f.properties.lat;
          lng = f.properties.lon;
        }
      } catch { /* fall back to hardcoded coords */ }
    }

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
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 py-2"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 transition-all hover:bg-gray-200 active:scale-90"
            >
              <X size={14} />
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

        {/* No results — show "Did you mean?" suggestions */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <MapPin size={36} className="text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-500">No exact match for</p>
              <p className="text-base font-black text-gray-800 mt-0.5">"{query}"</p>
            </div>

            {suggestions.length > 0 && (
              <div>
                <p className="text-[11px] font-black text-amber-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
                  <span>💡</span> Did you mean?
                </p>
                <ul className="space-y-1">
                  {suggestions.map((place) => {
                    const parts = place.display_name.split(',');
                    const name  = parts[0];
                    const sub   = parts.slice(1).join(',').trim();
                    return (
                      <li
                        key={place.place_id}
                        className="flex items-center gap-4 px-3 py-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-amber-50 active:bg-amber-100 border border-transparent hover:border-amber-100"
                        onMouseDown={() => handleSelect(place)}
                        onTouchEnd={(e) => { e.preventDefault(); handleSelect(place); }}
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                          <PlaceIcon type={place.type} category={place.class} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">{sub}</p>
                        </div>
                        <Navigation size={14} className="text-amber-300 shrink-0" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {suggestions.length === 0 && (
              <p className="text-xs text-gray-400 text-center">Try a different search term or check the spelling</p>
            )}
          </div>
        )}

        {/* Empty / initial state */}
        {!loading && query.length < 2 && (
          <div className="pt-6 space-y-6">
            
            {/* Recent Destinations (Mocked for HCI demonstration) */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Destinations</p>
              <div className="space-y-1">
                <button
                  onClick={() => setQuery('BSU ARASOF')}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">BSU ARASOF</p>
                    <p className="text-xs text-gray-400 font-medium">Bolinao, Pangasinan</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Popular Landmarks */}
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3 px-1">Popular Landmarks</p>
              <div className="space-y-2 flex flex-wrap gap-2">
                {[
                  { emoji: '🛒', name: 'Savemore',   sub: 'Supermarket' },
                  { emoji: '⛪', name: 'Simbahan',   sub: 'Church' },
                ].map((place) => (
                  <button
                    key={place.name}
                    onClick={() => setQuery(place.name)}
                    className="flex-1 min-w-[140px] flex flex-col items-start gap-1 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 active:scale-95 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg mb-1">
                      {place.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{place.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{place.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
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
