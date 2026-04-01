import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Shield, AlertTriangle, Route,
  LogOut, Menu, X, Bell, User as UserIcon, Sun, Moon,
  TrendingUp, Car, FileCheck, AlertOctagon
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { logout } from '../api';

export default function AdminView() {
  const { setView, setCurrentUser, currentUser, darkMode, toggleDarkMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const dm = darkMode;

  useEffect(() => {
    document.title = "Admin Dashboard | TrikeSecure";
    return () => { document.title = "TrikeSecure"; };
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setView('admin-login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'drivers', label: 'Drivers & Tricycles', icon: Users },
    { id: 'franchises', label: 'Franchises', icon: Shield },
    { id: 'rides', label: 'Live Rides', icon: Route },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
  ];

  return (
    <div
      className="admin-root fixed inset-0 z-[100] flex overflow-hidden transition-colors duration-300"
      style={{
        background: dm
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      }}
    >
      {/* ── Ambient Glows (dark only) ── */}
      {dm && (
        <>
          <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-red-600/8 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-150px] right-[-50px] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 backdrop-blur-xl transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: dm ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255,255,255,0.95)',
          borderRight: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        {/* Sidebar Header */}
        <div
          className="h-20 flex items-center justify-between px-6"
          style={{ borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/Gemini_Generated_Image_ylicdmylicdmylic-removebg-preview.png"
              alt="TrikeSecure"
              className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"
            />
            <div>
              <span className={`text-lg font-black tracking-tight block leading-none ${dm ? 'text-white' : 'text-gray-900'}`}>TrikeSecure</span>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Admin</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden transition-colors ${dm ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
            <X size={22} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className={`text-[10px] font-black uppercase tracking-widest px-4 mb-3 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Navigation</p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : dm
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(185,28,28,0.9) 100%)',
                  boxShadow: '0 8px 25px rgba(239,68,68,0.25)',
                } : {}}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4" style={{ borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all mb-2 ${
              dm
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            {dm ? <Sun size={18} /> : <Moon size={18} />}
            {dm ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              dm
                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <header
          className="h-20 px-6 sm:px-8 flex items-center justify-between shrink-0 backdrop-blur-xl transition-colors duration-300"
          style={{
            background: dm ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255,255,255,0.8)',
            borderBottom: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden transition-colors ${dm ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className={`text-[11px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className={`relative p-2 rounded-xl transition-colors ${dm ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className={`h-8 w-px ${dm ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.2))', border: '1px solid rgba(239,68,68,0.2)' }}>
                <UserIcon size={16} className="text-red-400" />
              </div>
              <div className="hidden sm:block text-right">
                <p className={`font-bold text-sm leading-none mb-0.5 ${dm ? 'text-white' : 'text-gray-900'}`}>{currentUser?.fullName || 'Admin'}</p>
                <p className={`font-bold text-[10px] leading-none uppercase tracking-wider ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewTab dm={dm} />}
            {activeTab === 'drivers' && <DriversTab dm={dm} />}
            {activeTab === 'franchises' && <FranchisesTab dm={dm} />}
            {activeTab === 'rides' && <RidesTab dm={dm} />}
            {activeTab === 'complaints' && <ComplaintsTab dm={dm} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── 
   Reusable Glass Card 
───────────────────────────────────────────────────────── */

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

/* ───────────────────────────────────────────────────────── 
   Overview Tab
───────────────────────────────────────────────────────── */

function OverviewTab({ dm }) {
  const stats = [
    { label: 'Active Drivers', val: '142', change: '+12%', icon: Users, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadowColor: 'rgba(59,130,246,0.3)' },
    { label: 'Pending Franchises', val: '12', change: '+3', icon: FileCheck, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadowColor: 'rgba(245,158,11,0.3)' },
    { label: "Today's Rides", val: '86', change: '+24%', icon: Car, gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', shadowColor: 'rgba(34,197,94,0.3)' },
    { label: 'Open Complaints', val: '3', change: '-2', icon: AlertOctagon, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', shadowColor: 'rgba(239,68,68,0.3)' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={20} className="text-red-400" />
        <h2 className={`text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-gray-900'}`}>System Status</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <GlassCard key={i} dm={dm}>
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: stat.gradient, boxShadow: `0 8px 20px ${stat.shadowColor}` }}
              >
                <stat.icon size={20} className="text-white" />
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${dm ? 'text-emerald-400 bg-emerald-400/10' : 'text-emerald-600 bg-emerald-50'}`}>
                {stat.change}
              </span>
            </div>
            <p className={`text-3xl font-black mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>{stat.val}</p>
            <p className={`text-xs font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <GlassCard dm={dm}>
          <h3 className={`text-sm font-black uppercase tracking-wide mb-4 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: 'New driver registration pending', time: '2 min ago', dot: '#f59e0b' },
              { text: 'Ride #4521 completed successfully', time: '5 min ago', dot: '#22c55e' },
              { text: 'Complaint resolved by admin', time: '12 min ago', dot: '#3b82f6' },
              { text: 'Franchise application submitted', time: '24 min ago', dot: '#f59e0b' },
              { text: 'System backup completed', time: '1 hr ago', dot: '#22c55e' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-colors cursor-pointer ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.dot, boxShadow: `0 0 8px ${item.dot}` }} />
                <p className={`text-sm font-semibold flex-1 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</p>
                <span className={`text-[10px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard dm={dm}>
          <h3 className={`text-sm font-black uppercase tracking-wide mb-4 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Approve Drivers', icon: Users, color: '#3b82f6' },
              { label: 'View Complaints', icon: AlertTriangle, color: '#ef4444' },
              { label: 'Manage Franchises', icon: Shield, color: '#f59e0b' },
              { label: 'Monitor Rides', icon: Route, color: '#22c55e' },
            ].map((action, i) => (
              <button 
                key={i} 
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all group ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                style={{ border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${action.color}15`, border: `1px solid ${action.color}30` }}
                >
                  <action.icon size={18} style={{ color: action.color }} />
                </div>
                <span className={`text-[11px] font-bold transition-colors ${dm ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'}`}>{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── 
   Placeholder Tabs
───────────────────────────────────────────────────────── */

function PlaceholderTab({ icon: Icon, title, description, dm }) {
  return (
    <GlassCard dm={dm} className="flex flex-col items-center justify-center py-20 text-center">
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <Icon size={28} className="text-red-400" />
      </div>
      <h3 className={`text-lg font-black mb-2 ${dm ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm font-semibold max-w-md ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{description}</p>
    </GlassCard>
  );
}

function DriversTab({ dm }) {
  return <PlaceholderTab dm={dm} icon={Users} title="Drivers & Tricycles" description="Driver management with approval workflows, vehicle registration, and status monitoring will appear here." />;
}
function FranchisesTab({ dm }) {
  return <PlaceholderTab dm={dm} icon={Shield} title="Franchise Management" description="Franchise applications, approvals, and territory management will appear here." />;
}
function RidesTab({ dm }) {
  return <PlaceholderTab dm={dm} icon={Route} title="Live Ride Tracking" description="Real-time ride monitoring with map view and ride status updates will appear here." />;
}
function ComplaintsTab({ dm }) {
  return <PlaceholderTab dm={dm} icon={AlertTriangle} title="Complaints Center" description="Complaint management with resolution workflows and priority tracking will appear here." />;
}
