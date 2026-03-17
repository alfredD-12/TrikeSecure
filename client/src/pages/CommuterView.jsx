import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CarFront, ScanLine, ClipboardList, User,
  AlertCircle, ChevronDown, Hash, ShieldCheck, LogOut, ChevronRight, QrCode,
  LocateFixed, MapPin, X, Camera
} from 'lucide-react';
import { animate, stagger, createTimeline } from 'animejs';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import LocationSearchModal from '../components/commuter/LocationSearchModal';
import SOSButton from '../components/SOSButton';
import { getDriverByQr, logout, bookRide, cancelRide } from '../api';

/* ── Fullscreen Searching Overlay ──────────────────────── */
function SearchingOverlay({ onCancel }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const rings = containerRef.current.querySelectorAll('.v-pulse-ring');
    const pin = containerRef.current.querySelector('.v-search-pin');
    const dots = containerRef.current.querySelector('.v-search-dots');

    // Staggered expanding pulse rings
    timelineRef.current = createTimeline({ loop: true });
    timelineRef.current
      .add(rings, {
        scale: [0.3, 2.8],
        opacity: [0.7, 0],
        duration: 2400,
        delay: stagger(400),
        ease: 'outQuad',
      });

    // Bouncing pin
    animate(pin, {
      translateY: [-8, 0, -8],
      duration: 1600,
      loop: true,
      ease: 'inOutSine',
    });

    // Dot wave
    if (dots) {
      animate(dots.querySelectorAll('.v-dot'), {
        translateY: [-6, 0],
        opacity: [1, 0.3],
        duration: 600,
        delay: stagger(150),
        loop: true,
        alternate: true,
        ease: 'inOutSine',
      });
    }

    return () => {
      if (timelineRef.current) timelineRef.current.pause();
    };
  }, []);

  return (
    <div className="v-searching-overlay" ref={containerRef}>
      {/* Concentric pulse rings */}
      <div className="v-pulse-container">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="v-pulse-ring" />
        ))}
        {/* Center pin */}
        <div className="v-search-pin">
          <svg width="48" height="58" viewBox="-4 -4 40 46" fill="none" className="v-pin-svg">
            <path d="M16 2C9.37 2 4 7.37 4 14c0 9.25 12 26 12 26s12-16.75 12-26c0-6.63-5.37-12-12-12z" fill="#ef4444" className="v-pin-path" strokeWidth="3"/>
            <circle cx="16" cy="14" r="5" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Text */}
      <p className="v-searching-text">Searching for a driver</p>
      <div className="v-search-dots">
        <span className="v-dot">.</span>
        <span className="v-dot">.</span>
        <span className="v-dot">.</span>
      </div>
      <p className="v-searching-sub">Please wait while we find you a ride</p>

      {/* Cancel */}
      <button onClick={onCancel} className="v-cancel-search-btn">
        Cancel Ride
      </button>
    </div>
  );
}

export default function CommuterView({ mapRef }) {
  const { t, setView, currentUser, setCurrentUser, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, setDestinationPin, liveLocation, isMapMoving } = useApp();
  const [activeTab, setActiveTab] = useState('ride');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [searchModal, setSearchModal] = useState(null); // null | 'from' | 'to'
  const [reportType, setReportType] = useState('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | starting | scanning | error
  const [scanError, setScanError] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const prevPinTargetRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerLockedRef = useRef(false);
  const [confirmingPin, setConfirmingPin] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // null | 'searching'
  const [activeRideId, setActiveRideId] = useState(null); // request_id of in-progress booking

  // Computed state for booking validation
  const canBook = userPickup && destination;

  async function handleBookRide() {
    if (!canBook) return;
    setBookingStatus('searching');
    try {
      const result = await bookRide(
        userPickup.label || 'GPS Location',
        destination,
        userPickup.lat ?? null,
        userPickup.lng ?? null
      );
      if (result?.requestId) setActiveRideId(result.requestId);
    } catch {
      // Keep the animation even if API fails (demo mode)
    }
  }

  async function cancelBooking() {
    if (activeRideId) {
      try { await cancelRide(activeRideId); } catch { /* best-effort */ }
    }
    setActiveRideId(null);
    setBookingStatus(null);
  }

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

  async function useCurrentLocation() {
    setGpsError('');

    // Fast path: the map's watchPosition already has a fresh fix — use it instantly
    if (liveLocation) {
      setGpsLoading(true);
      const { lat, lng, accuracy } = liveLocation;
      const label = await reverseGeocode(lat, lng);
      setUserPickup({ lat, lng, label, fromGps: true, accuracy });
      setGpsLoading(false);
      return;
    }

    // Slow path: watchPosition hasn't fired yet (first load) — fall back to one-shot
    if (!navigator.geolocation) {
      setGpsError(t('commuter-gps-error'));
      return;
    }
    setGpsLoading(true);
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  function activatePinOnMap() {
    setPinTarget('to');
    // Collapse bottom sheet fully so maximum map is visible
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) {
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      const viewH = window.innerHeight;
      sheet.style.transform = `translateY(${viewH - 120}px)`;
    }
  }

  async function confirmCenterPin() {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const { lat, lng } = center;
    setConfirmingPin(true);
    const label = await reverseGeocode(lat, lng);
    setDestination(label);
    setDestinationPin({ lat, lng, label });
    setPinTarget(null);
    setConfirmingPin(false);
    // Re-expand bottom sheet
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) {
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      sheet.style.transform = 'translateY(0px)';
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

  async function stopScanner() {
    if (!scannerRef.current) return;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    scannerLockedRef.current = false;
    try {
      await scanner.stop();
    } catch {
      // ignore stop errors when scanner did not fully initialize
    }
    try {
      await scanner.clear();
    } catch {
      // ignore clear errors
    }
  }

  async function fetchScanResult(rawValue) {
    const code = (rawValue || '').trim();
    if (!code) return;

    setScanLoading(true);
    setScanError('');
    const data = await getDriverByQr(code);
    setScanLoading(false);

    if (data?.tricycleId) {
      setScanResult(data);
      setScanInput(code);
      return;
    }

    setScanResult(null);
    setScanError(data?.message || 'Unable to find this QR code.');
  }

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      if (activeTab !== 'scan') {
        await stopScanner();
        setScanStatus('idle');
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScanStatus('error');
        setScanError('Camera is not supported on this browser/device.');
        return;
      }

      setScanStatus('starting');
      setScanError('');

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('commuter-qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (scannerLockedRef.current) return;
            scannerLockedRef.current = true;
            await fetchScanResult(decodedText);
            setTimeout(() => {
              scannerLockedRef.current = false;
            }, 1500);
          },
          () => {}
        );

        if (cancelled) {
          await stopScanner();
          return;
        }
        setScanStatus('scanning');
      } catch {
        await stopScanner();
        setScanStatus('error');
        setScanError('Unable to start camera scanner. Please allow camera access.');
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [activeTab]);

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

      {/* Searching for driver overlay */}
      {bookingStatus === 'searching' && (
        <SearchingOverlay onCancel={cancelBooking} />
      )}

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

      {/* ── Center-pin overlay when pinTarget === 'to' ─────── */}
      {pinTarget === 'to' && (
        <>
          <div className="v-center-pin-wrap">
            <div className={`v-center-pin-bounce-wrap ${isMapMoving ? 'is-moving' : ''}`}>
              <div className="v-center-pin-body">
                <svg width="54" height="66" viewBox="-4 -4 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="v-pin-svg">
                  <path d="M16 2C9.37 2 4 7.37 4 14c0 9.25 12 26 12 26s12-16.75 12-26c0-6.63-5.37-12-12-12z" fill="#ef4444" className="v-pin-path" strokeWidth="4"/>
                  <circle cx="16" cy="14" r="5.5" fill="white"/>
                </svg>
              </div>
              <div className={`v-center-pin-line ${isMapMoving ? 'is-moving' : ''}`} />
            </div>
            <div className={`v-center-pin-shadow ${isMapMoving ? 'is-moving' : ''}`} />
          </div>

          <div className="v-pin-confirm-banner">
            <MapPin size={18} className="text-red-500 shrink-0" />
            <span className="v-pin-banner-text">
              Set destination here
            </span>
            <button
              onClick={() => { setPinTarget(null); }}
              className="v-pin-btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={confirmCenterPin}
              disabled={confirmingPin}
              className="v-pin-btn-confirm"
            >
              {confirmingPin ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Getting location…</span>
                </>
              ) : '✓ Confirm'}
            </button>
          </div>
        </>
      )}

      {/* Floating hint banner for 'from' pin mode only */}
      {pinTarget === 'from' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full flex items-center gap-2.5 shadow-xl text-sm font-bold whitespace-nowrap">
          <MapPin size={15} className="text-blue-400" />
          {t('commuter-pin-map-hint')}
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

          <div className="v-anim v-anim--2 v-route-panel mb-4 overflow-hidden">
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
                    className={`flex-1 text-left font-bold text-sm truncate min-w-0 v-location-text ${userPickup ? 'has-value' : 'placeholder'}`}
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
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{t('commuter-going-to')}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSearchModal('to')}
                    className={`flex-1 text-left v-glass px-4 py-3 font-bold text-sm transition-all hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 truncate min-w-0 v-location-text ${destination ? 'has-value' : 'placeholder'}`}
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

          <button disabled={!canBook} onClick={handleBookRide} className="v-anim v-anim--5 v-btn-primary">
            {t('commuter-book-btn')}
          </button>
        </div>

        {/* ── Scan Tab ─────────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'scan' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('commuter-verify-title')}</h2>
          <p className="v-anim v-anim--1 text-sm font-semibold text-gray-500 mb-8">{t('commuter-verify-desc')}</p>

          <div className="v-anim v-anim--2 mb-6">
            <div className="v-scanner-box mb-3 relative overflow-hidden">
              <div id="commuter-qr-reader" className="absolute inset-0 z-0" />
              <QrCode size={72} className="absolute inset-0 m-auto text-white/25 z-10 pointer-events-none" />
              <div className="absolute inset-0 m-auto w-44 h-44 border-2 border-red-500/60 rounded-xl z-20 pointer-events-none">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 shadow-[0_0_8px_#ef4444] radar-ping" />
              </div>
              {scanStatus !== 'scanning' && (
                <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <Camera size={34} className="text-gray-400" />
                  <p className="text-xs font-bold text-gray-500">
                    {scanStatus === 'starting' ? 'Starting camera...' : 'Camera idle'}
                  </p>
                </div>
              )}
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">
              {scanStatus === 'scanning' ? 'Scanner active' : 'Scanner not running'}
            </p>
            {scanError && <p className="text-xs font-bold text-red-500 mt-2 text-center">⚠ {scanError}</p>}
          </div>

          <div className="v-anim v-anim--3 v-input-wrap max-w-sm mx-auto shadow-sm">
            <Hash className="v-input-icon w-5 h-5" />
            <input
              type="text"
              placeholder={t('commuter-body-scan-placeholder')}
              className="!pr-24"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
            />
            <button
              type="button"
              onClick={() => fetchScanResult(scanInput)}
              disabled={scanLoading || !scanInput.trim()}
              className="absolute right-2 top-2 bottom-2 bg-gray-900 text-white px-5 rounded-xl font-bold text-xs btn-press disabled:opacity-40"
            >
              {scanLoading ? 'Checking...' : t('commuter-search')}
            </button>
          </div>

          {scanResult && (
            <div className="v-anim v-anim--4 mt-5 p-4 rounded-2xl border border-gray-200 bg-white/85 shadow-sm space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Driver Details</p>
              <p className="text-sm font-bold text-gray-900">Name: {scanResult.driver.fullName}</p>
              <p className="text-sm font-semibold text-gray-700">Username: {scanResult.driver.username}</p>
              <p className="text-sm font-semibold text-gray-700">Body Number: {scanResult.bodyNumber}</p>
              <p className="text-sm font-semibold text-gray-700">Plate Number: {scanResult.plateNumber || 'N/A'}</p>
              <p className="text-sm font-semibold text-gray-700">License: {scanResult.driver.licenseNumber || 'N/A'}</p>
              <p className="text-sm font-semibold text-gray-700">Contact: {scanResult.driver.contactNumber || 'N/A'}</p>
              <p className="text-sm font-semibold text-gray-700">Status: {scanResult.tricycleStatus}</p>
            </div>
          )}
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

      {scanResult && <SOSButton />}

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
