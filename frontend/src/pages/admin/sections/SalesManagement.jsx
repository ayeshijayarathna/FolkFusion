import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  TrendingUp, DollarSign, ShoppingBag, Package, Download,
  Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  RefreshCw, Award, BarChart3, Eye, Star, Users,
  ShoppingCart, Layers, Tag, Sparkles, CheckCircle2, XCircle,
  Trophy, Crown, Medal
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { marketplaceAPI, artistAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// helpers
const fmt = (n) =>
  new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n ?? 0);
const fmtNum = (n) => new Intl.NumberFormat().format(n ?? 0);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PERIOD_OPTIONS = [
  { value: 'today',  label: 'Today'        },
  { value: 'week',   label: 'This Week'    },
  { value: 'month',  label: 'This Month'   },
  { value: 'year',   label: 'This Year'    },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all',    label: 'All Time'     },
];

// csv export
const exportToCSV = (sales, province) => {
  if (!sales?.length) { alert('No records to export.'); return; }
  const headers = [
    'Order Date','Item','Category','Artist',
    'Quantity','Unit Price (LKR)','Shipping (LKR)','Total (LKR)',
    'Payment Method','Payment Status','Order Status',
    'Buyer Name','Buyer Email','Buyer Phone',
  ];
  const rows = sales.map(s => [
    s.orderDate ? new Date(s.orderDate).toLocaleDateString('en-GB') : '',
    s.marketplaceItem?.listingTitle ?? '',
    s.marketplaceItem?.artwork?.category ?? '',
    s.artist?.fullName ?? '',
    s.quantity ?? 0, s.unitPrice ?? 0, s.shippingCost ?? 0, s.totalAmount ?? 0,
    s.paymentMethod ?? '', s.paymentStatus ?? '', s.orderStatus ?? '',
    s.buyer?.name ?? '', s.buyer?.email ?? '', s.buyer?.phone ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `sales_${province}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

//status map
const ORDER_STATUS_MAP = {
  pending:    { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending'    },
  confirmed:  { bg: 'bg-cyan-100',   text: 'text-cyan-700',   label: 'Confirmed'  },
  processing: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Processing' },
  shipped:    { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Shipped'    },
  delivered:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Delivered'  },
  cancelled:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled'  },
};
const PAYMENT_STATUS_MAP = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending'   },
  completed: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
  failed:    { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Failed'    },
  refunded:  { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Refunded'  },
};

//badge
const Badge = ({ val, map }) => {
  const info = map[val] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: val ?? '—' };
  return (
    <span className={`px-3 py-1 ${info.bg} ${info.text} rounded-full text-xs font-semibold whitespace-nowrap`}>
      {info.label}
    </span>
  );
};

//sales chart
const SalesAreaChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-52 text-[#2E2E2E]/30 text-sm">
        No chart data available
      </div>
    );
  }

  //group data by year, then month
  const byYear = {};
  data.forEach(d => {
    const y = String(d._id?.year);
    if (!byYear[y]) byYear[y] = {};
    byYear[y][MONTHS[(d._id?.month ?? 1) - 1]] = d.revenue;
  });

  const years = Object.keys(byYear).sort();

  // always show all 12 months — missing months get 0
  const chartData = MONTHS.map(month => {
    const row = { month };
    years.forEach(y => { row[y] = byYear[y][month] ?? 0; });
    return row;
  });

  const COLORS = ['#5F8B8C', '#A67C52', '#8DAA91', '#C48A6A', '#D4AF37'];

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#8DAA91]/30 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-[#4A3F35] mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          {years.map((y, i) => (
            <linearGradient key={y} id={`grad-${y}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS[i % COLORS.length]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}    />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#8DAA9122" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#2E2E2E99', fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 10, fill: '#2E2E2E66' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v}
        />
        <Tooltip content={customTooltip} />
        {years.length > 1 && <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, color: '#4A3F35' }} />}
        {years.map((y, i) => (
          <Area
            key={y} type="monotone" dataKey={y}
            stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
            fill={`url(#grad-${y})`} dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// artist revenue modal
const ArtistRevenueModal = ({ artistId, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.getArtistRevenue(artistId, { period });
      setData(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [artistId, period]);

  useEffect(() => { load(); }, [load]);

  const photoUrl = data?.artist?.profileImage?.url || data?.artist?.profilePhoto || null;

  // build chart data for modal
  const modalChartData = useMemo(() => {
    if (!data?.monthlyTrend?.length) return [];
    return data.monthlyTrend;
  }, [data]);

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-[#8DAA91]/20 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {photoUrl
              ? <img src={photoUrl} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-[#8DAA91]/30" />
              : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C] flex items-center justify-center text-white font-bold text-base">
                  {data?.artist?.fullName?.[0] ?? '?'}
                </div>
            }
            <div>
              <p className="font-bold text-[#4A3F35]">{data?.artist?.fullName ?? 'Artist'}</p>
              <p className="text-xs text-[#5F8B8C]">{data?.artist?.email ?? ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="text-xs border-2 border-[#8DAA91]/20 rounded-lg px-3 py-2 text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]">
              {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <XCircle size={20} className="text-[#2E2E2E]/60" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8DAA91] border-t-transparent" />
            </div>
          ) : !data ? (
            <p className="text-center text-[#2E2E2E]/40 py-12">Failed to load data.</p>
          ) : (
            <>
              {/* summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Revenue',  value: fmt(data.summary.totalRevenue),     icon: <DollarSign size={18}/>,    bg: 'bg-[#5F8B8C]/10', ic: 'text-[#5F8B8C]'  },
                  { label: 'Sales',    value: fmtNum(data.summary.totalSales),    icon: <ShoppingBag size={18}/>,   bg: 'bg-[#A67C52]/10', ic: 'text-[#A67C52]'  },
                  { label: 'Units',    value: fmtNum(data.summary.totalQuantity), icon: <Package size={18}/>,       bg: 'bg-[#8DAA91]/10', ic: 'text-[#8DAA91]'  },
                  { label: 'Listings', value: fmtNum(data.summary.totalListings), icon: <ShoppingCart size={18}/>, bg: 'bg-yellow-50',    ic: 'text-yellow-500' },
                ].map(({ label, value, icon, bg, ic }) => (
                  <div key={label} className="bg-[#F4EDE4]/40 rounded-xl p-4">
                    <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center ${ic} mb-3`}>{icon}</div>
                    <p className="text-lg font-bold text-[#4A3F35]">{value}</p>
                    <p className="text-xs text-[#2E2E2E]/50 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* monthly trend chart */}
              {modalChartData.length > 0 && (
                <div className="bg-[#F4EDE4]/30 rounded-xl p-5">
                  <p className="text-sm font-bold text-[#4A3F35] flex items-center gap-2 mb-4">
                    <BarChart3 size={16} className="text-[#5F8B8C]" /> Monthly Revenue Trend
                  </p>
                  <SalesAreaChart data={modalChartData} />
                </div>
              )}

              {/* item breakdown */}
              {data.itemBreakdown?.length > 0 && (
                <div className="bg-white rounded-xl border border-[#8DAA91]/15 overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#8DAA91]/10">
                    <p className="text-sm font-bold text-[#4A3F35] flex items-center gap-2">
                      <ShoppingBag size={15} className="text-[#A67C52]" /> Sales by Listing
                    </p>
                  </div>
                  <div className="divide-y divide-[#8DAA91]/10">
                    {data.itemBreakdown.map((item) => {
                      const pct = Math.round((item.revenue / (data.itemBreakdown[0]?.revenue || 1)) * 100);
                      return (
                        <div key={item.itemId} className="px-5 py-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 pr-4">
                              <p className="text-sm font-semibold text-[#4A3F35]">{item.title}</p>
                              <p className="text-xs text-[#5F8B8C] mt-0.5 flex items-center gap-1">
                                <Tag size={9} />{item.category} · {fmtNum(item.quantity)} units · {fmtNum(item.sales)} orders
                              </p>
                            </div>
                            <p className="text-sm font-bold text-[#A67C52]">{fmt(item.revenue)}</p>
                          </div>
                          <div className="h-1.5 bg-[#8DAA91]/15 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#A67C52] to-[#C48A6A] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* listings table */}
              {data.listings?.length > 0 && (
                <div className="bg-white rounded-xl border border-[#8DAA91]/15 overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#8DAA91]/10">
                    <p className="text-sm font-bold text-[#4A3F35] flex items-center gap-2">
                      <Layers size={15} className="text-[#8DAA91]" /> Current Listings ({data.listings.length})
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#8DAA91]/10">
                        <tr>
                          {['Item','Category','Price','Status','Sales','Revenue'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-bold text-[#4A3F35] uppercase tracking-wider text-[10px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8DAA91]/10">
                        {data.listings.map((l) => (
                          <tr key={l._id} className="hover:bg-[#F4EDE4]/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#4A3F35] max-w-[140px] truncate">{l.title}</td>
                            <td className="px-4 py-3 text-[#5F8B8C]">{l.category}</td>
                            <td className="px-4 py-3 font-bold text-[#A67C52]">{fmt(l.price?.amount ?? 0)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#2E2E2E]/60">{fmtNum(l.totalSales)}</td>
                            <td className="px-4 py-3 font-bold text-[#A67C52]">{fmt(l.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!data.itemBreakdown?.length && !data.listings?.length && (
                <div className="text-center py-12 text-[#2E2E2E]/30">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No sales or listings found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// top artists by revenue
const TopArtistsByRevenue = ({ onViewRevenue }) => {
  const [artists,  setArtists]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(new Set());
  const initialised = useRef(false);

  const load = useCallback(async ({ syncFromDB = false } = {}) => {
    try {
      setLoading(true); setError('');
      const res  = await artistAPI.getTopArtistsByRevenue();
      const list = res.data.data ?? [];
      setArtists(list);
      if (!initialised.current || syncFromDB) {
        setSelected(new Set(list.filter(a => a.isFeatured).map(a => a.artistId)));
        initialised.current = true;
      }
    } catch (e) { setError('Failed to load top artists data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load({ syncFromDB: true }); }, [load]);

  const toggleSelect = (artistId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(artistId)) { next.delete(artistId); }
      else {
        if (next.size >= 10) { alert('Maximum 10 featured artists allowed.'); return prev; }
        next.add(artistId);
      }
      return next;
    });
  };

  const saveFeatured = async () => {
    try {
      setSaving(true); setError(''); setSavedMsg('');
      const artistIds = Array.from(selected);
      if (artistIds.length === 0) {
        await artistAPI.clearAllFeatured();
        setSavedMsg('All artists removed from featured list.');
      } else {
        const ranks = {};
        artistIds.forEach((id, idx) => { ranks[id] = idx + 1; });
        await artistAPI.setFeaturedBulk({ artistIds, ranks });
        setSavedMsg(`${artistIds.length} artists marked as featured successfully!`);
      }
      await load({ syncFromDB: true });
    } catch (e) { setError('Failed to save featured artists. Please try again.'); }
    finally { setSaving(false); }
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={16} className="text-yellow-400" />;
    if (rank === 2) return <Trophy size={16} className="text-gray-400" />;
    if (rank === 3) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-xs font-bold text-[#2E2E2E]/40 w-4 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-4">
      {/* header card */}
      <div className="bg-white rounded-xl p-6 shadow-md flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-[#4A3F35] flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-500" /> Top Artists by Revenue
          </h3>
          <p className="text-sm text-[#2E2E2E]/60 mt-1">
            Select up to 10 artists to feature — sorted by total completed revenue.
          </p>
          {selected.size > 0 && (
            <p className="text-xs font-bold text-yellow-600 mt-2">{selected.size} / 10 selected for featuring</p>
          )}
          {selected.size === 0 && initialised.current && (
            <p className="text-xs text-[#2E2E2E]/40 mt-2">No artists selected — saving will clear the featured list</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => load({ syncFromDB: false })}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#8DAA91]/30 text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all text-sm font-semibold">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={saveFeatured} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
            <Star size={14} fill="white" /> {saving ? 'Saving…' : 'Save Featured List'}
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-2 text-green-700 text-sm font-semibold">
          <CheckCircle2 size={16} /> {savedMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent" />
        </div>
      ) : artists.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Trophy size={42} className="text-[#2E2E2E]/20 mx-auto mb-3" />
          <p className="text-[#2E2E2E]/50 text-sm">No sales data available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {artists.map((artist) => {
            const isSel   = selected.has(artist.artistId);
            const photo   = artist.profileImage?.url || artist.profilePhoto;
            const selRank = isSel ? Array.from(selected).indexOf(artist.artistId) + 1 : null;
            const pct     = artists[0]?.totalRevenue > 0
              ? Math.round((artist.totalRevenue / artists[0].totalRevenue) * 100) : 0;

            return (
              <div key={artist.artistId}
                className={`bg-white rounded-xl px-5 py-4 shadow-md flex items-center gap-4 transition-all border-2 ${isSel ? 'border-yellow-400' : 'border-transparent'}`}>

                {/* rank */}
                <div className="w-8 flex-shrink-0 flex justify-center">{rankIcon(artist.rank)}</div>

                {/* avatar */}
                <div className={`w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 ${isSel ? 'border-yellow-400' : 'border-[#8DAA91]/20'}`}>
                  {photo
                    ? <img src={photo} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-[#8DAA91] to-[#5F8B8C] flex items-center justify-center text-white font-bold text-lg">
                        {artist.fullName?.[0] ?? '?'}
                      </div>
                  }
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#4A3F35]">{artist.fullName}</span>
                    {artist.isFeatured && !isSel && (
                      <span className="text-[10px] bg-[#A67C52]/10 text-[#A67C52] rounded-full px-2 py-0.5 font-bold">WAS FEATURED</span>
                    )}
                    {isSel && (
                      <span className="text-[10px] bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
                        <Star size={9} fill="currentColor" /> SELECTED #{selRank}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5F8B8C] mt-0.5">
                    {(artist.specialization || []).slice(0, 2).join(', ') || 'Artist'}
                  </p>
                  <div className="flex gap-4 mt-1.5 flex-wrap">
                    <span className="text-xs text-[#2E2E2E]/70">
                      <strong className="text-[#A67C52]">{fmt(artist.totalRevenue)}</strong> revenue
                    </span>
                    <span className="text-xs text-[#2E2E2E]/50">{fmtNum(artist.totalSales)} sales</span>
                    <span className="text-xs text-[#2E2E2E]/50">{fmtNum(artist.totalQuantity)} units</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-[#8DAA91]/15 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isSel ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-[#8DAA91] to-[#5F8B8C]'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => onViewRevenue(artist.artistId)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#5F8B8C]/10 text-[#5F8B8C] rounded-lg hover:bg-[#5F8B8C]/20 transition-all text-xs font-bold">
                    <Eye size={13} /> Revenue
                  </button>
                  <button onClick={() => toggleSelect(artist.artistId)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${isSel
                      ? 'bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white border-transparent'
                      : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'}`}>
                    {isSel ? <><XCircle size={13} /> Deselect</> : <><Star size={13} /> Feature</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {artists.length > 0 && (
        <div className="bg-[#F4EDE4]/50 border border-[#A67C52]/20 rounded-xl px-5 py-3 text-xs text-[#2E2E2E]/60">
          <strong className="text-[#A67C52]">How it works:</strong> Select up to 10 artists, then click <em>Save Featured List</em>.
          The previous featured list is replaced in the database.
        </div>
      )}
    </div>
  );
};

// overview section with revenue trend, top artists and top items
const OverviewSection = ({ chartData, topArtists, topItems, loading, onViewArtist }) => (
  <div className="space-y-5">
    {/* chart card */}
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-[#4A3F35]">Revenue Trend</h3>
          <p className="text-xs text-[#2E2E2E]/50 mt-1">Monthly completed sales revenue — multiple years shown side-by-side</p>
        </div>
        <div className="flex items-center gap-2 bg-[#5F8B8C]/10 rounded-lg px-3 py-2">
          <BarChart3 size={14} className="text-[#5F8B8C]" />
          <span className="text-xs font-bold text-[#5F8B8C]">{chartData.length} data points</span>
        </div>
      </div>
      {loading
        ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8DAA91] border-t-transparent" /></div>
        : <SalesAreaChart data={chartData} />
      }
    </div>

    {/* top artists ,top items */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* top Artists */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-[#4A3F35] flex items-center gap-2 mb-4">
          <Award size={16} className="text-yellow-500" /> Top Artists
        </h3>
        {topArtists.length === 0 ? (
          <div className="text-center py-8 text-[#2E2E2E]/30">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No sales data yet</p>
          </div>
        ) : topArtists.map((a, i) => {
          const medals = [
            <Crown key="c" size={14} className="text-yellow-400" />,
            <Trophy key="t" size={14} className="text-gray-400" />,
            <Medal key="m" size={14} className="text-amber-600" />,
          ];
          return (
            <div key={i} className={`flex items-center gap-3 py-3 ${i < topArtists.length - 1 ? 'border-b border-[#8DAA91]/10' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-50 text-yellow-600' : i === 1 ? 'bg-gray-50 text-gray-500' : i === 2 ? 'bg-amber-50 text-amber-600' : 'bg-[#8DAA91]/10 text-[#4A3F35]'}`}>
                {i < 3 ? medals[i] : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#4A3F35] truncate">{a._id?.fullName ?? '—'}</p>
                <p className="text-xs text-[#2E2E2E]/50">{fmtNum(a.totalSales)} completed sales</p>
              </div>
              <button onClick={() => onViewArtist(a._id?._id)}
                className="text-xs font-bold text-[#5F8B8C] bg-[#5F8B8C]/10 px-3 py-1.5 rounded-lg hover:bg-[#5F8B8C]/20 transition-all flex-shrink-0">
                {fmt(a.totalRevenue)}
              </button>
            </div>
          );
        })}
      </div>

      {/*top items */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-[#4A3F35] flex items-center gap-2 mb-4">
          <Star size={16} className="text-yellow-500" fill="currentColor" /> Top Items
        </h3>
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-[#2E2E2E]/30">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No sales data yet</p>
          </div>
        ) : topItems.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 py-3 ${i < topItems.length - 1 ? 'border-b border-[#8DAA91]/10' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-[#A67C52]/10 flex items-center justify-center text-xs font-bold text-[#A67C52] flex-shrink-0">
              #{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#4A3F35] truncate">{item._id?.listingTitle ?? '—'}</p>
              <p className="text-xs text-[#2E2E2E]/50 truncate">{item._id?.artist?.fullName ?? '—'} · {fmtNum(item.totalSales)} sold</p>
            </div>
            <p className="text-sm font-bold text-[#A67C52] flex-shrink-0">{fmt(item.totalRevenue)}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

//main component
const SalesManagement = () => {
  const { user }  = useAuth();
  const province  = user?.province ?? '';

  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error,        setError]        = useState(null);

  const [period,    setPeriod]    = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');

  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [paymentFilter,  setPaymentFilter]  = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy,         setSortBy]         = useState('-orderDate');

  const [activeTab, setActiveTab] = useState('overview');
  const [page,      setPage]      = useState(1);
  const PAGE_SIZE = 15;

  const [viewSale,    setViewSale]    = useState(null);
  const [artistRevId, setArtistRevId] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true); setLoadingSales(true); setError(null);
      const params = {};
      if (period !== 'all' && period !== 'custom') params.period = period;
      if (period === 'custom' && startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      const res = await marketplaceAPI.getProvinceSalesStats(params);
      setStats(res.data.data);
    } catch (e) { setError('Failed to load sales data. Please try again.'); }
    finally { setLoading(false); setLoadingSales(false); }
  }, [period, startDate, endDate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const allSales          = stats?.allSales          ?? [];
  const summary           = stats?.summary           ?? {};
  const chartData         = stats?.salesByPeriod     ?? [];
  const topArtists        = stats?.topArtists        ?? [];
  const topItems          = stats?.topItems          ?? [];
  const categoryBreakdown = stats?.categoryBreakdown ?? [];

  const uniqueCategories = useMemo(() => {
    const cats = new Set(allSales.map(s => s.marketplaceItem?.artwork?.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allSales]);

  const filteredSales = useMemo(() => {
    let s = [...allSales];
    if (search) {
      const q = search.toLowerCase();
      s = s.filter(sale =>
        sale.marketplaceItem?.listingTitle?.toLowerCase().includes(q) ||
        sale.buyer?.name?.toLowerCase().includes(q) ||
        sale.buyer?.email?.toLowerCase().includes(q) ||
        sale.artist?.fullName?.toLowerCase().includes(q) ||
        (sale.marketplaceItem?.artwork?.category ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter   !== 'all') s = s.filter(sale => sale.orderStatus   === statusFilter);
    if (paymentFilter  !== 'all') s = s.filter(sale => sale.paymentStatus === paymentFilter);
    if (categoryFilter !== 'all') s = s.filter(sale => (sale.marketplaceItem?.artwork?.category ?? '') === categoryFilter);
    const [field, dir] = sortBy.startsWith('-') ? [sortBy.slice(1), -1] : [sortBy, 1];
    s.sort((a, b) => {
      let av = a[field], bv = b[field];
      if (field === 'orderDate') { av = new Date(av); bv = new Date(bv); }
      return dir * (av > bv ? 1 : av < bv ? -1 : 0);
    });
    return s;
  }, [allSales, search, statusFilter, paymentFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const pagedSales = filteredSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const TABS = [
    { key: 'overview',          label: 'Overview'          },
    { key: 'sales',             label: 'Sales'             },
    { key: 'categories',        label: 'Categories'        },
    { key: 'featured artists',  label: 'Featured Artists'  },
  ];

  return (
    <div className="space-y-6">

      {/*header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Sales Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Province: <strong>{province}</strong> — Revenue &amp; Sales Analytics</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={period} onChange={e => { setPeriod(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] font-semibold focus:outline-none focus:border-[#8DAA91]">
            {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {period === 'custom' && (
            <>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]" />
              <span className="text-[#A67C52] font-bold">→</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]" />
            </>
          )}
          <button onClick={() => exportToCSV(allSales, province)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#8DAA91]/30 text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all text-sm font-semibold">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm">{error}</div>
      )}

      {/*stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Revenue',   value: fmt(summary.totalRevenue),      icon: <DollarSign size={24}/>, bg: 'bg-[#5F8B8C]/10', ic: 'text-[#5F8B8C]',  val: 'text-[#5F8B8C]',  sub: 'Completed payments only'     },
          { label: 'Total Sales',     value: fmtNum(summary.totalSales),     icon: <ShoppingBag size={24}/>,bg: 'bg-[#A67C52]/10', ic: 'text-[#A67C52]',  val: 'text-[#A67C52]',  sub: 'Completed orders'            },
          { label: 'Units Sold',      value: fmtNum(summary.totalQuantity),  icon: <Package size={24}/>,    bg: 'bg-[#8DAA91]/10', ic: 'text-[#8DAA91]',  val: 'text-[#8DAA91]',  sub: 'Total items sold'            },
          { label: 'Avg Order Value', value: fmt(summary.averageOrderValue), icon: <TrendingUp size={24}/>, bg: 'bg-yellow-50',    ic: 'text-yellow-500', val: 'text-yellow-500', sub: 'Per completed transaction'   },
        ].map(({ label, value, icon, bg, ic, val, sub }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#2E2E2E]/60 text-sm">{label}</p>
                <p className={`text-2xl font-bold mt-2 ${val}`}>{value}</p>
                <p className="text-xs text-[#2E2E2E]/40 mt-1">{sub}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/*tabs*/}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-[#8DAA91]/10 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#8DAA91] text-[#4A3F35] bg-[#8DAA91]/5'
                  : 'border-transparent text-[#2E2E2E]/50 hover:text-[#4A3F35] hover:bg-[#F4EDE4]/50'
              }`}>
              {tab.key === 'featured artists' && <Star size={13} className={activeTab === tab.key ? 'text-yellow-500' : 'text-[#2E2E2E]/30'} fill={activeTab === tab.key ? 'currentColor' : 'none'} />}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* overview */}
          {activeTab === 'overview' && (
            <OverviewSection chartData={chartData} topArtists={topArtists} topItems={topItems} loading={loading} onViewArtist={(id) => setArtistRevId(id)} />
          )}

          {/*sales table */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              {/* filters */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={16} />
                  <input type="text" placeholder="Search item, buyer, artist…" value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]" />
                </div>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]">
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]">
                  <option value="all">All Orders</option>
                  {Object.entries(ORDER_STATUS_MAP).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
                </select>
                <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]">
                  <option value="all">All Payments</option>
                  {Object.entries(PAYMENT_STATUS_MAP).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2.5 border-2 border-[#8DAA91]/20 rounded-xl text-sm text-[#4A3F35] focus:outline-none focus:border-[#8DAA91]">
                  <option value="-orderDate">Newest First</option>
                  <option value="orderDate">Oldest First</option>
                  <option value="-totalAmount">Highest Amount</option>
                  <option value="totalAmount">Lowest Amount</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-[#2E2E2E]/50">
                  {filteredSales.length} record{filteredSales.length !== 1 ? 's' : ''} · {allSales.length} total in period
                </p>
                <button onClick={() => exportToCSV(filteredSales, province)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all">
                  <Download size={13} /> Export Filtered
                </button>
              </div>

              {/* table */}
              <div className="rounded-xl overflow-hidden border border-[#8DAA91]/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#8DAA91] text-white">
                      <tr>
                        {['Date','Item','Category','Artist','Qty','Amount','Payment','Order','Buyer',''].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8DAA91]/10 bg-white">
                      {loadingSales ? (
                        <tr><td colSpan={10} className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8DAA91] border-t-transparent mx-auto" />
                        </td></tr>
                      ) : pagedSales.length === 0 ? (
                        <tr><td colSpan={10} className="px-6 py-12 text-center">
                          <ShoppingBag size={36} className="text-[#2E2E2E]/20 mx-auto mb-3" />
                          <p className="text-[#2E2E2E]/40 text-sm">No sales records found</p>
                        </td></tr>
                      ) : pagedSales.map((sale, i) => (
                        <tr key={sale._id ?? i} className="hover:bg-[#F4EDE4]/40 transition-colors">
                          <td className="px-4 py-3 text-xs text-[#2E2E2E]/60 whitespace-nowrap">
                            {sale.orderDate ? new Date(sale.orderDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#4A3F35] max-w-[140px] truncate">{sale.marketplaceItem?.listingTitle ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-[#8DAA91]/10 text-[#5F8B8C] rounded text-xs font-semibold whitespace-nowrap">
                              {sale.marketplaceItem?.artwork?.category ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#2E2E2E]/70 max-w-[100px] truncate">{sale.artist?.fullName ?? '—'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-[#5F8B8C] text-center">{sale.quantity}</td>
                          <td className="px-4 py-3 text-sm font-bold text-[#A67C52] whitespace-nowrap">{fmt(sale.totalAmount)}</td>
                          <td className="px-4 py-3"><Badge val={sale.paymentStatus} map={PAYMENT_STATUS_MAP} /></td>
                          <td className="px-4 py-3"><Badge val={sale.orderStatus}   map={ORDER_STATUS_MAP}   /></td>
                          <td className="px-4 py-3 text-sm text-[#2E2E2E]/60 max-w-[100px] truncate">{sale.buyer?.name ?? '—'}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => setViewSale(sale)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#5F8B8C]/10 text-[#5F8B8C] rounded-lg hover:bg-[#5F8B8C]/20 transition-all text-xs font-bold">
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* pagination */}
                {filteredSales.length > PAGE_SIZE && (
                  <div className="px-5 py-3 border-t border-[#8DAA91]/10 flex items-center justify-between">
                    <p className="text-xs text-[#2E2E2E]/50">Page {page} of {totalPages}</p>
                    <div className="flex gap-1">
                      {[
                        { Icon: ChevronsLeft,  action: () => setPage(1),                            disabled: page === 1          },
                        { Icon: ChevronLeft,   action: () => setPage(p => Math.max(1, p - 1)),       disabled: page === 1          },
                        { Icon: ChevronRight,  action: () => setPage(p => Math.min(totalPages,p+1)), disabled: page === totalPages },
                        { Icon: ChevronsRight, action: () => setPage(totalPages),                   disabled: page === totalPages },
                      ].map(({ Icon, action, disabled }, i) => (
                        <button key={i} onClick={action} disabled={disabled}
                          className="p-2 rounded-lg border-2 border-[#8DAA91]/20 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* categories */}
          {activeTab === 'categories' && (
            <div>
              {categoryBreakdown.length === 0 && uniqueCategories.length === 0 ? (
                <div className="text-center py-16 text-[#2E2E2E]/30">
                  <Layers size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No category data available for this period</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categoryBreakdown.length > 0
                    ? categoryBreakdown
                    : uniqueCategories.map(c => ({ category: c, sales: 0, revenue: 0, quantity: 0 }))
                  ).map((cat, i) => {
                    const maxRev = categoryBreakdown[0]?.revenue || 1;
                    const pct    = categoryBreakdown.length > 0 ? Math.round((cat.revenue / maxRev) * 100) : 0;
                    const cols   = ['text-[#5F8B8C] bg-[#5F8B8C]','text-[#A67C52] bg-[#A67C52]','text-[#8DAA91] bg-[#8DAA91]','text-yellow-500 bg-yellow-400','text-[#C48A6A] bg-[#C48A6A]'];
                    const [tc, bc] = cols[i % cols.length].split(' ');
                    const borderCols = ['border-[#5F8B8C]','border-[#A67C52]','border-[#8DAA91]','border-yellow-400','border-[#C48A6A]'];
                    return (
                      <div key={cat.category} className={`bg-white rounded-xl p-5 shadow-md border-l-4 ${borderCols[i % borderCols.length]}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-bold text-[#4A3F35]">{cat.category}</p>
                            <p className="text-xs text-[#2E2E2E]/50 mt-0.5">{fmtNum(cat.quantity)} units · {fmtNum(cat.sales)} orders</p>
                          </div>
                          <p className={`text-base font-bold ${tc}`}>{fmt(cat.revenue)}</p>
                        </div>
                        <div className="h-2 bg-[#8DAA91]/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${bc} transition-all duration-700`} style={{ width: `${pct}%`, opacity: 0.8 }} />
                        </div>
                        <p className={`text-[10px] font-bold mt-1.5 text-right ${tc}`}>{pct}% of top category</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* featured artist */}
          {activeTab === 'featured artists' && (
            <TopArtistsByRevenue onViewRevenue={id => setArtistRevId(id)} />
          )}

        </div>
      </div>

      {/* sales details model */}
      {viewSale && (
        <div onClick={() => setViewSale(null)} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#8DAA91]/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-base font-bold text-[#4A3F35]">Sale Detail</h3>
              <button onClick={() => setViewSale(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <XCircle size={20} className="text-[#2E2E2E]/50" />
              </button>
            </div>
            <div className="p-6 space-y-1">
              {[
                ['Item',           viewSale.marketplaceItem?.listingTitle ?? '—'],
                ['Category',       viewSale.marketplaceItem?.artwork?.category ?? '—'],
                ['Artist',         viewSale.artist?.fullName ?? '—'],
                ['Order Date',     viewSale.orderDate ? new Date(viewSale.orderDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '—'],
                ['Quantity',       viewSale.quantity],
                ['Unit Price',     fmt(viewSale.unitPrice)],
                ['Shipping Cost',  fmt(viewSale.shippingCost)],
                ['Total Amount',   fmt(viewSale.totalAmount)],
                ['Payment Method', viewSale.paymentMethod ?? '—'],
                ['Payment Status', viewSale.paymentStatus ?? '—'],
                ['Order Status',   viewSale.orderStatus ?? '—'],
                ['Buyer Name',     viewSale.buyer?.name ?? '—'],
                ['Buyer Email',    viewSale.buyer?.email ?? '—'],
                ['Buyer Phone',    viewSale.buyer?.phone ?? '—'],
                ['Notes',          viewSale.notes ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-[#8DAA91]/10 last:border-0">
                  <span className="text-xs font-bold text-[#2E2E2E]/50 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-semibold text-[#4A3F35] max-w-[55%] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*artist revenue model */}
      {artistRevId && <ArtistRevenueModal artistId={artistRevId} onClose={() => setArtistRevId(null)} />}
    </div>
  );
};

export default SalesManagement;