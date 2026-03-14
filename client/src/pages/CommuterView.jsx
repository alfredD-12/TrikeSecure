import { useState, useEffect, useRef } from 'react';
import {
  CarFront, ScanLine, ClipboardList, User,
  AlertCircle, ChevronDown, Hash, ShieldCheck, LogOut, ChevronRight, QrCode,
  LocateFixed, MapPin, X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import LocationSearchModal from '../components/commuter/LocationSearchModal';
import { logout } from '../api';

export default function CommuterView({ mapRef }) {
  const { t, setView, currentUser, setCurrentUser, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, setDestinationPin } = useApp();
  const [activeTab, setActiveTab] = useState('ride');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [searchModal, setSearchModal] = useState(null); // null | 'from' | 'to'
  const prevPinTargetRef = useRef(null);

  // Re-expand bottom sheet when pin mode ends
  useEffect(() => {
    if (prevPinTargetRef.current && !pinTarget) {
      const sheet = document.getElementById('commuter-sheet');
      if (sheet) {
        sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
        sheet.style.transform = 'translateY(0px)';
      }
    }
    prevPinTargetRef.current = pinTarget;
  }, [pinTarget]);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const parts = data.display_name?.split(',') ?? [];
      return parts.slice(0, 3).join(',').trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGpsError(t('commuter-gps-error'));
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const label = await reverseGeocode(lat, lng);
        setUserPickup({ lat, lng, label, fromGps: true, accuracy });
        setGpsLoading(false);
      },
      () => {
        setGpsError(t('commuter-gps-error'));
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function activatePinOnMap() {
    setPinTarget('to');
    // Collapse bottom sheet so map is visible
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) {
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      const viewH = window.innerHeight;
      sheet.style.transform = `translateY(${viewH - 160}px)`;
    }
  }

  function clearPickup() {
    setUserPickup(null);
    setGpsError('');
  }

  function handleModalSelect({ lat, lng, label }) {
    if (searchModal === 'from') {
      setUserPickup({ lat, lng, label });
      setGpsError('');
    } else if (searchModal === 'to') {
      setDestination(label);
      setDestinationPin({ lat, lng, label });
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) {
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      sheet.style.transform = 'translateY(0px)';
    }
  }

  async function doLogout() {
    await logout();
    setCurrentUser(null);
    setView('login');
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) sheet.style.transform = 'translateY(0px)';
  }

  const displayName = currentUser?.fullName || currentUser?.username || 'User';
  const displayContact = currentUser?.email || 'No email available';

  const navItems = [
    { id: 'ride',    Icon: CarFront,      label: 'Ride' },
    { id: 'scan',    Icon: ScanLine,      label: 'Scan' },
    { id: 'report',  Icon: ClipboardList, label: 'Report' },
    { id: 'account', Icon: User,          label: 'Account' },
  ];

  return (
    <div className="h-screen flex flex-col relative w-full max-w-lg mx-auto">
      <Header />
      <MapControls mapRef={mapRef} />

      {/* Location Search Modal */}
      {searchModal && (
        <LocationSearchModal
          mode={searchModal}
          onClose={() => setSearchModal(null)}
          onSelect={handleModalSelect}
          mapRef={mapRef}
          t={t}
        />
      )}

      {/* Floating hint banner when pin mode is active */}
      {pinTarget && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-xl text-sm font-bold whitespace-nowrap">
          <MapPin size={15} className={pinTarget === 'to' ? 'text-red-400' : 'text-blue-400'} />
          {pinTarget === 'to' ? t('commuter-pin-destination-hint') : t('commuter-pin-map-hint')}
          <button
            onClick={() => setPinTarget(null)}
            className="ml-1 text-gray-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <BottomSheet id="commuter">
        {/* ── Ride Tab ─────────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'ride' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-6 tracking-tight">{t('commuter-where')}</h2>

          <div className="v-anim v-anim--2 v-route-panel mb-4">
            <div className="v-route-line" />

            {/* FROM row */}
            <div className="relative z-10 flex items-center gap-4 mb-5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white/60 shadow-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t('commuter-from')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setSearchModal('from')}
                    className="flex-1 text-left font-bold text-sm truncate min-w-0"
                    style={{ color: userPickup ? '#111827' : '#9ca3af' }}
                  >
                    {userPickup ? userPickup.label : t('commuter-set-pickup')}
                  </button>
                  {userPickup && (
                    <button onClick={clearPickup} className="text-gray-400 hover:text-red-500 shrink-0">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200/60 w-full ml-10 mb-5" />

            {/* TO row */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border-4 border-white/60 shadow-sm">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{t('commuter-going-to')}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchModal('to')}
                    className="flex-1 text-left v-glass px-4 py-3 font-bold text-sm transition-all hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 truncate min-w-0"
                    style={{ color: destination ? '#111827' : '#9ca3af' }}
                  >
                    {destination || t('commuter-destination-placeholder')}
                  </button>
                  {destination && (
                    <button
                      onClick={() => { setDestination(''); setDestinationPin(null); }}
                      className="text-gray-400 hover:text-red-500 shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={activatePinOnMap}
                    disabled={!!pinTarget}
                    title="Pin destination on map"
                    className="shrink-0 w-11 h-11 flex items-center justify-center bg-red-50 border border-red-100 text-red-600 rounded-xl btn-press disabled:opacity-40"
                  >
                    <MapPin size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GPS for From field */}
          <button
            onClick={useCurrentLocation}
            disabled={gpsLoading}
            className="v-anim v-anim--3 v-gps-btn mb-6"
          >
            <LocateFixed size={15} className={gpsLoading ? 'animate-spin' : ''} />
            {gpsLoading ? t('commuter-getting-location') : t('commuter-use-gps')}
          </button>

          {/* GPS error */}
          {gpsError && (
            <p className="text-xs font-bold text-red-500 mb-4 px-1">⚠ {gpsError}</p>
          )}

          {/* Quick destination chips */}
          <div className="v-anim v-anim--4 flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
            {[['📍', 'BSU ARASOF'], ['🛒', 'Savemore'], ['⛪', 'Simbahan']].map(([emoji, place]) => (
              <button
                key={place}
                onClick={() => setDestination(place)}
                className="v-chip"
              >
                <span>{emoji}</span> {place}
              </button>
            ))}
          </div>

          <button className="v-anim v-anim--5 v-btn-primary">
            {t('commuter-book-btn')}
          </button>
        </div>

        {/* ── Scan Tab ─────────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'scan' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('commuter-verify-title')}</h2>
          <p className="v-anim v-anim--1 text-sm font-semibold text-gray-500 mb-8">{t('commuter-verify-desc')}</p>

          <div className="v-anim v-anim--2 v-scanner-box mb-10">
            <div className="absolute w-44 h-44 border-2 border-red-500/50 rounded-xl z-10">
              <div className="w-full h-0.5 bg-red-500 absolute top-1/2 shadow-[0_0_8px_#ef4444] radar-ping" />
            </div>
            <QrCode size={64} className="text-gray-300" />
            <p className="absolute bottom-4 text-xs font-bold text-gray-400 tracking-wider uppercase">Scanner Active</p>
          </div>

          <div className="v-anim v-anim--3 v-input-wrap max-w-sm mx-auto">
            <Hash className="v-input-icon w-5 h-5" />
            <input
              type="text"
              placeholder={t('commuter-body-scan-placeholder')}
              className="!pr-24"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-gray-900 text-white px-5 rounded-xl font-bold text-xs btn-press">
              {t('commuter-search')}
            </button>
          </div>
        </div>

        {/* ── Report Tab ───────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'report' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-6 tracking-tight">{t('commuter-report-title')}</h2>

          <form className="space-y-4">
            <div className="v-anim v-anim--2">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-complaint-type')}
              </label>
              <div className="v-input-wrap">
                <AlertCircle className="v-input-icon w-5 h-5" />
                <select className="!appearance-none">
                  <option value="" disabled defaultValue>{t('commuter-select-issue')}</option>
                  <option>{t('commuter-overcharging')}</option>
                  <option>{t('commuter-reckless')}</option>
                  <option>{t('commuter-refused')}</option>
                  <option>{t('commuter-colorum')}</option>
                  <option>{t('commuter-others')}</option>
                </select>
                <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="v-anim v-anim--3">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-body-number-label')}
              </label>
              <div className="v-input-wrap">
                <Hash className="v-input-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('commuter-body-report-placeholder')}
                />
              </div>
            </div>

            <div className="v-anim v-anim--4">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-incident-label')}
              </label>
              <div className="v-input-wrap">
                <textarea
                  rows={3}
                  placeholder={t('commuter-incident-placeholder')}
                  className="!pl-4 resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              className="v-anim v-anim--5 v-btn-dark mt-4"
            >
              {t('commuter-submit-report')}
            </button>
          </form>
        </div>

        {/* ── Account Tab ──────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'account' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('commuter-account-title')}</h2>

          <div className="v-anim v-anim--2 v-profile-card mb-8">
            <div className="w-16 h-16 v-glass rounded-full flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{displayName}</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5">{displayContact}</p>
            </div>
          </div>

          <div className="v-anim v-anim--3 space-y-3 mb-8">
            {[
              { icon: <User size={20} className="text-gray-600" />, label: 'Edit Profile' },
              { icon: <ShieldCheck size={20} className="text-gray-600" />, label: 'Privacy & Security' },
            ].map((item, i) => (
              <button key={i} className="v-menu-row">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl">{item.icon}</div>
                  <span className="font-bold text-gray-800 text-sm">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ))}
          </div>

          <button
            onClick={doLogout}
            className="v-anim v-anim--4 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold text-sm btn-press"
          >
            <LogOut size={20} />
            <span>{t('commuter-logout')}</span>
          </button>
        </div>
      </BottomSheet>

      {/* Bottom Nav */}
      <nav className="v-nav">
        {navItems.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`v-nav-item ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span className="v-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
