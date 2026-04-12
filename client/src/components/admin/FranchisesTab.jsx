import { useEffect, useState } from 'react';
import {
  Shield,
  Car,
  CheckCircle2,
  Loader2,
  FileText,
  Mail,
  CalendarDays,
  Hash,
  XCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { getAdminFranchises, reviewAdminFranchise } from '../../services/api';

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
    expired: dm ? 'bg-slate-400/10 text-slate-300 border-slate-400/20' : 'bg-slate-100 text-slate-700 border-slate-200',
    revoked: dm ? 'bg-rose-400/10 text-rose-300 border-rose-400/20' : 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return `rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${colors[tone] || (dm ? 'bg-white/5 text-gray-300 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200')}`;
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

function Field({ dm, label, value }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
      <p className={`text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`truncate text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>{value || 'Not submitted'}</p>
    </div>
  );
}

function fileLabel(value) {
  if (!value) return 'Not submitted';
  const parts = String(value).split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || value;
}

function DocumentLink({ value, dm }) {
  if (!value) {
    return <span className={`text-sm font-semibold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Not submitted</span>;
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
      <span className="truncate">{displayName}</span>
      <ExternalLink size={12} className="shrink-0 opacity-40 group-hover:opacity-80" />
    </a>
  );
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return 'Not yet recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function defaultFormState(item) {
  return {
    issueDate: item.issueDate ? String(item.issueDate).slice(0, 10) : '',
    expiryDate: item.expiryDate ? String(item.expiryDate).slice(0, 10) : '',
    lguReferenceNo: item.lguReferenceNo || '',
    remarks: item.remarks || '',
  };
}

export default function FranchisesTab({ dm }) {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState(null);
  const [busyFranchiseId, setBusyFranchiseId] = useState(null);
  const [forms, setForms] = useState({});

  async function loadData() {
    setLoading(true);
    const result = await getAdminFranchises();

    if (Array.isArray(result)) {
      setFranchises(result);
      setForms((current) => {
        const next = { ...current };
        result.forEach((item) => {
          next[item.franchiseId] = {
            ...defaultFormState(item),
            ...(current[item.franchiseId] || {}),
          };
        });
        return next;
      });
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to load franchise applications.' });
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm(franchiseId, key, value) {
    setForms((current) => ({
      ...current,
      [franchiseId]: {
        ...defaultFormState({}),
        ...(current[franchiseId] || {}),
        [key]: value,
      },
    }));
  }

  async function handleReview(item, status) {
    const form = forms[item.franchiseId] || defaultFormState(item);

    if (status === 'approved' && (!form.issueDate || !form.expiryDate || !form.lguReferenceNo.trim())) {
      setNotice({ type: 'error', message: 'Approving a franchise needs issue date, expiry date, and LGU reference number.' });
      return;
    }

    setBusyFranchiseId(item.franchiseId);
    const payload = {
      status,
      remarks: form.remarks?.trim() || '',
    };

    if (status === 'approved') {
      payload.issueDate = form.issueDate;
      payload.expiryDate = form.expiryDate;
      payload.lguReferenceNo = form.lguReferenceNo.trim();
    }

    const result = await reviewAdminFranchise(item.franchiseId, payload);
    if (result?.franchise) {
      setNotice({ type: 'success', message: result.message || `Franchise application ${status}.` });
      await loadData();
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to review franchise application.' });
    }
    setBusyFranchiseId(null);
  }

  const visibleFranchises = filter === 'all'
    ? franchises
    : franchises.filter((item) => item.status === filter);

  return (
    <div>
      <Banner notice={notice} dm={dm} />

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric dm={dm} label="Pending Franchises" value={String(franchises.filter((item) => item.status === 'pending').length)} icon={Shield} color="#f59e0b" />
        <Metric dm={dm} label="Approved Franchises" value={String(franchises.filter((item) => item.status === 'approved').length)} icon={CheckCircle2} color="#22c55e" />
        <Metric dm={dm} label="Rejected Franchises" value={String(franchises.filter((item) => item.status === 'rejected').length)} icon={XCircle} color="#ef4444" />
        <Metric dm={dm} label="Active Tricycles" value={String(franchises.filter((item) => item.tricycleStatus === 'approved').length)} icon={Car} color="#3b82f6" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-red-400" />
          <h2 className={`text-lg font-black uppercase tracking-wide ${dm ? 'text-white' : 'text-gray-900'}`}>Franchise Applications</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected', 'expired', 'revoked'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wide ${filter === item ? 'bg-red-600 text-white' : dm ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-600'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16">
          <Loader2 size={18} className="animate-spin text-red-400" />
          Loading franchise applications...
        </GlassCard>
      ) : visibleFranchises.length === 0 ? (
        <GlassCard dm={dm} className="py-14 text-center">
          <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No franchise records for this filter.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {visibleFranchises.map((item) => {
            const form = forms[item.franchiseId] || defaultFormState(item);
            const isPending = item.status === 'pending';
            const isBusy = busyFranchiseId === item.franchiseId;

            return (
              <GlassCard key={item.franchiseId} dm={dm}>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <h3 className={`text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{item.driverFullName}</h3>
                  <span className={chip(item.status, dm)}>{item.status}</span>
                  <span className={chip(item.membershipStatus, dm)}>{item.membershipStatus}</span>
                  {item.tricycleStatus && <span className={chip(item.tricycleStatus, dm)}>{item.tricycleStatus}</span>}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
                  <div className={`rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Driver & Vehicle</p>
                    <div className="space-y-2">
                      <p className={`flex items-center gap-2 text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>
                        <Mail size={14} className="text-red-400" />
                        {item.driverEmail}
                      </p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>TODA: {item.todaName || 'Not assigned'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Body Number: {item.bodyNumber || 'Not assigned'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Plate Number: {item.plateNumber || 'Not submitted'}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Submitted: {formatDateTime(item.createdAt)}</p>
                      <p className={`text-sm font-semibold ${dm ? 'text-gray-200' : 'text-gray-700'}`}>Reviewed: {formatDateTime(item.reviewedAt)}</p>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-4 ${dm ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Submitted Documents</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-white/5' : 'bg-white'}`}>
                        <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>TODA Certificate</p>
                        <DocumentLink value={item.todaCertificateDocument} dm={dm} />
                      </div>
                      <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-white/5' : 'bg-white'}`}>
                        <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>OR / CR</p>
                        <DocumentLink value={item.orCrDocument} dm={dm} />
                      </div>
                      <div className={`rounded-xl px-3 py-2 ${dm ? 'bg-white/5' : 'bg-white'}`}>
                        <p className={`mb-1 text-[10px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Insurance</p>
                        <DocumentLink value={item.insuranceDocument} dm={dm} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 rounded-2xl p-4 ${dm ? 'bg-slate-900/40' : 'bg-gray-50'}`}>
                  <p className={`mb-3 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Franchise Decision</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block">
                      <span className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                        <CalendarDays size={12} />
                        Issue Date
                      </span>
                      <input
                        type="date"
                        value={form.issueDate}
                        onChange={(event) => updateForm(item.franchiseId, 'issueDate', event.target.value)}
                        disabled={!isPending || isBusy}
                        className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold outline-none transition ${
                          dm ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                    </label>

                    <label className="block">
                      <span className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                        <CalendarDays size={12} />
                        Expiry Date
                      </span>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(event) => updateForm(item.franchiseId, 'expiryDate', event.target.value)}
                        disabled={!isPending || isBusy}
                        className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold outline-none transition ${
                          dm ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                    </label>

                    <label className="block xl:col-span-2">
                      <span className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Hash size={12} />
                        LGU Reference No.
                      </span>
                      <input
                        type="text"
                        value={form.lguReferenceNo}
                        onChange={(event) => updateForm(item.franchiseId, 'lguReferenceNo', event.target.value)}
                        disabled={!isPending || isBusy}
                        placeholder="LGU-2026-0001"
                        className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold outline-none transition ${
                          dm ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                    </label>
                  </div>

                  <label className="mt-3 block">
                    <span className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                      <FileText size={12} />
                      Remarks
                    </span>
                    <textarea
                      rows="3"
                      value={form.remarks}
                      onChange={(event) => updateForm(item.franchiseId, 'remarks', event.target.value)}
                      disabled={isBusy}
                      placeholder="Add approval notes, compliance details, or rejection reason."
                      className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold outline-none transition ${
                        dm ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-900'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />
                  </label>

                  <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                    <div className={`rounded-xl px-3 py-3 ${dm ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-600'}`}>
                      <p className="text-[10px] font-black uppercase tracking-wide">Approval Snapshot</p>
                      <p className="mt-1 text-sm font-semibold">Issued: {formatDate(item.issueDate)}</p>
                      <p className="text-sm font-semibold">Expires: {formatDate(item.expiryDate)}</p>
                      <p className="truncate text-sm font-semibold">Reference: {item.lguReferenceNo || 'Not assigned'}</p>
                      <p className="text-xs font-bold opacity-70">Reviewed by: {item.reviewedByName || 'Not yet reviewed'}</p>
                    </div>

                    {isPending && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleReview(item, 'approved')}
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-70"
                      >
                        {isBusy ? 'Processing...' : 'Approve Franchise'}
                      </button>
                    )}

                    {isPending && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleReview(item, 'rejected')}
                        className={`rounded-xl px-4 py-3 text-sm font-black ${dm ? 'bg-red-500/10 text-red-200 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'} disabled:opacity-70`}
                      >
                        {isBusy ? 'Processing...' : 'Reject Franchise'}
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
