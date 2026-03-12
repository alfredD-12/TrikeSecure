import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('language') || 'en');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'enabled');
  const [view, setView] = useState('login'); // 'login' | 'driver' | 'commuter'
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

  const toggleDarkMode = useCallback(() => setDarkMode(v => !v), []);
  const toggleLanguage = useCallback(() => setLang(v => (v === 'en' ? 'tl' : 'en')), []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? key;
  }, [lang]);

  return (
    <AppContext.Provider value={{ lang, darkMode, view, setView, currentUser, setCurrentUser, toggleDarkMode, toggleLanguage, t, pinTarget, setPinTarget, userPickup, setUserPickup, destination, setDestination, destinationPin, setDestinationPin }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
