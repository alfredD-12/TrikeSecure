import { useEffect, useState, useMemo } from 'react';
import { Shield, Car, CheckCircle2, Loader2, FileText, Mail, CalendarDays, Hash, XCircle, Eye, ExternalLink, ChevronDown, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminFranchises, reviewAdminFranchise } from '../../services/api';

const PAGE_SIZE = 10;
const ANIM = `@keyframes f-page-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;

/* ── helpers ── */
function GlassCard({ children, className = '', dm = true }) {
  return (
    <div className={`rounded-2xl backdrop-blur-xl ${className}`} style={{
      background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
      border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
    }}>{children}</div>
  );
}

function StatusPill({ label, value, dm }) {
  if (!value) return null;
  const t = String(value).toLowerCase();
  const c = {
    pending:  dm ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'    : 'bg-amber-50 text-amber-700 border-amber-200',
    approved: dm ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: dm ? 'bg-red-400/10 text-red-300 border-red-400/20'          : 'bg-red-50 text-red-700 border-red-200',
    expired:  dm ? 'bg-slate-400/10 text-slate-300 border-slate-400/20'    : 'bg-slate-100 text-slate-700 border-slate-200',
    revoked:  dm ? 'bg-rose-400/10 text-rose-300 border-rose-400/20'       : 'bg-rose-50 text-rose-700 border-rose-200',
    president:dm ? 'bg-blue-400/10 text-blue-300 border-blue-400/20'       : 'bg-blue-50 text-blue-700 border-blue-200',
    member:   dm ? 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase ${c[t] || (dm ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200')}`}>{value}</span>
    </div>
  );
}

function DocLink({ value, dm }) {
  if (!value) return <span className={`text-xs font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Not submitted</span>;
  const name = String(value).split(/[\\/]/).filter(Boolean).pop() || value;
  return (
    <a href={value} target="_blank" rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${dm ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
      <Eye size={13} className="shrink-0 opacity-60 group-hover:opacity-100" />
      <span className="truncate max-w-[180px]">{name}</span>
      <ExternalLink size={11} className="shrink-0 opacity-40" />
    </a>
  );
}

function Banner({ notice, dm }) {
  if (!notice) return null;
  const cls = notice.type === 'success'
    ? (dm ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
    : (dm ? 'bg-red-500/10 text-red-200 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200');
  return <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${cls}`}>{notice.message}</div>;
}

function Metric({ dm, label, value, icon: Icon, color }) {
  return (
    <GlassCard dm={dm} className="p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className={`text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    </GlassCard>
  );
}

function fmtDate(v) { if (!v) return 'Not set'; const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString(); }
function fmtDateTime(v) { if (!v) return 'Not recorded'; const d = new Date(v); return isNaN(d) ? v : d.toLocaleString(); }
function defaultForm(item) {
  return { issueDate: item.issueDate ? String(item.issueDate).slice(0,10) : '', expiryDate: item.expiryDate ? String(item.expiryDate).slice(0,10) : '', lguReferenceNo: item.lguReferenceNo || '', remarks: item.remarks || '' };
}

const inCls = (dm) => `w-full rounded-xl border px-3 py-2.5 text-sm font-semibold outline-none transition disabled:opacity-60 disabled:cursor-not-allowed ${dm ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900'}`;

/* ── Collapsible Row ── */
function FranchiseRow({ item, dm, open, onToggle, form, onFormChange, onReview, isBusy }) {
  const isPending = item.status === 'pending';
  return (
    <GlassCard dm={dm} className="overflow-hidden">
      {/* Header */}
      <button type="button" onClick={onToggle}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${dm ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
          {(item.driverFullName || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{item.driverFullName}</p>
          <p className={`text-[11px] font-semibold truncate mt-0.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
            {item.todaName || 'No TODA'} · {item.plateNumber || item.bodyNumber || 'No plate'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <StatusPill label="Franchise"  value={item.status}           dm={dm} />
          <StatusPill label="Membership" value={item.membershipStatus} dm={dm} />
          {item.tricycleStatus && <StatusPill label="Tricycle" value={item.tricycleStatus} dm={dm} />}
        </div>
        <ChevronDown size={15} className={`shrink-0 transition-transform duration-300 ${dm ? 'text-gray-500' : 'text-gray-400'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* CSS-grid smooth expand */}
      <div style={{ display:'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.32s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ overflow:'hidden' }}>
          <div className={`border-t px-5 py-4 ${dm ? 'border-white/6' : 'border-gray-100'}`}>
            {/* Mobile pills */}
            <div className="flex sm:hidden flex-wrap gap-3 mb-4">
              <StatusPill label="Franchise"  value={item.status}           dm={dm} />
              <StatusPill label="Membership" value={item.membershipStatus} dm={dm} />
              {item.tricycleStatus && <StatusPill label="Tricycle" value={item.tricycleStatus} dm={dm} />}
            </div>

            {/* Info + docs grid */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 mb-4">
              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver & Vehicle</p>
                <div className="space-y-2">
                  {[
                    { icon: <Mail size={13}/>,         text: item.driverEmail },
                    { icon: <Shield size={13}/>,        text: `TODA: ${item.todaName || '--'}` },
                    { icon: <Hash size={13}/>,          text: `Body No: ${item.bodyNumber || '--'}` },
                    { icon: <Car size={13}/>,           text: `Plate: ${item.plateNumber || '--'}` },
                    { icon: <CalendarDays size={13}/>,  text: `Submitted: ${fmtDateTime(item.createdAt)}` },
                    { icon: <CalendarDays size={13}/>,  text: `Reviewed: ${fmtDateTime(item.reviewedAt)}` },
                  ].map(({ icon, text }, i) => (
                    <p key={i} className={`flex items-center gap-2 text-xs font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="text-red-400 shrink-0">{icon}</span>{text}
                    </p>
                  ))}
                </div>
              </div>

              <div className={`rounded-xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Submitted Documents</p>
                <div className="space-y-2.5">
                  {[['TODA Certificate', item.todaCertificateDocument], ['OR / CR', item.orCrDocument], ['Insurance', item.insuranceDocument]].map(([lbl, val]) => (
                    <div key={lbl} className={`rounded-lg px-3 py-2 ${dm ? 'bg-slate-900/40' : 'bg-white'}`}>
                      <p className={`mb-1 text-[9px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{lbl}</p>
                      <DocLink value={val} dm={dm} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision panel */}
            <div className={`rounded-xl p-4 ${dm ? 'bg-slate-900/40' : 'bg-gray-50'}`}>
              <p className={`mb-3 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Franchise Decision</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className={`mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}><CalendarDays size={11}/>Issue Date</span>
                  <input type="date" value={form.issueDate} onChange={e => onFormChange('issueDate', e.target.value)} disabled={!isPending || isBusy} className={inCls(dm)} />
                </label>
                <label className="block">
                  <span className={`mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}><CalendarDays size={11}/>Expiry Date</span>
                  <input type="date" value={form.expiryDate} onChange={e => onFormChange('expiryDate', e.target.value)} disabled={!isPending || isBusy} className={inCls(dm)} />
                </label>
                <label className="block xl:col-span-2">
                  <span className={`mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}><Hash size={11}/>LGU Reference No.</span>
                  <input type="text" value={form.lguReferenceNo} onChange={e => onFormChange('lguReferenceNo', e.target.value)} disabled={!isPending || isBusy} placeholder="LGU-2026-0001" className={inCls(dm)} />
                </label>
              </div>
              <label className="mt-3 block">
                <span className={`mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-gray-400'}`}><FileText size={11}/>Remarks</span>
                <textarea rows="2" value={form.remarks} onChange={e => onFormChange('remarks', e.target.value)} disabled={isBusy}
                  placeholder="Approval notes or rejection reason…" className={`${inCls(dm)} resize-none`} />
              </label>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold ${dm ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-600'}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1">Approval Snapshot</p>
                  <p>Issued: {fmtDate(item.issueDate)}</p>
                  <p>Expires: {fmtDate(item.expiryDate)}</p>
                  <p className="truncate">Ref: {item.lguReferenceNo || 'Not assigned'}</p>
                  <p className="opacity-60 mt-0.5">By: {item.reviewedByName || 'Not yet reviewed'}</p>
                </div>
                {isPending && (
                  <button type="button" disabled={isBusy} onClick={() => onReview('approved')}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-70">
                    {isBusy ? 'Processing…' : 'Approve'}
                  </button>
                )}
                {isPending && (
                  <button type="button" disabled={isBusy} onClick={() => onReview('rejected')}
                    className={`rounded-xl px-5 py-2.5 text-xs font-black disabled:opacity-70 ${dm ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    {isBusy ? 'Processing…' : 'Reject'}
                  </button>
                )}
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
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push('…'); acc.push(p); return acc; }, []);
  return (
    <div className="mt-5 flex items-center justify-between">
      <button onClick={() => onPage(page-1)} disabled={page===1}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black disabled:opacity-40 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        <ChevronLeft size={13}/> Prev
      </button>
      <div className="flex items-center gap-1">
        {nums.map((p, i) => p === '…'
          ? <span key={`d${i}`} className={`px-2 text-xs ${dm?'text-gray-500':'text-gray-400'}`}>…</span>
          : <button key={p} onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-black ${page===p?'bg-red-600 text-white':dm?'bg-white/5 text-gray-400 hover:bg-white/10':'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
        )}
      </div>
      <button onClick={() => onPage(page+1)} disabled={page===totalPages}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black disabled:opacity-40 ${dm ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        Next <ChevronRight size={13}/>
      </button>
    </div>
  );
}

/* ── Main Tab ── */
export default function FranchisesTab({ dm }) {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [openId, setOpenId]         = useState(null);
  const [notice, setNotice]         = useState(null);
  const [busyId, setBusyId]         = useState(null);
  const [forms, setForms]           = useState({});

  async function loadData() {
    setLoading(true);
    const result = await getAdminFranchises();
    if (Array.isArray(result)) {
      setFranchises(result);
      setForms(cur => {
        const next = { ...cur };
        result.forEach(item => { next[item.franchiseId] = { ...defaultForm(item), ...(cur[item.franchiseId] || {}) }; });
        return next;
      });
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to load franchises.' });
    }
    setLoading(false);
  }
  useEffect(() => { loadData(); }, []);

  function updateForm(id, key, val) {
    setForms(cur => ({ ...cur, [id]: { ...defaultForm({}), ...(cur[id]||{}), [key]: val } }));
  }

  async function handleReview(item, status) {
    const form = forms[item.franchiseId] || defaultForm(item);
    if (status === 'approved' && (!form.issueDate || !form.expiryDate || !form.lguReferenceNo.trim())) {
      setNotice({ type: 'error', message: 'Issue date, expiry date, and LGU reference are required to approve.' });
      return;
    }
    setBusyId(item.franchiseId);
    const payload = { status, remarks: form.remarks?.trim() || '' };
    if (status === 'approved') { payload.issueDate = form.issueDate; payload.expiryDate = form.expiryDate; payload.lguReferenceNo = form.lguReferenceNo.trim(); }
    const result = await reviewAdminFranchise(item.franchiseId, payload);
    setNotice(result?.franchise
      ? { type: 'success', message: result.message || `Franchise ${status}.` }
      : { type: 'error',   message: result.message || 'Failed.' });
    if (result?.franchise) await loadData();
    setBusyId(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return franchises.filter(f => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      if (!q) return true;
      return [f.driverFullName, f.plateNumber, f.bodyNumber, f.todaName, f.driverEmail, f.lguReferenceNo]
        .some(v => (v||'').toLowerCase().includes(q));
    });
  }, [franchises, statusFilter, search]);

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  function goPage(p) { setPage(Math.min(Math.max(1,p), Math.ceil(filtered.length/PAGE_SIZE))); setOpenId(null); }
  function handleSearch(v) { setSearch(v); setPage(1); setOpenId(null); }
  function handleStatus(s) { setStatusFilter(s); setPage(1); setOpenId(null); }

  const inputCls = `w-full bg-transparent border-none outline-none text-sm font-semibold ${dm ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`;

  return (
    <div>
      <style>{ANIM}</style>
      <Banner notice={notice} dm={dm} />

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric dm={dm} label="Pending"  value={String(franchises.filter(f=>f.status==='pending').length)}  icon={Shield}      color="#f59e0b"/>
        <Metric dm={dm} label="Approved" value={String(franchises.filter(f=>f.status==='approved').length)} icon={CheckCircle2} color="#22c55e"/>
        <Metric dm={dm} label="Rejected" value={String(franchises.filter(f=>f.status==='rejected').length)} icon={XCircle}     color="#ef4444"/>
        <Metric dm={dm} label="Active Tricycles" value={String(franchises.filter(f=>f.tricycleStatus==='approved').length)} icon={Car} color="#3b82f6"/>
      </div>

      {/* Section header */}
      <div className="mb-4 flex items-center gap-3">
        <Shield size={17} className="text-red-400"/>
        <h2 className={`text-sm font-black uppercase tracking-widest ${dm?'text-white':'text-gray-900'}`}>Franchise Applications</h2>
        <span className={`ml-auto text-xs font-bold ${dm?'text-gray-500':'text-gray-400'}`}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className={`flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 ${dm?'bg-white/5 border border-white/8':'bg-white border border-gray-200'}`}>
          <Search size={15} className={`shrink-0 ${dm?'text-gray-500':'text-gray-400'}`}/>
          <input className={inputCls} placeholder="Search by name, plate, TODA, email, LGU ref…" value={search} onChange={e=>handleSearch(e.target.value)}/>
          {search && <button onClick={()=>handleSearch('')} className={`shrink-0 ${dm?'text-gray-500 hover:text-gray-300':'text-gray-400 hover:text-gray-600'}`}><X size={14}/></button>}
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {['all','pending','approved','rejected','expired','revoked'].map(s=>(
            <button key={s} type="button" onClick={()=>handleStatus(s)}
              className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wide transition ${statusFilter===s?'bg-red-600 text-white shadow-lg shadow-red-900/30':dm?'bg-white/5 text-gray-400 hover:bg-white/10':'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16 p-6">
          <Loader2 size={18} className="animate-spin text-red-400"/>
          <span className={dm?'text-gray-400':'text-gray-500'}>Loading franchise applications…</span>
        </GlassCard>
      ) : paginated.length === 0 ? (
        <GlassCard dm={dm} className="py-14 text-center p-6">
          <p className={dm?'text-gray-400':'text-gray-500'}>No franchise records for this filter.</p>
        </GlassCard>
      ) : (
        <div key={`f-page-${page}-${statusFilter}-${search}`}
          style={{ animation: 'f-page-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards' }}
          className="space-y-2">
          {paginated.map(item => (
            <FranchiseRow
              key={item.franchiseId}
              item={item}
              dm={dm}
              open={openId === item.franchiseId}
              onToggle={() => setOpenId(p => p === item.franchiseId ? null : item.franchiseId)}
              form={forms[item.franchiseId] || defaultForm(item)}
              onFormChange={(key, val) => updateForm(item.franchiseId, key, val)}
              onReview={(status) => handleReview(item, status)}
              isBusy={busyId === item.franchiseId}
            />
          ))}
        </div>
      )}

      <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={goPage} dm={dm}/>

      {!loading && filtered.length > 0 && (
        <p className={`mt-3 text-center text-[11px] font-bold ${dm?'text-gray-600':'text-gray-400'}`}>
          Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} franchises
        </p>
      )}
    </div>
  );
}
