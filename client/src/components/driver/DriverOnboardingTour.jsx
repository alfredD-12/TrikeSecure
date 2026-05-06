import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Fuel,
  HelpCircle,
  Loader2,
  MapPin,
  QrCode,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: Shield,
    title: 'Welcome, Driver',
    body: 'This guide shows how to go on duty, handle ride requests, track active rides, and manage your driver records.',
    tab: 'home',
    target: 'driver-tutorial-shortcut',
    placement: 'below',
  },
  {
    icon: FileText,
    title: 'Complete setup first',
    body: 'If your account is still locked, open Setup and finish TODA membership, documents, and franchise approval.',
    tab: 'account',
    accountView: 'main',
    target: 'driver-franchise-menu',
    placement: 'above',
    lockedOnly: true,
  },
  {
    icon: Compass,
    title: 'Duty tab',
    body: 'This is your main work screen. Use it to go online, watch requests, and manage active trips.',
    tab: 'home',
    target: 'driver-nav-home',
    placement: 'above',
    activeOnly: true,
  },
  {
    icon: CheckCircle2,
    title: 'Go online',
    body: 'Turn Duty on when you are ready to accept passengers. Turn it off when you are unavailable.',
    tab: 'home',
    target: 'driver-duty-toggle',
    placement: 'below',
    activeOnly: true,
  },
  {
    icon: BadgeCheck,
    title: 'Online status',
    body: 'This card confirms if you are online and listening for nearby commuter requests.',
    tab: 'home',
    target: 'driver-online-card',
    placement: 'below',
    activeOnly: true,
  },
  {
    icon: MapPin,
    title: 'Demo: new request',
    body: 'This is what a ride request looks like. Tutorial mode only: no passenger is notified and no ride is accepted.',
    tab: 'home',
    demo: 'request',
    activeOnly: true,
  },
  {
    icon: CheckCircle2,
    title: 'Accept or pass',
    body: 'Accept to take the ride, Map to view the approximate pickup area, or Pass to skip the request.',
    tab: 'home',
    target: 'driver-requests-section',
    placement: 'above',
    activeOnly: true,
  },
  {
    icon: Loader2,
    title: 'Demo: active ride',
    body: 'After accepting, the active ride card guides you through Arrived, Start Ride, and Complete Ride. Demo only, no real ride is changed.',
    tab: 'home',
    demo: 'active',
    activeOnly: true,
  },
  {
    icon: Fuel,
    title: 'Fuel prices',
    body: 'Use this card to check current fuel price references before planning your trips.',
    tab: 'home',
    target: 'driver-fuel-card',
    placement: 'above',
    activeOnly: true,
  },
  {
    icon: QrCode,
    title: 'Driver ID card',
    body: 'Open ID Card to show your driver QR and download your driver ID as PDF.',
    tab: 'qr',
    target: 'driver-nav-qr',
    placement: 'above',
    activeOnly: true,
  },
  {
    icon: User,
    title: 'Account tools',
    body: 'Open Account to view profile, earnings, franchise records, trip history, support, and logout.',
    tab: 'account',
    accountView: 'main',
    target: 'driver-nav-account',
    placement: 'above',
  },
  {
    icon: FileText,
    title: 'Franchise records',
    body: 'Use Franchise & Records to submit or review TODA membership, tricycle, and franchise requirements.',
    tab: 'account',
    accountView: 'main',
    target: 'driver-franchise-menu',
    placement: 'above',
  },
  {
    icon: Users,
    title: 'President tools',
    body: 'If you are a TODA president, this tab is where you review member applications.',
    tab: 'president',
    target: 'driver-nav-president',
    placement: 'above',
    presidentOnly: true,
  },
  {
    icon: HelpCircle,
    title: 'Replay anytime',
    body: 'Tap Tutorial anytime to repeat this driver guide.',
    tab: 'home',
    target: 'driver-tutorial-shortcut',
    placement: 'below',
  },
];

const PANEL_WIDTH = 286;
const PANEL_HEIGHT = 226;
const GAP = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function DriverOnboardingTour({ open, onClose, onStepChange, storageKey = 'ts_driver_tour_done', isOnboardingLocked = false, showPresidentTab = false }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [layout, setLayout] = useState(null);
  const tourSteps = useMemo(() => TOUR_STEPS.filter((item) => {
    if (item.lockedOnly && !isOnboardingLocked) return false;
    if (item.activeOnly && isOnboardingLocked) return false;
    if (item.presidentOnly && !showPresidentTab) return false;
    return true;
  }), [isOnboardingLocked, showPresidentTab]);
  const totalSteps = tourSteps.length;
  const normalizedStepIndex = Math.min(stepIndex, totalSteps - 1);
  const step = tourSteps[normalizedStepIndex];
  const Icon = step.icon;
  const progressWidth = useMemo(() => `${((normalizedStepIndex + 1) / totalSteps) * 100}%`, [normalizedStepIndex, totalSteps]);

  useEffect(() => {
    if (!open || !step) return;
    onStepChange?.(step);
  }, [open, step, onStepChange]);

  useEffect(() => {
    if (!open || step?.demo || !step?.target) {
      return undefined;
    }

    let frameId = 0;
    let timeoutId = 0;

    function updateLayout() {
      const target = document.querySelector(`[data-tour="${step.target}"]`);

      if (!target) {
        setLayout(null);
        return;
      }

      target.scrollIntoView?.({ block: 'center', inline: 'center', behavior: 'smooth' });

      frameId = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
        const preferred = step.placement || 'below';
        const canShowBelow = rect.bottom + GAP + PANEL_HEIGHT < window.innerHeight - 16;
        const canShowAbove = rect.top - GAP - PANEL_HEIGHT > 16;
        const actualPlacement = preferred === 'above'
          ? (canShowAbove ? 'above' : 'below')
          : (canShowBelow ? 'below' : 'above');
        const left = clamp(rect.left + rect.width / 2 - width / 2, 12, window.innerWidth - width - 12);
        const top = actualPlacement === 'above'
          ? Math.max(12, rect.top - PANEL_HEIGHT - GAP)
          : Math.min(window.innerHeight - PANEL_HEIGHT - 12, rect.bottom + GAP);
        const targetCenter = rect.left + rect.width / 2;

        setLayout({
          placement: actualPlacement,
          spotlight: {
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          },
          panel: { top, left, width, maxHeight: window.innerHeight - 24 },
          arrowLeft: clamp(targetCenter - left - 7, 18, width - 32),
        });
      });
    }

    timeoutId = window.setTimeout(updateLayout, 120);
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [open, step]);

  if (!open) return null;

  function finishTour() {
    try {
      localStorage.setItem(storageKey, '1');
    } catch (error) {
      console.warn('Could not save driver tour status.', error);
    }
    setStepIndex(0);
    onClose?.();
  }

  function nextStep() {
    if (normalizedStepIndex >= totalSteps - 1) {
      finishTour();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  function previousStep() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  const fallbackPanel = {
    top: Math.max(12, window.innerHeight - PANEL_HEIGHT - 18),
    left: Math.max(12, (window.innerWidth - PANEL_WIDTH) / 2),
    width: Math.min(PANEL_WIDTH, window.innerWidth - 32),
    maxHeight: window.innerHeight - 24,
  };
  const panelStyle = layout?.panel || fallbackPanel;
  const arrowStyle = layout
    ? {
        left: layout.arrowLeft,
        [layout.placement === 'above' ? 'bottom' : 'top']: -7,
      }
    : null;
  const isRequestDemo = step.demo === 'request';
  const isActiveRideDemo = step.demo === 'active';

  return (
    <div className="driver-tour fixed inset-0 z-[1000000]">
      {isRequestDemo && (
        <div className="absolute inset-0 flex items-start justify-center bg-slate-950/42 px-4 pt-16 backdrop-blur-[3px]">
          <div className="w-full max-w-sm rounded-[22px] border border-white/70 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.28)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-orange-500">
                <MapPin size={14} />
                Tutorial Request
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">Demo only</span>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <p className="text-xs font-bold text-slate-800">Pickup: BSU ARASOF</p>
              </div>
              <div className="ml-[4.5px] my-1 h-3 w-px bg-slate-300" />
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                <p className="text-xs font-bold text-slate-800">Dropoff: Savemore Nasugbu</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase text-emerald-600">Fare</p>
                <p className="text-sm font-black text-emerald-700">P75.00</p>
              </div>
              <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
                <p className="text-[9px] font-black uppercase text-blue-600">Distance</p>
                <p className="text-sm font-black text-blue-700">2.1 km</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              This preview teaches the request card. It will not accept or change a real ride.
            </p>
          </div>
        </div>
      )}

      {isActiveRideDemo && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/92 px-5 text-center backdrop-blur-[18px]">
          <div className="w-full max-w-sm rounded-[28px] border border-emerald-100 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.22)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.34)]">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Active ride demo</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['Arrived', 'Start Ride', 'Complete'].map((label, index) => (
                <div key={label} className="rounded-2xl bg-emerald-50 px-2 py-2">
                  <p className="text-[9px] font-black uppercase text-emerald-600">Step {index + 1}</p>
                  <p className="mt-1 text-xs font-black text-emerald-800">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
              Tutorial mode only. This does not update any commuter ride.
            </p>
          </div>
        </div>
      )}

      {!isRequestDemo && !isActiveRideDemo && layout?.spotlight && (
        <div
          className="pointer-events-none absolute rounded-[22px] border-2 border-white bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.46),0_0_0_6px_rgba(34,197,94,0.34),0_18px_45px_rgba(15,23,42,0.28)] transition-all duration-300"
          style={layout.spotlight}
        />
      )}
      {!isRequestDemo && !isActiveRideDemo && !layout?.spotlight && <div className="absolute inset-0 bg-slate-950/45" />}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-tour-title"
        className="driver-tour-card fixed overflow-hidden rounded-[22px] border border-white/80 bg-white text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.28)] transition-all duration-300"
        style={panelStyle}
      >
        {arrowStyle && (
          <div
            className="absolute h-3.5 w-3.5 rotate-45 border-white/80 bg-white"
            style={arrowStyle}
          />
        )}

        <button
          type="button"
          onClick={finishTour}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="Skip tutorial"
        >
          <X size={14} />
        </button>

        <div className="flex gap-3 p-3 pb-2 pr-9">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-[0_10px_22px_rgba(34,197,94,0.30)]">
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-600">Step {normalizedStepIndex + 1} of {totalSteps}</p>
            <h2 id="driver-tour-title" className="text-base font-black leading-tight text-slate-950">{step.title}</h2>
            <p className="mt-1.5 text-xs font-semibold leading-[1.35rem] text-slate-500">{step.body}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 pb-2">
          <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
            {tourSteps.map((item, index) => (
              <span
                key={item.title}
                className={`h-1.5 shrink-0 rounded-full transition-all ${index === normalizedStepIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 p-2.5">
          <button
            type="button"
            onClick={previousStep}
            disabled={normalizedStepIndex === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition active:scale-95 disabled:opacity-40"
            title="Previous step"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 px-4 text-xs font-black text-white shadow-[0_8px_18px_rgba(34,197,94,0.28)] transition active:scale-95"
            title={normalizedStepIndex === totalSteps - 1 ? 'Finish tutorial' : 'Next step'}
          >
            <span className="truncate">{normalizedStepIndex === 0 ? 'Start' : normalizedStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight size={16} className="shrink-0" />
          </button>
        </div>
        <div className="h-1 overflow-hidden bg-emerald-100">
          <div className="h-full rounded-r-full bg-emerald-500 transition-all duration-300" style={{ width: progressWidth }} />
        </div>
      </div>
    </div>
  );
}
