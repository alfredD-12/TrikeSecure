import { useEffect, useState, useMemo } from 'react';
import {
  Building2, Users, Car, CheckCircle2, Loader2, Mail, Phone,
  ExternalLink, Eye, ChevronDown, Search, X, ChevronLeft, ChevronRight,
  FileText, Hash, Shield, UserCheck
} from 'lucide-react';
import { getAdminDrivers, getAdminTodas, reviewAdminToda } from '../../services/api';

const PAGE_SIZE = 10;

const ANIM_CSS = `
@keyframes dt-page-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

function GlassCard({ children, className = '', dm = true }) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-xl transition-colors duration-300 ${className}`}
      style={{
        background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >{children}</div>
  );
}

function StatusPill({ label, value, dm }) {
  if (!value) return null;
  const tone = String(value).toLowerCase();
  const colors = {
    pending:   dm ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'    : 'bg-amber-50 text-amber-700 border-amber-200',
    approved:  dm ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:  dm ? 'bg-red-400/10 text-red-300 border-red-400/20'          : 'bg-red-50 text-red-700 border-red-200',
    president: dm ? 'bg-blue-400/10 text-blue-300 border-blue-400/20'       : 'bg-blue-50 text-blue-700 border-blue-200',
    member:    dm ? 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
    suspended: dm ? 'bg-red-400/10 text-red-300 border-red-400/20'          : 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = colors[tone] || (dm ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200');
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${cls}`}>{value}</span>
    </div>
  );
}

function DocumentLink({ value, dm }) {
  if (!value) return <span className={`text-xs font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Not submitted</span>;
  const name = String(value).split(/[\\/]/).filter(Boolean).pop() || value;
  return (
    <a href={value} target="_blank" rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${dm ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
      <Eye size={13} className="shrink-0 opacity-60 group-hover:opacity-100" />
      <span className="truncate max-w-[180px]">{name}</span>
      <ExternalLink size={11} className="shrink-0 opacity-40 group-hover:opacity-80" />
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
    <GlassCard dm={dm} className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className={`text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    </GlassCard>
  );
}

/* ── Collapsible Driver Row with CSS-grid expand animation ── */
function DriverRow({ driver, dm, open, onToggle }) {
  const pills = (
    <div className="flex items-center flex-wrap gap-3">
      <StatusPill label="Membership" value={driver.membershipStatus} dm={dm} />
      <StatusPill label="Role"       value={driver.membershipRole}   dm={dm} />
      {driver.tricycleStatus && <StatusPill label="Franchise" value={driver.tricycleStatus} dm={dm} />}
    </div>
  );

  return (
    <GlassCard dm={dm} className="overflow-hidden">
      {/* Collapsed header */}
      <button type="button" onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
          {(driver.fullName || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{driver.fullName}</p>
          <p className={`text-[11px] font-semibold truncate mt-0.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
            {driver.todaName || 'No TODA'} · {driver.plateNumber || driver.bodyNumber || 'No plate'}
          </p>
        </div>
        <div className="hidden sm:flex">{pills}</div>
        <ChevronDown size={15} className={`shrink-0 transition-transform duration-300 ${dm ? 'text-gray-500' : 'text-gray-400'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile pills (always visible under header) */}
      <div className={`flex sm:hidden px-5 pb-3 ${open ? 'hidden' : ''}`}>{pills}</div>

      {/* CSS-grid smooth expand */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.32s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className={`border-t px-5 py-4 ${dm ? 'border-white/6' : 'border-gray-100'}`}>
            <div className="flex sm:hidden mb-4">{pills}</div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver Details</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <Mail size={13} />,     value: driver.email },
                    { icon: <Phone size={13} />,    value: driver.contactNumber || 'No contact' },
                    { icon: <FileText size={13} />, value: `License: ${driver.licenseNumber || '--'}` },
                    { icon: <Shield size={13} />,   value: `TODA: ${driver.todaName || 'Not assigned'}` },
                  ].map(({ icon, value }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="text-red-400 shrink-0">{icon}</span>{value}
                    </p>
                  ))}
                </div>
              </div>
              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Tricycle & Files</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <Hash size={13} />,    value: `Body No: ${driver.bodyNumber || '--'}` },
                    { icon: <Car size={13} />,     value: `Plate: ${driver.plateNumber || '--'}` },
                    { icon: <UserCheck size={13} />, value: `Franchise: ${driver.franchiseStatus || 'No application'}` },
                  ].map(({ icon, value }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="text-red-400 shrink-0">{icon}</span>{value}
                    </p>
                  ))}
                  <div className={`rounded-lg px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                    <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver License File</p>
                    <DocumentLink value={driver.driverLicenseDocument} dm={dm} />
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                    <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Valid ID File</p>
                    <DocumentLink value={driver.validIdDocument} dm={dm} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Pagination ── */
function Pager({ page, total, pageSize, onPage, dm }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const nums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…'); acc.push(p); return acc; }, []);

  return (
    <div className="mt-5 flex items-center justify-between">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition disabled:opacity-40 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        <ChevronLeft size={13} /> Prev
      </button>
      <div className="flex items-center gap-1">
        {nums.map((p, i) => p === '…'
          ? <span key={`d${i}`} className={`px-2 text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>…</span>
          : <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black transition ${page === p ? 'bg-red-600 text-white' : dm ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
        )}
      </div>
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition disabled:opacity-40 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        Next <ChevronRight size={13} />
      </button>
    </div>
  );
}

/* ── Main Tab ── */
export default function DriversTricyclesTab({ dm }) {
  const [todas, setTodas]     = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [openId, setOpenId]   = useState(null);
  const [busyTodaId, setBusyTodaId] = useState(null);
  const [notice, setNotice]   = useState(null);

  async function loadData() {
    setLoading(true);
    const [todaRes, driverRes] = await Promise.all([getAdminTodas('pending'), getAdminDrivers()]);
    if (Array.isArray(todaRes)) setTodas(todaRes);
    else setNotice({ type: 'error', message: todaRes.message || 'Failed to load TODA applications.' });
    if (Array.isArray(driverRes)) setDrivers(driverRes);
    else setNotice({ type: 'error', message: driverRes.message || 'Failed to load drivers.' });
    setLoading(false);
  }
  useEffect(() => { loadData(); }, []);

  async function reviewToda(todaId, status) {
    setBusyTodaId(todaId);
    const result = await reviewAdminToda(todaId, status);
    setNotice(result?.toda
      ? { type: 'success', message: result.message || `TODA ${status}.` }
      : { type: 'error',   message: result.message || 'Failed.' });
    if (result?.toda) await loadData();
    setBusyTodaId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter(d => {
      if (statusFilter !== 'all' && d.membershipStatus !== statusFilter) return false;
      if (!q) return true;
      return [d.fullName, d.plateNumber, d.bodyNumber, d.todaName, d.email, d.licenseNumber]
        .some(v => (v || '').toLowerCase().includes(q));
    });
  }, [drivers, statusFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goPage(p) {
    setPage(Math.min(Math.max(1, p), Math.ceil(filtered.length / PAGE_SIZE)));
    setOpenId(null);
  }
  function handleSearch(v) { setSearch(v); setPage(1); setOpenId(null); }
  function handleStatus(s) { setStatusFilter(s); setPage(1); setOpenId(null); }

  const inputCls = `w-full bg-transparent border-none outline-none text-sm font-semibold ${dm ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`;

  return (
    <div>
      <style>{ANIM_CSS}</style>
      <Banner notice={notice} dm={dm} />

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric dm={dm} label="Pending TODAs"    value={String(todas.length)}                                          icon={Building2}   color="#f59e0b" />
        <Metric dm={dm} label="Pending Members"  value={String(drivers.filter(d => d.membershipStatus === 'pending').length)} icon={Users}  color="#3b82f6" />
        <Metric dm={dm} label="Approved Drivers" value={String(drivers.filter(d => d.membershipStatus === 'approved').length)} icon={CheckCircle2} color="#22c55e" />
        <Metric dm={dm} label="Approved Tricycles" value={String(drivers.filter(d => d.tricycleStatus === 'approved').length)} icon={Car} color="#8b5cf6" />
      </div>

      {/* Pending TODAs */}
      {todas.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Building2 size={17} className="text-red-400" />
            <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>Pending TODA Applications</h2>
          </div>
          <div className="space-y-3">
            {todas.map(toda => (
              <GlassCard key={toda.todaId} dm={dm} className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{toda.todaName}</h3>
                  <StatusPill label="Status" value={toda.status} dm={dm} />
                </div>
                <p className={`text-sm font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>President: {toda.presidentFullName}</p>
                <p className={`mt-0.5 text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{toda.barangay}{toda.municipality ? `, ${toda.municipality}` : ''}</p>
                <div className="mt-4 flex gap-3">
                  <button type="button" disabled={busyTodaId === toda.todaId} onClick={() => reviewToda(toda.todaId, 'approved')}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-70">
                    {busyTodaId === toda.todaId ? 'Processing…' : 'Approve'}
                  </button>
                  <button type="button" disabled={busyTodaId === toda.todaId} onClick={() => reviewToda(toda.todaId, 'rejected')}
                    className={`rounded-xl px-4 py-2.5 text-xs font-black disabled:opacity-70 ${dm ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    {busyTodaId === toda.todaId ? 'Processing…' : 'Reject'}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Drivers */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Users size={17} className="text-red-400" />
          <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>Drivers & Tricycles</h2>
          <span className={`ml-auto text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 ${dm ? 'bg-white/5 border border-white/8' : 'bg-white border border-gray-200'}`}>
            <Search size={15} className={`shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
            <input className={inputCls} placeholder="Search by name, plate, TODA, email, license…" value={search} onChange={e => handleSearch(e.target.value)} />
            {search && <button onClick={() => handleSearch('')} className={`shrink-0 ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}><X size={14} /></button>}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} type="button" onClick={() => handleStatus(s)}
                className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wide transition ${statusFilter === s ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : dm ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
        </div>

        {/* List — key triggers fade+slide animation on page change */}
        {loading ? (
          <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16 p-6">
            <Loader2 size={18} className="animate-spin text-red-400" />
            <span className={dm ? 'text-gray-400' : 'text-gray-500'}>Loading drivers…</span>
          </GlassCard>
        ) : paginated.length === 0 ? (
          <GlassCard dm={dm} className="py-14 text-center p-6">
            <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No drivers match your filters.</p>
          </GlassCard>
        ) : (
          <div key={`dt-page-${page}-${statusFilter}-${search}`}
            style={{ animation: 'dt-page-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards' }}
            className="space-y-2">
            {paginated.map(driver => {
              const id = `${driver.driverId}-${driver.tricycleId || 'none'}`;
              return <DriverRow key={id} driver={driver} dm={dm} open={openId === id} onToggle={() => setOpenId(p => p === id ? null : id)} />;
            })}
          </div>
        )}

        <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={goPage} dm={dm} />

        {!loading && filtered.length > 0 && (
          <p className={`mt-3 text-center text-[11px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} drivers
          </p>
        )}
      </div>
    </div>
  );
}
