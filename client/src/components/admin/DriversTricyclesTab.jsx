import { useEffect, useState } from 'react';
import { Building2, Users, Car, CheckCircle2, Loader2, XCircle, FileText, Mail, Phone, ExternalLink, Eye } from 'lucide-react';
import { getAdminDrivers, getAdminTodas, reviewAdminToda } from '../../services/api';

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

function chip(status, dm) {
  const tone = String(status || 'unknown').toLowerCase();
  const colors = {
    pending: dm ? 'bg-amber-400/10 text-amber-300 border-amber-400/20' : 'bg-amber-50 text-amber-700 border-amber-200',
    approved: dm ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: dm ? 'bg-red-400/10 text-red-300 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200',
    president: dm ? 'bg-blue-400/10 text-blue-300 border-blue-400/20' : 'bg-blue-50 text-blue-700 border-blue-200',
    member: dm ? 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
    suspended: dm ? 'bg-red-400/10 text-red-300 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200',
  };

  return `rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${colors[tone] || (dm ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200')}`;
}

function fileLabel(value) {
  if (!value) return 'Not submitted';
  const parts = String(value).split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || value;
}

function DocumentLink({ value, dm, label }) {
  if (!value) {
    return <span className={`text-sm font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label ? `${label}: ` : ''}Not submitted</span>;
  }
  const displayName = fileLabel(value);
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
        dm ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
      }`}
      title={`View ${displayName}`}
    >
      <Eye size={14} className="shrink-0 opacity-60 group-hover:opacity-100" />
      <span className="truncate">{label ? `${label}: ` : ''}{displayName}</span>
      <ExternalLink size={12} className="shrink-0 opacity-40 group-hover:opacity-80" />
    </a>
  );
}

function Banner({ notice, dm }) {
  if (!notice) return null;
  const tone = notice.type === 'success'
    ? (dm ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
    : (dm ? 'bg-red-500/10 text-red-200 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200');

  return <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${tone}`}>{notice.message}</div>;
}

function Metric({ dm, label, value, icon: Icon, color }) {
  return (
    <GlassCard dm={dm}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className={`mb-1 text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    </GlassCard>
  );
}

function formatDateTime(value) {
  if (!value) return 'Not yet recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function DriversTricyclesTab({ dm }) {
  const [todas, setTodas] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyTodaId, setBusyTodaId] = useState(null);
  const [notice, setNotice] = useState(null);

  async function loadData() {
    setLoading(true);
    const [todaRes, driverRes] = await Promise.all([getAdminTodas('pending'), getAdminDrivers()]);
    if (Array.isArray(todaRes)) setTodas(todaRes); else setNotice({ type: 'error', message: todaRes.message || 'Failed to load TODA applications.' });
    if (Array.isArray(driverRes)) setDrivers(driverRes); else setNotice({ type: 'error', message: driverRes.message || 'Failed to load driver records.' });
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function reviewToda(todaId, status) {
    setBusyTodaId(todaId);
    const result = await reviewAdminToda(todaId, status);
    if (result?.toda) {
      setNotice({ type: 'success', message: result.message || `TODA application ${status}.` });
      await loadData();
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to review TODA application.' });
    }
    setBusyTodaId(null);
  }

  const visibleDrivers = filter === 'all' ? drivers : drivers.filter((driver) => driver.membershipStatus === filter);

  return (
    <div>
      <Banner notice={notice} dm={dm} />

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric dm={dm} label="Pending TODAs" value={String(todas.length)} icon={Building2} color="#f59e0b" />
        <Metric dm={dm} label="Pending Members" value={String(drivers.filter((item) => item.membershipStatus === 'pending').length)} icon={Users} color="#3b82f6" />
        <Metric dm={dm} label="Approved Drivers" value={String(drivers.filter((item) => item.membershipStatus === 'approved').length)} icon={CheckCircle2} color="#22c55e" />
        <Metric dm={dm} label="Approved Tricycles" value={String(drivers.filter((item) => item.tricycleStatus === 'approved').length)} icon={Car} color="#8b5cf6" />
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <Building2 size={18} className="text-red-400" />
          <h2 className={`text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-gray-900'}`}>Pending TODA Applications</h2>
        </div>

        {loading ? (
          <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16"><Loader2 size={18} className="animate-spin text-red-400" />Loading TODA applications...</GlassCard>
        ) : todas.length === 0 ? (
          <GlassCard dm={dm} className="py-14 text-center"><p className={dm ? 'text-gray-400' : 'text-gray-500'}>No pending TODA applications.</p></GlassCard>
        ) : (
          <div className="space-y-4">
            {todas.map((toda) => (
              <GlassCard key={toda.todaId} dm={dm}>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h3 className={`text-xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{toda.todaName}</h3>
                  <span className={chip(toda.status, dm)}>{toda.status}</span>
                </div>
                <p className={`text-sm font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>President: {toda.presidentFullName}</p>
                <p className={`mt-1 text-xs font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{toda.barangay}{toda.municipality ? `, ${toda.municipality}` : ''}</p>
                <div className={`mt-4 rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`mb-2 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Route Description</p>
                  <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>{toda.routeDescription}</p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {[
                    ['Letter of Intent', toda.letterOfIntentDocument],
                    ['Officers List', toda.officersListDocument],
                    ['Members List', toda.membersListDocument],
                    ['Barangay Approval', toda.barangayApprovalDocument],
                  ].map(([docLabel, docValue]) => (
                    <div key={docLabel} className={`rounded-xl px-3 py-2 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{docLabel}</p>
                      <DocumentLink value={docValue} dm={dm} />
                    </div>
                  ))}
                </div>
                <div className={`mt-4 rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>President Documents</p>
                  {toda.presidentLicenseNumber && (
                    <p className={`mb-2 text-sm font-semibold ${dm ? 'text-gray-300' : 'text-gray-600'}`}>License No: {toda.presidentLicenseNumber}</p>
                  )}
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                      <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver License</p>
                      <DocumentLink value={toda.presidentDriverLicenseDocument} dm={dm} />
                    </div>
                    <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                      <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Valid ID</p>
                      <DocumentLink value={toda.presidentValidIdDocument} dm={dm} />
                    </div>
                  </div>
                </div>
                <p className={`mt-4 text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Submitted: {formatDateTime(toda.submittedAt)}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="button" disabled={busyTodaId === toda.todaId} onClick={() => reviewToda(toda.todaId, 'approved')} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-70">
                    {busyTodaId === toda.todaId ? 'Processing...' : 'Approve TODA'}
                  </button>
                  <button type="button" disabled={busyTodaId === toda.todaId} onClick={() => reviewToda(toda.todaId, 'rejected')} className={`rounded-xl px-4 py-3 text-sm font-black ${dm ? 'bg-red-500/10 text-red-200 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'} disabled:opacity-70`}>
                    {busyTodaId === toda.todaId ? 'Processing...' : 'Reject TODA'}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-red-400" />
            <h2 className={`text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-gray-900'}`}>Drivers & Tricycles</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide ${filter === item ? 'bg-red-600 text-white' : dm ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-600'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16"><Loader2 size={18} className="animate-spin text-red-400" />Loading drivers and tricycles...</GlassCard>
        ) : visibleDrivers.length === 0 ? (
          <GlassCard dm={dm} className="py-14 text-center"><p className={dm ? 'text-gray-400' : 'text-gray-500'}>No driver records for this filter.</p></GlassCard>
        ) : (
          <div className="space-y-4">
            {visibleDrivers.map((driver) => (
              <GlassCard key={`${driver.driverId}-${driver.tricycleId || 'none'}`} dm={dm}>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h3 className={`text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{driver.fullName}</h3>
                  <span className={chip(driver.membershipStatus, dm)}>{driver.membershipStatus}</span>
                  <span className={chip(driver.membershipRole, dm)}>{driver.membershipRole}</span>
                  {driver.tricycleStatus && <span className={chip(driver.tricycleStatus, dm)}>{driver.tricycleStatus}</span>}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
                  <div className={`rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver Details</p>
                    <div className="space-y-2">
                      <p className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}><Mail size={14} className="text-red-400" />{driver.email}</p>
                      <p className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}><Phone size={14} className="text-red-400" />{driver.contactNumber || 'No contact number'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>License: {driver.licenseNumber}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>TODA: {driver.todaName || 'Not assigned'}</p>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Tricycle & Files</p>
                    <div className="space-y-2">
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Body Number: {driver.bodyNumber || 'Not assigned'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Plate Number: {driver.plateNumber || 'Not submitted'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Franchise: {driver.franchiseStatus || 'No application yet'}</p>
                      <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                        <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver License File</p>
                        <DocumentLink value={driver.driverLicenseDocument} dm={dm} />
                      </div>
                      <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                        <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Valid ID File</p>
                        <DocumentLink value={driver.validIdDocument} dm={dm} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
