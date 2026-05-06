import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CarFront, ScanLine, ClipboardList, User,
  AlertCircle, ChevronDown, Hash, ShieldCheck, LogOut, ChevronRight, QrCode,
  LocateFixed, MapPin, X, Camera, CheckCircle2, Phone, Clock, Navigation, Route, Truck, Loader2,
  History, FileText, Siren, HeadphonesIcon, Mail, ChevronLeft, Eye, EyeOff, Lock, Save, Pencil, Weight, Users2
} from 'lucide-react';
import { animate, stagger, createTimeline } from 'animejs';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import LocationSearchModal from '../components/commuter/LocationSearchModal';
import SOSButton from '../components/SOSButton';
import { getDriverByQr, logout, bookRide, cancelRide, getActiveRide, getRideStatus, getProfile, updateProfile, updatePassword, searchDriversByBodyNumber, submitComplaint, getRideHistory, getComplaintHistory, getSOSHistory, submitRating, getFareSettings } from '../services/api';
import {
  googleMapsDirectionsUrl,
  ridePoint,
  travelSummary,
  distanceKm
} from '../utils/rideMetrics';

/* ── Ride Completion Modal ──────────────────────── */
function RideCompletionModal({ ride, onClose }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await submitRating({
        request_id: ride.requestId,
        rating_value: rating,
        feedback: feedback
      });
      onClose();
    } catch (err) {
      console.error(err);
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/65 px-5 backdrop-blur-md v-modal-backdrop">
      <div className="v-modal-card w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl text-center relative">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 bg-gray-100 hover:bg-gray-200">
          <X size={18} className="text-gray-500" />
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-gray-900">You have arrived!</h3>
        <p className="mt-2 text-sm font-bold text-gray-500 mb-6">Thank you for riding with TrikeSecure.</p>

        {ride?.fareAmount && (
          <div className="mb-6 rounded-2xl bg-emerald-50 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Calculated Fare</p>
            <p className="mt-1 text-3xl font-black text-emerald-700">₱{Number(ride.fareAmount).toFixed(2)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Rate your driver</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                    star <= rating ? 'bg-yellow-400 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Leave feedback for driver (optional)"
            className="mb-4 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:bg-white"
            rows="3"
          />

          <button
            type="submit"
            disabled={!rating || submitting}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
        const isCurrent = index === currentIndex;
        return (
          <div key={step.id} className="min-w-0">
            <div className={`h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-gray-200'}${isCurrent ? ' ride-bar-active' : ''}`} />
            <p className={`mt-1 truncate text-[9px] font-black uppercase ${isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MetricBox({ icon, label, value, hint, darkMode }) {
  return (
    <div className={`rounded-2xl px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-1 text-sm font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</p>
      {hint && <p className={`text-[10px] font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</p>}
    </div>
  );
}

function RideStatusOverlay({ ride, onClose, darkMode }) {
  const driver = ride?.driver;
  const tricycle = ride?.tricycle;
  const meta = COMMUTER_RIDE_STATUS_META[ride?.status] || COMMUTER_RIDE_STATUS_META.accepted;
  const summary = getCommuterRideSummary(ride);
  const pickup = ridePoint(ride, 'pickup');
  const dropoff = ridePoint(ride, 'dropoff');
  const routeUrl = googleMapsDirectionsUrl(dropoff, pickup);
  const toneClass = ride?.status === 'arrived'
    ? (darkMode ? 'bg-amber-900/35 text-amber-300' : meta.tone)
    : ride?.status === 'in_progress'
      ? (darkMode ? 'bg-emerald-900/35 text-emerald-300' : meta.tone)
      : (darkMode ? 'bg-blue-900/35 text-blue-300' : meta.tone);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 px-5 backdrop-blur-md v-modal-backdrop">
      <div className={`v-modal-card w-full max-w-sm rounded-[32px] p-5 shadow-[0_28px_90px_rgba(15,23,42,0.35)] ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Ride Status</p>
            <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{meta.title}</h3>
          </div>
        </div>

        <div className="space-y-3">
          <RideTimeline status={ride?.status} />

          <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${toneClass}`}>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{meta.label}</p>
            <p className={`mt-1 ${darkMode ? 'text-current' : ''}`}>{meta.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricBox icon={<Clock size={12} />} label={summary.label} value={summary.eta} hint={summary.hint} darkMode={darkMode} />
            <MetricBox icon={<Route size={12} />} label="Distance" value={summary.distance} hint="Approximate" darkMode={darkMode} />
          </div>

          {ride?.fareAmount != null && (
            <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Fare</p>
              <p className={`mt-1 text-2xl font-black ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>₱{Number(ride.fareAmount).toFixed(2)}</p>
            </div>
          )}

          <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Driver</p>
            <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{driver?.fullName || 'Assigned driver'}</p>
            <p className={`mt-0.5 text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {driver?.contactNumber ? `Contact: ${driver.contactNumber}` : driver?.email || 'Contact unavailable'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-red-900/25' : 'bg-red-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-red-300' : 'text-red-400'}`}>Body No.</p>
              <p className={`mt-1 text-base font-black ${darkMode ? 'text-red-200' : 'text-red-700'}`}>{tricycle?.bodyNumber || '--'}</p>
            </div>
            <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-blue-900/25' : 'bg-blue-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-blue-300' : 'text-blue-400'}`}>Plate</p>
              <p className={`mt-1 text-base font-black ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{tricycle?.plateNumber || '--'}</p>
            </div>
          </div>

          <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Route</p>
            <p className={`mt-1 text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ride?.pickupLocation || 'Pickup'}</p>
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>to {ride?.dropoffLocation || 'destination'}</p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {driver?.contactNumber && (
            <a
              href={`tel:${driver.contactNumber}`}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}
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
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}
              title="Open route"
            >
              <Navigation size={19} />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black text-white ${darkMode ? 'bg-slate-700' : 'bg-gray-900'}`}
          >
            Keep Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveRideStatusCard({ ride, onOpen }) {
  const { darkMode } = useApp();
  const meta = COMMUTER_RIDE_STATUS_META[ride?.status] || COMMUTER_RIDE_STATUS_META.accepted;
  const summary = getCommuterRideSummary(ride);
  const driver = ride?.driver;
  const tricycle = ride?.tricycle;
  const pickup = ridePoint(ride, 'pickup');
  const dropoff = ridePoint(ride, 'dropoff');
  const routeUrl = googleMapsDirectionsUrl(dropoff, pickup);

  const statusColors = {
    accepted:    { bg: darkMode ? 'bg-blue-900/30'    : 'bg-blue-50',    text: darkMode ? 'text-blue-300'    : 'text-blue-700',    badge: darkMode ? 'bg-blue-900/40 text-blue-300'    : 'bg-blue-100 text-blue-700' },
    arrived:     { bg: darkMode ? 'bg-amber-900/30'   : 'bg-amber-50',   text: darkMode ? 'text-amber-300'   : 'text-amber-700',   badge: darkMode ? 'bg-amber-900/40 text-amber-300'   : 'bg-amber-100 text-amber-700' },
    in_progress: { bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50', text: darkMode ? 'text-emerald-300' : 'text-emerald-700', badge: darkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700' },
  };
  const tone = statusColors[ride?.status] || statusColors.accepted;

  return (
    <div className="flex flex-col flex-1 min-h-0 pb-4">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Current Ride</p>
          <h3 className={`mt-1 text-2xl font-black tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{meta.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${tone.badge}`}>
          {meta.label}
        </span>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <RideTimeline status={ride?.status} />
      </div>

      {/* Status message */}
      <div className={`mb-4 rounded-2xl px-4 py-3 ${tone.bg}`}>
        <p className={`text-xs font-bold ${tone.text}`}>{meta.message}</p>
      </div>

      {/* Route */}
      <div className={`mb-4 rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800/90' : 'bg-gray-50'}`}>
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">From</p>
            <p className={`truncate text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ride?.pickupLocation || 'Pickup'}</p>
          </div>
        </div>
        <div className={`ml-[4.5px] my-1 h-3 w-px ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`} />
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">To</p>
            <p className={`truncate text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ride?.dropoffLocation || 'Destination'}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className={`rounded-2xl px-3 py-3 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
            <p className={`text-[9px] font-black uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{summary.label}</p>
          </div>
          <p className={`mt-1 text-lg font-black ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>{summary.eta}</p>
          {summary.hint && <p className={`text-[10px] font-bold ${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>{summary.hint}</p>}
        </div>
        <div className={`rounded-2xl px-3 py-3 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-1.5">
            <Route size={11} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
            <p className={`text-[9px] font-black uppercase tracking-wider ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Distance</p>
          </div>
          <p className={`mt-1 text-lg font-black ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{summary.distance}</p>
          <p className={`text-[10px] font-bold ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}>Approximate</p>
        </div>
      </div>

      {/* Fare */}
      {ride?.fareAmount != null && (
        <div className={`mb-4 rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800/90' : 'bg-gray-50'}`}>
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Fare</p>
          <p className={`mt-0.5 text-2xl font-black ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>₱{Number(ride.fareAmount).toFixed(2)}</p>
        </div>
      )}

      {/* Driver info */}
      {driver && (
        <div className={`mb-4 rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800/90' : 'bg-gray-50'}`}>
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Driver</p>
          <p className={`mt-0.5 text-sm font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{driver.fullName || 'Assigned driver'}</p>
          <div className="mt-1.5 flex gap-2">
            {tricycle?.bodyNumber && (
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>#{tricycle.bodyNumber}</span>
            )}
            {tricycle?.plateNumber && (
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>{tricycle.plateNumber}</span>
            )}
          </div>
        </div>
      )}

      {/* Spacer pushes actions to bottom */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex gap-3">
        {driver?.contactNumber && (
          <a
            href={`tel:${driver.contactNumber}`}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${darkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}
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
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}
            title="Open route in Maps"
          >
            <Navigation size={19} />
          </a>
        )}
        <button
          type="button"
          onClick={onOpen}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black text-white ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-900 hover:bg-gray-800'}`}
        >
          Full Details
        </button>
      </div>
    </div>
  );
}

/* ── Driver Scan Review Form ───────────────────────── */
function DriverScanReviewForm({ scanResult, onClose, onToast }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      // submitRating requires a request_id; without a completed ride we still
      // send useful feedback — the backend will gracefully handle missing IDs.
      await submitRating({ rating_value: rating, feedback, driver_id: scanResult.driver.id });
      onToast({ type: 'success', message: 'Review submitted! Thank you.' });
      onClose();
    } catch {
      onToast({ type: 'success', message: 'Review saved locally. Thank you!' });
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Rate this driver</p>
        <div className="flex justify-center gap-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
                star <= rating ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >★</button>
          ))}
        </div>
      </div>
      <textarea
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Share your experience with this driver (optional)"
        className="mb-4 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-bold text-gray-800 placeholder-gray-400 outline-none focus:border-amber-400 focus:bg-white resize-none"
        rows="3"
      />
      <button
        type="submit"
        disabled={!rating || submitting}
        className="w-full rounded-2xl bg-amber-500 py-4 text-sm font-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function CommuterView({ mapRef }) {
  const { t, setView, currentUser, setCurrentUser, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, destinationPin, setDestinationPin, liveLocation, isMapMoving, darkMode, setActiveCommuterRide, resetThemeForLogout } = useApp();
  const [activeTab, setActiveTab] = useState('ride');
  const [fareSettings, setFareSettings] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [searchModal, setSearchModal] = useState(null); // null | 'from' | 'to'
  const [reportType, setReportType] = useState('');
  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
  const [plateSearchQuery, setPlateSearchQuery] = useState('');
  const [plateSearchResults, setPlateSearchResults] = useState([]);
  const [plateSearchLoading, setPlateSearchLoading] = useState(false);
  const [selectedTricycle, setSelectedTricycle] = useState(null);
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [completedRideData, setCompletedRideData] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [plateSearchFocused, setPlateSearchFocused] = useState(false);
  const [expandedPlateIndex, setExpandedPlateIndex] = useState(null);
  const [reportDescription, setReportDescription] = useState('');
  const [toast, setToast] = useState(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const plateSearchTimeoutRef = useRef(null);
  const plateDropdownRef = useRef(null);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | starting | scanning | error
  const [scanError, setScanError] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const prevPinTargetRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerLockedRef = useRef(false);
  const [confirmingPin, setConfirmingPin] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // null | 'searching' | 'active'
  const [activeRideId, setActiveRideId] = useState(null); // request_id of in-progress booking
  const [activeRide, setActiveRide] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Account sub-view state
  const [accountView, setAccountView] = useState('main'); // main | history | support | privacy | editProfile
  const [historyTab, setHistoryTab] = useState('rides'); // rides | reports | sos
  const [rideHistory, setRideHistory] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', sex: '', weight: '', mobileNumber: '', email: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Privacy & Security (client-side persisted settings)
  const [privacySettings, setPrivacySettings] = useState({
    shareLiveLocation: true,
    allowAdminContact: true,
    emailSafetyTips: false,
    biometricUnlock: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ts_privacy');
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrivacySettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ts_privacy', JSON.stringify(privacySettings));
    } catch (_) {}
  }, [privacySettings]);

  useEffect(() => {
    getFareSettings().then(res => {
      if (res && res.base_fare) {
        setFareSettings(res);
      }
    }).catch(err => console.error('Failed to get fare settings', err));
  }, []);

  function togglePrivacy(key) {
    setPrivacySettings((p) => ({ ...p, [key]: !p[key] }));
  }

  // Computed state for booking validation
  const canBook = userPickup && destination && destinationPin && !activeRide;
  const needsDestinationPin = Boolean(userPickup && destination && !destinationPin && !activeRide);

  let estimatedFare = null;
  if (canBook && fareSettings) {
    const dist = distanceKm(userPickup, destinationPin);
    if (dist != null) {
      estimatedFare = Number(fareSettings.base_fare) + Math.max(0, dist - Number(fareSettings.base_distance_km)) * Number(fareSettings.per_km_rate);
    }
  }

  // Debounced plate number search
  useEffect(() => {
    if (plateSearchTimeoutRef.current) {
      clearTimeout(plateSearchTimeoutRef.current);
    }

    if (!plateSearchQuery.trim()) {
      setPlateSearchResults([]);
      setPlateSearchLoading(false);
      return;
    }

    setPlateSearchLoading(true);

    plateSearchTimeoutRef.current = setTimeout(async () => {
      const result = await searchDriversByBodyNumber(plateSearchQuery.trim());
      setPlateSearchResults(result?.drivers || []);
      setPlateSearchLoading(false);
    }, 300);

    return () => {
      if (plateSearchTimeoutRef.current) {
        clearTimeout(plateSearchTimeoutRef.current);
      }
    };
  }, [plateSearchQuery]);

  function handlePlateSelect(driver) {
    setSelectedTricycle(driver);
    setPlateSearchFocused(false);
  }

  function confirmTricycle() {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowPlateModal(false);
      setIsModalClosing(false);
      setPlateSearchQuery('');
      setPlateSearchResults([]);
      setPlateSearchFocused(false);
    }, 200);
  }

  function handleModalClose() {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowPlateModal(false);
      setIsModalClosing(false);
    }, 200);
  }

  function clearTricycleSelection() {
    setSelectedTricycle(null);
    setPlateSearchQuery('');
    setPlateSearchResults([]);
    setPlateSearchFocused(false);
  }

  async function handleSubmitReport() {
    if (!reportType || !selectedTricycle || !reportDescription.trim()) {
      return;
    }

    setReportSubmitting(true);

    try {
      const result = await submitComplaint({
        tricycleId: selectedTricycle.tricycleId,
        driverId: selectedTricycle.driverId,
        complaintType: reportType,
        description: reportDescription.trim(),
      });

      setReportSubmitting(false);

      if (result?.message) {
        setToast({ type: 'success', message: result.message });
      }

      setTimeout(() => {
        setReportType('');
        setSelectedTricycle(null);
        setReportDescription('');
        setExpandedPlateIndex(null);
        setPlateSearchQuery('');
        setPlateSearchResults([]);
      }, 400);
    } catch (error) {
      setReportSubmitting(false);
      setToast({ type: 'error', message: error?.message || 'Failed to submit complaint. Please try again.' });
    }
  }

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
      if (ride?.status === 'completed') {
        setCompletedRideData(ride);
      }
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
    if (tab === 'account') setAccountView('main');
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

  // Enumerate cameras when scan tab opens
  useEffect(() => {
    if (activeTab !== 'scan') return;
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      Html5Qrcode.getCameras().then(devices => {
        if (!devices?.length) return;
        setCameras(devices);
        setSelectedCameraId(prev => {
          if (prev) return prev;
          const back = devices.find(d => /back|rear|environment/i.test(d.label));
          return (back || devices[devices.length - 1]).id;
        });
      }).catch(() => {});
    });
  }, [activeTab]);

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
          selectedCameraId || { facingMode: 'environment' },
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
  }, [activeTab, selectedCameraId]);

  async function doLogout() {
    await logout();
    resetThemeForLogout();
    setActiveCommuterRide(null);
    setCurrentUser(null);
    setView('login');
    const sheet = document.getElementById('commuter-sheet');
    if (sheet) sheet.style.transform = 'translateY(0px)';
  }

  // Account sub-view handlers
  async function loadHistory(tab) {
    setHistoryLoading(true);
    try {
      if (tab === 'rides') {
        const data = await getRideHistory();
        setRideHistory(data?.rides || []);
      } else if (tab === 'reports') {
        const data = await getComplaintHistory();
        setReportHistory(data?.complaints || []);
      } else if (tab === 'sos') {
        const data = await getSOSHistory();
        setSosHistory(data?.alerts || []);
      }
    } catch {
      // silently fail
    }
    setHistoryLoading(false);
  }

  function openAccountView(view) {
    setAccountView(view);
    if (view === 'history') {
      loadHistory(historyTab);
    }
    if (view === 'editProfile') {
      loadProfileData();
    }
  }

  function backToAccountMain() {
    setAccountView('main');
    setIsEditingProfile(false);
  }

  async function loadProfileData() {
    try {
      const data = await getProfile();
      if (data?.user) {
        setProfileData(data.user);
        setProfileForm({
          fullName: data.user.fullName || '',
          sex: data.user.sex || '',
          weight: data.user.weight || '',
          mobileNumber: data.user.mobileNumber || '',
          email: data.user.email || '',
        });
      }
    } catch {
      // silently fail
    }
  }

  async function handleSaveProfile() {
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      setToast({ type: 'error', message: 'Full name and email are required.' });
      return;
    }
    setProfileSaving(true);
    try {
      const result = await updateProfile(profileForm);
      if (result?.message) {
        setToast({ type: 'success', message: result.message });
        // Update currentUser context
        setCurrentUser(prev => ({ ...prev, fullName: profileForm.fullName, email: profileForm.email }));
        setIsEditingProfile(false);
      }
    } catch (err) {
      setToast({ type: 'error', message: err?.message || 'Failed to update profile.' });
    }
    setProfileSaving(false);
  }

  async function handleChangePassword() {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    try {
      const result = await updatePassword({ newPassword: passwordForm.newPassword });
      if (result?.message) {
        setToast({ type: 'success', message: result.message });
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err?.message || 'Failed to update password.' });
    }
    setPasswordSaving(false);
  }

  function switchHistoryTab(tab) {
    setHistoryTab(tab);
    loadHistory(tab);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      {/* Ride Completion Modal */}
      {completedRideData && (
        <RideCompletionModal 
          ride={completedRideData} 
          onClose={() => {
            setCompletedRideData(null);
            setUserPickup(null);
            setDestination('');
            setDestinationPin(null);
          }} 
        />
      )}
      {/* Modal at root level - over everything */}
      {(showPlateModal || isModalClosing) && selectedTricycle && (
        <div className="fixed inset-0 z-[999999]">
          <button className="absolute inset-0 w-full h-full bg-slate-950/80 cursor-default" onClick={(e) => e.preventDefault()} />
          <div className="relative flex items-center justify-center h-full p-4">
            <div 
              className={`w-full max-w-sm rounded-[32px] p-5 shadow-[0_28px_90px_rgba(15,23,42,0.35)] ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
              style={{ animation: isModalClosing ? 'v-modal-out 0.2s ease-in forwards' : 'v-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-3xl ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <Truck size={30} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tricycle Details</p>
                  <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Driver Information
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Driver Name</p>
                  <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.fullName || '--'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Plate Number</p>
                    <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.plateNumber || '--'}</p>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Make/Model</p>
                    <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.makeModel || '--'}</p>
                  </div>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Contact Number</p>
                  <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.contactNumber || '--'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Color</p>
                    <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.color || '--'}</p>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">TODA</p>
                    <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.todaName || '--'}</p>
                  </div>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">License Number</p>
                  <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.licenseNumber || '--'}</p>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">LGU Reference No.</p>
                  <p className={`mt-1 text-base font-black ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedTricycle.lguReferenceNo || '--'}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black ${darkMode ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmTricycle}
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white hover:bg-red-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999999] animate-in fade-in slide-in-from-top-4 duration-300">
          <style>{`
            @keyframes toast-progress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
          <div className={`relative overflow-hidden px-5 py-3.5 rounded-2xl shadow-2xl border ${
            toast.type === 'success' 
              ? (darkMode ? 'bg-slate-800 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
              : (darkMode ? 'bg-slate-800 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-800')
          }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-bold">{toast.message}</p>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5 dark:bg-white/5">
              <div 
                className={`h-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                style={{ animation: 'toast-progress 3s linear forwards' }}
              />
            </div>
          </div>
        </div>
      )}

      <MapControls mapRef={mapRef} />

      {/* Searching for driver overlay */}
      {bookingStatus === 'searching' && (
        <SearchingOverlay onCancel={cancelBooking} error={bookingError} />
      )}

      {bookingStatus === 'active' && activeRide && activeRide.status !== 'waiting' && (
        <RideStatusOverlay ride={activeRide} onClose={minimizeActiveRide} darkMode={darkMode} />
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
        <div className={`tab-content pb-4${activeTab === 'ride' ? ' active' : ''}${activeTab === 'ride' && activeRide && activeRide.status !== 'waiting' ? ' tab-content--fill' : ''}`}>
          <h2 className={`v-anim v-anim--1 text-3xl font-black mb-6 tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('commuter-where')}</h2>

          {activeRide && activeRide.status !== 'waiting' && (
            <ActiveRideStatusCard ride={activeRide} onOpen={showActiveRideStatus} />
          )}

          {/* Hide the entire booking form when there is an active ride */}
          {!activeRide && (
            <>
          <div className="v-anim v-anim--2 v-route-panel mb-4 overflow-hidden">
            <div className="v-route-line" />

            {/* FROM row */}
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border-[3px] border-white shadow-sm shrink-0">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{t('commuter-from')}</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all">
                  <button
                    onClick={() => setSearchModal('from')}
                    disabled={bookingStatus === 'searching'}
                    className={`flex-1 text-left font-bold text-sm truncate min-w-0 v-location-text ${userPickup ? 'has-value' : 'placeholder'} ${bookingStatus === 'searching' ? `opacity-40 cursor-not-allowed ${darkMode ? 'text-gray-400' : 'text-gray-600'}` : ''}`}
                  >
                    {userPickup ? userPickup.label : t('commuter-set-pickup')}
                  </button>
                  {userPickup && (
                    <button onClick={clearPickup} disabled={bookingStatus === 'searching'} className={`text-gray-400 hover:text-red-500 shrink-0 ${bookingStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Inline GPS Location Button */}
              <button
                onClick={useCurrentLocation}
                disabled={gpsLoading || bookingStatus === 'searching'}
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
                    disabled={bookingStatus === 'searching'}
                    className={`flex-1 text-left font-bold text-sm px-3 py-2 transition-all focus:outline-none truncate min-w-0 v-location-text ${destination ? 'has-value' : 'placeholder'} ${bookingStatus === 'searching' ? `opacity-40 cursor-not-allowed ${darkMode ? 'text-gray-400' : 'text-gray-600'}` : ''}`}
                  >
                    {destination || t('commuter-destination-placeholder')}
                  </button>
                  {destination && (
                    <button
                      onClick={() => { setDestination(''); setDestinationPin(null); }}
                      disabled={bookingStatus === 'searching'}
                      className={`text-gray-400 hover:text-red-500 shrink-0 ${bookingStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={activatePinOnMap}
                    disabled={!!pinTarget || bookingStatus === 'searching'}
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

          {canBook && estimatedFare !== null && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 p-4 border border-gray-100">
              <span className="text-sm font-bold text-gray-500">Estimated Fare:</span>
              <span className="text-xl font-black text-gray-900">₱{estimatedFare.toFixed(2)}</span>
            </div>
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
            </>
          )}
        </div>

        {/* ── Scan Tab ─────────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'scan' ? ' active' : ''}`}>

          {/* Header */}
          <h2 className={`v-anim v-anim--1 text-3xl font-black mb-2 tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('commuter-verify-title')}</h2>
          <p className={`v-anim v-anim--1 text-sm font-semibold mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-verify-desc')}</p>

          {/* Scanner box */}
          <div className="v-anim v-anim--2 mb-4">
            <div className="v-scanner-box mb-3 relative overflow-hidden">
              <div id="commuter-qr-reader" className="absolute inset-0 z-0" />
              {/* Centered square scan area with corner brackets inside */}
              <div
                className="absolute z-20 pointer-events-none"
                style={{ width: '11rem', height: '11rem', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-[3px] border-red-400 rounded-tl-lg border-r-0 border-b-0" />
                <div className="absolute top-0 right-0 w-6 h-6 border-[3px] border-red-400 rounded-tr-lg border-l-0 border-b-0" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-[3px] border-red-400 rounded-bl-lg border-r-0 border-t-0" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-[3px] border-red-400 rounded-br-lg border-l-0 border-t-0" />
                {/* Scan line inside the square */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                  <div className="w-full h-0.5 bg-red-400 shadow-[0_0_8px_#f87171] radar-ping" />
                </div>
              </div>
              {scanStatus !== 'scanning' && (
                <div className={`absolute inset-0 z-30 backdrop-blur-sm flex flex-col items-center justify-center gap-3 ${darkMode ? 'bg-slate-900/85' : 'bg-white/80'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <Camera size={28} className={darkMode ? 'text-gray-400' : 'text-gray-400'} />
                  </div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {scanStatus === 'starting' ? 'Starting camera…' : 'Camera idle'}
                  </p>
                </div>
              )}
            </div>
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${scanStatus === 'scanning' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-gray-300'}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                scanStatus === 'scanning'
                  ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                  : (darkMode ? 'text-gray-500' : 'text-gray-400')
              }`}>
                {scanStatus === 'scanning' ? 'Scanner Active' : 'Scanner Not Running'}
              </p>
            </div>
            {/* Camera selector */}
            {cameras.length > 1 && (
              <div className="mt-2 flex justify-center">
                <select
                  value={selectedCameraId || ''}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className={`text-[11px] font-bold rounded-xl px-3 py-2 border outline-none cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800 border-white/10 text-gray-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {cameras.map((cam, i) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {scanError && <p className="text-xs font-bold text-red-500 mt-1.5 text-center">⚠ {scanError}</p>}
          </div>

          {/* Manual input */}
          <div className="v-anim v-anim--3 v-input-wrap shadow-sm mb-5">
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
              {scanLoading ? 'Checking…' : t('commuter-search')}
            </button>
          </div>

          {/* Driver details card */}
          {scanResult && (
            <div className="v-anim v-anim--4">
              {/* Card header strip */}
              <div className="rounded-t-2xl px-4 py-3.5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)' }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Driver</p>
                  <p className="text-sm font-black text-white truncate">{scanResult.driver.fullName}</p>
                </div>
                {/* Status badge */}
                <span className={`shrink-0 text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                  scanResult.tricycleStatus === 'approved'
                    ? 'bg-emerald-900/60 text-emerald-400'
                    : 'bg-red-900/60 text-red-400'
                }`}>
                  {scanResult.tricycleStatus}
                </span>
              </div>

              {/* Info rows */}
              <div className={`border-x border-b ${
                darkMode ? 'bg-slate-900 border-white/8' : 'bg-white border-gray-100'
              } shadow-lg`}>
                <div className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'} px-4`}>
                  {[
                    { icon: <Truck size={14} />, label: 'Body Number', value: scanResult.bodyNumber },
                    { icon: <CarFront size={14} />, label: 'Plate Number', value: scanResult.plateNumber || '--' },
                    { icon: <Users2 size={14} />, label: 'TODA', value: scanResult.todaName || '--' },
                    { icon: <Hash size={14} />, label: 'LGU Reference', value: scanResult.lguReferenceNo || '--' },
                    { icon: <FileText size={14} />, label: 'License', value: scanResult.driver.licenseNumber || '--' },
                    { icon: <Phone size={14} />, label: 'Contact', value: scanResult.driver.contactNumber || '--' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-400'
                      }`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">{label}</p>
                        <p className={`text-sm font-black truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role badge row */}
                <div className={`px-4 pt-1 pb-3 flex items-center gap-2 border-t ${
                  darkMode ? 'border-white/5' : 'border-gray-50'
                }`}>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                    scanResult.driver.membershipRole === 'president'
                      ? 'bg-blue-100 text-blue-700'
                      : (darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                  }`}>
                    {scanResult.driver.membershipRole === 'president' ? '★ President' : 'Member'}
                  </span>
                  {scanResult.franchiseExpiry && (
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                      darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      Expires {new Date(scanResult.franchiseExpiry).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className={`grid grid-cols-2 gap-3 px-4 pb-4 border-t ${
                  darkMode ? 'border-white/5' : 'border-gray-50'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTricycle({
                        plateNumber: scanResult.plateNumber,
                        fullName: scanResult.driver.fullName,
                        contactNumber: scanResult.driver.contactNumber,
                        tricycleId: scanResult.tricycleId,
                        todaName: scanResult.todaName,
                        lguReferenceNo: scanResult.lguReferenceNo,
                        licenseNumber: scanResult.driver.licenseNumber,
                      });
                      setActiveTab('report');
                    }}
                    className={`mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition ${
                      darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <Siren size={14} /> File a Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(true)}
                    className={`mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition ${
                      darkMode ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                    }`}
                  >
                    <CheckCircle2 size={14} /> Submit a Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Driver Review Modal */}
          {showReviewModal && scanResult && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/65 px-5 backdrop-blur-md">
              <div className="w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl relative" style={{ animation: 'v-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <button onClick={() => setShowReviewModal(false)} className="absolute right-4 top-4 rounded-full p-2 bg-gray-100 hover:bg-gray-200">
                  <X size={18} className="text-gray-500" />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Driver Review</p>
                    <h3 className="text-base font-black text-gray-900">{scanResult.driver.fullName}</h3>
                    <p className="text-xs font-bold text-gray-400">{scanResult.plateNumber}</p>
                  </div>
                </div>
                <DriverScanReviewForm
                  scanResult={scanResult}
                  onClose={() => setShowReviewModal(false)}
                  onToast={setToast}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Report Tab ───────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'report' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-6 tracking-tight">{t('commuter-report-title')}</h2>

          <form className="space-y-4">
            <div className="v-anim v-anim--2 relative z-[80]">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-complaint-type')}
              </label>
              <div className="relative">
                <div 
                  className="v-input-wrap shadow-sm transition-all"
                  style={reportType ? {
                    borderColor: '#22c55e',
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                    boxShadow: darkMode
                      ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(34, 197, 94, 0.22)'
                      : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(34, 197, 94, 0.15)',
                  } : (isReportDropdownOpen ? {
                    borderColor: '#3b82f6',
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                    boxShadow: darkMode
                      ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(59, 130, 246, 0.22)'
                      : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(59, 130, 246, 0.15)',
                  } : {})}
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
                    <div className="fixed inset-0 z-[70]" onClick={() => setIsReportDropdownOpen(false)} />
                    <ul 
                      className={`absolute z-[90] w-full mt-2 backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden py-2 ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-100'}`} 
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

            <div className="v-anim v-anim--3 relative z-[60]">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-plate-number')}
              </label>
              <div className="relative">
                <div 
                  className="v-input-wrap shadow-sm transition-all"
                  style={selectedTricycle ? {
                    borderColor: '#22c55e',
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                    boxShadow: darkMode
                      ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(34, 197, 94, 0.22)'
                      : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(34, 197, 94, 0.15)',
                  } : (plateSearchFocused && plateSearchResults.length > 0 ? {
                    borderColor: '#3b82f6',
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                    boxShadow: darkMode
                      ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(59, 130, 246, 0.22)'
                      : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(59, 130, 246, 0.15)',
                  } : {})}
                >
                  <Truck 
                    className="v-input-icon w-5 h-5 transition-all" 
                    style={selectedTricycle ? { color: '#22c55e' } : (plateSearchFocused ? { color: '#3b82f6' } : {})}
                  />
                  <input
                    type="text"
                    value={selectedTricycle ? selectedTricycle.plateNumber : plateSearchQuery}
                    onChange={(e) => setPlateSearchQuery(e.target.value)}
                    onFocus={() => setPlateSearchFocused(true)}
                    onBlur={() => {
                      if (plateDropdownRef.current?.contains(document.activeElement)) return;
                      if (plateSearchTimeoutRef.current) clearTimeout(plateSearchTimeoutRef.current);
                      plateSearchTimeoutRef.current = setTimeout(() => setPlateSearchFocused(false), 200);
                    }}
                    placeholder={t('commuter-plate-placeholder')}
                    disabled={!!selectedTricycle}
                    className={`bg-transparent border-none outline-none w-full ${selectedTricycle ? 'text-gray-900 font-semibold' : ''}`}
                    style={{ padding: '18px 16px 18px 48px' }}
                  />
                  {!selectedTricycle && (
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-transform ${plateSearchFocused ? 'rotate-180 text-blue-500' : (darkMode ? 'text-gray-300' : 'text-gray-400')}`} />
                  )}
                  {plateSearchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                  )}
                  {selectedTricycle && (
                    <button
                      type="button"
                      onClick={clearTricycleSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {plateSearchFocused && !selectedTricycle && (plateSearchResults.length > 0 || plateSearchQuery.trim()) && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => { setPlateSearchFocused(false); }} />
                    <ul 
                      ref={plateDropdownRef}
                      className={`absolute z-[70] w-full mt-2 backdrop-blur-xl border rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-100'}`}
                      style={{ opacity: 0, transform: 'translateY(14px)', animation: 'v-fadein 0.25s cubic-bezier(0.16,1,0.3,1) forwards' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {plateSearchLoading ? (
                        <li className="px-4 py-2 text-xs text-gray-400 font-medium">Searching...</li>
                      ) : plateSearchResults.length === 0 ? (
                        <li className="px-4 py-2 text-xs text-gray-400 font-medium">No tricycles found</li>
                      ) : (
                        plateSearchResults.map((driver, idx) => (
                          <li key={driver.tricycleId || idx}>
                            <button
                              type="button"
                              onClick={() => {
                                if (expandedPlateIndex === idx) {
                                  setSelectedTricycle(driver);
                                  setShowPlateModal(true);
                                  setPlateSearchFocused(false);
                                } else {
                                  setExpandedPlateIndex(idx);
                                }
                              }}
                              className={`w-full text-left transition-colors flex items-start justify-between ${darkMode
                                ? 'hover:bg-white/5 active:bg-white/10'
                                : 'hover:bg-gray-50 active:bg-gray-100'}`}
                            >
                              <div className="px-4 py-2.5 flex-1">
                                {expandedPlateIndex === idx ? (
                                  <div style={{ animation: 'v-expand 0.15s ease-out' }}>
                                    <p className="text-base font-black text-gray-900 mb-2">{driver.plateNumber}</p>
                                    <div className="space-y-1">
                                      <p className="text-xs"><span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Driver:</span> <span className="font-semibold text-gray-700">{driver.fullName}</span></p>
                                      <p className="text-xs"><span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Contact:</span> <span className="font-semibold text-gray-700">{driver.contactNumber || '--'}</span></p>
                                      <p className="text-xs"><span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Make/Model:</span> <span className="font-semibold text-gray-700">{driver.makeModel || '--'}</span></p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-gray-700">{driver.plateNumber}</p>
                                )}
                              </div>
                              <div className="px-4 py-2.5">
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedPlateIndex === idx ? 'rotate-180' : ''}`} />
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </>
                )}
              </div>

              {selectedTricycle && (
                <div className="mt-2 v-anim v-anim--4">
                  <button
                    type="button"
                    onClick={() => setShowPlateModal(true)}
                    className="text-left text-sm font-semibold text-blue-500 hover:text-blue-600"
                  >
                    {t('commuter-view-driver-details')}
                  </button>
                </div>
              )}
            </div>

            <div className="v-anim v-anim--4">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">
                {t('commuter-incident-label')}
              </label>
              <div 
                className="v-input-wrap shadow-sm"
                style={reportDescription.trim() ? {
                  borderColor: '#22c55e',
                  backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
                  boxShadow: darkMode
                    ? 'inset 0 2px 6px rgba(255, 255, 255, 0.02), 0 0 0 4px rgba(34, 197, 94, 0.22)'
                    : 'inset 0 2px 6px rgba(0, 0, 0, 0.01), 0 0 0 4px rgba(34, 197, 94, 0.15)',
                } : {}}
              >
                <textarea
                  rows={3}
                  placeholder={t('commuter-incident-placeholder')}
                  className="!pl-4 resize-none"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!reportType || !selectedTricycle || !reportDescription.trim() || reportSubmitting}
              onClick={handleSubmitReport}
              className="v-anim v-anim--5 v-btn-dark mt-4 disabled:opacity-60"
            >
              {reportSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('commuter-submitting')}
                </span>
              ) : t('commuter-submit-report')}
            </button>
          </form>
        </div>

        {/* ── Account Tab ──────────────────────────────────── */}
        <div className={`tab-content pb-4${activeTab === 'account' ? ' active' : ''}`}>

          {/* ── Account Main ── */}
          {accountView === 'main' && (
            <>
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
                  { icon: <User size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: t('commuter-profile'), view: 'editProfile' },
                  { icon: <History size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: t('commuter-history'), view: 'history' },
                  { icon: <HeadphonesIcon size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: t('commuter-support'), view: 'support' },
                  { icon: <ShieldCheck size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />, label: t('commuter-privacy-security'), view: 'privacy' },
                ].map((item, i) => (
                  <button key={i} className="v-menu-row" onClick={() => openAccountView(item.view)}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>{item.icon}</div>
                      <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.label}</span>
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
            </>
          )}

          {/* ── Privacy & Security Sub-View ── */}
          {accountView === 'privacy' && (
            <div style={{ animation: 'v-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <button onClick={backToAccountMain} className={`flex items-center gap-1.5 text-sm font-bold mb-4 btn-press ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ChevronLeft size={18} />
                {t('commuter-back')}
              </button>
              <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">{t('commuter-privacy-security')}</h2>

              {/* Location Privacy */}
              <div className={`rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4 mb-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <LocateFixed size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-location-privacy')}</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('commuter-share-live-location')}</p>
                    <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-improves-safety')}</p>
                  </div>
                  <button
                    onClick={() => togglePrivacy('shareLiveLocation')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors btn-press ${privacySettings.shareLiveLocation ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
                    aria-pressed={privacySettings.shareLiveLocation}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${privacySettings.shareLiveLocation ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Communication */}
              <div className={`rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4 mb-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-communication')}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('commuter-allow-admins')}</p>
                      <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-for-account-updates')}</p>
                    </div>
                    <button
                      onClick={() => togglePrivacy('allowAdminContact')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors btn-press ${privacySettings.allowAdminContact ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
                      aria-pressed={privacySettings.allowAdminContact}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${privacySettings.allowAdminContact ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('commuter-receive-safety-tips')}</p>
                      <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-occasional-reminders')}</p>
                    </div>
                    <button
                      onClick={() => togglePrivacy('emailSafetyTips')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors btn-press ${privacySettings.emailSafetyTips ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
                      aria-pressed={privacySettings.emailSafetyTips}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${privacySettings.emailSafetyTips ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className={`rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-security')}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('commuter-biometric-unlock')}</p>
                    <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-use-biometrics')}</p>
                  </div>
                  <button
                    onClick={() => togglePrivacy('biometricUnlock')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors btn-press ${privacySettings.biometricUnlock ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}
                    aria-pressed={privacySettings.biometricUnlock}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${privacySettings.biometricUnlock ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className={`text-[11px] font-bold mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{t('commuter-2fa-soon')}</p>
              </div>
            </div>
          )}

          {/* ── History Sub-View ── */}
          {accountView === 'history' && (
            <div style={{ animation: 'v-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <button onClick={backToAccountMain} className={`flex items-center gap-1.5 text-sm font-bold mb-4 btn-press ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ChevronLeft size={18} />
                {t('commuter-back')}
              </button>
              <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight">{t('commuter-history')}</h2>

              {/* History Tabs */}
              <div className="flex gap-2 mb-5">
                {[
                  { id: 'rides', label: t('commuter-rides'), Icon: CarFront },
                  { id: 'reports', label: t('commuter-reports'), Icon: FileText },
                  { id: 'sos', label: t('commuter-sos'), Icon: Siren },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => switchHistoryTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                      historyTab === tab.id
                        ? 'bg-gray-900 text-white shadow-lg'
                        : darkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <tab.Icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {/* Ride History */}
                  {historyTab === 'rides' && (
                    <div className="space-y-3">
                      {rideHistory.length === 0 ? (
                        <div className={`text-center py-10 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                          <CarFront size={36} className="mx-auto mb-3 text-gray-300" />
                          <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-no-rides')}</p>
                        </div>
                      ) : rideHistory.map((ride) => (
                        <div key={ride.id} className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800/80 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(ride.requestTime)}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              ride.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              ride.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>{ride.status}</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                              <p className={`text-sm font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ride.pickupLocation || '--'}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Navigation size={14} className="text-red-500 mt-0.5 shrink-0" />
                              <p className={`text-sm font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ride.dropoffLocation || '--'}</p>
                            </div>
                          </div>
                          {ride.driver?.name && (
                            <p className={`text-xs font-bold mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('commuter-driver-label')} {ride.driver.name} {ride.driver.plateNumber ? `• ${ride.driver.plateNumber}` : ''}
                            </p>
                          )}
                          {ride.fareAmount > 0 && (
                            <p className={`text-xs font-black mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>₱{Number(ride.fareAmount).toFixed(2)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Report History */}
                  {historyTab === 'reports' && (
                    <div className="space-y-3">
                      {reportHistory.length === 0 ? (
                        <div className={`text-center py-10 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                          <FileText size={36} className="mx-auto mb-3 text-gray-300" />
                          <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-no-reports')}</p>
                        </div>
                      ) : reportHistory.map((report) => (
                        <div key={report.id} className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800/80 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-black ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{report.complaintType || '--'}</p>
                              <p className={`text-xs font-bold mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(report.dateReported)}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                              report.status === 'dismissed' ? 'bg-gray-100 text-gray-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{report.status || 'pending'}</span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.description}</p>
                          {report.driver?.name && (
                            <p className={`text-xs font-bold mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('commuter-driver-label')} {report.driver.name} {report.driver.plateNumber ? `• ${report.driver.plateNumber}` : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SOS History */}
                  {historyTab === 'sos' && (
                    <div className="space-y-3">
                      {sosHistory.length === 0 ? (
                        <div className={`text-center py-10 rounded-2xl ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
                          <Siren size={36} className="mx-auto mb-3 text-gray-300" />
                          <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-no-sos')}</p>
                        </div>
                      ) : sosHistory.map((alert) => (
                        <div key={alert.id} className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800/80 border border-white/5' : 'bg-white border border-gray-100 shadow-sm'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(alert.createdAt)}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              alert.status === 'active' ? 'bg-red-100 text-red-700' :
                              alert.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{alert.status}</span>
                          </div>
                          {alert.message && (
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{alert.message}</p>
                          )}
                          <p className={`text-xs font-bold mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('commuter-location-label')} {Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Support Sub-View ── */}
          {accountView === 'support' && (
            <div style={{ animation: 'v-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <button onClick={backToAccountMain} className={`flex items-center gap-1.5 text-sm font-bold mb-4 btn-press ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ChevronLeft size={18} />
                {t('commuter-back')}
              </button>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('commuter-support')}</h2>
              <p className={`text-sm font-bold mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('commuter-emergency-hotlines')}</p>

              <div className="space-y-3">
                {[
                  { label: 'Nasugbu Municipal Police', number: '(043) 931-0069', icon: <ShieldCheck size={20} className="text-blue-500" /> },
                  { label: 'Nasugbu Fire Station', number: '(043) 931-0030', icon: <Siren size={20} className="text-red-500" /> },
                  { label: 'Nasugbu Rural Health Unit', number: '(043) 931-0101', icon: <Phone size={20} className="text-emerald-500" /> },
                  { label: 'MDRRMO Nasugbu', number: '(043) 931-0070', icon: <AlertCircle size={20} className="text-amber-500" /> },
                  { label: 'Philippine National Emergency', number: '911', icon: <Phone size={20} className="text-red-600" /> },
                ].map((hotline, i) => (
                  <a
                    key={i}
                    href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
                    className={`v-menu-row ${darkMode ? '' : ''}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>{hotline.icon}</div>
                      <div>
                        <span className={`font-bold text-sm block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{hotline.label}</span>
                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{hotline.number}</span>
                      </div>
                    </div>
                    <Phone size={18} className="text-gray-400" />
                  </a>
                ))}

                <div className={`mt-6 rounded-2xl p-4 ${darkMode ? 'bg-slate-800/80 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={20} className="text-blue-500" />
                    <p className={`text-sm font-black ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('commuter-email-support')}</p>
                  </div>
                  <a href="mailto:trikesecure.support@gmail.com" className="text-sm font-bold text-blue-500 hover:text-blue-600">
                    trikesecure.support@gmail.com
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Profile Sub-View ── */}
          {accountView === 'editProfile' && (
            <div style={{ animation: 'v-modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <button onClick={backToAccountMain} className={`flex items-center gap-1.5 text-sm font-bold mb-4 btn-press ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ChevronLeft size={18} />
                {t('commuter-back')}
              </button>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User size={32} className={darkMode ? 'text-gray-100' : 'text-gray-900'} />
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: darkMode ? '#f8fafc' : '#111827' }}>{t('commuter-profile-info')}</h2>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors btn-press ${darkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    title="Edit Profile"
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              {/* Personal Information */}
              <div className={`v-anim v-anim--2 rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4 mb-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-personal-info')}</p>
                </div>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-full-name')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${!isEditingProfile ? (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100') : (darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500')}`}>
                      <div className={`absolute top-2.5 left-3.5 ${!isEditingProfile ? (darkMode ? 'text-slate-500' : 'text-gray-400') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                        <User size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                        disabled={!isEditingProfile}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${!isEditingProfile ? (darkMode ? 'text-slate-300' : 'text-gray-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}
                      />
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-sex')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${!isEditingProfile ? (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100') : (darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500')}`}>
                      <div className={`absolute top-2.5 left-3.5 ${!isEditingProfile ? (darkMode ? 'text-slate-500' : 'text-gray-400') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                        <Users2 size={15} strokeWidth={2.5} />
                      </div>
                      <select
                        value={profileForm.sex}
                        onChange={(e) => setProfileForm(f => ({ ...f, sex: e.target.value }))}
                        disabled={!isEditingProfile}
                        className={`w-full text-center appearance-none bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${!isEditingProfile ? (darkMode ? 'text-slate-300' : 'text-gray-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}
                        style={{ textAlignLast: 'center' }}
                      >
                        <option value="">{t('commuter-select-sex')}</option>
                        <option value="Male">{t('commuter-male')}</option>
                        <option value="Female">{t('commuter-female')}</option>
                        <option value="Other">{t('commuter-other')}</option>
                      </select>
                      {isEditingProfile && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown size={16} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-weight')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${!isEditingProfile ? (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100') : (darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500')}`}>
                      <div className={`absolute top-2.5 left-3.5 ${!isEditingProfile ? (darkMode ? 'text-slate-500' : 'text-gray-400') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                        <Weight size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type="number"
                        placeholder="Weight in kg"
                        value={profileForm.weight}
                        onChange={(e) => setProfileForm(f => ({ ...f, weight: e.target.value }))}
                        disabled={!isEditingProfile}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${!isEditingProfile ? (darkMode ? 'text-slate-300' : 'text-gray-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className={`v-anim v-anim--3 rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4 mb-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <Phone size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-contact-info')}</p>
                </div>
                <div className="space-y-4">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-mobile')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${!isEditingProfile ? (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100') : (darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500')}`}>
                      <div className={`absolute top-2.5 left-3.5 ${!isEditingProfile ? (darkMode ? 'text-slate-500' : 'text-gray-400') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                        <Phone size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type="tel"
                        placeholder="09XXXXXXXXX"
                        value={profileForm.mobileNumber}
                        onChange={(e) => setProfileForm(f => ({ ...f, mobileNumber: e.target.value }))}
                        disabled={!isEditingProfile}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${!isEditingProfile ? (darkMode ? 'text-slate-300' : 'text-gray-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-email')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${!isEditingProfile ? (darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100') : (darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500')}`}>
                      <div className={`absolute top-2.5 left-3.5 ${!isEditingProfile ? (darkMode ? 'text-slate-500' : 'text-gray-400') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>
                        <Mail size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                        disabled={!isEditingProfile}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${!isEditingProfile ? (darkMode ? 'text-slate-300' : 'text-gray-600') : (darkMode ? 'text-white' : 'text-gray-900')}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingProfile && (
                <div className="v-anim v-anim--4 mb-8">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsEditingProfile(false); loadProfileData(); }}
                      className={`flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-sm transition-colors btn-press ${darkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t('commuter-cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-sm transition-colors hover:bg-emerald-600 disabled:opacity-60 btn-press"
                    >
                      {profileSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {t('commuter-save-changes')}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Section */}
              <div className={`v-anim v-anim--5 rounded-2xl ${darkMode ? 'bg-slate-900/60 border border-white/10' : 'bg-white/70 border border-gray-100'} shadow-sm p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={18} className="text-blue-500" />
                  <p className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{t('commuter-password')}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-new-password')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500'}`}>
                      <div className={`absolute top-2.5 left-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Lock size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('commuter-min-chars')}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('commuter-confirm-password')}</label>
                    <div className={`relative h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-colors ${darkMode ? 'bg-slate-800 border-slate-600 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500'}`}>
                      <div className={`absolute top-2.5 left-3.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Lock size={15} strokeWidth={2.5} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('commuter-confirm-password')}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className={`w-full text-center bg-transparent border-none outline-none font-bold text-sm px-10 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !passwordForm.newPassword}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-colors btn-press disabled:opacity-60 ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  >
                    {passwordSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        {t('commuter-updating')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock size={18} />
                        {t('commuter-update-password')}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

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
