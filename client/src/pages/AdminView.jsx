import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Shield, AlertTriangle, Route,
  LogOut, Menu, X, Bell, User as UserIcon, Sun, Moon,
  TrendingUp, FileCheck, Car, AlertOctagon,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { logout } from '../services/api';
import DriversTricyclesTab from '../components/admin/DriversTricyclesTab';
import FranchisesTab from '../components/admin/FranchisesTab';

function GlassCard({ children, className = '', dm = true }) {
  return (
    <div
      className={`rounded-2xl p-6 backdrop-blur-xl transition-colors duration-300 ${className}`}
      style={{
        background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

function OverviewTab({ dm, onSelectTab }) {
  const cards = [
    { label: 'Drivers & Tricycles', value: 'Review', icon: Users, color: '#3b82f6', tab: 'drivers' },
    { label: 'Franchises', value: 'Approve', icon: Shield, color: '#f59e0b', tab: 'franchises' },
    { label: 'Live Rides', value: 'Monitor', icon: Car, color: '#22c55e', tab: 'rides' },
    { label: 'Complaints', value: 'Track', icon: AlertOctagon, color: '#ef4444', tab: 'complaints' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp size={20} className="text-red-400" />
        <h2 className={`text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-gray-900'}`}>LGU Review Center</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <GlassCard key={card.label} dm={dm}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <p className={`mb-1 text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
            <p className={`text-xs font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{card.label}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard dm={dm} className="mt-6">
        <h3 className={`mb-4 text-sm font-black uppercase tracking-wide ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={() => onSelectTab(card.tab)}
              className={`rounded-xl px-4 py-4 text-left transition ${dm ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-white'}`}
            >
              <card.icon size={18} style={{ color: card.color }} />
              <p className={`mt-3 text-sm font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{card.label}</p>
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function PlaceholderTab({ dm, icon: Icon, title, description }) {
  return (
    <GlassCard dm={dm} className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
        <Icon size={28} className="text-red-400" />
      </div>
      <h3 className={`mb-2 text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`mx-auto max-w-xl text-sm font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
    </GlassCard>
  );
}

export default function AdminView() {
  const { setView, setCurrentUser, currentUser, darkMode, toggleDarkMode, resetThemeForLogout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const dm = darkMode;

  useEffect(() => {
    document.title = 'Admin Dashboard | TrikeSecure';
    return () => { document.title = 'TrikeSecure'; };
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'drivers', label: 'Drivers & Tricycles', icon: Users },
    { id: 'franchises', label: 'Franchises', icon: Shield },
    { id: 'rides', label: 'Live Rides', icon: Route },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
  ];

  async function handleLogout() {
    await logout();
    resetThemeForLogout();
    setCurrentUser(null);
    setView('admin-login');
  }

  return (
    <div className="admin-root fixed inset-0 z-[100] flex overflow-hidden transition-colors duration-300" style={{ background: dm ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: dm ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255,255,255,0.95)', borderRight: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
        <div className="flex h-20 items-center justify-between px-6" style={{ borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <div>
            <span className={`block text-lg font-black leading-none tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>TrikeSecure</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Admin</span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden">{<X size={22} className={dm ? 'text-gray-400' : 'text-gray-600'} />}</button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? 'text-white shadow-lg' : dm ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                style={active ? { background: 'linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(185,28,28,0.9) 100%)' } : {}}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <button type="button" onClick={toggleDarkMode} className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${dm ? 'text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400' : 'text-gray-500 hover:bg-amber-50 hover:text-amber-600'}`}>
            {dm ? <Sun size={18} /> : <Moon size={18} />}
            {dm ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button type="button" onClick={handleLogout} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${dm ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between px-6 sm:px-8 backdrop-blur-xl" style={{ background: dm ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255,255,255,0.8)', borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden">{<Menu size={22} className={dm ? 'text-gray-400' : 'text-gray-600'} />}</button>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>{navItems.find((item) => item.id === activeTab)?.label}</h1>
              <p className={`text-[11px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" className={`relative rounded-xl p-2 ${dm ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10">
                <UserIcon size={16} className="text-red-400" />
              </div>
              <div className="hidden text-right sm:block">
                <p className={`mb-0.5 text-sm font-bold leading-none ${dm ? 'text-white' : 'text-gray-900'}`}>{currentUser?.fullName || 'Admin'}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider leading-none ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 sm:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'overview' && <OverviewTab dm={dm} onSelectTab={setActiveTab} />}
            {activeTab === 'drivers' && <DriversTricyclesTab dm={dm} />}
            {activeTab === 'franchises' && <FranchisesTab dm={dm} />}
            {activeTab === 'rides' && <PlaceholderTab dm={dm} icon={Route} title="Live Ride Tracking" description="Real-time ride monitoring will connect here next." />}
            {activeTab === 'complaints' && <PlaceholderTab dm={dm} icon={AlertTriangle} title="Complaints Center" description="Complaint resolution tools can be connected to the new admin endpoints next." />}
          </div>
        </div>
      </main>
    </div>
  );
}
