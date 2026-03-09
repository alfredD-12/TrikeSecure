import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, MapPin, Loader2, Building2, TreePine, Navigation, Landmark } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import '../styles/SearchBar.css';

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

export default function SearchBar({ mapRef }) {
  const { setUserPickup, setDestination, setDestinationPin } = useApp();
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [selected, setSelected]     = useState(null); // { lat, lng, label }
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);
  const wrapRef     = useRef(null);

  /* ── Nominatim search (Philippines-biased) ── */
  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&countrycodes=ph`;
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
    setSelected(null);
    setActiveIdx(-1);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  function handleSelect(place) {
    const lat   = parseFloat(place.lat);
    const lng   = parseFloat(place.lon);
    const parts = place.display_name.split(',');
    const label = parts.slice(0, 3).join(',').trim();
    setQuery(label);
    setResults([]);
    setSelected({ lat, lng, label });
    setFocused(false);
    inputRef.current?.blur();
    mapRef.current?.flyTo([lat, lng], 16, { duration: 1.2 });
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(results[activeIdx]); }
    else if (e.key === 'Escape') { setResults([]); setFocused(false); inputRef.current?.blur(); }
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setSelected(null);
    setLoading(false);
    inputRef.current?.focus();
  }

  function setAsFrom() {
    if (!selected) return;
    setUserPickup({ lat: selected.lat, lng: selected.lng, label: selected.label });
    setSelected(null); setQuery('');
  }

  function setAsTo() {
    if (!selected) return;
    setDestination(selected.label);
    setDestinationPin({ lat: selected.lat, lng: selected.lng, label: selected.label });
    setSelected(null); setQuery('');
  }

  /* ── Close dropdown on outside tap/click ── */
  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setResults([]); setFocused(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, []);

  const showDropdown = focused && (loading || results.length > 0 || (query.length >= 2 && !loading));

  return (
    <div ref={wrapRef} className={`sb-wrap${focused ? ' sb-focused' : ''}`}>

      {/* ── Search pill ── */}
      <div className="sb-pill">
        <div className="sb-icon">
          {loading
            ? <Loader2 size={17} className="text-red-500 animate-spin" />
            : <Search size={17} className={`sb-search-icon${focused ? ' active' : ''}`} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search places, landmarks…"
          className="sb-input"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {query && (
          <button onClick={handleClear} className="sb-clear" aria-label="Clear search">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Quick-action bar after a result is tapped ── */}
      {selected && (
        <div className="sb-action-bar">
          <span className="sb-action-label">
            <MapPin size={11} className="inline mr-1 text-red-400" />
            {selected.label}
          </span>
          <div className="sb-action-btns">
            <button onClick={setAsFrom} className="sb-action-btn sb-from">Set as From</button>
            <button onClick={setAsTo}   className="sb-action-btn sb-to">Set as To</button>
          </div>
        </div>
      )}

      {/* ── Results dropdown ── */}
      {showDropdown && (
        <ul className="sb-results" role="listbox">
          {loading && results.length === 0 && (
            <li className="sb-result-empty">
              <Loader2 size={14} className="animate-spin text-red-400" /> Searching…
            </li>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <li className="sb-result-empty">No results for "<strong>{query}</strong>"</li>
          )}
          {results.map((place, i) => {
            const parts = place.display_name.split(',');
            const name  = parts[0];
            const sub   = parts.slice(1, 3).join(',').trim();
            return (
              <li
                key={place.place_id}
                role="option"
                className={`sb-result-item${i === activeIdx ? ' sb-active' : ''}`}
                style={{ animationDelay: `${i * 35}ms` }}
                onMouseDown={() => handleSelect(place)}
                onTouchEnd={(e) => { e.preventDefault(); handleSelect(place); }}
              >
                <PlaceIcon type={place.type} category={place.class} />
                <div className="sb-result-text">
                  <span className="sb-result-name">{name}</span>
                  <span className="sb-result-sub">{sub}</span>
                </div>
                <Navigation size={13} className="sb-result-nav" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
