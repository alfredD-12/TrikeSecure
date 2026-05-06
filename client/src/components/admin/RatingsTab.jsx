import { useEffect, useState, useMemo } from 'react';
import {
  Star, Search, X, Loader2, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, MessageSquareText, FileText,
  Car, Award, Building2, BarChart2
} from 'lucide-react';
import { getAdminRatings } from '../../services/api';

const PAGE_SIZE = 10;

const ANIM_CSS = `
@keyframes r-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bar-grow {
  from { width: 0%; }
}`;

function GlassCard({ children, className = '', dm = true, style = {} }) {
  return (
    <div className={`rounded-2xl backdrop-blur-xl transition-colors duration-300 ${className}`}
      style={{
        background: dm ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: dm ? '0 8px 32px rgba(0,0,0,0.2)' : '0 4px 24px rgba(0,0,0,0.06)',
        ...style,
      }}
    >{children}</div>
  );
}

function Banner({ notice, dm }) {
  if (!notice) return null;
  const tone = notice.type === 'success'
    ? (dm ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
    : (dm ? 'bg-red-500/10 text-red-200 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200');
  return <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold ${tone}`}>{notice.message}</div>;
}

/* ── Stars ── */
function Stars({ rating, size = 14, dm }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size}
          className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : dm ? 'text-gray-700' : 'text-gray-300'} />
      ))}
    </div>
  );
}

/* ── Avatar initials ── */
function Avatar({ name, size = 40, color = '#ef4444' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0"
      style={{ width: size, height: size, background: color + '22', color, border: `1.5px solid ${color}40` }}>
      {initials}
    </div>
  );
}

/* ── Pager ── */
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
          ? <span key={'d' + i} className={`px-2 text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>…</span>
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

/* ── Individual rating list card ── */
function RatingCard({ rating, dm }) {
  const val = rating.rating_value;
  const color = val >= 4 ? '#22c55e' : val === 3 ? '#facc15' : '#ef4444';
  return (
    <div className="flex items-stretch gap-0 rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: dm ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
      {/* Color accent side bar */}
      <div className="w-1 shrink-0" style={{ background: color }} />

      {/* Star score badge */}
      <div className="shrink-0 w-14 flex flex-col items-center justify-center gap-0.5 px-2 py-3"
        style={{ background: color + '0e' }}>
        <span className="text-xl font-black" style={{ color }}>{val}</span>
        <Star size={11} style={{ color }} className="fill-current" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        {rating.feedback ? (
          <p className={`text-[12px] font-semibold leading-relaxed mb-2 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>
            "{rating.feedback}"
          </p>
        ) : (
          <p className={`text-[12px] font-semibold italic mb-2 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
            No feedback provided
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`flex items-center gap-1.5 text-[11px] font-bold ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
            <Car size={10} className="shrink-0" />
            {rating.driver_name}
            <span className={`font-semibold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>#{rating.body_number || 'N/A'}</span>
          </span>
          {rating.toda_name && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${dm ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
              {rating.toda_name}
            </span>
          )}
          <span className={`ml-auto text-[10px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
            {new Date(rating.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Tab ── */
export default function RatingsTab({ dm }) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [notice, setNotice]   = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getAdminRatings();
      if (Array.isArray(result)) setRatings(result);
      else setNotice({ type: 'error', message: result.message || 'Failed to load ratings.' });
      setLoading(false);
    }
    loadData();
  }, []);

  /* Aggregations */
  const { driverList, topToda } = useMemo(() => {
    const dMap = {}, tMap = {};
    ratings.forEach(r => {
      const did = r.driver_id || r.driver_name;
      if (!dMap[did]) dMap[did] = { id: did, name: r.driver_name, body: r.body_number, toda: r.toda_name, sum: 0, count: 0 };
      dMap[did].sum += r.rating_value;
      dMap[did].count += 1;

      const tname = r.toda_name || '__none__';
      if (!tMap[tname]) tMap[tname] = { name: r.toda_name, sum: 0, count: 0, dids: new Set() };
      tMap[tname].sum += r.rating_value;
      tMap[tname].count += 1;
      tMap[tname].dids.add(did);
    });

    const driverList = Object.values(dMap)
      .map(d => ({ ...d, avg: d.sum / d.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count);

    const todaArr = Object.entries(tMap)
      .filter(([k]) => k !== '__none__')
      .map(([, t]) => ({
        name: t.name,
        avg: t.sum / t.count,
        count: t.count,
        topDrivers: [...t.dids]
          .map(did => dMap[did])
          .filter(Boolean)
          .map(d => ({ ...d, avg: d.sum / d.count }))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 3),
      }))
      .sort((a, b) => b.avg - a.avg);

    return { driverList, topToda: todaArr[0] || null };
  }, [ratings]);

  const topDriver    = driverList[0] || null;
  const bottomDriver = driverList.length > 1 ? driverList[driverList.length - 1] : null;

  const totalCount = ratings.length;
  const avgRating  = totalCount ? (ratings.reduce((s, r) => s + r.rating_value, 0) / totalCount) : 0;

  const dist = useMemo(() => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => { d[r.rating_value] = (d[r.rating_value] || 0) + 1; });
    return d;
  }, [ratings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ratings;
    return ratings.filter(r =>
      [r.driver_name, r.body_number, r.toda_name, r.feedback].some(v => (v || '').toString().toLowerCase().includes(q))
    );
  }, [ratings, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function goPage(p)      { setPage(Math.min(Math.max(1, p), Math.ceil(filtered.length / PAGE_SIZE))); }
  function handleSearch(v){ setSearch(v); setPage(1); }

  const inputCls = `w-full bg-transparent border-none outline-none text-sm font-semibold ${dm ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`;

  return (
    <div>
      <style>{ANIM_CSS}</style>
      <Banner notice={notice} dm={dm} />

      {/* ── Top stat strip ── */}
      <div className="mb-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Avg rating — special card */}
        <GlassCard dm={dm} className="p-5 col-span-2 xl:col-span-1">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Average Rating</p>
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-5xl font-black leading-none ${dm ? 'text-white' : 'text-gray-900'}`}>{avgRating.toFixed(1)}</span>
            <span className={`text-lg font-bold mb-1 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>/&nbsp;5</span>
          </div>
          <Stars rating={avgRating} size={15} dm={dm} />
          <p className={`mt-2 text-[10px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>{totalCount} total review{totalCount !== 1 ? 's' : ''}</p>
        </GlassCard>

        {[
          { label: '5-Star Ratings',  value: dist[5],   color: '#22c55e', icon: TrendingUp },
          { label: 'With Feedback',   value: ratings.filter(r => r.feedback?.trim()).length, color: '#14b8a6', icon: MessageSquareText },
          { label: 'Drivers Rated',   value: driverList.length, color: '#6366f1', icon: FileText },
        ].map(({ label, value, color, icon: Icon }) => (
          <GlassCard key={label} dm={dm} className="p-5">
            <div className="mb-3 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: color + '18', border: `1px solid ${color}28` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className={`text-3xl font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── Insight row ── */}
      {totalCount > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Distribution */}
          <GlassCard dm={dm} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={14} className="text-indigo-400" />
              <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Distribution</p>
            </div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = dist[stars];
                const pct   = totalCount ? (count / totalCount) * 100 : 0;
                const color = stars >= 4 ? '#22c55e' : stars === 3 ? '#facc15' : '#ef4444';
                return (
                  <div key={stars} className="flex items-center gap-2.5">
                    <span className={`w-3 text-[11px] font-black text-right shrink-0 ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{stars}</span>
                    <Star size={9} className="shrink-0 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: pct + '%', background: color, transition: 'width 0.8s ease' }} />
                    </div>
                    <span className={`w-5 text-right text-[10px] font-black shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Driver spotlights — stacked */}
          <div className="flex flex-col gap-3">
            {/* Highest */}
            {topDriver && (
              <GlassCard dm={dm} className="p-4 flex-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <Award size={12} className="text-yellow-400" />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Highest Rated</p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={topDriver.name} color="#facc15" size={38} />
                  <div className="min-w-0">
                    <p className={`font-black text-sm truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{topDriver.name}</p>
                    <p className={`text-[10px] font-semibold truncate ${dm ? 'text-gray-500' : 'text-gray-400'}`}>#{topDriver.body || 'N/A'} · {topDriver.toda || 'No TODA'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Stars rating={topDriver.avg} size={12} dm={dm} />
                  <span className={`text-[11px] font-bold ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{topDriver.avg.toFixed(1)} · {topDriver.count} rating{topDriver.count > 1 ? 's' : ''}</span>
                </div>
              </GlassCard>
            )}
            {/* Lowest */}
            {bottomDriver && (
              <GlassCard dm={dm} className="p-4 flex-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingDown size={12} className="text-red-400" />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Needs Improvement</p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={bottomDriver.name} color="#ef4444" size={38} />
                  <div className="min-w-0">
                    <p className={`font-black text-sm truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{bottomDriver.name}</p>
                    <p className={`text-[10px] font-semibold truncate ${dm ? 'text-gray-500' : 'text-gray-400'}`}>#{bottomDriver.body || 'N/A'} · {bottomDriver.toda || 'No TODA'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Stars rating={bottomDriver.avg} size={12} dm={dm} />
                  <span className={`text-[11px] font-bold ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{bottomDriver.avg.toFixed(1)} · {bottomDriver.count} rating{bottomDriver.count > 1 ? 's' : ''}</span>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Top TODA leaderboard */}
          {topToda && (
            <GlassCard dm={dm} className="p-5">
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 size={12} className="text-indigo-400" />
                <p className={`text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Top Rated TODA</p>
              </div>
              <p className={`font-black text-base leading-tight mb-0.5 mt-3 ${dm ? 'text-white' : 'text-gray-900'}`}>{topToda.name}</p>
              <div className="flex items-center gap-2 mb-4">
                <Stars rating={topToda.avg} size={11} dm={dm} />
                <span className={`text-[10px] font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{topToda.avg.toFixed(1)} avg · {topToda.count} rating{topToda.count > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {topToda.topDrivers.map((d, i) => {
                  const rankColors = ['#facc15', '#94a3b8', '#cd7c2f'];
                  const rc = rankColors[i] || '#6b7280';
                  return (
                    <div key={d.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      style={{ background: dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                      <span className="text-[11px] font-black w-4 text-center" style={{ color: rc }}>#{i + 1}</span>
                      <Avatar name={d.name} color={rc} size={26} />
                      <span className={`flex-1 text-[11px] font-bold truncate ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{d.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={9} className="text-yellow-400 fill-yellow-400" />
                        <span className={`text-[11px] font-black ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{d.avg.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── Search + list ── */}
      <div className="mb-4">
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ${dm ? 'bg-white/5 border border-white/[0.07]' : 'bg-white border border-gray-200'}`}>
          <Search size={15} className={`shrink-0 ${dm ? 'text-gray-500' : 'text-gray-400'}`} />
          <input className={inputCls}
            placeholder="Search by driver, body number, TODA, or feedback text…"
            value={search} onChange={e => handleSearch(e.target.value)} />
          {search && (
            <button onClick={() => handleSearch('')} className={`shrink-0 ${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
        <h2 className={`text-sm font-black uppercase tracking-widest ${dm ? 'text-white' : 'text-gray-900'}`}>Recent Ratings</h2>
        <span className={`ml-auto text-xs font-bold ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <GlassCard dm={dm} className="flex items-center justify-center gap-3 py-16">
          <Loader2 size={18} className="animate-spin text-red-400" />
          <span className={dm ? 'text-gray-400' : 'text-gray-500'}>Loading ratings…</span>
        </GlassCard>
      ) : paginated.length === 0 ? (
        <GlassCard dm={dm} className="py-14 text-center">
          <MessageSquareText size={32} className={`mx-auto mb-3 ${dm ? 'text-gray-700' : 'text-gray-300'}`} />
          <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No ratings match your filters.</p>
        </GlassCard>
      ) : (
        <div key={'rp-' + page + search} style={{ animation: 'r-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards' }} className="space-y-2">
          {paginated.map(r => <RatingCard key={r.rating_id} rating={r} dm={dm} />)}
        </div>
      )}

      <Pager page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={goPage} dm={dm} />

      {!loading && filtered.length > 0 && (
        <p className={`mt-3 text-center text-[11px] font-bold ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
      )}
    </div>
  );
}