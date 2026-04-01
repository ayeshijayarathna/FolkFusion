import { useState, useEffect } from 'react';
import { RiGroupLine, RiSearchLine } from 'react-icons/ri';
import { learningAPI } from '../../../services/api';

export default function LearningUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    learningAPI.adminGetUsers().then(res => {
      if (res.data.success) setUsers(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#3D3530]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Learning Users
          </h2>
          <p className="text-sm text-[#9A8880] mt-1">{users.length} registered</p>
        </div>
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A8880]" size={14}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="pl-8 pr-4 py-2 text-sm border border-[#E8DDD5] rounded-xl outline-none focus:border-[#C97B5A] bg-[#FAF7F2] text-[#3D3530] w-52"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#C97B5A] animate-spin border-[#C97B5A]/20"/>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8DDD5] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DDD5]">
              <tr>
                {['Name','Email','Province','Type','Categories Started','Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#9A8880] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id} className={`border-b border-[#F5F0EB] last:border-0 ${i % 2 === 0 ? '' : 'bg-[#FAF7F2]/50'}`}>
                  <td className="px-4 py-3 font-medium text-[#3D3530]">{u.name}</td>
                  <td className="px-4 py-3 text-[#9A8880]">{u.email}</td>
                  <td className="px-4 py-3 text-[#9A8880]">{u.province || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] bg-[#C97B5A]/10 text-[#C97B5A] px-2 py-0.5 rounded-full font-semibold">
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#9A8880]">{u.progress?.length || 0}</td>
                  <td className="px-4 py-3 text-[#9A8880]">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#9A8880]">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}