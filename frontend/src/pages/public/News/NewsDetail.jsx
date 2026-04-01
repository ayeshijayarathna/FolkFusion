import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, MapPin, ArrowLeft, Calendar, Eye, Share2,
  Facebook, Twitter, Linkedin, Copy, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { newsAPI } from '../../../services/api';

const formatDate = (d, opts = { month: 'long', day: 'numeric', year: 'numeric' }) =>
  new Date(d).toLocaleDateString('en-US', opts);

const CATEGORY_CLASSES = {
  'Training Program': { bg: 'bg-[#5F8B8C]/12', text: 'text-[#2e6566]', border: 'border-[#5F8B8C]/30'  },
  'Exhibition':       { bg: 'bg-[#A67C52]/12', text: 'text-[#7a5230]', border: 'border-[#A67C52]/30'  },
  'Achievement':      { bg: 'bg-[#D4AF37]/15', text: 'text-[#7a6010]', border: 'border-[#D4AF37]/35'  },
  'Technology':       { bg: 'bg-[#4A3F35]/10', text: 'text-[#4A3F35]', border: 'border-[#4A3F35]/25'  },
  'Workshop':         { bg: 'bg-[#8DAA91]/15', text: 'text-[#4a7a55]', border: 'border-[#8DAA91]/30'  },
  'Festival':         { bg: 'bg-[#C48A6A]/15', text: 'text-[#8b4a1e]', border: 'border-[#C48A6A]/30'  },
  'Announcement':     { bg: 'bg-[#5F8B8C]/10', text: 'text-[#2e6566]', border: 'border-[#5F8B8C]/25'  },
  'Other':            { bg: 'bg-[#4A3F35]/08', text: 'text-[#6b5a4e]', border: 'border-[#4A3F35]/20'  },
};
const getCatClasses = (cat) => CATEGORY_CLASSES[cat] || CATEGORY_CLASSES['Other'];

/* ── Gallery ── */
const Gallery = ({ images, title }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C52]" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#A67C52]">Photo Gallery</h3>
      </div>

      {/* Main viewer */}
      <div className="relative rounded-2xl overflow-hidden mb-3 h-[380px]">
        <img
          src={images[idx]}
          alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover transition-all duration-500"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140a04]/50 via-transparent to-transparent" />
        <span className="absolute bottom-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full bg-black/55 text-white backdrop-blur-md">
          {idx + 1} / {images.length}
        </span>
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-white/18 backdrop-blur-md border border-white/25 text-white hover:bg-white/30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-white/18 backdrop-blur-md border border-white/25 text-white hover:bg-white/30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-[72px] h-[52px] rounded-xl overflow-hidden transition-all duration-200 ${
                i === idx
                  ? 'border-2 border-[#A67C52] opacity-100 scale-[1.04]'
                  : 'border-2 border-transparent opacity-60 scale-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Share Menu ── */
const ShareMenu = ({ news, open, onClose }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const share = (platform) => {
    const enc = encodeURIComponent;
    const actions = {
      facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, '_blank', 'width=600,height=400'),
      twitter:  () => window.open(`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(news.title)}`, '_blank', 'width=600,height=400'),
      linkedin: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, '_blank', 'width=600,height=400'),
      whatsapp: () => window.open(`https://wa.me/?text=${enc(news.title + ' ' + url)}`, '_blank'),
      copy:     () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); },
    };
    actions[platform]?.();
    if (platform !== 'copy') onClose();
  };

  if (!open) return null;

  const items = [
    { key: 'facebook', label: 'Facebook',   bg: 'bg-[#1877F2]', icon: <Facebook size={14} fill="white" className="text-white" /> },
    { key: 'twitter',  label: 'X / Twitter', bg: 'bg-black',     icon: <Twitter  size={14} fill="white" className="text-white" /> },
    { key: 'linkedin', label: 'LinkedIn',   bg: 'bg-[#0A66C2]', icon: <Linkedin size={14} fill="white" className="text-white" /> },
    { key: 'whatsapp', label: 'WhatsApp',   bg: 'bg-[#25D366]', icon: (
      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )},
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 z-50 w-[220px] rounded-2xl overflow-hidden bg-white shadow-[0_20px_60px_rgba(74,63,53,0.2)] border border-[#A67C52]/15">
        <div className="px-4 py-3 border-b border-[#A67C52]/10 bg-gradient-to-br from-[#D4AF37]/06 to-[#A67C52]/04">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A67C52]">Share Article</p>
        </div>
        <div className="p-2">
          {items.map(({ key, label, bg, icon }) => (
            <button
              key={key}
              onClick={() => share(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-[#4A3F35] hover:bg-[#F4EDE4]"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                {icon}
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
          <div className="my-1.5 border-t border-dashed border-[#A67C52]/20" />
          <button
            onClick={() => share('copy')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[#4A3F35] hover:bg-[#F4EDE4]"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${copied ? 'bg-[#8DAA91]' : 'bg-[#5F8B8C]'}`}>
              {copied ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white" />}
            </div>
            <span className="text-xs font-semibold">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Related Card ── */
const RelatedCard = ({ item }) => {
  const cs = getCatClasses(item.category);
  return (
    <Link
      to={`/news/${item._id}`}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col shadow-[0_2px_12px_rgba(74,63,53,0.07)] border border-[#A67C52]/10 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(74,63,53,0.14)] transition-all duration-250"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#A67C52] to-[#C48A6A]">
        <img
          src={item.images?.[0] || '/images/placeholder.jpg'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140a04]/60 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-white/92 border ${cs.text} ${cs.border}`}>
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="w-7 h-0.5 rounded-full mb-3 bg-gradient-to-r from-[#D4AF37] to-[#A67C52]" />
        <h4 className="font-bold text-sm leading-snug line-clamp-2 mb-2 text-[#4A3F35] group-hover:text-[#A67C52] transition-colors">
          {item.title}
        </h4>
        <p className="text-xs line-clamp-2 flex-1 mb-3 text-[#2E2E2E]/60">{item.excerpt}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-[#A67C52]">
          <Clock size={11} />
          <span className="font-medium">{formatDate(item.date, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
};

/* ── Main ── */
const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [relatedNews, setRelated] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => { fetchDetail(); window.scrollTo(0, 0); }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await newsAPI.getById(id);
      if (res.data.success) {
        setNews(res.data.data);
        fetchRelated(res.data.data.category);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRelated = async (category) => {
    try {
      const res = await newsAPI.getAll({ category, limit: 4 });
      if (res.data.success) setRelated(res.data.data.filter(i => i._id !== id).slice(0, 3));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4EDE4] to-[#ede2d5]">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-[#A67C52]/12" />
          <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-[#A67C52]" />
        </div>
        <p className="text-sm font-medium text-[#A67C52]">Loading article…</p>
      </div>
    </div>
  );

  if (!news) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4EDE4] to-[#ede2d5]">
      <div className="text-center">
        <div className="text-6xl mb-5"></div>
        <h2 className="text-xl font-bold mb-4 text-[#4A3F35]">Article Not Found</h2>
        <Link
          to="/news"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block bg-gradient-to-br from-[#A67C52] to-[#8b5e38] shadow-[0_4px_14px_rgba(166,124,82,0.3)] hover:opacity-90 transition-opacity"
        >
          ← Back to News
        </Link>
      </div>
    </div>
  );

  const cs = getCatClasses(news.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EDE4] to-[#ede2d5]">

      {/* Hero */}
     
        <div className="relative overflow-hidden bg-cover bg-center"style={{height: 'clamp(320px, 52vh, 520px)',backgroundImage: "url('/images/detail.jpg')" }}>
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
            <div className="max-w-4xl mx-auto">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3 bg-white/90 border ${cs.text} ${cs.border}`}>
                {news.category}
              </span>
              <h1
                className="font-bold text-white leading-tight drop-shadow-xl"
                style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', letterSpacing: '-0.02em', maxWidth: 700 }}
              >
                {news.title}
              </h1>
            </div>
          </div>
        </div>

      {/* article boady */}
      <div className="max-w-4xl mx-auto px-6 py-10 pb-0">

        {/* back link */}
       <button onClick={() => navigate('/news')}className="flex items-center gap-2 mb-7 text-sm font-semibold text-[#A67C52] hover:text-[#4A3F35] transition-colors" ><ArrowLeft size={15} /> Back to News</button>

        <div className={`flex flex-wrap items-center gap-x-5 gap-y-2.5 py-5 mb-7 border-b border-[#A67C52]/15 ${news.images?.[0] ? 'border-t border-[#A67C52]/15 mt-1.5' : ''}`}>
          <div className="flex items-center gap-1.5 text-sm text-[#5F8B8C]">
            <Calendar size={14} />
            <span className="font-medium">{formatDate(news.date)}</span>
          </div>

          {news.location && (
            <div className="flex items-center gap-1.5 text-sm text-[#5F8B8C]">
              <MapPin size={14} />
              <span className="font-medium">{news.location}</span>
            </div>
          )}

          {news.views !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-[#5F8B8C]">
              <Eye size={14} />
              <span className="font-medium">{Number(news.views).toLocaleString()} views</span>
            </div>
          )}

          {/* share btn */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShareOpen(o => !o)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                shareOpen
                  ? 'bg-gradient-to-br from-[#A67C52] to-[#8b5e38] text-white shadow-[0_4px_14px_rgba(166,124,82,0.3)]'
                  : 'bg-white text-[#A67C52] border-[1.5px] border-[#A67C52]/25 shadow-[0_2px_8px_rgba(74,63,53,0.07)]'
              }`}
            >
              <Share2 size={14} /> Share
            </button>
            <ShareMenu news={news} open={shareOpen} onClose={() => setShareOpen(false)} />
          </div>
        </div>

        {/* excerpt */}
        {news.excerpt && (
          <div className="relative mb-8 pl-5 py-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#A67C52]" />
            <p className="text-base italic leading-relaxed text-[#4A3F35]">
              {news.excerpt}
            </p>
          </div>
        )}

        {/* description */}
        <div className="rounded-2xl p-7 mb-2 bg-white shadow-[0_2px_16px_rgba(74,63,53,0.07)] border border-[#A67C52]/10">
          <div className="text-[15px] leading-[1.9] whitespace-pre-line text-[#2E2E2E]/88">
            {news.description}
          </div>
        </div>

        {/* gallery */}
        {news.images?.length > 0 && <Gallery images={news.images} title={news.title} />}

        {/* tags / province */}
        <div className="flex flex-wrap gap-3 mt-10 pb-12 border-t border-dashed border-[#A67C52]/20 pt-6">
          {news.province && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#5F8B8C]/10 text-[#2e6566] border border-[#5F8B8C]/22">
              <MapPin size={13} /> {news.province}
            </div>
          )}
          {news.isFeatured && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#D4AF37]/12 text-[#7a6010] border border-[#D4AF37]/28">
              ★ Featured Article
            </div>
          )}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${cs.bg} ${cs.text} ${cs.border}`}>
            {news.category}
          </div>
        </div>
      </div>

      {/* related news */}
      {relatedNews.length > 0 && (
        <section className="py-14 bg-white/55 border-t border-[#A67C52]/10">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C52]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#A67C52]">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedNews.map(item => <RelatedCard key={item._id} item={item} />)}
            </div>
          </div>
        </section>
      )}

      {/* bottem nav*/}
      <div className="py-8 border-t border-[#A67C52]/12">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-sm font-bold text-[#A67C52] hover:text-[#4A3F35] transition-colors"
          >
            <ArrowLeft size={15} /> All Articles
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-[#F4EDE4] text-[#A67C52] border-[1.5px] border-[#A67C52]/20 hover:bg-[#A67C52]/10 transition-colors"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;