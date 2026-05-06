import { useState, useEffect } from 'react';
import { Save, Settings2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { API_URL } from '../../services/api';

export default function FareSettingsTab({ dm }) {
  const [fare, setFare] = useState({ base_fare: 20, base_distance_km: 3, per_km_rate: 0.50 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFare();
  }, []);

  const fetchFare = async () => {
    try {
      const res = await fetch(`${API_URL}/fare/latest`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setFare({
          base_fare: Number(data.base_fare),
          base_distance_km: Number(data.base_distance_km),
          per_km_rate: Number(data.per_km_rate)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/fare/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fare)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Fare settings updated successfully.');
      } else {
        setMessage(data.error || 'Failed to update fare.');
      }
    } catch (err) {
      setMessage('Network error.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFare(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-6">
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
        <div className="flex h-40 items-center justify-center">
          <Loader2 className={`h-8 w-8 animate-spin ${dm ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
      ) : (
        <div className={`overflow-hidden rounded-3xl border ${dm ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'} shadow-sm`}>
          <div className={`border-b ${dm ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50/50'} px-6 py-5`}>
            <h3 className={`font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Global Pricing Configuration</h3>
          </div>
          
          <form onSubmit={handleSave} className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                  Base Fare (PHP)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-sm font-bold text-gray-400">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    name="base_fare"
                    value={fare.base_fare}
                    onChange={handleChange}
                    className={`block w-full rounded-2xl border bg-transparent py-3 pl-8 pr-4 text-sm font-bold focus:outline-none focus:ring-2 ${
                      dm
                        ? 'border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                        : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Initial cost for every ride.</p>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                  Base Distance (KM)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-gray-400"><MapPin size={16}/></span>
                  <input
                    type="number"
                    step="0.1"
                    name="base_distance_km"
                    value={fare.base_distance_km}
                    onChange={handleChange}
                    className={`block w-full rounded-2xl border bg-transparent py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:ring-2 ${
                      dm
                        ? 'border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                        : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Distance covered by base fare.</p>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                  Per KM Rate (PHP)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-sm font-bold text-gray-400">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    name="per_km_rate"
                    value={fare.per_km_rate}
                    onChange={handleChange}
                    className={`block w-full rounded-2xl border bg-transparent py-3 pl-8 pr-4 text-sm font-bold focus:outline-none focus:ring-2 ${
                      dm
                        ? 'border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20'
                        : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                <p className={`text-xs ${dm ? 'text-slate-500' : 'text-gray-400'}`}>Added cost per km exceeding base.</p>
              </div>
            </div>

            {message && (
              <div className={`mt-6 rounded-xl p-4 text-sm font-bold ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:opacity-70"
              >
                {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                {saving ? 'Saving...' : 'Apply Fare Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}