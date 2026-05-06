import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  Loader2,
  LocateFixed,
  MapPin,
  QrCode,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

const TOUR_STEPS = [
  {
    icon: ShieldCheck,
    title: 'Welcome to TrikeSecure',
    body: 'Follow these quick tips to learn the commuter side step by step.',
    tab: 'ride',
    target: 'tutorial-shortcut',
    placement: 'below',
  },
  {
    icon: CarFront,
    title: 'Booking scenario',
    body: 'Example: you are at BSU ARASOF and you want to go to Savemore. The next steps show the correct order.',
    tab: 'ride',
    target: 'ride-route',
    placement: 'below',
  },
  {
    icon: LocateFixed,
    title: '1. Set pickup',
    body: 'Tap From and choose BSU ARASOF, or use the GPS button if you are already at your pickup point.',
    tab: 'ride',
    target: 'pickup-field',
    placement: 'below',
  },
  {
    icon: MapPin,
    title: '2. Choose destination',
    body: 'Tap Going to and search Savemore, or tap the Savemore quick button if it is shown below.',
    tab: 'ride',
    target: 'destination-field',
    placement: 'below',
  },
  {
    icon: MapPin,
    title: '3. Pin exact dropoff',
    body: 'Use this pin when you need the driver to see the exact entrance or dropoff spot on the map.',
    tab: 'ride',
    target: 'destination-pin',
    placement: 'below',
  },
  {
    icon: CheckCircle2,
    title: '4. Send request',
    body: 'When pickup and destination are complete, tap Book a Tricycle. This is the only step that sends a real request.',
    tab: 'ride',
    target: 'book-button',
    placement: 'above',
  },
  {
    icon: Loader2,
    title: 'Demo: finding driver',
    body: 'After booking, the app shows this loading screen while waiting for a driver. This is tutorial mode only, so no real request is sent.',
    tab: 'ride',
    demo: 'searching',
  },
  {
    icon: CarFront,
    title: '5. Track the ride',
    body: 'After booking, stay on Ride. The app shows the ride progress: searching, accepted, arrived, and in ride.',
    tab: 'ride',
    target: 'nav-ride',
    placement: 'above',
  },
  {
    icon: QrCode,
    title: 'Scan tab',
    body: 'Use Scan to verify if a tricycle and driver are registered.',
    tab: 'scan',
    target: 'nav-scan',
    placement: 'above',
  },
  {
    icon: ShieldCheck,
    title: 'Scan QR code',
    body: 'Point the camera at the tricycle QR code to check its franchise details.',
    tab: 'scan',
    target: 'scan-camera',
    placement: 'below',
  },
  {
    icon: QrCode,
    title: 'Manual search',
    body: 'If the QR is not working, type the body number here and tap Search.',
    tab: 'scan',
    target: 'manual-search',
    placement: 'above',
  },
  {
    icon: AlertCircle,
    title: 'Driver details',
    body: 'After a successful scan, you can review the driver, plate number, TODA, license, and contact number.',
    tab: 'scan',
    target: 'scan-camera',
    placement: 'below',
  },
  {
    icon: ClipboardList,
    title: 'Report tab',
    body: 'Use Report to submit issues like overcharging, reckless driving, refusal to ride, or colorum tricycles.',
    tab: 'report',
    target: 'nav-report',
    placement: 'above',
  },
  {
    icon: User,
    title: 'Account tools',
    body: 'Open Account to update your profile, view history, contact support, and change privacy settings.',
    tab: 'account',
    accountView: 'main',
    target: 'nav-account',
    placement: 'above',
  },
  {
    icon: HelpCircle,
    title: 'Replay anytime',
    body: 'Tap Tutorial anytime if you want to repeat this guide.',
    tab: 'account',
    accountView: 'main',
    target: 'tutorial-shortcut',
    placement: 'below',
  },
];

const PANEL_WIDTH = 286;
const PANEL_HEIGHT = 226;
const GAP = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function CommuterOnboardingTour({ open, onClose, onStepChange }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [layout, setLayout] = useState(null);
  const totalSteps = TOUR_STEPS.length;
  const step = TOUR_STEPS[stepIndex];
  const Icon = step.icon;
  const progressWidth = useMemo(() => `${((stepIndex + 1) / totalSteps) * 100}%`, [stepIndex, totalSteps]);

  useEffect(() => {
    if (!open || !step) return;
    onStepChange?.(step);
  }, [open, step, onStepChange]);

  useEffect(() => {
    if (!open || step?.demo || !step?.target) {
      setLayout(null);
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
          panel: { top, left, width },
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
      localStorage.setItem('ts_commuter_tour_done', '1');
    } catch (error) {
      console.warn('Could not save commuter tour status.', error);
    }
    setStepIndex(0);
    onClose?.();
  }

  function nextStep() {
    if (stepIndex >= totalSteps - 1) {
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
  const isSearchingDemo = step.demo === 'searching';

  return (
    <div className="commuter-tour fixed inset-0 z-[1000000]">
      {isSearchingDemo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/92 px-6 text-center backdrop-blur-[18px]">
          <div className="relative mb-7 flex h-40 w-40 items-center justify-center">
            <div className="absolute h-20 w-20 animate-ping rounded-full border-4 border-red-400/35 bg-red-400/10" />
            <div className="absolute h-28 w-28 animate-ping rounded-full border-4 border-red-400/25 bg-red-400/5 [animation-delay:180ms]" />
            <div className="absolute h-36 w-36 animate-ping rounded-full border-4 border-red-400/15 bg-red-400/5 [animation-delay:360ms]" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500 text-white shadow-[0_18px_40px_rgba(239,68,68,0.35)]">
              <MapPin size={31} />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Finding a driver</h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
            <Loader2 size={16} className="animate-spin text-red-500" />
            <span>Tutorial demo only</span>
          </div>
          <p className="mt-3 max-w-[18rem] text-sm font-semibold leading-6 text-slate-500">
            This preview will not contact drivers or create a ride request.
          </p>
        </div>
      )}

      {!isSearchingDemo && layout?.spotlight && (
        <div
          className="pointer-events-none absolute rounded-[22px] border-2 border-white bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.46),0_0_0_6px_rgba(239,68,68,0.34),0_18px_45px_rgba(15,23,42,0.28)] transition-all duration-300"
          style={layout.spotlight}
        />
      )}
      {!isSearchingDemo && !layout?.spotlight && <div className="absolute inset-0 bg-slate-950/45" />}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="commuter-tour-title"
        className="commuter-tour-card fixed overflow-hidden rounded-[22px] border border-white/80 bg-white text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.28)] transition-all duration-300"
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_10px_22px_rgba(239,68,68,0.30)]">
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-red-500">Step {stepIndex + 1} of {totalSteps}</p>
            <h2 id="commuter-tour-title" className="text-base font-black leading-tight text-slate-950">{step.title}</h2>
            <p className="mt-1.5 text-xs font-semibold leading-[1.35rem] text-slate-500">{step.body}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 pb-2">
          <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
            {TOUR_STEPS.map((item, index) => (
              <span
                key={item.title}
                className={`h-1.5 shrink-0 rounded-full transition-all ${index === stepIndex ? 'w-5 bg-red-500' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 p-2.5">
          <button
            type="button"
            onClick={previousStep}
            disabled={stepIndex === 0}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition active:scale-95 disabled:opacity-40"
            title="Previous step"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-red-500 to-red-700 px-4 text-xs font-black text-white shadow-[0_8px_18px_rgba(239,68,68,0.28)] transition active:scale-95"
            title={stepIndex === totalSteps - 1 ? 'Finish tutorial' : 'Next step'}
          >
            <span className="truncate">{stepIndex === 0 ? 'Start' : stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight size={16} className="shrink-0" />
          </button>
        </div>
        <div className="h-1 overflow-hidden bg-red-100">
          <div className="h-full rounded-r-full bg-red-500 transition-all duration-300" style={{ width: progressWidth }} />
        </div>
      </div>
    </div>
  );
}
