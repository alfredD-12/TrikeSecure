import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, FileText, Loader2, Users, XCircle, Eye, ExternalLink } from 'lucide-react';
import { getPresidentMembershipRequests, reviewPresidentMembershipRequest } from '../../services/api';

function chipClass(status) {
  const tone = String(status || 'unknown').toLowerCase();
  const palette = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
    president: 'border-blue-200 bg-blue-50 text-blue-700',
    member: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  };

  return `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${palette[tone] || 'border-slate-200 bg-slate-50 text-slate-700'}`;
}

function fieldClass() {
  return 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100';
}

function formatDateTime(value) {
  if (!value) return 'Not yet recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function PresidentMembershipTab({ enabled, pendingCount = 0, onAfterReview }) {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [requestData, setRequestData] = useState({ todaName: '', requests: [] });
  const [remarks, setRemarks] = useState({});

  async function loadRequests(nextStatus = statusFilter) {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getPresidentMembershipRequests(nextStatus);

    if (result?.requests) {
      setRequestData(result);
      setNotice(null);
    } else {
      setRequestData({ todaName: '', requests: [] });
      setNotice({ type: 'error', message: result.message || 'Failed to load membership requests.' });
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests(statusFilter);
  }, [statusFilter, enabled]);

  async function handleReview(driverId, status) {
    setReviewingId(driverId);
    const result = await reviewPresidentMembershipRequest(driverId, {
      status,
      remarks: remarks[driverId] || '',
    });

    if (result?.message && !result?.driver) {
      setNotice({ type: 'success', message: result.message });
      await loadRequests(statusFilter);
      if (onAfterReview) {
        await onAfterReview();
      }
    } else {
      setNotice({ type: 'error', message: result.message || 'Failed to review membership application.' });
    }

    setReviewingId(null);
  }

  if (!enabled) {
    return (
      <div className="rounded-[30px] border border-white/60 bg-white/90 p-6 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
          <Users size={24} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-black text-gray-900">President tools unavailable</h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          The membership review tab unlocks only after the LGU approves your TODA and your president membership record.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {notice && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.message}
        </div>
      )}

      <div className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">President Review Desk</p>
            <h2 className="mt-1 text-xl font-black text-gray-900">{requestData.todaName || 'TODA Membership Requests'}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{pendingCount} pending requests waiting for action.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatusFilter(item)}
                className={`rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-wide transition ${statusFilter === item ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[30px] border border-white/60 bg-white/90 px-6 py-12 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <Loader2 size={20} className="mx-auto mb-3 animate-spin text-red-500" />
          <p className="text-sm font-semibold text-slate-500">Loading membership requests...</p>
        </div>
      ) : requestData.requests.length === 0 ? (
        <div className="rounded-[30px] border border-white/60 bg-white/90 px-6 py-12 text-center shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <Clock3 size={20} className="mx-auto mb-3 text-slate-400" />
          <p className="text-sm font-semibold text-slate-500">No membership requests in this filter right now.</p>
        </div>
      ) : (
        requestData.requests.map((item) => (
          <div key={item.driverId} className="rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-gray-900">{item.fullName}</h3>
              <span className={chipClass(item.membershipStatus)}>{item.membershipStatus}</span>
              <span className={chipClass(item.membershipRole)}>{item.membershipRole}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">Driver Details</p>
                <div className="space-y-2 text-sm font-semibold text-slate-700">
                  <p>Email: {item.email}</p>
                  <p>License Number: {item.licenseNumber}</p>
                  <p>Contact Number: {item.contactNumber || 'Not provided'}</p>
                  <p>License Expiry: {item.licenseExpiryDate ? String(item.licenseExpiryDate).slice(0, 10) : 'Not provided'}</p>
                  <p>Applied: {formatDateTime(item.membershipAppliedAt)}</p>
                  <p>Reviewed: {formatDateTime(item.membershipReviewedAt)}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">Submitted Documents</p>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white px-3 py-2">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">Driver License File</p>
                    {item.driverLicenseDocument ? (
                      <a
                        href={item.driverLicenseDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
                      >
                        <Eye size={14} className="shrink-0 opacity-60 group-hover:opacity-100" />
                        <span className="truncate">{item.driverLicenseDocument.split(/[\\/]/).pop()}</span>
                        <ExternalLink size={12} className="shrink-0 opacity-40 group-hover:opacity-80" />
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-slate-400">Not submitted</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2">
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">Valid ID File</p>
                    {item.validIdDocument ? (
                      <a
                        href={item.validIdDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-500"
                      >
                        <Eye size={14} className="shrink-0 opacity-60 group-hover:opacity-100" />
                        <span className="truncate">{item.validIdDocument.split(/[\\/]/).pop()}</span>
                        <ExternalLink size={12} className="shrink-0 opacity-40 group-hover:opacity-80" />
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-slate-400">Not submitted</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Current Remarks: {item.membershipRemarks || 'No remarks yet'}</p>
                </div>
              </div>
            </div>

            {statusFilter === 'pending' && (
              <div className="mt-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    <FileText size={12} />
                    Review Remarks
                  </span>
                  <textarea
                    rows="3"
                    value={remarks[item.driverId] || ''}
                    onChange={(event) => setRemarks((current) => ({ ...current, [item.driverId]: event.target.value }))}
                    placeholder="Add any approval or rejection notes for this driver."
                    className={fieldClass()}
                  />
                </label>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={reviewingId === item.driverId}
                    onClick={() => handleReview(item.driverId, 'approved')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-70"
                  >
                    {reviewingId === item.driverId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve Membership
                  </button>
                  <button
                    type="button"
                    disabled={reviewingId === item.driverId}
                    onClick={() => handleReview(item.driverId, 'rejected')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-70"
                  >
                    {reviewingId === item.driverId ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject Membership
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
