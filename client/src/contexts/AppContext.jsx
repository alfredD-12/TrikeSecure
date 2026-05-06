import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { translations } from '../utils/translations';
import { getMe } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');
  
  const [view, setView] = useState(() => {
    // Basic routing: if the URL explicitly asks for admin, show the admin login
    if (window.location.pathname.startsWith('/admin')) {
      return 'admin-login';
    }
    return 'login';
  }); // 'login' | 'driver' | 'commuter' | 'admin-login' | 'admin-dashboard'

  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [pinTarget, setPinTarget] = useState(null);       // null | 'from' | 'to'
  const [userPickup, setUserPickup] = useState(null);      // { lat, lng, label, fromGps? }
  const [destination, setDestination] = useState('');      // free-text going-to label
  const [destinationPin, setDestinationPin] = useState(null); // { lat, lng, label } from map tap
  const [liveLocation, setLiveLocation] = useState(null);  // { lat, lng, accuracy } from watchPosition
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [pendingRides, setPendingRides] = useState([]);
  const [activeDriverRide, setActiveDriverRide] = useState(null);
  const [activeCommuterRide, setActiveCommuterRide] = useState(null);
  const translationRequestsRef = useRef(new Set());
  const translationInFlightRef = useRef(new Set());
  // Initialize dynamicDict from localStorage
  const [dynamicDict, setDynamicDict] = useState(() => {
    try {
      const stored = localStorage.getItem('app_translations');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist dynamicDict to localStorage
  useEffect(() => {
    localStorage.setItem('app_translations', JSON.stringify(dynamicDict));
  }, [dynamicDict]);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
  }, [darkMode]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const me = await getMe();
      if (!isMounted) return;

      const isAdminRoute = window.location.pathname.startsWith('/admin');

      if (me?.userId) {
        if (me.role === 'admin' || me.role === 'lgu') {
          if (!isAdminRoute) {
            window.location.href = '/admin';
            return;
          }
          setCurrentUser({ ...me });
          setView('admin-dashboard');
          return;
        }

        if (isAdminRoute) {
          // Found a non-admin session on the admin route. Force view to admin-login
          setCurrentUser(null);
          setView('admin-login');
          return;
        }

        const resolvedRole = me.role === 'driver' ? 'driver' : 'commuter';
        setCurrentUser({
          username: me.username,
          fullName: me.fullName || me.username,
          email: me.email || '',
          role: resolvedRole,
        });
        setView(resolvedRole);
        return;
      }

      setCurrentUser(null);
      setView(isAdminRoute ? 'admin-login' : 'login');
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDarkMode = useCallback(() => setDarkMode(v => !v), []);
  const resetThemeForLogout = useCallback(() => {
    setDarkMode(false);
    localStorage.setItem('darkMode', 'disabled');
  }, []);
  const toggleLanguage = useCallback(() => setLang(v => (v === 'en' ? 'tl' : 'en')), []);

  // Clear fetch tracker when language changes so translations re-fetch
  useEffect(() => {
    window._fetchingDict = {};
  }, [lang]);

  useEffect(() => {
    if (lang === 'en') {
      translationRequestsRef.current.clear();
      translationInFlightRef.current.clear();
      return;
    }

    const pendingKeys = Array.from(translationRequestsRef.current).filter((cacheKey) => {
      return !dynamicDict[cacheKey] && !translationInFlightRef.current.has(cacheKey);
    });

    if (pendingKeys.length === 0) {
      return;
    }

    translationRequestsRef.current.clear();

    pendingKeys.forEach((cacheKey) => {
      const separatorIndex = cacheKey.indexOf('_');
      const requestLang = separatorIndex >= 0 ? cacheKey.slice(0, separatorIndex) : lang;
      const text = separatorIndex >= 0 ? cacheKey.slice(separatorIndex + 1) : cacheKey;

      if (!text || translationInFlightRef.current.has(cacheKey) || dynamicDict[cacheKey]) {
        return;
      }

      translationInFlightRef.current.add(cacheKey);

      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${requestLang}&dt=t&q=${encodeURIComponent(text)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]) {
            const translated = data[0].map((segment) => segment[0]).join('');
            setDynamicDict((prev) => ({ ...prev, [cacheKey]: translated }));
          }
        })
        .catch((err) => {
          console.error('Translation error:', err);
        })
        .finally(() => {
          translationInFlightRef.current.delete(cacheKey);
        });
    });
  }, [lang, dynamicDict]);

  const t = useCallback((text) => {
    if (translations[lang]?.[text]) return translations[lang][text];
    if (lang === 'en' || !text) return text;

    const cacheKey = `${lang}_${text}`;
    const cachedTranslation = dynamicDict[cacheKey];
    if (cachedTranslation) return cachedTranslation;

    translationRequestsRef.current.add(cacheKey);

    return text;
  }, [lang, dynamicDict]);

  return (
    <AppContext.Provider value={{ lang, darkMode, setDarkMode, view, setView, currentUser, setCurrentUser, toggleDarkMode, resetThemeForLogout, toggleLanguage, t, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, destinationPin, setDestinationPin, dynamicDict, setDynamicDict, liveLocation, setLiveLocation, isMapMoving, setIsMapMoving, pendingRides, setPendingRides, activeDriverRide, setActiveDriverRide, activeCommuterRide, setActiveCommuterRide }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
