import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, ExternalLink, Loader2,
  MapPin, RefreshCw, Route, Search, ShieldCheck, Siren, User, X
} from 'lucide-react';
import { getAdminSosAlerts, resolveAdminSosAlert } from '../../services/api';

const POLL_MS = 5000;

function GlassCard({ children, className = '', dm = true }) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl transition-colors duration-300 ${className}`}
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

function Banner({ notice, dm }) {
  if (!notice) return null;
  const tone = notice.type === 'success'
    ? (dm ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
    : (dm ? 'bg-red-500/10 text-red-200 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200');
  return <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${tone}`}>{notice.message}</div>;
}

function Metric({ dm, label, value, icon, color }) {
  return (
    <GlassCard dm={dm} className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {createElement(icon, { size: 18, style: { color } })}
      </div>
      <p className={`text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    </GlassCard>
  );
}

function statusClass(status, dm) {
  if (status === 'active') {
    return dm ? 'bg-red-500/10 text-red-300 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200';
  }
  return dm ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

function fmtDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapUrl(alert) {
  if (alert.latitude == null || alert.longitude == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${alert.latitude},${alert.longitude}`)}`;
}

function SosAlertRow({ alert, dm, onResolve, isBusy }) {
  const isActive = alert.status === 'active';
  const locationUrl = mapUrl(alert);
  const rideLabel = alert.rideId ? `Ride #${alert.rideId}` : 'No ride linked';

  return (
    <GlassCard dm={dm} className={`overflow-hidden ${isActive ? 'ring-1 ring-red-500/20' : ''}`}>
      <div className={`border-l-4 ${isActive ? 'border-l-red-500' : 'border-l-emerald-500'} p-5`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${statusClass(alert.status, dm)}`}>
                {alert.status}
              </span>
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${dm ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {alert.userRole}
              </span>
              <span className={`text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{fmtDateTime(alert.createdAt)}</span>
            </div>

            <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{alert.senderName || 'Unknown sender'}</h3>
            <p className={`mt-1 text-xs font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{alert.senderEmail || 'No email'} · {rideLabel}</p>
            <p className={`mt-3 text-sm font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{alert.message || 'Emergency SOS activated'}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {[
                { icon: <User size={13} />, label: 'Commuter', value: alert.commuterName || '--' },
                { icon: <ShieldCheck size={13} />, label: 'Driver', value: alert.driverName || '--' },
                { icon: <Route size={13} />, label: 'Route', value: alert.pickupLocation && alert.dropoffLocation ? `${alert.pickupLocation} to ${alert.dropoffLocation}` : '--' },
                { icon: <MapPin size={13} />, label: 'Unit', value: [alert.bodyNumber, alert.plateNumber, alert.todaName].filter(Boolean).join(' · ') || '--' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-gray-50'}`}>
                  <p className={`mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="text-red-400">{item.icon}</span>{item.label}
                  </p>
                  <p className={`truncate text-xs font-bold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
            {locationUrl ? (
              <a
                href={locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-500"
              >
                <MapPin size={13} /> Open Map <ExternalLink size={11} />
              </a>
            ) : (
              <span className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-black ${dm ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                GPS unavailable
              </span>
            )}

            {isActive && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onResolve(alert.alertId)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition disabled:opacity-70 ${
                  dm ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {isBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function SosAlertsTab({ dm }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    const result = await getAdminSosAlerts();
    if (Array.isArray(result)) {
      setAlerts(result);
    } else {
      setNotice({ type: 'error', message: result?.message || 'Failed to load SOS alerts.' });
    }

    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    const initialLoad = setTimeout(() => loadData(false), 0);

    const refresh = () => {
      if (document.hidden) return;
      loadData(true);
    };

    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadData]);

  async function handleResolve(alertId) {
    setBusyId(alertId);
    const result = await resolveAdminSosAlert(alertId);
    if (result?.message?.toLowerCase().includes('resolved')) {
      setNotice({ type: 'success', message: 'SOS alert marked as resolved.' });
      await loadData(true);
    } else {
      setNotice({ type: 'error', message: result?.message || 'Failed to resolve SOS alert.' });
    }
    setBusyId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((alert) => {
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (!q) return true;
      return [
        alert.senderName, alert.senderEmail, alert.userRole, alert.message,
        alert.rideId, alert.commuterName, alert.driverName, alert.bodyNumber,
        alert.plateNumber, alert.todaName, alert.pickupLocation, alert.dropoffLocation,
      ].some((value) => String(value || '').toLowerCase().includes(q));
    });
  }, [alerts, search, statusFilter]);

  const activeCount = alerts.filter((alert) => alert.status === 'active').length;
  const resolvedCount = alerts.filter((alert) => alert.status === 'resolved').length;
  const noGpsCount = alerts.filter((alert) => alert.latitude == null || alert.longitude == null).length;
  const inputCls = `w-full bg-transparent border-none outline-none text-sm font-semibold ${dm ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`;

  return (
    <div>
      <Banner notice={notice} dm={dm} />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric dm={dm} label="Active SOS" value={String(activeCount)} icon={Siren} color="#ef4444" />
        <Metric dm={dm} label="Resolved" value={String(resolvedCount)} icon={CheckCircle2} color="#22c55e" />
        <Metric dm={dm} label="No GPS" value={String(noGpsCount)} icon={MapPin} color="#f59e0b" />
        <Metric dm={dm} label="Total Alerts" value={String(alerts.length)} icon={AlertTriangle} color="#6366f1" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 ${dm ? 'bg-white/5 border border-white/8' : 'bg-white border border-gray-200'}`}>
          <Search size={15} className={`shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            className={inputCls}
            placeholder="Search by sender, ride, driver, plate, route..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className={`shrink-0 ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {['active', 'all', 'resolved'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wide transition ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : dm ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={() => loadData(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wide transition ${
              dm ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Siren size={17} className="text-red-400" />
        <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>SOS Alerts</h2>
        <span className={`ml-auto text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16 p-6">
          <Loader2 size={18} className="animate-spin text-red-400" />
          <span className={dm ? 'text-gray-400' : 'text-gray-500'}>Loading SOS alerts...</span>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard dm={dm} className="py-14 text-center p-6">
          <Clock size={32} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No SOS alerts match your filters.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <SosAlertRow
              key={alert.alertId}
              alert={alert}
              dm={dm}
              onResolve={handleResolve}
              isBusy={busyId === alert.alertId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
