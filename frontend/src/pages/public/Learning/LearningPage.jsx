import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiBookOpenLine, RiArrowRightLine, RiStarFill,
  RiStarLine, RiPaletteLine, RiUserLine,
  RiCheckLine, RiLoader4Line, RiCloseLine,
  RiBox3Line, RiEyeLine, RiSmartphoneLine,
  RiHistoryLine, RiToolsLine, RiHeartLine,
  RiMapPinLine, RiImageLine, RiLeafLine,
  RiMagicLine, RiAwardLine,
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

/*pattern detail modal*/
const PatternDetailModal = ({ pattern, onClose }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!pattern) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="bg-[#FDF6EE] rounded-2xl border border-[#E8DDD5] w-full max-w-3xl shadow-2xl overflow-hidden">

        {/* top bar — only close icon */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8DDD5]">
          <div className="flex items-center gap-2">
            <RiPaletteLine size={14} className="text-[#C97B5A]" />
            <span className="font-body text-[10px] tracking-[0.25em] uppercase text-[#C97B5A]">
              Traditional Pattern
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9A8880] transition-colors"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* body */}
        <div className="flex flex-col sm:flex-row">

          {/* left image */}
          <div className="sm:w-[45%] flex-shrink-0 bg-[#F5EDE4] flex items-center justify-center min-h-[300px] relative p-4">
            {pattern.image ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/20 animate-spin" />
                  </div>
                )}
                <img
                  src={pattern.image}
                  alt={pattern.title}
                  onLoad={() => setImgLoaded(true)}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ maxHeight: 400 }}
                />
              </>
            ) : (
              <RiPaletteLine size={56} className="text-[#C97B5A]/20" />
            )}
          </div>

          {/* right content */}
          <div className="flex-1 px-7 py-7 overflow-y-auto" style={{ maxHeight: 440 }}>

            <h2 className="font-heading text-xl text-[#3D3530] mb-2">{pattern.title}</h2>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-[#C97B5A]/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C97B5A]/60" />
              <div className="w-4 h-px bg-[#C97B5A]/30" />
            </div>

            {pattern.description ? (
              <p className="font-body text-sm leading-[1.85] text-[#6B5A50]">
                {pattern.description}
              </p>
            ) : (
              <p className="font-body text-sm text-[#9A8880] italic">No description available.</p>
            )}

            {pattern.origin && (
              <div className="mt-4 flex items-start gap-2">
                <span className="font-body text-[10px] tracking-wider uppercase text-[#9A8880] mt-0.5 w-16 flex-shrink-0">Origin</span>
                <span className="font-body text-sm text-[#3D3530]">{pattern.origin}</span>
              </div>
            )}
            {pattern.material && (
              <div className="mt-2 flex items-start gap-2">
                <span className="font-body text-[10px] tracking-wider uppercase text-[#9A8880] mt-0.5 w-16 flex-shrink-0">Material</span>
                <span className="font-body text-sm text-[#3D3530]">{pattern.material}</span>
              </div>
            )}
            {pattern.category && (
              <div className="mt-2 flex items-start gap-2">
                <span className="font-body text-[10px] tracking-wider uppercase text-[#9A8880] mt-0.5 w-16 flex-shrink-0">Category</span>
                <span className="font-body text-sm text-[#3D3530]">{pattern.category}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const toEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  // youtube shorts: youtube.com/shorts/ID
  const shorts = url.match(/youtube\.com\/shorts\/([^?&\s]+)/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  // youtu.be/ID
  const short = url.match(/youtu\.be\/([^?&\s]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  // youtube.com/watch?v=ID
  const watch = url.match(/[?&]v=([^?&\s]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
};

/*accordion chapter viewer*/
const chapterIcons = [
  RiBookOpenLine, RiHistoryLine, RiToolsLine,
  RiHeartLine, RiMapPinLine, RiImageLine,
  RiLeafLine, RiMagicLine, RiAwardLine, RiPaletteLine,
];
const iconColors = [
  'bg-[#C97B5A]', 'bg-[#7A9E8E]', 'bg-[#8E7A9E]',
  'bg-[#9E8E7A]', 'bg-[#7A8E9E]', 'bg-[#9E7A8E]',
  'bg-[#8E9E7A]', 'bg-[#C97B5A]', 'bg-[#7A9E8E]', 'bg-[#8E7A9E]',
];

const AccordionViewer = ({ content, user: initialUser, onBack, onAllComplete, onUserRegistered }) => {
  const chapters = content.chapters.filter(ch => ch.isPublished);

  const [user,       setUser]       = useState(initialUser);
  const [openIdx,    setOpenIdx]    = useState(null);
  const [completed,  setCompleted]  = useState(() => {
    const p = initialUser?.progress?.find(p => p.category === content.category);
    return new Set(p?.completedChapters || []);
  });
  const [saving,     setSaving]     = useState(null);
  const [showReview, setShowReview] = useState(false);

  /*inline registration form state*/
  const [regForm,  setRegForm]  = useState({ name:'', email:'', phone:'', province:'', age:'', userType:'Student' });
  const [regSaving,setRegSaving]= useState(false);
  const [regError, setRegError] = useState('');
  const setReg = k => e => setRegForm(p => ({ ...p, [k]: e.target.value }));

  const handleRegister = async () => {
    if (!regForm.name || !regForm.email) { setRegError('Name and email are required.'); return; }
    setRegSaving(true); setRegError('');
    try {
      const res = await learningAPI.registerUser({
        ...regForm,
        age: regForm.age ? Number(regForm.age) : undefined,
      });
      if (res.data.success) {
        const u = res.data.data;
        setUser(u);
        onUserRegistered?.(u);
      }
    } catch (e) { setRegError(e.response?.data?.message || 'Registration failed.'); }
    finally { setRegSaving(false); }
  };

  const inp = "w-full border border-[#E8DDD5] rounded-xl px-3 py-2.5 text-sm text-[#3D3530] outline-none focus:border-[#C97B5A] transition-colors bg-white font-body";

  const allDone = chapters.length > 0 && chapters.every((_, i) => completed.has(i));
  const progress = chapters.length ? Math.round((completed.size / chapters.length) * 100) : 0;

  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i);

  /*if no user yet,show inline registration gate*/
  if (!user) return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* back */}
        <button onClick={onBack}
          className="flex items-center gap-2 mb-8 text-sm font-body text-[#9A8880] hover:text-[#C97B5A] transition-colors group">
          <span className="w-7 h-7 rounded-full border border-[#E8DDD5] group-hover:border-[#C97B5A]/50 flex items-center justify-center transition-colors">
            <RiArrowRightLine size={14} className="rotate-180"/>
          </span>
          Back to Learning
        </button>

        {/* heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#C97B5A]"/>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">
              {content.category}
            </span>
          </div>
          <h2 className="font-heading text-2xl text-[#3D3530] mb-2">Create Your Learning Profile</h2>
          <p className="font-body text-sm text-[#9A8880] leading-relaxed">
            Fill in your details to start learning and track your progress across all chapters.
          </p>
        </div>

        {/* form card */}
        <div className="bg-white rounded-2xl border border-[#E8DDD5] p-7 shadow-sm">
          {regError && (
            <p className="font-body text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{regError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-1.5">
                Full Name <span className="text-[#C97B5A]">*</span>
              </label>
              <input value={regForm.name} onChange={setReg('name')} placeholder="Your name" className={inp}/>
            </div>
            <div>
              <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-1.5">
                Email <span className="text-[#C97B5A]">*</span>
              </label>
              <input type="email" value={regForm.email} onChange={setReg('email')} placeholder="your@email.com" className={inp}/>
            </div>
            <div>
              <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-1.5">Phone</label>
              <input value={regForm.phone} onChange={setReg('phone')} placeholder="+94 77 000 0000" className={inp}/>
            </div>
            <div>
              <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-1.5">Age</label>
              <input type="number" value={regForm.age} onChange={setReg('age')} placeholder="25" className={inp}/>
            </div>
          </div>

          <div className="mb-4">
            <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-1.5">Province</label>
            <select value={regForm.province} onChange={setReg('province')} className={`${inp} appearance-none`}>
              <option value="">Select province…</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label className="font-body block text-[10px] tracking-wider uppercase text-[#9A8880] mb-2">I am a…</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Student','Undergraduate','Professional','Other'].map(t => (
                <button key={t} type="button"
                  onClick={() => setRegForm(p => ({ ...p, userType: t }))}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all font-body ${
                    regForm.userType === t
                      ? 'bg-[#C97B5A] text-white border-[#C97B5A]'
                      : 'border-[#E8DDD5] text-[#6B5A50] hover:border-[#C97B5A]/50'
                  }`}>{t}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleRegister} disabled={regSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-all font-body">
            {regSaving
              ? <><RiLoader4Line size={15} className="animate-spin"/> Setting up…</>
              : <>Start Learning <RiArrowRightLine size={15}/></>
            }
          </button>
        </div>
      </div>
    </div>
  );

  const markComplete = async (i) => {
    if (completed.has(i) || !user) return;
    setSaving(i);
    try {
      await learningAPI.completeChapter({
        email: user.email,
        category: content.category,
        chapterIndex: i,
      });
      setCompleted(prev => {
        const next = new Set([...prev, i]);
        if (next.size === chapters.length) { onAllComplete?.(); }
        return next;
      });
      // auto-open next chapter
      if (i < chapters.length - 1) setOpenIdx(i + 1);
      else setOpenIdx(null);
    } catch (e) { console.error(e); }
    finally { setSaving(null); }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* sticky top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E8DDD5] shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="p-2 rounded-xl hover:bg-[#FAF7F2] text-[#9A8880] transition-colors">
              <RiArrowRightLine size={18} className="rotate-180"/>
            </button>
            <div>
              <p className="font-body text-[10px] text-[#9A8880] uppercase tracking-widest">
                {content.category}
              </p>
              <p className="font-body text-xs text-[#C97B5A]">
                {completed.size}/{chapters.length} chapters completed
              </p>
            </div>
          </div>
          {/* progress bar pill */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-[#E8DDD5] rounded-full overflow-hidden">
              <div className="h-full bg-[#C97B5A] transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}/>
            </div>
            <span className="font-body text-xs text-[#9A8880]">{progress}%</span>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* heading */}
        <div className="mb-8">
          {/* back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 text-sm font-body text-[#9A8880] hover:text-[#C97B5A] transition-colors group"
          >
            <span className="w-7 h-7 rounded-full border border-[#E8DDD5] group-hover:border-[#C97B5A]/50 flex items-center justify-center transition-colors">
              <RiArrowRightLine size={14} className="rotate-180"/>
            </span>
            Back to Learning
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px bg-[#C97B5A]"/>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">
              Learning Content
            </span>
          </div>
          <h2 className="font-heading text-2xl text-[#3D3530]">{content.category}</h2>
          {content.description && (
            <p className="font-body text-sm text-[#9A8880] mt-2 leading-relaxed">
              {content.description}
            </p>
          )}
        </div>

        {/* accordion chapters */}
        <div className="space-y-3 mb-10">
          {chapters.map((ch, i) => {
            const isOpen      = openIdx === i;
            const isDone      = completed.has(i);
            const isSaving    = saving === i;
            const colorClass  = iconColors[i % iconColors.length];

            return (
              <div key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#C97B5A]/40 shadow-[0_4px_20px_rgba(201,123,90,0.1)]'
                    : isDone
                    ? 'border-green-200 bg-green-50/30'
                    : 'border-[#E8DDD5] bg-white hover:border-[#C97B5A]/30'
                }`}
              >
                {/* accordion header */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => toggle(i)}
                >
                  {/* icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                    isDone ? 'bg-green-500' : colorClass
                  }`}>
                    {isDone
                      ? <RiCheckLine size={18}/>
                      : (() => { const Icon = chapterIcons[i % chapterIcons.length]; return <Icon size={18}/>; })()
                    }
                  </div>

                  {/* title */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[10px] tracking-wider uppercase text-[#9A8880] mb-0.5">
                      Chapter {i + 1}
                    </p>
                    <p className="font-heading text-sm text-[#3D3530] truncate">{ch.title}</p>
                  </div>

                  {/* status badge + chevron */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isDone && (
                      <span className="font-body text-[10px] px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        Completed
                      </span>
                    )}
                    <RiArrowRightLine size={16}
                      className={`text-[#9A8880] transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}/>
                  </div>
                </button>

                {/* accordion body */}
                {isOpen && (
                  <div className="border-t border-[#E8DDD5] px-5 py-6">

                    {/* video */}
                    {ch.videoUrl && (
                      <div className="mb-6 rounded-xl overflow-hidden border border-[#E8DDD5] aspect-video">
                        <iframe
                          src={toEmbedUrl(ch.videoUrl)}
                          className="w-full h-full"
                          allowFullScreen
                          title={ch.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    )}

                    {/* text content */}
                    <div className="prose prose-sm max-w-none text-[#3D3530] leading-relaxed font-body mb-6"
                      style={{ fontFamily: "'Libre Baskerville', serif" }}
                      dangerouslySetInnerHTML={{
                        __html: ch.content || '<p style="color:#9A8880">No content yet.</p>'
                      }}/>

                    {/* images */}
                    {ch.images?.length > 0 && (
                      <div className="mb-6">
                        <p className="font-heading text-xs text-[#3D3530] mb-3 uppercase tracking-wider">
                          Artworks & Images
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {ch.images.map((img, j) => (
                            <div key={j} className="rounded-xl overflow-hidden border border-[#E8DDD5] aspect-square">
                              <img src={img} alt={`img-${j+1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* mark complete */}
                    <div className="flex justify-end pt-4 border-t border-[#E8DDD5]">
                      {!isDone ? (
                        <button onClick={() => markComplete(i)} disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] disabled:opacity-50 transition-all font-body">
                          {isSaving
                            ? <><RiLoader4Line size={14} className="animate-spin"/> Saving…</>
                            : <><RiCheckLine size={14}/> Mark as Complete</>
                          }
                        </button>
                      ) : (
                        <span className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-green-100 text-green-700 font-body">
                          <RiCheckLine size={14}/> Completed
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* all done review section */}
        {allDone && (
          <div className="mt-4">
            {!showReview ? (
              <div className="bg-white rounded-2xl border border-[#E8DDD5] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <RiCheckLine size={32} className="text-green-500"/>
                </div>
                <h3 className="font-heading text-xl text-[#3D3530] mb-2">
                  You've completed <span className="text-[#C97B5A]">{content.category}</span>!
                </h3>
                <p className="font-body text-sm text-[#9A8880] mb-6">
                  Excellent work! Would you like to share your learning experience?
                </p>
                <button onClick={() => setShowReview(true)}
                  className="flex items-center gap-2 mx-auto px-7 py-3 rounded-xl text-sm font-semibold bg-[#C97B5A] text-white hover:bg-[#b56a4a] transition-all font-body">
                  <RiStarFill size={14}/> Leave a Review
                </button>
              </div>
            ) : (
              <ReviewForm
                category={content.category}
                userEmail={user?.email}
                userName={user?.name}
                onSubmitted={() => {}}
              />
            )}
          </div>
        )}
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

  const [registerFor,     setRegisterFor]     = useState(null);
  const [activeUser,      setActiveUser]      = useState(null);
  const [viewContent,     setViewContent]     = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patternPage,     setPatternPage]     = useState(0);
  const [arPage,          setArPage]          = useState(0);
  const [catPage,         setCatPage]         = useState(0);
  const PATTERNS_PER_PAGE = 4;
  const AR_PER_PAGE       = 3;
  const CATS_PER_PAGE     = 6;

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
    // always load content first
    try {
      const cRes = await learningAPI.getCategoryContent(cat.category);
      if (cRes.data?.success) setViewContent(cRes.data.data);
    } catch (e) { console.error(e); return; }

    // silently try to restore user from localStorage
    const saved = localStorage.getItem('learningUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const res    = await learningAPI.getUserByEmail(parsed.email);
        if (res.data?.success) {
          const freshUser = res.data.data;
          localStorage.setItem('learningUser', JSON.stringify(freshUser));
          setActiveUser(freshUser);
        }
      } catch {}
    }
    // 
  };

  const fade = (delay) => ({
    opacity:    headerLoaded ? 1 : 0,
    transform:  headerLoaded ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Pattern detail modal */}
      {selectedPattern && (
        <PatternDetailModal
          pattern={selectedPattern}
          onClose={() => setSelectedPattern(null)}
        />
      )}

      {/*according content view*/}
      {viewContent && (
        <AccordionViewer
          content={viewContent}
          user={activeUser}
          onUserRegistered={(u) => {
            setActiveUser(u);
            localStorage.setItem('learningUser', JSON.stringify(u));
          }}
          onBack={() => { setViewContent(null); }}
          onAllComplete={() => {}}
        />
      )}

      {/*main learning */}
      {!viewContent && (<>

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
                { Icon: RiPaletteLine,  label: `${patterns.length} Patterns` },
                { Icon: RiBox3Line,     label: `${arArtworks.length} 3D Models` },
                { Icon: RiUserLine,     label: 'Free Access' },
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

      {/*traditional patterns */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-6">

          {/* section heading */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#C97B5A]"/>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">Sri Lankan motifs</span>
            </div>
            <h2 className="font-heading text-3xl text-[#3D3530]">Traditional  Decorative Motifs</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#C97B5A] border-[#C97B5A]/20 animate-spin"/>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 items-start">

              {/* left info pannel*/}
              <div className="lg:w-[38%] flex-shrink-0">

                {/* classification image */}
                <div className="rounded-xl overflow-hidden border border-[#E8DDD5] shadow-sm bg-white mb-6">
                  <img
                    src="/images/classification.png"
                    alt="Classification of Traditional Sri Lankan Decorative Motifs"
                    className="w-full object-contain"
                    style={{ maxHeight: 220 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>

                {/* title */}
                <h3 className="font-heading text-base text-[#3D3530] leading-snug mb-3">
                  Classification of Traditional Sri Lankan Decorative Motifs with Fundamental Design Elements
                </h3>

                {/* accent divider */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-[#C97B5A]/50"/>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C97B5A]/60"/>
                  <div className="w-4 h-px bg-[#C97B5A]/30"/>
                </div>

                {/* description */}
                <p className="font-body text-xs leading-[1.9] text-[#6B5A50]">
                  This diagram presents the classification of traditional Sri Lankan decorative motifs along with one of
                  the fundamental design elements used in their creation. Traditional motifs are stylized artistic forms
                  inspired by nature, religion, and cultural beliefs, and are not direct representations of reality but
                  creatively transformed designs.
                  <br/><br/>
                  Sri Lankan decorative motifs are mainly categorized into four groups: <strong>Divine, Animal, Floral
                  (Botanical),</strong> and <strong>Inanimate</strong> motifs. The <strong>Vaka Deka</strong> (double curve)
                  is considered a fundamental design element — a flowing, curved shape derived from natural forms such as
                  waves, leaves, or animal bodies. Through repetition, rotation, and combination of this curved form,
                  artists create intricate patterns used in murals, wood carvings, stone carvings, and metalwork.
                </p>

                {/* vaka deka & thirigi thalaya */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {[
                    { src: '/images/vaka deka.png',       alt: 'Vaka Deka' },
                    { src: '/images/thirigi thalaya.png', alt: 'Thirigi Thalaya' },
                  ].map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-[#E8DDD5] shadow-sm bg-white">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full object-contain"
                        style={{ maxHeight: 180 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* pattern cards */}
              <div className="flex-1 min-w-0">
                {patterns.length === 0 ? (
                  <div className="text-center py-16 text-[#9A8880]">
                    <RiPaletteLine size={40} className="mx-auto mb-3 opacity-20"/>
                    <p className="font-body text-sm">No patterns added yet.</p>
                  </div>
                ) : (() => {
                  const totalPages = Math.ceil(patterns.length / PATTERNS_PER_PAGE);
                  const start      = patternPage * PATTERNS_PER_PAGE;
                  const visible    = patterns.slice(start, start + PATTERNS_PER_PAGE);
                  return (
                    <>
                      {/* cards grid 2×2 */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {visible.map(p => (
                          <div
                            key={p._id}
                            onClick={() => setSelectedPattern(p)}
                            className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8DDD5] hover:border-[#C97B5A]/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                          >
                            <div className="overflow-hidden" style={{ aspectRatio: '4/3' }}>
                              {p.image
                                ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                : <div className="w-full h-full bg-gradient-to-br from-[#C97B5A]/10 to-[#7A9E8E]/10 flex items-center justify-center">
                                    <RiPaletteLine size={28} className="text-[#C97B5A]/40"/>
                                  </div>
                              }
                            </div>
                            <div className="p-4">
                              <p className="font-body text-sm font-medium text-[#3D3530] truncate">{p.title}</p>
                              {p.description && (
                                <p className="font-body text-[11px] text-[#9A8880] mt-1 line-clamp-2">{p.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* prev / next */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setPatternPage(p => Math.max(0, p - 1))}
                            disabled={patternPage === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium font-body border border-[#E8DDD5] text-[#6B5A50] hover:border-[#C97B5A]/50 hover:text-[#C97B5A] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                          >
                            <RiArrowRightLine size={15} className="rotate-180"/> Previous
                          </button>

                          {/* page dots */}
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setPatternPage(i)}
                                className={`rounded-full transition-all duration-300 h-2 ${
                                  i === patternPage ? 'w-5 bg-[#C97B5A]' : 'w-2 bg-[#D9D0CB]'
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => setPatternPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={patternPage === totalPages - 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium font-body border border-[#E8DDD5] text-[#6B5A50] hover:border-[#C97B5A]/50 hover:text-[#C97B5A] disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                          >
                            Next <RiArrowRightLine size={15}/>
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

            </div>
          )}
        </div>
      </section>

      {/*3D Artworks */}
      {arArtworks.length > 0 && (() => {
        const arTotalPages = Math.ceil(arArtworks.length / AR_PER_PAGE);
        const arVisible    = arArtworks.slice(arPage * AR_PER_PAGE, arPage * AR_PER_PAGE + AR_PER_PAGE);
        return (
        <section className="py-20" style={{ backgroundColor: '#FFF8E1' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
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
              {/* prev / next buttons */}
              {arTotalPages > 1 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setArPage(p => Math.max(0, p - 1))}
                    disabled={arPage === 0}
                    className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderColor: 'rgba(201,123,90,0.35)', color: '#C97B5A' }}
                    onMouseEnter={e => { if (arPage !== 0) e.currentTarget.style.background = '#C97B5A'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C97B5A'; }}
                  >
                    <RiArrowRightLine size={16} className="rotate-180"/>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: arTotalPages }).map((_, i) => (
                      <button key={i} onClick={() => setArPage(i)}
                        className="rounded-full transition-all duration-300 h-2"
                        style={{ width: i === arPage ? 20 : 8, background: i === arPage ? '#C97B5A' : 'rgba(201,123,90,0.3)' }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setArPage(p => Math.min(arTotalPages - 1, p + 1))}
                    disabled={arPage === arTotalPages - 1}
                    className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ borderColor: 'rgba(201,123,90,0.35)', color: '#C97B5A' }}
                    onMouseEnter={e => { if (arPage !== arTotalPages - 1) { e.currentTarget.style.background = '#C97B5A'; e.currentTarget.style.color = 'white'; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C97B5A'; }}
                  >
                    <RiArrowRightLine size={16}/>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {arVisible.map(art => (
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
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#C97B5A' }}>
                      <RiBox3Line size={10}/> 3D · AR
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(30,26,23,0.65)' }}>
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-body text-white"
                        style={{ background: 'linear-gradient(135deg, #C97B5A, #b56a4a)', boxShadow: '0 4px 20px rgba(201,123,90,0.5)' }}>
                        <RiEyeLine size={15}/> View in 3D / AR
                      </div>
                    </div>
                  </div>
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
        );
      })()}

      {/*learning categories */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#C97B5A]"/>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">Learn</span>
              </div>
              <h2 className="font-heading text-3xl text-[#3D3530]">Learning Content</h2>
              <p className="font-body text-sm text-[#9A8880] mt-2">
                Select a category to begin. Register to track your progress chapter by chapter.
              </p>
            </div>
            {/* prev / next */}
            {Math.ceil(categories.length / CATS_PER_PAGE) > 1 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setCatPage(p => Math.max(0, p - 1))}
                  disabled={catPage === 0}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A]/50 hover:text-[#C97B5A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <RiArrowRightLine size={16} className="rotate-180"/>
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.ceil(categories.length / CATS_PER_PAGE) }).map((_, i) => (
                    <button key={i} onClick={() => setCatPage(i)}
                      className={`rounded-full transition-all duration-300 h-2 ${
                        i === catPage ? 'w-5 bg-[#C97B5A]' : 'w-2 bg-[#D9D0CB]'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCatPage(p => Math.min(Math.ceil(categories.length / CATS_PER_PAGE) - 1, p + 1))}
                  disabled={catPage === Math.ceil(categories.length / CATS_PER_PAGE) - 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-[#E8DDD5] text-[#9A8880] hover:border-[#C97B5A]/50 hover:text-[#C97B5A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <RiArrowRightLine size={16}/>
                </button>
              </div>
            )}
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
              {categories.slice(catPage * CATS_PER_PAGE, catPage * CATS_PER_PAGE + CATS_PER_PAGE).map(cat => {
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
    </>)}
    </div>
  );
}