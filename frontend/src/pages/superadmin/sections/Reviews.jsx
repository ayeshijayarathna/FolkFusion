import { useState, useEffect } from 'react';
import { RiStarFill, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { learningAPI } from '../../../services/api';

export default function Reviews() {
  const [reviews, setReviews]   = useState([]);
  const [tab, setTab]           = useState('pending');
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchReviews(); }, [tab]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await learningAPI.adminGetReviews(tab);
      if (res.data.success) setReviews(res.data.data);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await learningAPI.adminUpdateReview(id, status);
    fetchReviews();
  };

  const tabs = ['pending', 'approved', 'rejected'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#3D3530]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          Reviews
        </h2>
        <div className="flex gap-1 bg-[#FAF7F2] border border-[#E8DDD5] rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-[#C97B5A] text-white shadow-sm' : 'text-[#9A8880] hover:text-[#3D3530]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#C97B5A] animate-spin border-[#C97B5A]/20"/>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-[#9A8880] text-sm">No {tab} reviews</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r._id} className="bg-white border border-[#E8DDD5] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#3D3530]">{r.userName}</span>
                    <span className="text-xs text-[#9A8880]">{r.email}</span>
                    {r.category && (
                      <span className="text-[10px] bg-[#C97B5A]/10 text-[#C97B5A] px-2 py-0.5 rounded-full">{r.category}</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <RiStarFill key={s} size={13} className={s <= r.rating ? 'text-amber-400' : 'text-gray-200'}/>
                    ))}
                  </div>
                  <p className="text-sm text-[#3D3530]/70 leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-[#9A8880] mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                {tab === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateStatus(r._id, 'approved')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
                    >
                      <RiCheckLine size={13}/> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r._id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-colors"
                    >
                      <RiCloseLine size={13}/> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}