import { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Car, Loader2,
  ChevronDown, Search, X, ChevronLeft, ChevronRight,
  User, Hash, MapPin, FileText, AlertOctagon, Shield
} from 'lucide-react';
import { getAdminComplaints, resolveAdminComplaint } from '../../services/api';

const PAGE_SIZE = 10;

const ANIM_CSS = `
@keyframes c-page-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}`;

/* ── Shared UI atoms (mirror DriversTricyclesTab) ── */
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
    pending:  dm ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'    : 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: dm ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  const cls = colors[tone] || (dm ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200');
  return (
    <div className="flex flex-col items-start gap-0.5">
      {label && <span className={`text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>}
      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${cls}`}>{value}</span>
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

/* ── Complaint type formatting ── */
const TYPE_LABELS = {
  rude_behavior:     'Rude Behavior',
  overcharging:      'Overcharging',
  reckless_driving:  'Reckless Driving',
  sexual_harassment: 'Sexual Harassment',
  other:             'Other',
};
function fmtType(t) {
  return TYPE_LABELS[t] || (t ? String(t).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General');
}
function fmtDate(v) {
  if (!v) return '--';
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ── Collapsible Complaint Row ── */
function ComplaintRow({ complaint, dm, open, onToggle, onResolve, busy }) {
  const isPending = complaint.status === 'pending';
  return (
    <GlassCard dm={dm} className="overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
      >
        {/* Icon avatar */}
        <div
          className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
          style={{ background: isPending ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)', color: isPending ? '#fbbf24' : '#34d399' }}
        >
          <AlertTriangle size={16} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm truncate ${dm ? 'text-white' : 'text-gray-900'}`}>
            {fmtType(complaint.complaintType)}
          </p>
          <p className={`text-[11px] font-semibold truncate mt-0.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
            {complaint.driverName || 'Unknown driver'} · {complaint.plateNumber || complaint.bodyNumber || 'No plate'}
          </p>
        </div>

        {/* Right meta */}
        <div className="hidden sm:flex items-center gap-3">
          <StatusPill value={complaint.status} dm={dm} />
          <span className={`text-[11px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{fmtDate(complaint.dateReported)}</span>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-300 ${dm ? 'text-gray-500' : 'text-gray-400'} ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* CSS-grid smooth expand */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.32s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className={`border-t px-5 py-4 ${dm ? 'border-white/6' : 'border-gray-100'}`}>

            {/* Mobile: date + status */}
            <div className="flex sm:hidden items-center gap-3 mb-4">
              <StatusPill value={complaint.status} dm={dm} />
              <span className={`text-[11px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{fmtDate(complaint.dateReported)}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {/* Description */}
              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Complaint Details</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <AlertOctagon size={13} />, value: `Type: ${fmtType(complaint.complaintType)}` },
                    { icon: <Clock size={13} />,        value: `Filed: ${fmtDate(complaint.dateReported)}` },
                    { icon: <Shield size={13} />,       value: `TODA: ${complaint.todaName || 'Unknown'}` },
                  ].map(({ icon, value }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="text-amber-400 shrink-0">{icon}</span>{value}
                    </p>
                  ))}
                  {complaint.description && (
                    <div className={`mt-2 rounded-lg px-3 py-2.5 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                      <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Description</p>
                      <p className={`text-[12px] font-semibold leading-relaxed ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                        {complaint.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver / Tricycle info */}
              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver & Tricycle</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <User size={13} />,  value: complaint.driverName || 'Unknown driver' },
                    { icon: <Car size={13} />,   value: `Plate: ${complaint.plateNumber || '--'}` },
                    { icon: <Hash size={13} />,  value: `Body No: ${complaint.bodyNumber || '--'}` },
                    { icon: <MapPin size={13} />, value: `TODA: ${complaint.todaName || '--'}` },
                  ].map(({ icon, value }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="text-red-400 shrink-0">{icon}</span>{value}
                    </p>
                  ))}
                </div>

                {/* Resolve action */}
                {isPending && (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onResolve(complaint.complaintId)}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      {busy ? 'Resolving…' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}

                {!isPending && (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <p className={`flex items-center gap-1.5 text-xs font-bold ${dm ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <CheckCircle2 size={13} /> Complaint resolved
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Pagination (identical to DriversTricyclesTab) ── */
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
      <button onClick={() => onPage(page + 1)} disabled={page === Math.ceil(total / pageSize)}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition disabled:opacity-40 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        Next <ChevronRight size={13} />
      </button>
    </div>
  );
}

/* ── Main Tab ── */
export default function ComplaintsTab({ dm }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [openId, setOpenId]         = useState(null);
  const [busyId, setBusyId]         = useState(null);
  const [notice, setNotice]         = useState(null);

  async function loadData() {
    setLoading(true);
    const result = await getAdminComplaints();
    if (Array.isArray(result)) {
      setComplaints(result);
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to load complaints.' });
    }
    setLoading(false);
  }
  useEffect(() => { loadData(); }, []);

  async function handleResolve(complaintId) {
    setBusyId(complaintId);
    const result = await resolveAdminComplaint(complaintId);
    if (result?.message?.toLowerCase().includes('resolved')) {
      setNotice({ type: 'success', message: 'Complaint marked as resolved.' });
      await loadData();
      setOpenId(null);
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to resolve complaint.' });
    }
    setBusyId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return complaints.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return [c.driverName, c.plateNumber, c.bodyNumber, c.todaName, c.complaintType, c.description]
        .some(v => (v || '').toLowerCase().includes(q));
    });
  }, [complaints, statusFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goPage(p) { setPage(Math.min(Math.max(1, p), Math.ceil(filtered.length / PAGE_SIZE))); setOpenId(null); }
  function handleSearch(v) { setSearch(v); setPage(1); setOpenId(null); }
  function handleStatus(s) { setStatusFilter(s); setPage(1); setOpenId(null); }

  const totalCount    = complaints.length;
  const pendingCount  = complaints.filter(c => c.status === 'pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const inputCls = `w-full bg-transparent border-none outline-none text-sm font-semibold ${dm ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`;

  return (
    <div>
      <style>{ANIM_CSS}</style>
      <Banner notice={notice} dm={dm} />

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric dm={dm} label="Total Complaints" value={String(totalCount)}   icon={FileText}      color="#6366f1" />
        <Metric dm={dm} label="Pending"           value={String(pendingCount)} icon={AlertTriangle} color="#f59e0b" />
        <Metric dm={dm} label="Resolved"          value={String(resolvedCount)} icon={CheckCircle2} color="#22c55e" />
        <Metric dm={dm} label="Open Rate"
          value={totalCount ? `${Math.round((pendingCount / totalCount) * 100)}%` : '0%'}
          icon={AlertOctagon} color="#ef4444" />
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 ${dm ? 'bg-white/5 border border-white/8' : 'bg-white border border-gray-200'}`}>
          <Search size={15} className={`shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            className={inputCls}
            placeholder="Search by driver, plate, TODA, type…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => handleSearch('')} className={`shrink-0 ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          {['all', 'pending', 'resolved'].map(s => (
            <button key={s} type="button" onClick={() => handleStatus(s)}
              className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wide transition ${statusFilter === s ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : dm ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="mb-4 flex items-center gap-3">
        <AlertTriangle size={17} className="text-red-400" />
        <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>Complaints</h2>
        <span className={`ml-auto text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16 p-6">
          <Loader2 size={18} className="animate-spin text-red-400" />
          <span className={dm ? 'text-gray-400' : 'text-gray-500'}>Loading complaints…</span>
        </GlassCard>
      ) : paginated.length === 0 ? (
        <GlassCard dm={dm} className="py-14 text-center p-6">
          <AlertOctagon size={32} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No complaints match your filters.</p>
        </GlassCard>
      ) : (
        <div
          key={`c-page-${page}-${statusFilter}-${search}`}
          style={{ animation: 'c-page-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards' }}
          className="space-y-2"
        >
          {paginated.map(complaint => (
            <ComplaintRow
              key={complaint.complaintId}
              complaint={complaint}
              dm={dm}
              open={openId === complaint.complaintId}
              onToggle={() => setOpenId(p => p === complaint.complaintId ? null : complaint.complaintId)}
              onResolve={handleResolve}
              busy={busyId === complaint.complaintId}
            />
          ))}
        </div>
      )}

      <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={goPage} dm={dm} />

      {!loading && filtered.length > 0 && (
        <p className={`mt-3 text-center text-[11px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} complaints
        </p>
      )}
    </div>
  );
}
