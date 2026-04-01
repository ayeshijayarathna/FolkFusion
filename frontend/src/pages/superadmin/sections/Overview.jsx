import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../../services/api';
import {
  RiShieldUserLine, RiPaletteLine, RiUserStarLine,
  RiRefreshLine,
} from 'react-icons/ri';

const PageTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>{title}</h2>
    {subtitle && <p className="text-[#9A8880] text-[13px] mt-1">{subtitle}</p>}
  </div>
);

const StatCard = ({ label, value, sub, color, Icon }) => (
  <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-[28px] font-bold leading-none mb-1" style={{ color, fontFamily: "'Cinzel Decorative', serif" }}>{value ?? '—'}</p>
      <p className="text-[13px] text-[#3D3530] font-semibold">{label}</p>
      {sub && <p className="text-[11px] text-[#9A8880] mt-0.5">{sub}</p>}
    </div>
  </div>
);

// overview
export default function Overview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await superAdminAPI.getOverview();
      setData(res.data.data);
    } catch {
      setError('Failed to load overview data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-[#C97B5A]/20 border-t-[#C97B5A] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-[#DC2626] text-[14px]">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#C97B5A] text-white rounded-xl text-[13px] font-medium hover:opacity-90">
        <RiRefreshLine size={14} /> Retry
      </button>
    </div>
  );

  const { totals, provinceStats } = data || {};

  const statCards = [
    { label: 'Provincial Admins', value: totals?.totalAdmins,   sub: `${totals?.activeAdmins ?? 0} active`,      color: '#C97B5A', Icon: RiShieldUserLine },
    { label: 'Total Artists',     value: totals?.totalArtists,  sub: `${totals?.approvedArtists ?? 0} approved`, color: '#7A9E8E', Icon: RiPaletteLine    },
    { label: 'Active Artists',    value: totals?.activeArtists, sub: 'across all provinces',                     color: '#7C6F5E', Icon: RiUserStarLine   },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageTitle title="Platform Overview" subtitle="Real-time statistics across all provinces" />
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-[#E8DDD5] rounded-xl text-[13px] text-[#9A8880] hover:bg-[#FDF6EE] transition-colors">
          <RiRefreshLine size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Province table */}
      <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8DDD5]">
          <h3 className="text-[14px] font-bold text-[#3D3530] m-0" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Province Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]" style={{ minWidth: 560 }}>
            <thead>
              <tr className="border-b border-[#E8DDD5]">
                {['Province', 'Admins', 'Total Artists', 'Approved'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[#9A8880] font-bold text-[11px] uppercase tracking-[.08em]"
                    style={{ fontFamily: "'Libre Baskerville', serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(provinceStats || []).map((row, i) => (
                <tr key={row.province} className={`border-b border-[#E8DDD5]/50 ${i % 2 === 0 ? '' : 'bg-[#FAF7F2]'}`}>
                  <td className="px-5 py-3 font-semibold text-[#3D3530]">{row.province}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C97B5A]/15 text-[#C97B5A]">
                      {row.adminCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#3D3530]">{row.artistCount}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7A9E8E]/15 text-[#7A9E8E]">
                      {row.approvedArtists}
                    </span>
                  </td>
                </tr>
              ))}
              {(!provinceStats || provinceStats.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#9A8880] text-[13px]">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}