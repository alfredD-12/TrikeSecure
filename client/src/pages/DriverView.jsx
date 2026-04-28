import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Compass, User, Wallet, Route, CheckCircle2,
  FileText, History, LogOut, Loader2, MapPin,
  Clock, AlertCircle, Phone, Users, BadgeCheck, Shield, ChevronRight,
  Fuel, ExternalLink, RefreshCw, Navigation
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import SOSButton from '../components/SOSButton';
import DriverOnboardingPanel from '../components/driver/DriverOnboardingPanel';
import PresidentMembershipTab from '../components/driver/PresidentMembershipTab';
import {
  logout,
  API_URL,
  getDriverProfile,
  getFuelPrices,
  getActiveRide,
  markRideArrived,
  startRide,
  completeRide,
  updateDriverRideLocation,
  getApprovedDriverTodas,
  getNasugbuBarangays,
  submitDriverMembershipApplication,
  submitDriverTodaApplication,
  submitDriverFranchiseApplication,
} from '../services/api';
import {
  googleMapsDirectionsUrl,
  hasCoords,
  ridePoint,
  travelSummary,
} from '../utils/rideMetrics';

function statusChip(value) {
  const tone = String(value || 'unknown').toLowerCase();
  const palette = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
    president: 'border-blue-200 bg-blue-50 text-blue-700',
    member: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    not_applied: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${palette[tone] || 'border-slate-200 bg-slate-50 text-slate-700'}`;
}

function summaryCard(icon, label, value, accentClass) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${accentClass}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function formatFuelPrice(value) {
  return Number.isFinite(Number(value)) ? `P${Number(value).toFixed(2)}/L` : '--';
}

function FuelPriceCard({ snapshot, loading, error, onRefresh }) {
  const sourceUrl = snapshot?.sourceUrl || 'https://gaswatchph.com/';
  const labelDate = snapshot?.asOf || snapshot?.week || 'latest available';

  return (
    <div className="v-anim v-anim--3 mb-5 rounded-[26px] border border-emerald-100 bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <Fuel size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Fuel Prices</p>
            <p className="text-xs font-bold text-gray-500">GasWatch PH, {labelDate}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 ring-1 ring-gray-100 transition hover:bg-gray-100 disabled:opacity-60"
          title="Refresh fuel prices"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Avg Diesel</p>
              <p className="mt-1 text-lg font-black text-gray-900">{loading ? '--' : formatFuelPrice(snapshot?.average?.diesel)}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Avg Unleaded</p>
              <p className="mt-1 text-lg font-black text-gray-900">{loading ? '--' : formatFuelPrice(snapshot?.average?.unleaded)}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-emerald-50 px-3 py-2">
              <p className="font-black text-emerald-700">{loading ? '--' : formatFuelPrice(snapshot?.cheapest?.diesel?.price)}</p>
              <p className="font-bold text-emerald-600">Cheapest diesel{snapshot?.cheapest?.diesel?.brand ? `: ${snapshot.cheapest.diesel.brand}` : ''}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-3 py-2">
              <p className="font-black text-blue-700">{loading ? '--' : formatFuelPrice(snapshot?.cheapest?.unleaded?.price)}</p>
              <p className="font-bold text-blue-600">Cheapest unleaded{snapshot?.cheapest?.unleaded?.brand ? `: ${snapshot.cheapest.unleaded.brand}` : ''}</p>
            </div>
          </div>
        </>
      )}

      <a
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700"
      >
        View GasWatchPH <ExternalLink size={12} />
      </a>
    </div>
  );
}

const DRIVER_RIDE_STATUS_META = {
  accepted: {
    label: 'Accepted',
    title: 'Head to pickup',
    message: 'Navigate to the commuter and tap arrived when you reach the pickup point.',
    action: 'Arrived at Pickup',
    tone: 'bg-blue-100 text-blue-700',
  },
  arrived: {
    label: 'Arrived',
    title: 'Waiting at pickup',
    message: 'Let the commuter board, then start the ride.',
    action: 'Start Ride',
    tone: 'bg-amber-100 text-amber-700',
  },
  in_progress: {
    label: 'In Progress',
    title: 'Ride in progress',
    message: 'Drive to the dropoff and complete the ride when the trip is done.',
    action: 'Complete Ride',
    tone: 'bg-green-100 text-green-700',
  },
};

const DRIVER_RIDE_STEPS = [
  { id: 'accepted', label: 'Accepted' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'in_progress', label: 'In Ride' },
  { id: 'completed', label: 'Done' },
];

function RideTimeline({ status }) {
  const currentIndex = Math.max(0, DRIVER_RIDE_STEPS.findIndex((step) => step.id === status));

  return (
    <div className="mb-3 grid grid-cols-4 gap-1.5">
      {DRIVER_RIDE_STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <div key={step.id} className="min-w-0">
            <div className={`h-1.5 rounded-full ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
            <p className={`mt-1 truncate text-[9px] font-black uppercase ${isDone ? 'text-green-700' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-gray-100">
      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-black text-gray-900">{value}</p>
    </div>
  );
}

function DriverActiveRideCard({ ride, updating, onAdvance, onFocusTarget, liveLocation }) {
  const meta = DRIVER_RIDE_STATUS_META[ride?.status] || DRIVER_RIDE_STATUS_META.accepted;
  const focusTarget = ride?.status === 'in_progress' ? 'dropoff' : 'pickup';
  const targetPoint = ridePoint(ride, focusTarget);
  const originPoint = hasCoords(liveLocation)
    ? liveLocation
    : ride?.status === 'in_progress'
      ? ridePoint(ride, 'pickup')
      : null;
  const summary = travelSummary(originPoint, targetPoint);
  const navUrl = googleMapsDirectionsUrl(targetPoint, hasCoords(liveLocation) ? liveLocation : null);
  const canShowMapTarget = hasCoords(targetPoint);

  return (
    <div className="v-anim v-anim--3 mb-5 rounded-[26px] border border-green-100 bg-white/95 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600">Current Ride</p>
          <h3 className="mt-1 text-lg font-black text-gray-900">{meta.title}</h3>
          <p className="mt-0.5 text-xs font-bold text-gray-500">{ride?.commuter?.fullName || 'Commuter'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <RideTimeline status={ride?.status} />

      <p className="mb-3 rounded-2xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
        {meta.message}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50/90 p-2">
        <MetricBox label={focusTarget === 'dropoff' ? 'To dropoff' : 'To pickup'} value={summary.distance} />
        <MetricBox label="ETA" value={summary.eta} />
      </div>

      <div className="rounded-2xl bg-gray-50/90 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pickup</p>
            <p className="truncate text-xs font-bold text-gray-800">{ride?.pickupLocation || 'Pickup location'}</p>
          </div>
        </div>
        <div className="ml-[4.5px] h-3 w-px bg-gray-300" />
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dropoff</p>
            <p className="truncate text-xs font-bold text-gray-800">{ride?.dropoffLocation || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {canShowMapTarget && (
          <button
            type="button"
            onClick={onFocusTarget}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"
            title={focusTarget === 'dropoff' ? 'Show dropoff on map' : 'Show pickup on map'}
          >
            <MapPin size={17} />
          </button>
        )}
        {navUrl && (
          <a
            href={navUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
            title={focusTarget === 'dropoff' ? 'Navigate to dropoff' : 'Navigate to pickup'}
          >
            <Navigation size={17} />
          </a>
        )}
        <button
          type="button"
          onClick={onAdvance}
          disabled={updating}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-green-100 disabled:opacity-70"
        >
          {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          {meta.action}
        </button>
      </div>
    </div>
  );
}

export default function DriverView({ mapRef }) {
  const { t, setView, setCurrentUser, currentUser, pendingRides, setPendingRides, activeDriverRide, setActiveDriverRide, liveLocation, resetThemeForLogout } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [dutyOn, setDutyOn] = useState(true);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [toast, setToast] = useState(null);          // { msg, type } 'success' | 'error'
  const [passedIds, setPassedIds] = useState(new Set()); // hidden for this session
  const [acceptingId, setAcceptingId] = useState(null);
  const toastTimer = useRef(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [approvedTodas, setApprovedTodos] = useState([]);
  const [nasugbuBarangays, setNasugbuBarangays] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [fuelSnapshot, setFuelSnapshot] = useState(null);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelError, setFuelError] = useState('');
  const [updatingRideStatus, setUpdatingRideStatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lastLocationUpdateRef = useRef(0);
  const showPresidentTab = Boolean(driverProfile?.presidentToolsEnabled);
  const isOnboardingLocked = Boolean(driverProfile && !driverProfile.canOperate);

  function showToast(msg, type = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  const loadDriverData = useCallback(async (withSpinner = false) => {
    if (withSpinner) {
      setProfileLoading(true);
    }

    setProfileError('');

    const [profileResult, todaResult, barangayResult] = await Promise.all([
      getDriverProfile(),
      getApprovedDriverTodas(),
      getNasugbuBarangays(),
    ]);

    if (profileResult?.message && !profileResult?.onboardingStep && !profileResult?.driverId) {
      setProfileError(profileResult.message || 'Failed to load driver account.');
      setDriverProfile(null);
    } else {
      setDriverProfile(profileResult);
      if (profileResult && !profileResult.canOperate) {
        setActiveTab((current) => (current === 'home' ? 'account' : current));
      }
    }

    if (Array.isArray(todaResult)) {
      setApprovedTodos(todaResult);
    }

    if (Array.isArray(barangayResult?.barangays)) {
      setNasugbuBarangays(barangayResult.barangays);
    }

    if (withSpinner) {
      setProfileLoading(false);
    }
  }, []);

  function flyToRide(req) {
    if (!mapRef?.current || req.pickup_lat == null || req.pickup_lng == null) return;
    mapRef.current.flyTo([req.pickup_lat, req.pickup_lng], 15, { duration: 1.0 });
    const sheet = document.getElementById('driver-sheet');
    if (sheet) {
      const viewH = window.innerHeight;
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      sheet.style.transform = `translateY(${viewH - 120}px)`;
    }
  }

  function switchTab(tab) {
    setActiveTab(tab);
    const sheet = document.getElementById('driver-sheet');
    if (sheet) {
      sheet.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1)';
      sheet.style.transform = 'translateY(0px)';
    }
  }

  async function doLogout() {
    await logout();
    resetThemeForLogout();
    setActiveDriverRide(null);
    setCurrentUser(null);
    setView('login');
    const sheet = document.getElementById('driver-sheet');
    if (sheet) sheet.style.transform = 'translateY(0px)';
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  // Returns urgency level: 'fresh' <3min | 'warm' 3-8min | 'urgent' >8min
  function urgency(dateStr) {
    if (!dateStr) return 'fresh';
    const mins = (Date.now() - new Date(dateStr).getTime()) / 60000;
    if (mins < 3) return 'fresh';
    if (mins < 8) return 'warm';
    return 'urgent';
  }

  const urgencyStyles = {
    fresh:  { border: 'border-l-4 border-l-green-400',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
    warm:   { border: 'border-l-4 border-l-amber-400',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
    urgent: { border: 'border-l-4 border-l-red-400',    badge: 'bg-red-100 text-red-600',      dot: 'bg-red-500' },
  };

  const fetchPendingRides = useCallback(async () => {
    if (!dutyOn || !driverProfile?.canOperate) {
      setPendingRides([]);
      setRidesLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rides/nearby`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPendingRides(data);
      } else if (res.status === 403) {
        setPendingRides([]);
        await loadDriverData(false);
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    } finally {
      setRidesLoading(false);
    }
  }, [dutyOn, driverProfile?.canOperate, loadDriverData, setPendingRides]);

  const loadFuelPrices = useCallback(async () => {
    setFuelLoading(true);
    setFuelError('');
    const result = await getFuelPrices();
    if (result?.average || result?.cheapest) {
      setFuelSnapshot(result);
    } else {
      setFuelError(result?.message || 'Fuel prices are temporarily unavailable.');
    }
    setFuelLoading(false);
  }, []);

  const loadActiveDriverRide = useCallback(async () => {
    const result = await getActiveRide();
    setActiveDriverRide(result?.ride || null);
  }, []);

  useEffect(() => {
    setRidesLoading(true);
    fetchPendingRides();
    const interval = setInterval(fetchPendingRides, 5000);
    return () => clearInterval(interval);
  }, [fetchPendingRides]);

  useEffect(() => {
    loadDriverData(true).catch(() => {
      setProfileError('Failed to load driver account.');
      setProfileLoading(false);
    });
  }, [loadDriverData]);

  useEffect(() => {
    loadFuelPrices().catch(() => {
      setFuelError('Fuel prices are temporarily unavailable.');
      setFuelLoading(false);
    });
  }, [loadFuelPrices]);

  useEffect(() => {
    if (!driverProfile?.canOperate) {
      setActiveDriverRide(null);
      return;
    }

    loadActiveDriverRide().catch(() => setActiveDriverRide(null));
  }, [driverProfile?.canOperate, loadActiveDriverRide]);

  useEffect(() => {
    const canShareLocation = activeDriverRide?.requestId
      && ['accepted', 'arrived', 'in_progress'].includes(activeDriverRide.status)
      && liveLocation?.lat != null
      && liveLocation?.lng != null;

    if (!canShareLocation) {
      return;
    }

    const now = Date.now();
    if (now - lastLocationUpdateRef.current < 5000) {
      return;
    }

    lastLocationUpdateRef.current = now;
    updateDriverRideLocation(activeDriverRide.requestId, {
      lat: liveLocation.lat,
      lng: liveLocation.lng,
      accuracy: liveLocation.accuracy ?? null,
    }).catch(() => {});
  }, [activeDriverRide?.requestId, activeDriverRide?.status, liveLocation]);

  const acceptRide = async (rideId) => {
    setAcceptingId(rideId);
    try {
      const res = await fetch(`${API_URL}/rides/${rideId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setPendingRides(prev => prev.filter(r => r.request_id !== rideId));
        setActiveDriverRide(data?.ride || null);
        showToast('Ride accepted. Exact pickup is now visible on your map.', 'success');
        await loadDriverData(false);
      } else {
        const data = await res.json();
        showToast(data.message || t('driver-toast-unavailable'), 'error');
        await loadDriverData(false);
        fetchPendingRides();
      }
    } catch {
      showToast(t('driver-toast-network'), 'error');
    } finally {
      setAcceptingId(null);
    }
  };

  async function advanceActiveRide() {
    if (!activeDriverRide?.requestId) {
      return;
    }

    const actionByStatus = {
      accepted: markRideArrived,
      arrived: startRide,
      in_progress: completeRide,
    };
    const nextAction = actionByStatus[activeDriverRide.status];

    if (!nextAction) {
      showToast('This ride has no next action yet.', 'error');
      return;
    }

    setUpdatingRideStatus(true);
    try {
      const result = await nextAction(activeDriverRide.requestId);
      if (result?.status === 'completed') {
        setActiveDriverRide(null);
        showToast('Ride completed.', 'success');
        await loadDriverData(false);
        fetchPendingRides();
      } else if (result?.ride) {
        setActiveDriverRide(result.ride);
        showToast(result.message || 'Ride status updated.', 'success');
      } else {
        showToast(result?.message || 'Could not update ride status.', 'error');
      }
    } catch {
      showToast('Network error - please try again.', 'error');
    } finally {
      setUpdatingRideStatus(false);
    }
  }

  function focusActiveRideTarget() {
    const target = activeDriverRide?.status === 'in_progress'
      ? { lat: activeDriverRide.dropoffLat, lng: activeDriverRide.dropoffLng }
      : { lat: activeDriverRide?.pickupLat, lng: activeDriverRide?.pickupLng };

    if (!mapRef?.current || target.lat == null || target.lng == null) {
      return;
    }

    mapRef.current.flyTo([target.lat, target.lng], 17, { duration: 1.0 });
  }

  async function handleMembershipSubmit(payload) {
    setSubmitting(true);
    const result = await submitDriverMembershipApplication(payload);
    if (result?.state) {
      showToast(result.message || 'Membership application submitted.', 'success');
      await loadDriverData(false);
    } else {
      showToast(result.message || 'Failed to submit membership application.', 'error');
    }
    setSubmitting(false);
  }

  async function handleTodaSubmit(payload) {
    setSubmitting(true);
    const result = await submitDriverTodaApplication(payload);
    if (result?.state) {
      showToast(result.message || 'TODA application submitted.', 'success');
      await loadDriverData(false);
    } else {
      showToast(result.message || 'Failed to submit TODA application.', 'error');
    }
    setSubmitting(false);
  }

  async function handleFranchiseSubmit(payload) {
    setSubmitting(true);
    const result = await submitDriverFranchiseApplication(payload);
    if (result?.state) {
      showToast(result.message || 'Franchise application submitted.', 'success');
      await loadDriverData(false);
    } else {
      showToast(result.message || 'Failed to submit franchise application.', 'error');
    }
    setSubmitting(false);
  }

  function passRide(rideId) {
    setPassedIds(prev => new Set([...prev, rideId]));
  }

  const visibleRides = pendingRides.filter(r => !passedIds.has(r.request_id));
  const displayName = currentUser?.fullName || currentUser?.username || 'Driver';
  const shouldShowOnboardingOverlay = profileLoading || !driverProfile || !driverProfile.canOperate;

  if (shouldShowOnboardingOverlay) {
    return (
      <div className="h-screen flex flex-col relative w-full max-w-lg mx-auto overflow-hidden">
        {toast && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold whitespace-nowrap
              ${toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-500 text-white'}`}
            style={{ animation: 'v-fadein 0.3s ease forwards' }}
          >
            {toast.type === 'success'
              ? <CheckCircle2 size={16} />
              : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.18))]" />
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-red-400/20 blur-3xl" />
          <div className="absolute right-[-3rem] top-1/4 h-44 w-44 rounded-full bg-amber-300/18 blur-3xl" />
          <div className="absolute bottom-14 left-1/3 h-36 w-36 rounded-full bg-emerald-300/18 blur-3xl" />
          <div className="absolute inset-0 bg-white/6 backdrop-blur-[3px]" />
        </div>

        <div className="relative z-20 flex h-full flex-col px-3 pb-4 pt-4">
          <div className="mb-auto flex items-start justify-between gap-3">
            <div className="rounded-full border border-white/60 bg-white/78 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-red-500">Driver Onboarding</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {profileLoading ? 'Checking your account requirements' : 'Finish account setup to unlock operations'}
              </p>
            </div>

            <button
              type="button"
              onClick={doLogout}
              className="rounded-full border border-white/60 bg-white/78 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur transition hover:bg-white"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 rounded-[34px] border border-white/70 bg-white/92 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="border-b border-slate-100 px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-red-500">Finish Account</p>
              <h2 className="mt-2 text-[1.75rem] font-black leading-tight text-slate-900">
                {profileLoading ? 'Preparing your driver profile' : 'Complete your driver account'}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {profileError || driverProfile?.accessMessage || 'All required approvals and records must be completed before the overlay disappears.'}
              </p>

              {driverProfile && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={statusChip(driverProfile.membershipStatus)}>{driverProfile.membershipStatus}</span>
                  <span className={statusChip(driverProfile.membershipRole)}>{driverProfile.membershipRole}</span>
                  {driverProfile.franchiseStatus && <span className={statusChip(driverProfile.franchiseStatus)}>{driverProfile.franchiseStatus}</span>}
                </div>
              )}
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
              {driverProfile && (
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {summaryCard(<Shield size={18} className="text-red-500" />, 'TODA', driverProfile.todaName || 'Not joined yet', 'bg-red-50')}
                  {summaryCard(<Users size={18} className="text-blue-500" />, 'Pending Reviews', String(driverProfile.pendingMembershipRequests || 0), 'bg-blue-50')}
                  {summaryCard(<BadgeCheck size={18} className="text-emerald-500" />, 'Franchise', driverProfile.franchiseStatus || 'Not submitted', 'bg-emerald-50')}
                </div>
              )}

              <DriverOnboardingPanel
                driverProfile={driverProfile}
                approvedTodas={approvedTodas}
                nasugbuBarangays={nasugbuBarangays}
                submitting={submitting}
                onSubmitMembership={handleMembershipSubmit}
                onSubmitToda={handleTodaSubmit}
                onSubmitFranchise={handleFranchiseSubmit}
              />

              {showPresidentTab && (
                <div className="mt-5">
                  <PresidentMembershipTab
                    enabled={showPresidentTab}
                    pendingCount={driverProfile?.pendingMembershipRequests || 0}
                    onAfterReview={() => loadDriverData(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col relative w-full max-w-lg mx-auto ${isOnboardingLocked ? 'bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.14),transparent_32%),linear-gradient(180deg,#fff8f7_0%,#f8fafc_35%,#eef2ff_100%)]' : ''}`}>
      {!isOnboardingLocked && <Header badge={driverProfile?.bodyNumber ?? undefined} />}
      {!isOnboardingLocked && <MapControls mapRef={mapRef} />}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold whitespace-nowrap
            ${toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-500 text-white'}`}
          style={{ animation: 'v-fadein 0.3s ease forwards' }}
        >
          {toast.type === 'success'
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <BottomSheet id="driver">
        {/* ── Home / Duty Tab ───────────────────────────────── */}
        <div className={`tab-content${activeTab === 'home' ? ' active' : ''}`}>
          {profileLoading ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="text-center">
                <Loader2 size={24} className="mx-auto mb-3 animate-spin text-red-500" />
                <p className="text-sm font-semibold text-slate-500">Loading driver dashboard...</p>
              </div>
            </div>
          ) : isOnboardingLocked ? (
            <div className="space-y-5 pb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">Driver Onboarding</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Finish your approvals first</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  The ride map stays locked until TODA membership and franchise approval are both complete.
                </p>
              </div>

              <div className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={statusChip(driverProfile?.membershipStatus)}>{driverProfile?.membershipStatus}</span>
                  <span className={statusChip(driverProfile?.membershipRole)}>{driverProfile?.membershipRole}</span>
                  {driverProfile?.franchiseStatus && <span className={statusChip(driverProfile.franchiseStatus)}>{driverProfile.franchiseStatus}</span>}
                </div>
                <p className="text-base font-black text-slate-900">
                  {driverProfile?.accessMessage || 'Complete the next onboarding step to unlock driver operations.'}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Current step: <span className="font-black capitalize text-slate-700">{String(driverProfile?.onboardingStep || 'start').replaceAll('_', ' ')}</span>
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => switchTab('account')}
                    className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                  >
                    Open Account Setup
                  </button>

                  {showPresidentTab && (
                    <button
                      type="button"
                      onClick={() => switchTab('president')}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      Review Member Requests ({driverProfile?.pendingMembershipRequests || 0})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {summaryCard(<Shield size={18} className="text-red-500" />, 'TODA', driverProfile?.todaName || 'Not joined yet', 'bg-red-50')}
                {summaryCard(<Users size={18} className="text-blue-500" />, 'Pending Reviews', String(driverProfile?.pendingMembershipRequests || 0), 'bg-blue-50')}
                {summaryCard(<BadgeCheck size={18} className="text-emerald-500" />, 'Franchise', driverProfile?.franchiseStatus || 'Not submitted', 'bg-emerald-50')}
              </div>
            </div>
          ) : (
            <>

          {/* Header row with duty toggle */}
          <div className="v-anim v-anim--1 flex justify-between items-center mb-5">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('driver-duty-status')}</h2>
              <p className="text-sm font-semibold text-gray-500 mt-0.5">{t('driver-accept-passengers')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={dutyOn}
                onChange={e => setDutyOn(e.target.checked)}
              />
              <div className="w-16 h-9 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-green-500 shadow-inner" />
            </label>
          </div>

          {/* Online / Offline status card */}
          <div className={`v-anim v-anim--2 mb-5 ${dutyOn ? 'v-online-card' : 'v-offline-card'}`}>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                {dutyOn && <div className="absolute inset-0 bg-green-400 rounded-full opacity-40 radar-ping" />}
                <div className={`w-5 h-5 rounded-full z-10 shadow-sm ${dutyOn ? 'bg-green-600' : 'bg-red-500'}`} />
              </div>
              <div className="flex-1">
                <p className={`font-black text-lg leading-tight ${dutyOn ? 'text-green-900' : 'text-red-900'}`}>
                  {dutyOn ? t('driver-online-now') : t('driver-offline')}
                </p>
                <p className={`text-xs font-bold ${dutyOn ? 'text-green-700' : 'text-red-600'}`}>
                  {dutyOn ? t('driver-looking') : t('driver-offline-msg')}
                </p>
              </div>
              {dutyOn && pendingRides.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow animate-pulse">
                  {pendingRides.length} new
                </span>
              )}
            </div>
          </div>

          {activeDriverRide && (
            <DriverActiveRideCard
              ride={activeDriverRide}
              updating={updatingRideStatus}
              onAdvance={advanceActiveRide}
              onFocusTarget={focusActiveRideTarget}
              liveLocation={liveLocation}
            />
          )}

          <FuelPriceCard
            snapshot={fuelSnapshot}
            loading={fuelLoading}
            error={fuelError}
            onRefresh={loadFuelPrices}
          />

          {/* Stats */}
          <div className="v-anim v-anim--3 grid grid-cols-3 gap-3 mb-6 transition-opacity duration-300" style={{ opacity: dutyOn ? 1 : 0.45 }}>
            {[
              { icon: <Wallet size={16} className="text-blue-600" />,        bg: 'bg-blue-50',   label: t('driver-earned'),   value: driverProfile ? `₱${Number(driverProfile.todayEarnings).toFixed(0)}` : '—' },
              { icon: <Route size={16} className="text-orange-600" />,       bg: 'bg-orange-50', label: t('driver-distance'), value: '—' },
              { icon: <CheckCircle2 size={16} className="text-purple-600" />, bg: 'bg-purple-50', label: t('driver-trips'),    value: driverProfile ? String(driverProfile.todayTrips) : '—' },
            ].map((s, i) => (
              <div key={i} className="v-stat-card">
                <div className={`${s.bg} p-2 rounded-full mb-2`}>{s.icon}</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div className="v-anim v-anim--4">
            <div className="flex justify-between items-center mb-1 px-1">
              <h3 className="font-black text-gray-800 text-lg tracking-tight">{t('driver-requests-title')}</h3>
            </div>
            <p className="text-[11px] text-orange-500 font-bold px-1 mb-4 flex items-center gap-1">
              <MapPin size={11} /> {t('driver-map-hint')}
            </p>
          </div>

          {/* Ride cards */}
          <div className="v-anim v-anim--5 space-y-4 pb-6">
            {ridesLoading ? (
              /* Skeleton loader */
              [1, 2].map(i => (
                <div key={i} className="v-booking-card animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-11 bg-gray-200 rounded-2xl" />
                    <div className="w-20 h-11 bg-gray-100 rounded-2xl" />
                  </div>
                </div>
              ))
            ) : !dutyOn ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Compass size={26} className="text-gray-400" />
                </div>
                <p className="font-black text-gray-500 text-sm">{t('driver-offline-state')}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">{t('driver-offline-state-msg')}</p>
              </div>
            ) : visibleRides.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={26} className="text-green-400" />
                </div>
                <p className="font-black text-gray-500 text-sm">{t('driver-all-clear')}</p>
                <p className="text-xs text-gray-400 font-semibold mt-1">{t('driver-all-clear-msg')}</p>
              </div>
            ) : (
              visibleRides.map((req) => {
                const u = urgency(req.request_time);
                const s = urgencyStyles[u];
                const isAccepting = acceptingId === req.request_id;
                return (
                  <div key={req.request_id} className={`v-booking-card ${s.border} overflow-hidden`}>
                    {/* Card header */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${s.dot}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-black text-gray-900 text-sm truncate">{req.commuter_name}</h4>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${s.badge}`}>
                            {u === 'urgent' ? t('driver-badge-urgent') : u === 'warm' ? t('driver-badge-waiting') : t('driver-badge-new')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold">
                          <Clock size={10} />
                          {timeAgo(req.request_time)}
                        </div>
                      </div>

                      {/* Fare */}
                      <div className="text-right shrink-0 pt-0.5">
                        {req.fare_amount != null
                          ? <p className="font-black text-green-600 text-lg leading-tight">₱{req.fare_amount}</p>
                          : <p className="text-[11px] font-bold text-gray-400 leading-tight">No fare</p>
                        }
                      </div>
                    </div>

                    {/* Route details */}
                    <div className="bg-gray-50/80 rounded-2xl px-4 py-3 mb-4 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pickup</p>
                          <p className="text-xs font-bold text-gray-800 truncate">{req.pickup_location}</p>
                        </div>
                      </div>
                      <div className="w-px h-3 bg-gray-300 ml-[4.5px]" />
                      <div className="flex items-start gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-1" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dropoff</p>
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {req.dropoff_location || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRide(req.request_id)}
                        disabled={isAccepting || Boolean(activeDriverRide)}
                        className="v-btn-accept flex items-center justify-center gap-2"
                        style={{ opacity: isAccepting || activeDriverRide ? 0.75 : 1 }}
                      >
                        {activeDriverRide
                          ? 'Finish current'
                          : isAccepting
                          ? <><Loader2 size={14} className="animate-spin" /> {t('driver-accepting')}</>
                          : <>{t('driver-accept')}</>
                        }
                      </button>
                      {req.pickup_lat != null && (
                        <button
                          onClick={() => flyToRide(req)}
                          className="v-btn-ghost flex items-center gap-1.5 px-3"
                          title="Show approximate pickup area on map"
                        >
                          <MapPin size={14} />
                          <span className="text-xs">{t('driver-btn-map')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => passRide(req.request_id)}
                        className="v-btn-ghost px-3"
                        title="Skip this request for now"
                      >
                        <span className="text-xs">{t('driver-btn-pass')}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Passed rides indicator */}
            {passedIds.size > 0 && dutyOn && (
              <button
                onClick={() => setPassedIds(new Set())}
                className="w-full text-center text-xs font-bold text-gray-400 py-2 hover:text-gray-600 transition-colors"
              >
                {passedIds.size} passed ride{passedIds.size > 1 ? 's' : ''} hidden — tap to restore
              </button>
            )}
          </div>
            </>
          )}
        </div>

        {/* ── Account Tab ───────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'account' ? ' active' : ''}`}>
          <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{isOnboardingLocked ? 'Driver Setup' : t('driver-account-title')}</h2>

          {profileLoading && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <Loader2 size={16} className="animate-spin text-red-500" />
              Loading account setup...
            </div>
          )}

          {profileError && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {profileError}
            </div>
          )}

          {/* Profile identity card */}
          <div className="v-anim v-anim--2 v-profile-card mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(243,244,246,0.5) 100%)' }}>
            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center shrink-0">
              <User size={32} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-900 tracking-tight truncate">{displayName}</h3>
              <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">{currentUser?.email || '—'}</p>
            </div>
          </div>

          {/* Earnings card */}
          <div className="v-anim v-anim--3 v-earnings-card mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('driver-todays-earnings')}</p>
            <h3 className="text-4xl font-black mb-4">₱{Number(driverProfile?.todayEarnings ?? 0).toFixed(2)}</h3>
            <div className="flex gap-3 text-sm font-bold flex-wrap">
              <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">{driverProfile?.todayTrips ?? 0} {t('driver-trips')}</div>
              <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">⭐ 5.0 Rating</div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryCard(<Wallet size={18} className="text-blue-500" />, 'Today', `P${Number(driverProfile?.todayEarnings ?? 0).toFixed(2)}`, 'bg-blue-50')}
            {summaryCard(<History size={18} className="text-orange-500" />, 'Trips', String(driverProfile?.todayTrips ?? 0), 'bg-orange-50')}
            {summaryCard(<Users size={18} className="text-emerald-500" />, 'Pending Reviews', String(driverProfile?.pendingMembershipRequests || 0), 'bg-emerald-50')}
          </div>

          <div className="mb-8">
            <DriverOnboardingPanel
              driverProfile={driverProfile}
              approvedTodas={approvedTodas}
              nasugbuBarangays={nasugbuBarangays}
              submitting={submitting}
              onSubmitMembership={handleMembershipSubmit}
              onSubmitToda={handleTodaSubmit}
              onSubmitFranchise={handleFranchiseSubmit}
            />
          </div>

          {/* Menu rows */}
          <div className="v-anim v-anim--4 space-y-3 mb-8">
            {[
              { icon: <FileText size={20} className="text-gray-600" />, label: t('driver-franchise') },
              { icon: <History size={20} className="text-gray-600" />,  label: t('driver-trip-history') },
              { icon: <Phone size={20} className="text-gray-600" />,    label: t('driver-contact-support') },
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
            className="v-anim v-anim--5 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold text-sm btn-press"
          >
            <LogOut size={20} />
            <span>{t('driver-logout')}</span>
          </button>
        </div>

        {showPresidentTab && (
          <div className={`tab-content pb-4${activeTab === 'president' ? ' active' : ''}`}>
            <PresidentMembershipTab
              enabled={showPresidentTab}
              pendingCount={driverProfile?.pendingMembershipRequests || 0}
              onAfterReview={() => loadDriverData(false)}
            />
          </div>
        )}
      </BottomSheet>

      {!isOnboardingLocked && <SOSButton />}

      {/* Bottom Nav */}
      <nav className="v-nav">
        <button
          onClick={() => switchTab('home')}
          className={`v-nav-item ${activeTab === 'home' ? 'active-green' : ''}`}
        >
          <div className="relative">
            <Compass size={24} />
            {!isOnboardingLocked && pendingRides.length > 0 && dutyOn && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">
                {pendingRides.length > 9 ? '9+' : pendingRides.length}
              </span>
            )}
          </div>
          <span className="v-nav-label">{isOnboardingLocked ? 'Status' : t('driver-nav-duty')}</span>
        </button>
        <button
          onClick={() => switchTab('account')}
          className={`v-nav-item ${activeTab === 'account' ? 'active-green' : ''}`}
        >
          <User size={24} />
          <span className="v-nav-label">{isOnboardingLocked ? 'Setup' : t('driver-nav-account')}</span>
        </button>
        {showPresidentTab && (
          <button
            onClick={() => switchTab('president')}
            className={`v-nav-item ${activeTab === 'president' ? 'active-green' : ''}`}
          >
            <Users size={24} />
            <span className="v-nav-label">President</span>
          </button>
        )}
      </nav>
    </div>
  );
}
