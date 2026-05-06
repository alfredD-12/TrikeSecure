import { useState, useEffect } from 'react';
import { Save, Settings2, MapPin, Loader2, History, Clock, User, TrendingUp, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../../services/api';

function GlassCard({ children, className = '', dm }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{
        background: dm ? 'rgba(255,255,255,0.03)' : '#ffffff',
        border: `1px solid ${dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 2px 16px rgba(0,0,0,0.06)',
      }}>
      {children}
    </div>
  );
}

export default function FareSettingsTab({ dm }) {
  const [fare, setFare] = useState({ base_fare: 20, base_distance_km: 3, per_km_rate: 0.50 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: true });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFare(), fetchHistory()]);
    setLoading(false);
  };

  const fetchFare = async () => {
    try {
      const res = await fetch(`${API_URL}/fare/latest`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setFare({
          base_fare: Number(data.base_fare),
          base_distance_km: Number(data.base_distance_km),
          per_km_rate: Number(data.per_km_rate),
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/fare/history`, { credentials: 'include' });
      if (res.ok) setHistory(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', ok: true });
    try {
      const res = await fetch(`${API_URL}/fare/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fare),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Fare settings applied successfully.', ok: true });
        await fetchHistory(); // refresh history immediately
      } else {
        setMessage({ text: data.error || 'Failed to update fare.', ok: false });
      }
    } catch {
      setMessage({ text: 'Network error.', ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', ok: true }), 4000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFare(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const inputCls = `block w-full rounded-xl border bg-transparent py-3 pl-8 pr-4 text-sm font-bold focus:outline-none focus:ring-2 ${
    dm
      ? 'border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
      : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
  }`;

  const labelCls = `text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-400' : 'text-gray-500'}`;

  return (
    <div className="space-y-6" style={{ animation: 'c-page-in 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>
            Fare Settings
          </h2>
          <p className={`mt-1 text-sm font-medium ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
            Adjust the formula used for calculating automated distance-based fares.
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dm ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <Settings2 size={24} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-3">
          <Loader2 className={`h-7 w-7 animate-spin ${dm ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <span className={`text-sm font-bold ${dm ? 'text-slate-400' : 'text-gray-500'}`}>Loading…</span>
        </div>
      ) : (
        <>
          {/* Config card */}
          <GlassCard dm={dm}>
            <div className={`flex items-center gap-3 border-b px-6 py-4 ${dm ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <TrendingUp size={16} className={dm ? 'text-indigo-400' : 'text-indigo-600'} />
              <h3 className={`font-black text-sm uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>
                Global Pricing Configuration
              </h3>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Base Fare */}
                <div className="space-y-2">
                  <label className={labelCls}>Base Fare (PHP)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold text-gray-400">₱</span>
                    <input type="number" step="0.01" name="base_fare"
                      value={fare.base_fare} onChange={handleChange} className={inputCls} />
                  </div>
                  <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Initial cost for every ride.</p>
                </div>

                {/* Base Distance */}
                <div className="space-y-2">
                  <label className={labelCls}>Base Distance (KM)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><MapPin size={14} /></span>
                    <input type="number" step="0.1" name="base_distance_km"
                      value={fare.base_distance_km} onChange={handleChange} className={inputCls} />
                  </div>
                  <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Distance covered by base fare.</p>
                </div>

                {/* Per KM Rate */}
                <div className="space-y-2">
                  <label className={labelCls}>Per KM Rate (PHP)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold text-gray-400">₱</span>
                    <input type="number" step="0.01" name="per_km_rate"
                      value={fare.per_km_rate} onChange={handleChange} className={inputCls} />
                  </div>
                  <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Added cost per km exceeding base.</p>
                </div>
              </div>

              {/* Preview formula */}
              <div className={`mt-5 rounded-xl px-4 py-3 text-xs font-bold ${dm ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-50 text-indigo-700'}`}>
                Formula: Fare = ₱{Number(fare.base_fare).toFixed(2)} + (distance − {Number(fare.base_distance_km).toFixed(1)} km) × ₱{Number(fare.per_km_rate).toFixed(2)}/km
              </div>

              {message.text && (
                <div className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
                  message.ok
                    ? (dm ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                    : (dm ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-700')
                }`}>
                  {message.ok && <CheckCircle2 size={15} />}
                  {message.text}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving…' : 'Apply Fare Settings'}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* History card */}
          <GlassCard dm={dm}>
            <div className={`flex items-center gap-3 border-b px-6 py-4 ${dm ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <History size={16} className={dm ? 'text-slate-400' : 'text-gray-500'} />
              <h3 className={`font-black text-sm uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>
                Fare Change History
              </h3>
              <span className={`ml-auto text-xs font-bold ${dm ? 'text-slate-500' : 'text-gray-400'}`}>
                {history.length} record{history.length !== 1 ? 's' : ''}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14">
                <History size={30} className={dm ? 'text-slate-700' : 'text-gray-300'} />
                <p className={`text-sm font-bold ${dm ? 'text-slate-500' : 'text-gray-400'}`}>No fare history yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${dm ? 'border-white/[0.05]' : 'border-gray-100'}`}>
                      {['', 'Date Applied', 'Base Fare', 'Base Distance', 'Per KM Rate', 'Set By'].map(h => (
                        <th key={h} className={`px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest ${dm ? 'text-slate-500' : 'text-gray-400'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => {
                      const isCurrent = i === 0;
                      const rowBg = isCurrent
                        ? (dm ? 'bg-indigo-500/05' : 'bg-indigo-50/60')
                        : '';
                      return (
                        <tr key={row.id}
                          className={`border-b transition-colors ${dm ? 'border-white/[0.04] hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'} ${rowBg}`}>
                          <td className="pl-6 pr-2 py-4 w-8">
                            {isCurrent && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                dm ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                <CheckCircle2 size={9} /> Current
                              </span>
                            )}
                          </td>
                          <td className={`px-6 py-4 font-semibold ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className={dm ? 'text-slate-500 shrink-0' : 'text-gray-400 shrink-0'} />
                              {new Date(row.effective_date).toLocaleString('en-PH', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className={`px-6 py-4 font-black ${isCurrent ? (dm ? 'text-indigo-300' : 'text-indigo-700') : (dm ? 'text-white' : 'text-gray-900')}`}>
                            ₱{Number(row.base_fare).toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 font-bold ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                            {Number(row.base_distance_km).toFixed(1)} km
                          </td>
                          <td className={`px-6 py-4 font-bold ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                            ₱{Number(row.per_km_rate).toFixed(2)}/km
                          </td>
                          <td className={`px-6 py-4 ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                            <div className="flex items-center gap-1.5">
                              <User size={11} className="shrink-0" />
                              <span className="font-semibold text-xs">{row.set_by_name || '—'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}