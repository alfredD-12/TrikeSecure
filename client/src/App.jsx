import { useRef } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import MapBackground from './components/MapBackground';
import LoginView from './pages/LoginView';
import DriverView from './pages/DriverView';
import CommuterView from './pages/CommuterView';

function AppInner() {
  const { view } = useApp();
  const mapRef = useRef(null);

  return (
    <>
      {/* Map always rendered in background once logged in */}
      {view !== 'login' && <MapBackground mapRef={mapRef} />}

      {view === 'login'    && <LoginView />}
      {view === 'driver'   && <DriverView mapRef={mapRef} />}
      {view === 'commuter' && <CommuterView mapRef={mapRef} />}
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

