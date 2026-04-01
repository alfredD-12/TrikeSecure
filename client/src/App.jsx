import { useRef } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import MapBackground from './components/MapBackground';
import LoginView from './pages/LoginView';
import DriverView from './pages/DriverView';
import CommuterView from './pages/CommuterView';
import AdminLogin from './pages/AdminLogin';
import AdminView from './pages/AdminView';

function AppInner() {
  const { view } = useApp();
  const mapRef = useRef(null);

  return (
    <>
      {/* Map always rendered in background once logged in to mobile app */}
      {!['login', 'admin-login', 'admin-dashboard'].includes(view) && <MapBackground mapRef={mapRef} />}

      {view === 'login'    && <LoginView />}
      {view === 'driver'   && <DriverView mapRef={mapRef} />}
      {view === 'commuter' && <CommuterView mapRef={mapRef} />}
      {view === 'admin-login' && <AdminLogin />}
      {view === 'admin-dashboard' && <AdminView />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

