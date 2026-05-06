import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerSOS } from '../services/api';

const COUNTDOWN_SECONDS = 5;
const CIRCLE_RADIUS = 54;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function SOSButton({ rideId = null }) {
  const [phase, setPhase] = useState('idle'); // idle | countdown | sending | sent | error
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [sliderX, setSliderX] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);

  const trackRef = useRef(null);
  const dragging = useRef(false);
  const startXRef = useRef(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Calculate the cancel threshold (thumb must travel ~80% of track)
  const thumbSize = 56;
  const cancelThreshold = sliderWidth > 0 ? sliderWidth - thumbSize - 8 : 200;

  const resetAfter = useCallback((delay) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase('idle');
      setSecondsLeft(COUNTDOWN_SECONDS);
      setSliderX(0);
    }, delay);
  }, []);

  const fireAlert = useCallback(async () => {
    clearInterval(countdownRef.current);
    setPhase('sending');

    try {
      if (!navigator.geolocation?.getCurrentPosition) {
        throw new Error('Geolocation unavailable');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        });
      });

      const { latitude, longitude } = position.coords;
      await triggerSOS(latitude, longitude, rideId, 'Emergency SOS activated');
      setPhase('sent');
      resetAfter(4000);
    } catch (err) {
      console.error('SOS Error:', err);

      try {
        await triggerSOS(null, null, rideId, 'Emergency SOS activated - GPS unavailable');
        setPhase('sent');
        resetAfter(4000);
      } catch {
        setPhase('error');
        resetAfter(3000);
      }
    }
  }, [resetAfter, rideId]);

  // Start the countdown
  const startCountdown = useCallback(() => {
    clearInterval(countdownRef.current);
    clearTimeout(timerRef.current);
    setPhase('countdown');
    setSecondsLeft(COUNTDOWN_SECONDS);
    setSliderX(0);

    let remaining = COUNTDOWN_SECONDS;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        fireAlert();
      }
    }, 1000);
  }, [fireAlert]);

  // Cancel the countdown
  const cancelCountdown = useCallback(() => {
    clearInterval(countdownRef.current);
    setPhase('idle');
    setSecondsLeft(COUNTDOWN_SECONDS);
    setSliderX(0);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  // Measure slider track width
  useEffect(() => {
    if (phase === 'countdown' && trackRef.current) {
      setSliderWidth(trackRef.current.offsetWidth);
    }
  }, [phase]);

  // Touch handlers for swipe-to-cancel
  const onTouchStart = (e) => {
    dragging.current = true;
    startXRef.current = e.touches[0].clientX - sliderX;
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const x = Math.max(0, Math.min(e.touches[0].clientX - startXRef.current, cancelThreshold));
    setSliderX(x);
  };

  const onTouchEnd = () => {
    dragging.current = false;
    if (sliderX >= cancelThreshold * 0.85) {
      cancelCountdown();
    } else {
      setSliderX(0);
    }
  };

  // Mouse handlers (for desktop testing)
  const onMouseDown = (e) => {
    dragging.current = true;
    startXRef.current = e.clientX - sliderX;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const x = Math.max(0, Math.min(e.clientX - startXRef.current, cancelThreshold));
      setSliderX(x);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (sliderX >= cancelThreshold * 0.85) {
        cancelCountdown();
      } else {
        setSliderX(0);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [sliderX, cancelThreshold, cancelCountdown]);

  // Calculate ring progress
  const progress = (COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS;
  const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  // ─── Floating SOS Button (idle state) ────────────────
  if (phase === 'idle') {
    return (
      <button
        className="v-sos-fab"
        onClick={startCountdown}
        aria-label="Emergency SOS"
      >
        <span className="v-sos-fab-pulse" />
        <span className="v-sos-fab-text">SOS</span>
      </button>
    );
  }

  // ─── Countdown / Sending / Sent overlay ──────────────
  return (
    <div className="v-sos-overlay">
      {/* Countdown phase */}
      {phase === 'countdown' && (
        <>
          <div className="v-sos-countdown-container">
            {/* SVG ring */}
            <svg className="v-sos-ring-svg" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r={CIRCLE_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
              />
              <circle
                cx="60" cy="60" r={CIRCLE_RADIUS}
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <span className="v-sos-countdown-number">{secondsLeft}</span>
          </div>

          <p className="v-sos-countdown-title">Emergency Alert</p>
          <p className="v-sos-countdown-subtitle">
            Sending SOS in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
          </p>

          {/* Swipe to cancel slider */}
          <div className="v-sos-slider-track" ref={trackRef}>
            <div
              className="v-sos-slider-thumb"
              style={{ transform: `translateX(${sliderX}px)` }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="v-sos-slider-label">Slide to Cancel</span>
            {/* Fill behind thumb */}
            <div
              className="v-sos-slider-fill"
              style={{ width: `${sliderX + thumbSize}px` }}
            />
          </div>
        </>
      )}

      {/* Sending phase */}
      {phase === 'sending' && (
        <div className="v-sos-status-container">
          <div className="v-sos-spinner" />
          <p className="v-sos-countdown-title">Sending Alert...</p>
          <p className="v-sos-countdown-subtitle">Grabbing your location</p>
        </div>
      )}

      {/* Sent phase */}
      {phase === 'sent' && (
        <div className="v-sos-status-container">
          <div className="v-sos-checkmark">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="v-sos-countdown-title">Alert Sent!</p>
          <p className="v-sos-countdown-subtitle">Emergency services have been notified with your location</p>
        </div>
      )}

      {/* Error phase */}
      {phase === 'error' && (
        <div className="v-sos-status-container">
          <div className="v-sos-error-icon">!</div>
          <p className="v-sos-countdown-title">Failed to Send</p>
          <p className="v-sos-countdown-subtitle">Please try again or call emergency services directly</p>
        </div>
      )}
    </div>
  );
}
