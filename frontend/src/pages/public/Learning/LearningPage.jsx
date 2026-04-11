import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiBookOpenLine, RiArrowRightLine, RiStarFill,
  RiStarLine, RiPaletteLine, RiUserLine,
  RiCheckLine, RiLoader4Line, RiCloseLine,
  RiBox3Line, RiEyeLine, RiSmartphoneLine,
} from 'react-icons/ri';
import { learningAPI, arArtworkAPI } from '../../../services/api';
import { PROVINCES } from '../../../utils/constants';

/*star rating*/
const StarRating = ({ value, onChange, size = 24 }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        {s <= value
          ? <RiStarFill size={size} className="text-amber-400"/>
          : <RiStarLine size={size} className="text-[#D9D0CB]"/>
        }
      </button>
    ))}
  </div>
);

/* register modal*/
const RegisterModal = ({ category, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name:'', email:'', phone:'', province:'', age:'', userType:'Student' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await learningAPI.registerUser({ ...form, age: form.age ? Number(form.age) : undefined });
      if (res.data.success) onSuccess(res.data.data);
    } catch (e) { setError(e.response?.data?.message || 'Registration failed.'); }
    finally { setSaving(false); }
  };

  const inp = "w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors bg-white font-body";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-[#FDF6EE] rounded-2xl border border-[#E8DDD5] w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD5]">
          <div>
            <h3 className="font-heading text-base text-[#3D3530]">Start Learning</h3>
            <p className="text-xs text-[#9A8880] mt-0.5 font-body">{category}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9A8880] transition-colors">
            <RiCloseLine size={18}/>
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">Full Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Your name" className={inp}/>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" className={inp}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+94 77 000 0000" className={inp}/>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">Age</label>
              <input type="number" value={form.age} onChange={set('age')} placeholder="25" className={inp}/>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">Province</label>
            <select value={form.province} onChange={set('province')} className={inp}>
              <option value="">Select province…</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#9A8880] uppercase tracking-wider block mb-1">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {['Student','Undergraduate','Professional','Other'].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm(p => ({ ...p, userType: t }))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all font-body ${
                    form.userType === t ? 'bg-[#C97B5A] text-white border-[#C97B5A]' : 'border-[#E8DDD5] text-[#6B5A50] hover:border-[#C97B5A]/50'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-all font-body mt-2">
            {saving ? <><RiLoader4Line size={15} className="animate-spin"/> Registering…</> : <>Start Learning <RiArrowRightLine size={15}/></>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* review form */
const ReviewForm = ({ category, userEmail, userName, onSubmitted }) => {
  const [form, setForm]     = useState({ rating: 0, comment: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const handleSubmit = async () => {
    if (!form.rating || !form.comment) return;
    setSaving(true);
    try {
      await learningAPI.submitReview({ userName, email: userEmail, category, rating: form.rating, comment: form.comment });
      setDone(true);
      onSubmitted?.();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (done) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
      <RiCheckLine size={32} className="text-green-500 mx-auto mb-2"/>
      <p className="font-semibold text-green-800 font-body">Review submitted! Thank you.</p>
      <p className="text-xs text-green-600 mt-1 font-body">Your review is pending approval.</p>
    </div>
  );

  return (
    <div className="bg-[#FDF6EE] border border-[#E8DDD5] rounded-2xl p-6">
      <h4 className="font-heading text-base text-[#3D3530] mb-4">Rate Your Experience</h4>
      <div className="mb-4">
        <p className="text-xs text-[#9A8880] mb-2 font-body">Your Rating</p>
        <StarRating value={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))}/>
      </div>
      <div className="mb-4">
        <label className="text-xs text-[#9A8880] block mb-1 font-body">Your Review</label>
        <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} rows={4}
          placeholder="Share your learning experience…"
          className="w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors resize-none font-body"/>
      </div>
      <button onClick={handleSubmit} disabled={saving || !form.rating || !form.comment}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-all font-body">
        {saving ? <RiLoader4Line size={14} className="animate-spin"/> : <RiStarFill size={14}/>}
        Submit Review
      </button>
    </div>
  );
};

/*chapter viewer*/
const ChapterViewer = ({ content, user, onClose, onAllComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted]   = useState(() => {
    const p = user?.progress?.find(p => p.category === content.category);
    return new Set(p?.completedChapters || []);
  });
  const [saving, setSaving]     = useState(false);
  const [showReview, setShowReview] = useState(false);

  const chapters         = content.chapters.filter(ch => ch.isPublished);
  const current          = chapters[currentIdx];
  const isLast           = currentIdx === chapters.length - 1;
  const currentCompleted = completed.has(currentIdx);
  const allDone          = chapters.every((_, i) => completed.has(i));

  const markComplete = async () => {
    if (currentCompleted) return;
    setSaving(true);
    try {
      await learningAPI.completeChapter({ email: user.email, category: content.category, chapterIndex: currentIdx });
      setCompleted(prev => new Set([...prev, currentIdx]));
      if (isLast) { onAllComplete?.(); setShowReview(true); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[998] bg-[#FAF7F2] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8DDD5] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#FAF7F2] text-[#9A8880] transition-colors">
            <RiArrowRightLine size={18} className="rotate-180"/>
          </button>
          <div>
            <p className="text-[10px] text-[#9A8880] uppercase tracking-widest font-body">{content.category}</p>
            <h3 className="font-heading text-sm text-[#3D3530]">{current?.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {chapters.map((_, i) => (
            <button key={i}
              onClick={() => { if (i === 0 || completed.has(i - 1)) setCurrentIdx(i); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                completed.has(i) ? 'bg-green-500' : i === currentIdx ? 'bg-[#C97B5A] w-5' : 'bg-[#E8DDD5]'
              }`}/>
          ))}
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#FAF7F2] text-[#9A8880] transition-colors">
          <RiCloseLine size={18}/>
        </button>
      </div>
      <div className="h-1 bg-[#E8DDD5]">
        <div className="h-full bg-[#C97B5A] transition-all duration-500"
          style={{ width: `${(completed.size / chapters.length) * 100}%` }}/>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {current?.videoUrl && (
            <div className="mb-8 rounded-xl overflow-hidden border border-[#E8DDD5] aspect-video">
              <iframe src={current.videoUrl} className="w-full h-full" allowFullScreen title={current.title} frameBorder="0"/>
            </div>
          )}
          <div className="prose prose-sm max-w-none text-[#3D3530] leading-relaxed font-body mb-8"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
            dangerouslySetInnerHTML={{ __html: current?.content || '<p class="text-gray-400">No content yet.</p>' }}/>
          {current?.images?.length > 0 && (
            <div className="mb-8">
              <h4 className="font-heading text-sm text-[#3D3530] mb-3">Artworks & Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {current.images.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-[#E8DDD5] aspect-square">
                    <img src={img} alt={`Artwork ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                  </div>
                ))}
              </div>
            </div>
          )}
          {showReview && allDone && (
            <div className="mb-8">
              <ReviewForm category={content.category} userEmail={user.email} userName={user.name} onSubmitted={() => {}}/>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8DDD5]">
            <button onClick={() => setCurrentIdx(s => Math.max(0, s - 1))} disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#E8DDD5] text-[#9A8880] hover:text-[#3D3530] disabled:opacity-40 transition-colors font-body">
              ← Previous
            </button>
            <div className="flex gap-2">
              {!currentCompleted && (
                <button onClick={markComplete} disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-colors font-body">
                  {saving ? <RiLoader4Line size={13} className="animate-spin"/> : <RiCheckLine size={13}/>}
                  {isLast ? 'Complete & Finish' : 'Mark Complete'}
                </button>
              )}
              {currentCompleted && !isLast && (
                <button onClick={() => setCurrentIdx(s => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3D3530] text-white hover:bg-[#2a2420] transition-colors font-body">
                  Next Chapter <RiArrowRightLine size={13}/>
                </button>
              )}
              {currentCompleted && isLast && !showReview && (
                <button onClick={() => setShowReview(true)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors font-body">
                  <RiStarFill size={13}/> Leave a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/*main page */
export default function LearningPage() {
  const navigate = useNavigate();
  const [categories,   setCategories]   = useState([]);
  const [patterns,     setPatterns]     = useState([]);
  const [reviews,      setReviews]      = useState([]);
  const [arArtworks,   setArArtworks]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [headerLoaded, setHeaderLoaded] = useState(false);

  const [registerFor, setRegisterFor] = useState(null);
  const [activeUser,  setActiveUser]  = useState(null);
  const [viewContent, setViewContent] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setHeaderLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, pRes, rRes, arRes] = await Promise.all([
          learningAPI.getPublishedCategories(),
          learningAPI.getPublishedPatterns(),
          learningAPI.getApprovedReviews(),
          arArtworkAPI.getPublished(),
        ]);
        if (cRes.data?.success)  setCategories(cRes.data.data);
        if (pRes.data?.success)  setPatterns(pRes.data.data);
        if (rRes.data?.success)  setReviews(rRes.data.data);
        if (arRes.data?.success) setArArtworks(arRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleCategoryClick = async (cat) => {
    const saved = localStorage.getItem('learningUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const res = await learningAPI.getUserByEmail(user.email);
        if (res.data?.success) {
          const freshUser = res.data.data;
          localStorage.setItem('learningUser', JSON.stringify(freshUser));
          setActiveUser(freshUser);
          const cRes = await learningAPI.getCategoryContent(cat.category);
          if (cRes.data?.success) setViewContent(cRes.data.data);
          return;
        }
      } catch {}
    }
    setRegisterFor(cat.category);
  };

  const handleRegistered = async (user) => {
    localStorage.setItem('learningUser', JSON.stringify(user));
    setActiveUser(user);
    setRegisterFor(null);
    const cRes = await learningAPI.getCategoryContent(registerFor);
    if (cRes.data?.success) setViewContent(cRes.data.data);
  };

  const fade = (delay) => ({
    opacity:    headerLoaded ? 1 : 0,
    transform:  headerLoaded ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* modals */}
      {registerFor && (
        <RegisterModal category={registerFor} onClose={() => setRegisterFor(null)} onSuccess={handleRegistered}/>
      )}
      {viewContent && activeUser && (
        <ChapterViewer content={viewContent} user={activeUser}
          onClose={() => { setViewContent(null); setActiveUser(null); }}
          onAllComplete={() => {}}/>
      )}

      {/* hero */}
     <section
  className="relative py-36 overflow-hidden bg-cover bg-center"
  style={{ backgroundImage: "url('/images/learning-hero.png')" }}>
  <div className="absolute left-0 top-16 bottom-16 w-[3px] bg-gradient-to-b from-transparent via-[#C97B5A] to-transparent opacity-70" />

  <div className="max-w-6xl mx-auto px-8 relative z-10">
    <div className="max-w-lg ml-auto text-right">
      
      <div className="flex items-center justify-end gap-3 mb-7" style={fade(0.1)}>
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">
          Heritage & Knowledge
        </span>
        <div className="w-8 h-px bg-[#C97B5A]" />
      </div>

      <h1
        className="font-heading font-normal text-[clamp(2.2rem,5vw,3.8rem)] text-[#FDF6EE] leading-[1.08] mb-6"
        style={fade(0.25)}
      >
        Learn Sri Lanka's<br />
        <span className="text-[#C97B5A] italic">Traditional Folk Arts</span>
      </h1>

      <div className="flex items-center justify-end gap-3 mb-7" style={fade(0.38)}>
        <div className="w-5 h-px bg-[#C97B5A]/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#C97B5A]/70" />
        <div className="w-12 h-px bg-[#C97B5A]/60" />
      </div>

      <p
        className="font-body text-[0.92rem] leading-[1.9] text-dark-brown mb-10 max-w-md ml-auto"
        style={fade(0.45)}
      >
        Explore the history, techniques, and cultural significance of Sri Lanka's living artistic traditions.
      </p>

      <div
        className="flex flex-wrap items-center justify-end gap-x-8 gap-y-3"
        style={fade(0.55)}
      >
        {[
          { Icon: RiBookOpenLine, label: `${categories.length} Categories` },
          { Icon: RiPaletteLine, label: `${patterns.length} Patterns` },
          { Icon: RiBox3Line, label: `${arArtworks.length} 3D Models` },
          { Icon: RiUserLine, label: 'Free Access' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-dark-brown">
            <s.Icon size={15} className="text-muted-clay" />
            <span className="font-body text-xs">{s.label}</span>
          </div>
        ))}
      </div>

    </div>
  </div>
</section>

      {/*traditional petterns*/}
      <section className="py-20 max-w-6xl mx-auto px-6" >
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#C97B5A]"/>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">Traditional</span>
          </div>
          <h2 className="font-heading text-3xl text-[#3D3530]">Traditional Patterns</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/20 animate-spin"/>
          </div>
        ) : patterns.length === 0 ? (
          <div className="text-center py-16 text-[#9A8880]">
            <RiPaletteLine size={40} className="mx-auto mb-3 opacity-20"/>
            <p className="font-body text-sm">No patterns added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {patterns.slice(0, 6).map(p => (
              <div key={p._id}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DDD5] hover:border-[#C97B5A]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square overflow-hidden">
                  {p.image
                    ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full bg-gradient-to-br from-[#C97B5A]/10 to-[#7A9E8E]/10 flex items-center justify-center">
                        <RiPaletteLine size={24} className="text-[#C97B5A]/40"/>
                      </div>
                  }
                </div>
                <div className="p-3">
                  <p className="font-body text-xs font-medium text-[#3D3530] truncate">{p.title}</p>
                  {p.description && <p className="font-body text-[10px] text-[#9A8880] mt-0.5 line-clamp-2">{p.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/*3D Artworks */}
      {arArtworks.length > 0 && (
        <section className="py-20" style={{ backgroundColor: '#FFF8E1' }}>
          <div className="max-w-6xl mx-auto px-6">

            {/* section header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#C97B5A]"/>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">
                  Web AR · 3D Experience
                </span>
              </div>
              <h2 className="font-heading text-3xl text-[#FDF6EE]">Explore Folk Art in 3D</h2>
              <p className="font-body text-sm mt-2" style={{ color: 'rgba(196,145,122,0.7)' }}>
                View traditional artworks in 3D — or place them in your room using AR on mobile.
              </p>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {arArtworks.map(art => (
                <div
                  key={art._id}
                  className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,123,90,0.15)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '1px solid rgba(201,123,90,0.4)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,123,90,0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '1px solid rgba(201,123,90,0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => navigate(`/ar-view/${art._id}`)}
                >
                  {/* thumbnail */}
                  <div className="relative h-48 overflow-hidden" style={{ background: 'rgba(201,123,90,0.05)' }}>
                    {art.image ? (
                      <img src={art.image} alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ opacity: 0.85 }}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiBox3Line size={48} style={{ color: 'rgba(201,123,90,0.25)' }}/>
                      </div>
                    )}
                    {/* 3D badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#C97B5A' }}>
                      <RiBox3Line size={10}/> 3D · AR
                    </div>
                    {/* hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(30,26,23,0.65)' }}>
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-body text-white"
                        style={{ background: 'linear-gradient(135deg, #C97B5A, #b56a4a)', boxShadow: '0 4px 20px rgba(201,123,90,0.5)' }}>
                        <RiEyeLine size={15}/> View in 3D / AR
                      </div>
                    </div>
                  </div>

                  {/* info */}
                  <div className="p-4">
                    <h3 className="font-heading text-sm mb-1 truncate" style={{ color: '#FDF6EE' }}>{art.title}</h3>
                    {art.category && (
                      <p className="font-body text-[10px] mb-2 uppercase tracking-wider" style={{ color: '#C97B5A' }}>
                        {art.category}
                      </p>
                    )}
                    {art.description && (
                      <p className="font-body text-xs line-clamp-2 mb-3" style={{ color: 'rgba(196,145,122,0.65)' }}>
                        {art.description}
                      </p>
                    )}
                    <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium font-body transition-colors"
                      style={{ border: '1px solid rgba(201,123,90,0.25)', color: '#C97B5A' }}>
                      <RiBox3Line size={13}/> Open 3D Viewer
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* mobile tip */}
            <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(201,123,90,0.08)', border: '1px solid rgba(201,123,90,0.18)' }}>
              <RiSmartphoneLine size={18} className="flex-shrink-0" style={{ color: '#C97B5A' }}/>
              <p className="font-body text-sm" style={{ color: 'rgba(196,145,122,0.8)' }}>
                <strong style={{ color: '#C97B5A' }}>Mobile tip:</strong> Open on your phone and tap{' '}
                <strong style={{ color: '#C97B5A' }}>"View in Your Room"</strong> to place the artwork in your real environment using your camera.
              </p>
            </div>
          </div>
        </section>
      )}

      {/*learning categories */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C97B5A]"/>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">Learn</span>
            </div>
            <h2 className="font-heading text-3xl text-[#3D3530]">Learning Content</h2>
            <p className="font-body text-sm text-[#9A8880] mt-2">
              Select a category to begin. Register to track your progress chapter by chapter.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/20 animate-spin"/>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-[#9A8880]">
              <RiBookOpenLine size={40} className="mx-auto mb-3 opacity-20"/>
              <p className="font-body text-sm">No learning content available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map(cat => {
                const pub = (cat.chapters || []).filter(c => c.isPublished).length;
                return (
                  <button key={cat._id} onClick={() => handleCategoryClick(cat)}
                    className="group text-left bg-[#FAF7F2] rounded-2xl border border-[#E8DDD5] hover:border-[#C97B5A]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-5">
                    {cat.coverImage ? (
                      <div className="rounded-xl overflow-hidden mb-4 aspect-video">
                        <img src={cat.coverImage} alt={cat.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-gradient-to-br from-[#C97B5A]/10 to-[#7A9E8E]/10 mb-4 aspect-video flex items-center justify-center">
                        <RiBookOpenLine size={32} className="text-[#C97B5A]/40"/>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base text-[#3D3530] mb-1 truncate">{cat.category}</h3>
                        {cat.description && (
                          <p className="font-body text-xs text-[#9A8880] line-clamp-2">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C97B5A]/10 flex items-center justify-center group-hover:bg-[#C97B5A] group-hover:text-white transition-all text-[#C97B5A]">
                        <RiArrowRightLine size={15}/>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E8DDD5]">
                      <span className="font-body text-[10px] text-[#9A8880]">{pub} chapters</span>
                      <span className="w-1 h-1 rounded-full bg-[#D9D0CB]"/>
                      <span className="font-body text-[10px] text-[#C97B5A] font-medium">Click to start →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* reviews */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#C97B5A]"/>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">Testimonials</span>
          </div>
          <h2 className="font-heading text-3xl text-[#3D3530]">Learner Reviews</h2>
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-[#9A8880]">
            <RiStarLine size={36} className="mx-auto mb-3 opacity-20"/>
            <p className="font-body text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map(r => (
              <div key={r._id} className="bg-white rounded-2xl border border-[#E8DDD5] p-5">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <RiStarFill key={s} size={13} className={s <= r.rating ? 'text-amber-400' : 'text-gray-200'}/>
                  ))}
                </div>
                <p className="font-body text-sm text-[#3D3530]/80 leading-relaxed mb-4 italic">"{r.comment}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-xs font-semibold text-[#3D3530]">{r.userName}</p>
                    {r.category && <p className="font-body text-[10px] text-[#C97B5A]">{r.category}</p>}
                  </div>
                  <p className="font-body text-[10px] text-[#9A8880]">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}