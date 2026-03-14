import { useState } from 'react';
import {
  Compass, User, Wallet, Route, CheckCircle2,
  FileText, History, LogOut, ChevronRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/Header';
import MapControls from '../components/MapControls';
import BottomSheet from '../components/BottomSheet';
import { logout } from '../api';

export default function DriverView({ mapRef }) {
  const { t, setView, setCurrentUser } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [dutyOn, setDutyOn] = useState(true);

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
    setCurrentUser(null);
    setView('login');
    const sheet = document.getElementById('driver-sheet');
    if (sheet) sheet.style.transform = 'translateY(0px)';
  }

  return (
    <div className="h-screen flex flex-col relative w-full max-w-lg mx-auto">
      <Header badge="NSG-0143" />
      <MapControls mapRef={mapRef} />

      <BottomSheet id="driver">
        {/* Home / Duty Tab */}
        <div className={`tab-content${activeTab === 'home' ? ' active' : ''}`}>
          <div className="v-anim v-anim--1 flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('driver-duty-status')}</h2>
              <p className="text-sm font-semibold text-gray-500 mt-1">{t('driver-accept-passengers')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={dutyOn}
                onChange={e => setDutyOn(e.target.checked)}
              />
              <div className="w-16 h-9 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-green-500 shadow-inner" />
            </label>
          </div>

          {/* Online status */}
          <div
            className={`v-anim v-anim--2 mb-4 ${dutyOn ? 'v-online-card' : 'v-offline-card'}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {dutyOn && <div className="absolute inset-0 bg-green-400 rounded-full opacity-40 radar-ping" />}
                <div className={`w-5 h-5 rounded-full z-10 shadow-sm ${dutyOn ? 'bg-green-600' : 'bg-red-500'}`} />
              </div>
              <div>
                <p className={`font-black text-lg ${dutyOn ? 'text-green-900' : 'text-red-900'}`}>
                  {dutyOn ? t('driver-online-now') : 'Offline'}
                </p>
                <p className={`text-xs font-bold ${dutyOn ? 'text-green-700' : 'text-red-600'}`}>
                  {dutyOn ? t('driver-looking') : 'You are not accepting rides'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="v-anim v-anim--3 grid grid-cols-3 gap-3 mb-8 transition-opacity duration-300" style={{ opacity: dutyOn ? 1 : 0.5 }}>
            {[
              { icon: <Wallet size={16} className="text-blue-600" />, bg: 'bg-blue-50', label: t('driver-earned'), value: '₱450' },
              { icon: <Route size={16} className="text-orange-600" />, bg: 'bg-orange-50', label: t('driver-distance'), value: '15.2 km' },
              { icon: <CheckCircle2 size={16} className="text-purple-600" />, bg: 'bg-purple-50', label: t('driver-trips'), value: '12' },
            ].map((s, i) => (
              <div key={i} className="v-stat-card">
                <div className={`${s.bg} p-2 rounded-full mb-2`}>{s.icon}</div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="font-black text-gray-900 text-sm mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Booking requests */}
          <div className="v-anim v-anim--4 flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-gray-800 text-lg tracking-tight">{t('driver-booking-requests')}</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{t('driver-new')}</span>
          </div>

          <div className="v-anim v-anim--5 space-y-4 pb-4">
            {[
              { from: 'BSU ARASOF Gate', to: t('driver-to-bucana'), fare: '₱40', time: '1 min ago' },
              { from: 'Savemore', to: t('driver-to-martinez'), fare: '₱25', time: '5 mins ago' },
            ].map((req, i) => (
              <div key={i} className="v-booking-card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="v-glass p-3 rounded-full">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-black text-gray-900 text-base">{req.from}</h4>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">{req.to}</p>
                  </div>
                  <div className="text-right pt-1">
                    <p className="font-black text-green-600 text-lg">{req.fare}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{req.time}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="v-btn-accept">{t('driver-accept')}</button>
                  <button className="v-btn-ghost">Pass</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Tab */}
        <div className={`tab-content pb-6${activeTab === 'account' ? ' active' : ''}`}>
          <h2 className="v-anim v-anim--1 text-3xl font-black text-gray-900 mb-6 tracking-tight">Driver Profile</h2>

          <div className="v-anim v-anim--2 v-earnings-card mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('driver-todays-earnings')}</p>
            <h3 className="text-4xl font-black mb-4">₱450.00</h3>
            <div className="flex gap-3 text-sm font-bold">
              <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">{t('driver-trips-count')}</div>
              <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">5.0 Rating</div>
            </div>
          </div>

          <div className="v-anim v-anim--3 space-y-3 mb-8">
            {[
              { icon: <FileText size={20} className="text-gray-600" />, label: t('driver-franchise') },
              { icon: <History size={20} className="text-gray-600" />, label: t('driver-trip-history') },
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
            className="v-anim v-anim--4 w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-4 rounded-2xl font-bold text-sm btn-press"
          >
            <LogOut size={20} />
            <span>{t('driver-logout')}</span>
          </button>
        </div>
      </BottomSheet>

      {/* Bottom Nav */}
      <nav className="v-nav">
        <button
          onClick={() => switchTab('home')}
          className={`v-nav-item ${activeTab === 'home' ? 'active-green' : ''}`}
        >
          <Compass size={24} />
          <span className="v-nav-label">Duty</span>
        </button>
        <button
          onClick={() => switchTab('account')}
          className={`v-nav-item ${activeTab === 'account' ? 'active-green' : ''}`}
        >
          <User size={24} />
          <span className="v-nav-label">Account</span>
        </button>
      </nav>
    </div>
  );
}
