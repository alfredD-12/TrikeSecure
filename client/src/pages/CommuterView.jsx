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
  const [reportType, setReportType] = useState('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const prevPinTargetRef = useRef(null);

  // Computed state for booking validation
  const canBook = userPickup && destination;

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
      const apiKey = import.meta.env.VITE_GEOAPIFY_REVERSE_KEY;
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=en&apiKey=${apiKey}`
      );
      const data = await res.json();
      const props = data.features?.[0]?.properties;
      return props?.formatted
        ? props.formatted.split(',').slice(0, 3).join(',').trim()
        : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
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
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-[3px] border-white shadow-sm shrink-0">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{t('commuter-from')}</p>
                <div className="flex items-center gap-2">
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
              
              {/* Inline GPS Location Button */}
              <button
                onClick={useCurrentLocation}
                disabled={gpsLoading}
                title={t('commuter-use-gps')}
                className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border transition-all ${
                  gpsLoading 
                    ? 'bg-blue-50 border-blue-100 text-blue-400' 
                    : 'bg-white border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-95 shadow-sm'
                }`}
              >
                <LocateFixed size={18} className={gpsLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="h-px bg-gray-200/60 w-full ml-11 mb-4" />

            {/* TO row */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border-[3px] border-white shadow-sm shrink-0">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
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

          {/* GPS error (if inline location fetch fails) */}
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

          <button disabled={!canBook} className="v-anim v-anim--5 v-btn-primary">
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
            <QrCode size={64} className="text-gray-300 relative z-10" />
            <p className="absolute bottom-4 text-[10px] font-black text-gray-400 tracking-wider uppercase v-scanner-pulse-text">Scanner Active</p>
          </div>

          <div className="v-anim v-anim--3 v-input-wrap max-w-sm mx-auto shadow-sm">
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
            <div className="v-anim v-anim--2 relative z-50">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-complaint-type')}
              </label>
              <div className="relative">
                <div 
                  className="v-input-wrap shadow-sm transition-all"
                  style={isReportDropdownOpen ? { borderColor: '#ef4444', backgroundColor: '#ffffff', boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(239, 68, 68, 0.15)' } : {}}
                >
                  <AlertCircle 
                    className="v-input-icon w-5 h-5 transition-all" 
                    style={isReportDropdownOpen ? { color: '#ef4444', transform: 'translateY(-50%) scale(1.1)' } : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                    className="w-full bg-transparent border-none outline-none text-left flex items-center justify-between transition-colors"
                    style={{ padding: '18px 16px 18px 48px' }}
                  >
                    <span className={reportType ? 'text-gray-900 font-semibold text-[15px]' : 'text-gray-400 font-medium text-[15px]'}>
                      {reportType ? [
                        { value: 'overcharging', label: t('commuter-overcharging') || 'Overcharging' },
                        { value: 'reckless', label: t('commuter-reckless') || 'Reckless Driver' },
                        { value: 'refused', label: t('commuter-refused') || 'Refused to Ride' },
                        { value: 'colorum', label: t('commuter-colorum') || 'Colorum (No Franchise)' },
                        { value: 'others', label: t('commuter-others') || 'Others' }
                      ].find(o => o.value === reportType)?.label : (t('commuter-select-issue') || 'Select an issue...')}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isReportDropdownOpen ? 'rotate-180 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>

                {isReportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsReportDropdownOpen(false)} />
                    <ul 
                      className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2" 
                      style={{ opacity: 0, transform: 'translateY(14px)', animation: 'v-fadein 0.25s cubic-bezier(0.16,1,0.3,1) forwards' }}
                    >
                      {[
                        { value: 'overcharging', label: t('commuter-overcharging') || 'Overcharging' },
                        { value: 'reckless', label: t('commuter-reckless') || 'Reckless Driver' },
                        { value: 'refused', label: t('commuter-refused') || 'Refused to Ride' },
                        { value: 'colorum', label: t('commuter-colorum') || 'Colorum (No Franchise)' },
                        { value: 'others', label: t('commuter-others') || 'Others' }
                      ].map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => { setReportType(option.value); setIsReportDropdownOpen(false); }}
                            className={`w-full text-left px-5 py-3.5 text-[15px] font-semibold transition-colors hover:bg-gray-50 active:bg-gray-100 ${reportType === option.value ? 'text-red-600 bg-red-50/50' : 'text-gray-700'}`}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="v-anim v-anim--3">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-body-number-label')}
              </label>
              <div className="v-input-wrap shadow-sm">
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
              <div className="v-input-wrap shadow-sm">
                <textarea
                  rows={3}
                  placeholder={t('commuter-incident-placeholder')}
                  className="!pl-4 resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!reportType}
              className="v-anim v-anim--5 v-btn-dark mt-4"
            >
              {t('commuter-submit-report')}
            </button>
          </form>
        </div>

        {/* ── Account Tab ──────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'account' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-8 tracking-tight">{t('commuter-account-title')}</h2>

          <div className="v-anim v-anim--2 v-profile-card mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(243,244,246,0.5) 100%)' }}>
            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center shrink-0">
              <User size={32} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-900 tracking-tight truncate">{displayName}</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">{displayContact}</p>
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
