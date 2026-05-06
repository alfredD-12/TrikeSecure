import { useState, useEffect } from 'react';
import { Star, MessageSquareText, Search, Loader2 } from 'lucide-react';
import { API_URL } from '../../services/api';

export default function RatingsTab({ dm }) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_URL}/ratings/all`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRatings(data);
      }
    } catch (err) {
      console.error('Failed to fetch ratings', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter(r => 
    r.driver_name?.toLowerCase().includes(searchFilter.toLowerCase()) || 
    r.commuter_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.body_number?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-gray-900'}`}>
            Ride Ratings
          </h2>
          <p className={`mt-1 text-sm font-medium ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
            Review passenger feedback and driver performance scores.
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${dm ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
          <Star size={24} />
        </div>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search records by driver, passenger, or body number..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={`block w-full rounded-2xl border bg-transparent py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 ${
            dm
              ? 'border-slate-700 text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-yellow-500/20'
              : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20'
          }`}
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className={`h-8 w-8 animate-spin ${dm ? 'text-yellow-400' : 'text-yellow-600'}`} />
        </div>
      ) : filteredRatings.length === 0 ? (
        <div className={`rounded-3xl border border-dashed py-16 text-center ${dm ? 'border-slate-700' : 'border-gray-200'}`}>
          <MessageSquareText size={48} className={`mx-auto mb-4 opacity-50 ${dm ? 'text-slate-500' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>No ratings found</h3>
          <p className={`mt-1 text-sm font-bold ${dm ? 'text-slate-400' : 'text-gray-500'}`}>There is no passenger feedback matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRatings.map((rating) => (
            <div key={rating.rating_id} className={`flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
              dm ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800' : 'border-gray-200 bg-white hover:bg-gray-50'
            } transition-colors`}>
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < rating.rating_value ? 'currentColor' : 'none'} className={i < rating.rating_value ? 'text-yellow-400' : (dm ? 'text-slate-600' : 'text-gray-200')} />
                    ))}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className={`mt-2 text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>
                  Driver: {rating.driver_name} <span className="opacity-50 break-keep">#{rating.body_number || 'N/A'}</span>
                </h4>
                <p className={`text-sm font-bold ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                  "{rating.feedback || 'No feedback provided'}"
                </p>
                <p className={`mt-2 text-xs font-bold ${dm ? 'text-slate-500' : 'text-gray-400'}`}>
                  Left by {rating.commuter_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}