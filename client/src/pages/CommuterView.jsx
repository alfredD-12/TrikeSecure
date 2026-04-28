import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CarFront, ScanLine, ClipboardList, User,
  AlertCircle, ChevronDown, Hash, ShieldCheck, LogOut, ChevronRight, QrCode,
  LocateFixed, MapPin, X, Camera, CheckCircle2, Phone, Clock, Navigation, Route
} from 'lucide-react';
import { animate, stagger, createTimeline } from 'animejs';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import LocationSearchModal from '../components/commuter/LocationSearchModal';
import SOSButton from '../components/SOSButton';
import { getDriverByQr, logout, bookRide, cancelRide, getActiveRide, getRideStatus } from '../services/api';
import {
  googleMapsDirectionsUrl,
  ridePoint,
  travelSummary,
} from '../utils/rideMetrics';

/* ── Fullscreen Searching Overlay ──────────────────────── */
function SearchingOverlay({ onCancel, error }) {
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
      <p className="v-searching-sub">{error || 'Please wait while we find you a ride'}</p>

      {/* Cancel */}
      <button onClick={onCancel} className="v-cancel-search-btn">
        Cancel Ride
      </button>
    </div>
  );
}

const COMMUTER_RIDE_STATUS_META = {
  waiting: {
    label: 'Searching',
    title: 'Finding a driver',
    message: 'Your request is visible to nearby approved drivers.',
    tone: 'bg-blue-50 text-blue-700',
  },
  accepted: {
    label: 'Accepted',
    title: 'Driver is on the way',
    message: 'Your driver accepted the booking and is heading to your pickup point.',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  arrived: {
    label: 'Arrived',
    title: 'Driver has arrived',
    message: 'Meet your driver at the pickup point and board when ready.',
    tone: 'bg-amber-50 text-amber-700',
  },
  in_progress: {
    label: 'In Progress',
    title: 'Ride in progress',
    message: 'You are on the way to your destination.',
    tone: 'bg-green-50 text-green-700',
  },
};

const COMMUTER_RIDE_STEPS = [
  { id: 'waiting', label: 'Searching' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'in_progress', label: 'In Ride' },
];

function getCommuterRideSummary(ride) {
  const pickup = ridePoint(ride, 'pickup');
  const dropoff = ridePoint(ride, 'dropoff');
  const driver = ridePoint(ride, 'driver');

  if (['accepted', 'arrived'].includes(ride?.status)) {
    return {
      label: 'Driver ETA',
      hint: driver ? 'Driver to pickup' : 'Waiting for driver GPS',
      ...travelSummary(driver, pickup),
    };
  }

  if (ride?.status === 'in_progress') {
    return {
      label: 'Dropoff ETA',
      hint: driver ? 'Current route' : 'Trip route',
      ...travelSummary(driver || pickup, dropoff),
    };
  }

  return {
    label: 'Trip Estimate',
    hint: 'Pickup to dropoff',
    ...travelSummary(pickup, dropoff),
  };
}

function RideTimeline({ status }) {
  const currentIndex = Math.max(0, COMMUTER_RIDE_STEPS.findIndex((step) => step.id === status));

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {COMMUTER_RIDE_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <div key={step.id} className="min-w-0">
            <div className={`h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <p className={`mt-1 truncate text-[9px] font-black uppercase ${isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MetricBox({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-1 text-sm font-black text-gray-900">{value}</p>
      {hint && <p className="text-[10px] font-bold text-gray-400">{hint}</p>}
    </div>
  );
}

function RideStatusOverlay({ ride, onClose }) {
  const driver = ride?.driver;
  const tricycle = ride?.tricycle;
  const meta = COMMUTER_RIDE_STATUS_META[ride?.status] || COMMUTER_RIDE_STATUS_META.accepted;
  const summary = getCommuterRideSummary(ride);
  const pickup = ridePoint(ride, 'pickup');
  const dropoff = ridePoint(ride, 'dropoff');
  const routeUrl = googleMapsDirectionsUrl(dropoff, pickup);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 px-5 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.35)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Ride Status</p>
            <h3 className="text-2xl font-black tracking-tight text-gray-900">{meta.title}</h3>
          </div>
        </div>

        <div className="space-y-3">
          <RideTimeline status={ride?.status} />

          <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${meta.tone}`}>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{meta.label}</p>
            <p className="mt-1">{meta.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricBox icon={<Clock size={12} />} label={summary.label} value={summary.eta} hint={summary.hint} />
            <MetricBox icon={<Route size={12} />} label="Distance" value={summary.distance} hint="Approximate" />
          </div>

          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Driver</p>
            <p className="mt-1 text-base font-black text-gray-900">{driver?.fullName || 'Assigned driver'}</p>
            <p className="mt-0.5 text-xs font-bold text-gray-500">
              {driver?.contactNumber ? `Contact: ${driver.contactNumber}` : driver?.email || 'Contact unavailable'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-red-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400">Body No.</p>
              <p className="mt-1 text-base font-black text-red-700">{tricycle?.bodyNumber || '--'}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Plate</p>
              <p className="mt-1 text-base font-black text-blue-700">{tricycle?.plateNumber || '--'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Route</p>
            <p className="mt-1 text-sm font-bold text-gray-800">{ride?.pickupLocation || 'Pickup'}</p>
            <p className="text-xs font-semibold text-gray-500">to {ride?.dropoffLocation || 'destination'}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {driver?.contactNumber && (
            <a
              href={`tel:${driver.contactNumber}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
              title="Call driver"
            >
              <Phone size={19} />
            </a>
          )}
          {routeUrl && (
            <a
              href={routeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"
              title="Open route"
            >
              <Navigation size={19} />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white"
          >
            Keep Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveRideStatusCard({ ride, onOpen }) {
  const meta = COMMUTER_RIDE_STATUS_META[ride?.status] || COMMUTER_RIDE_STATUS_META.accepted;
  const summary = getCommuterRideSummary(ride);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-5 w-full rounded-[24px] border border-emerald-100 bg-white/95 p-4 text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Current Ride</p>
          <h3 className="mt-1 text-lg font-black text-gray-900">{meta.title}</h3>
          <p className="mt-1 text-xs font-bold text-gray-500">{meta.message}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${meta.tone}`}>
          {meta.label}
        </span>
      </div>
      <div className="mt-3 rounded-2xl bg-gray-50 px-3 py-2">
        <p className="truncate text-xs font-bold text-gray-800">{ride?.pickupLocation || 'Pickup'}</p>
        <p className="truncate text-xs font-semibold text-gray-500">to {ride?.dropoffLocation || 'destination'}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-emerald-50 px-3 py-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">{summary.label}</p>
          <p className="mt-0.5 text-sm font-black text-emerald-800">{summary.eta}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 px-3 py-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-blue-600">Distance</p>
          <p className="mt-0.5 text-sm font-black text-blue-800">{summary.distance}</p>
        </div>
      </div>
    </button>
  );
}

export default function CommuterView({ mapRef }) {
  const { t, setView, currentUser, setCurrentUser, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, destinationPin, setDestinationPin, liveLocation, isMapMoving, darkMode, setActiveCommuterRide, resetThemeForLogout } = useApp();
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
  const [bookingStatus, setBookingStatus] = useState(null); // null | 'searching' | 'active'
  const [activeRideId, setActiveRideId] = useState(null); // request_id of in-progress booking
  const [activeRide, setActiveRide] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Computed state for booking validation
  const canBook = userPickup && destination && destinationPin && !activeRide;
  const needsDestinationPin = Boolean(userPickup && destination && !destinationPin && !activeRide);

  async function handleBookRide() {
    if (!canBook) {
      if (needsDestinationPin) {
        setBookingError('Please pin or search the exact dropoff so your driver can navigate there.');
      }
      return;
    }
    setBookingStatus('searching');
    setBookingError('');
    try {
      const result = await bookRide(
        userPickup.label || 'GPS Location',
        destination,
        userPickup.lat ?? null,
        userPickup.lng ?? null,
        destinationPin?.lat ?? null,
        destinationPin?.lng ?? null
      );
      const ride = result?.ride || null;
      const requestId = result?.requestId || ride?.requestId;

      if (requestId) {
        applyRideState(ride || { requestId, status: 'waiting' });
        return;
      }

      setBookingStatus(null);
      setBookingError(result?.message || 'Could not create ride request.');
    } catch {
      setBookingStatus(null);
      setBookingError('Network error. Please try booking again.');
    }
  }

  async function cancelBooking() {
    if (activeRideId) {
      try {
        const result = await cancelRide(activeRideId);
        if (result?.status !== 'cancelled') {
          const latest = await getRideStatus(activeRideId);
          if (latest?.ride && latest.ride.status !== 'waiting') {
            setActiveRide(latest.ride);
            setBookingStatus('active');
            return;
          }

          setBookingError(result?.message || 'Could not cancel this request.');
        }
      } catch {
        setBookingError('Network error. Please try again.');
        return;
      }
    }
    setActiveRideId(null);
    setActiveRide(null);
    setActiveCommuterRide(null);
    setBookingStatus(null);
  }

  function minimizeActiveRide() {
    setBookingStatus(null);
  }

  function showActiveRideStatus() {
    if (activeRide && activeRide.status !== 'waiting') {
      setBookingStatus('active');
    }
  }

  const applyRideState = useCallback((ride, showOverlay = true) => {
    if (!ride || ['cancelled', 'completed'].includes(ride.status)) {
      setActiveRideId(null);
      setActiveRide(null);
      setActiveCommuterRide(null);
      setBookingStatus(null);
      return;
    }

    setActiveRide(ride);
    setActiveCommuterRide(ride);
    setActiveRideId(ride.requestId);

    if (ride.pickupLat != null && ride.pickupLng != null) {
      setUserPickup({
        lat: ride.pickupLat,
        lng: ride.pickupLng,
        label: ride.pickupLocation || 'Pickup location',
      });
    }

    if (ride.dropoffLocation) {
      setDestination(ride.dropoffLocation);
    }

    if (ride.dropoffLat != null && ride.dropoffLng != null) {
      setDestinationPin({
        lat: ride.dropoffLat,
        lng: ride.dropoffLng,
        label: ride.dropoffLocation || 'Dropoff location',
      });
    }

    setBookingStatus((current) => {
      if (ride.status === 'waiting') {
        return 'searching';
      }

      if (showOverlay || current === 'searching' || current === 'active') {
        return 'active';
      }

      return current;
    });
  }, [setActiveCommuterRide, setDestination, setDestinationPin, setUserPickup]);

  useEffect(() => {
    let ignore = false;

    async function restoreActiveRide() {
      const result = await getActiveRide();
      if (!ignore && result?.ride) {
        applyRideState(result.ride, false);
      }
    }

    restoreActiveRide().catch(() => {});
    return () => {
      ignore = true;
    };
  }, [applyRideState]);

  useEffect(() => {
    if (!activeRideId) {
      return undefined;
    }

    let ignore = false;

    async function refreshRideStatus() {
      const result = await getRideStatus(activeRideId);
      if (ignore) {
        return;
      }

      if (result?.ride) {
        setBookingError('');
        applyRideState(result.ride, false);
        return;
      }

      setBookingError(result?.message || 'Still waiting for a driver...');
    }

    refreshRideStatus().catch(() => {});
    const interval = setInterval(() => {
      refreshRideStatus().catch(() => {});
    }, 3000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [activeRideId, applyRideState]);

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
    resetThemeForLogout();
    setActiveCommuterRide(null);
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
        <SearchingOverlay onCancel={cancelBooking} error={bookingError} />
      )}

      {bookingStatus === 'active' && activeRide && activeRide.status !== 'waiting' && (
        <RideStatusOverlay ride={activeRide} onClose={minimizeActiveRide} />
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

          {activeRide && activeRide.status !== 'waiting' && (
            <ActiveRideStatusCard ride={activeRide} onOpen={showActiveRideStatus} />
          )}

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

          {bookingError && !bookingStatus && (
            <p className="text-xs font-bold text-red-500 mb-4 px-1">{bookingError}</p>
          )}

          {needsDestinationPin && !bookingError && (
            <p className="text-xs font-bold text-amber-600 mb-4 px-1">
              Pin or search the exact dropoff so your driver can see the route.
            </p>
          )}

          {/* Quick destination chips */}
          <div className="v-anim v-anim--4 flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
            {[['📍', 'BSU ARASOF'], ['🛒', 'Savemore'], ['⛪', 'Simbahan']].map(([emoji, place]) => (
              <button
                key={place}
                onClick={() => { setDestination(place); setDestinationPin(null); }}
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
                <div className={`absolute inset-0 z-30 backdrop-blur-sm flex flex-col items-center justify-center gap-2 px-6 text-center ${darkMode ? 'bg-slate-900/85' : 'bg-white/85'}`}>
                  <Camera size={34} className={darkMode ? 'text-gray-300' : 'text-gray-400'} />
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
            <div className={`v-anim v-anim--4 mt-5 p-4 rounded-2xl border shadow-sm space-y-2 ${darkMode ? 'border-white/10 bg-slate-900/80' : 'border-gray-200 bg-white/85'}`}>
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
                  style={isReportDropdownOpen ? {
                    borderColor: '#ef4444',
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                    boxShadow: darkMode
                      ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(239, 68, 68, 0.22)'
                      : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(239, 68, 68, 0.15)',
                  } : {}}
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
                    <span className={reportType ? `${darkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold text-[15px]` : 'text-gray-400 font-medium text-[15px]'}>
                      {reportType ? [
                        { value: 'overcharging', label: t('commuter-overcharging') || 'Overcharging' },
                        { value: 'reckless', label: t('commuter-reckless') || 'Reckless Driver' },
                        { value: 'refused', label: t('commuter-refused') || 'Refused to Ride' },
                        { value: 'colorum', label: t('commuter-colorum') || 'Colorum (No Franchise)' },
                        { value: 'others', label: t('commuter-others') || 'Others' }
                      ].find(o => o.value === reportType)?.label : (t('commuter-select-issue') || 'Select an issue...')}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isReportDropdownOpen ? 'rotate-180 text-red-500' : (darkMode ? 'text-gray-300' : 'text-gray-400')}`} />
                  </button>
                </div>

                {isReportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsReportDropdownOpen(false)} />
                    <ul 
                      className={`absolute z-50 w-full mt-2 backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden py-2 ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-100'}`} 
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
                            className={`w-full text-left px-5 py-3.5 text-[15px] font-semibold transition-colors ${darkMode
                              ? (reportType === option.value ? 'text-red-300 bg-red-500/15 hover:bg-red-500/20 active:bg-red-500/25' : 'text-gray-200 hover:bg-white/5 active:bg-white/10')
                              : (reportType === option.value ? 'text-red-600 bg-red-50/50 hover:bg-red-50 active:bg-red-100' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100')}`}
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

          <div className="v-anim v-anim--2 v-profile-card mb-8" style={{ background: darkMode ? 'linear-gradient(135deg, rgba(30,41,59,0.82) 0%, rgba(15,23,42,0.72) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(243,244,246,0.5) 100%)' }}>
            <div className={`w-16 h-16 shadow-sm rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800 border border-white/10' : 'bg-white border border-gray-100'}`}>
              <User size={32} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-900 tracking-tight truncate">{displayName}</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">{displayContact}</p>
            </div>
          </div>

          <div className="v-anim v-anim--3 space-y-3 mb-8">
            {[
              { icon: <User size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: 'Edit Profile' },
              { icon: <ShieldCheck size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: 'Privacy & Security' },
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => switchTab(item.id)}
            className={`v-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.Icon size={24} />
            <span className="v-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
