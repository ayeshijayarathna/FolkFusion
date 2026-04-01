import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, Heart, Eye, MapPin, Palette,
  SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { CATEGORY_OPTIONS, PROVINCE_OPTIONS } from '../../../utils/constants';

const Skel = ({ h }) => (
  <div className="g-masonry-item">
    <div className="g-shimmer rounded-2xl" style={{ height: h }} />
  </div>
);

const ArtCard = ({ artwork, liked, onLike, idx }) => {
  const src = artwork.images?.[0]?.url || artwork.images?.[0] || null;
  const [pop, setPop] = useState(false);

  const doLike = (e) => {
    e.preventDefault(); e.stopPropagation();
    setPop(false);
    requestAnimationFrame(() => setPop(true));
    onLike(artwork._id, e);
    setTimeout(() => setPop(false), 380);
  };

  return (
    <div className="g-masonry-item g-fadeup" style={{ animationDelay: `${Math.min(idx * 50, 460)}ms` }}>
      <Link to={`/gallery/${artwork._id}`} className="g-card block rounded-2xl overflow-hidden bg-white shadow-md">
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#A67C52,#C48A6A)' }}>
          {src
            ? <img src={src} alt={artwork.title} loading="lazy" className="g-card-img w-full h-auto block" onError={e => e.target.style.display = 'none'} />
            : <div className="flex items-center justify-center h-48"><Palette size={36} className="text-white/40" /></div>
          }
          <div className="g-overlay absolute inset-0 flex flex-col justify-end p-4"
            style={{ background: 'linear-gradient(to top,rgba(30,18,8,.82) 0%,rgba(30,18,8,.04) 60%,transparent 100%)' }}>
            <span className="inline-block text-xs px-2.5 py-1 rounded-full mb-2 font-semibold"
              style={{ background: 'rgba(166,124,82,.9)', color: '#fff', fontFamily: "'Libre Baskerville',serif", width: 'fit-content' }}>
              {artwork.category}
            </span>
            <p className="text-white font-bold truncate mb-0.5" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 12 }}>{artwork.title}</p>
            <p className="text-white/65 text-xs mb-3" style={{ fontFamily: "'Libre Baskerville',serif" }}>by {artwork.artist?.fullName || 'Unknown'}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white/75 text-xs" style={{ fontFamily: "'Libre Baskerville',serif" }}>
                <Eye size={12} />{artwork.views || 0}
              </span>
              <button onClick={doLike}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/30 transition-all"
                style={{ background: liked ? 'rgba(220,38,38,.85)' : 'rgba(255,255,255,.18)', color: '#fff', fontFamily: "'Libre Baskerville',serif" }}>
                <Heart size={12} fill={liked ? 'currentColor' : 'none'} className={pop ? 'g-heart-pop' : ''} />
                {artwork.likes || 0}
              </button>
            </div>
          </div>
          {artwork.isFeatured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(212,175,55,.92)', color: '#4A3F35', fontFamily: "'Libre Baskerville',serif" }}>
              <Sparkles size={10} />Featured
            </div>
          )}
          {artwork.isForSale && artwork.price?.amount && (
            <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,.92)', color: '#A67C52', fontFamily: "'Libre Baskerville',serif" }}>
              Rs.{artwork.price.amount.toLocaleString()}
            </div>
          )}
        </div>
        <div className="px-4 py-3">
          <p className="font-bold truncate" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 12, color: '#4A3F35' }}>{artwork.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs" style={{ fontFamily: "'Libre Baskerville',serif", color: 'rgba(46,46,46,.5)' }}>{artwork.artist?.fullName || 'Unknown'}</span>
            {artwork.artist?.province && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#8DAA91', fontFamily: "'Libre Baskerville',serif" }}>
                <MapPin size={9} />{artwork.artist.province}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

const FeaturedCarousel = ({ items }) => {
  const [cur, setCur] = useState(0);
  const tmr = useRef(null);
  const go = useCallback((d) => setCur(p => (p + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    tmr.current = setInterval(() => go(1), 5500);
    return () => clearInterval(tmr.current);
  }, [go]);

  if (!items.length) return null;
  const art = items[cur];
  const src = art.images?.[0]?.url || art.images?.[0] || null;

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom,#D4AF37,#A67C52)' }} />
          <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 'clamp(1rem,3vw,1.5rem)', color: '#4A3F35' }}>
            Featured Artworks
          </h2>
          <Sparkles size={16} style={{ color: '#D4AF37' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <Link to={`/gallery/${art._id}`} className="relative rounded-2xl overflow-hidden shadow-xl block group" style={{ minHeight: 400 }}>
          {src
            ? <img src={src} alt={art.title} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
            : <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#A67C52,#C48A6A)' }}><Palette size={60} className="text-white/30" /></div>
          }
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(30,18,8,.88) 0%,rgba(30,18,8,.15) 55%,transparent 100%)' }} />
          <div className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(212,175,55,.95)', color: '#4A3F35', fontFamily: "'Libre Baskerville',serif" }}>
            <Sparkles size={11} />Featured
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block text-xs px-3 py-1 rounded-full mb-3 font-semibold"
              style={{ background: 'rgba(166,124,82,.85)', color: '#fff', fontFamily: "'Libre Baskerville',serif" }}>
              {art.category}
            </span>
            <h3 className="text-white mb-2 leading-tight" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 'clamp(1.1rem,3vw,1.9rem)' }}>{art.title}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm" style={{ fontFamily: "'Libre Baskerville',serif" }}>by {art.artist?.fullName || 'Unknown'}</p>
                {art.artist?.province && <p className="flex items-center gap-1 text-white/50 text-xs mt-0.5" style={{ fontFamily: "'Libre Baskerville',serif" }}><MapPin size={10} />{art.artist.province}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-white/65 text-sm" style={{ fontFamily: "'Libre Baskerville',serif" }}><Eye size={13} />{art.views || 0}</span>
                <span className="flex items-center gap-1 text-white/65 text-sm" style={{ fontFamily: "'Libre Baskerville',serif" }}><Heart size={13} />{art.likes || 0}</span>
                {art.isForSale && art.price?.amount && <span className="font-bold text-sm" style={{ color: '#D4AF37', fontFamily: "'Cinzel Decorative',serif" }}>Rs.{art.price.amount.toLocaleString()}</span>}
              </div>
            </div>
          </div>
          {items.length > 1 && (
            <>
              <button onClick={e => { e.preventDefault(); go(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', color: '#fff', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
              <button onClick={e => { e.preventDefault(); go(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', color: '#fff', border: 'none', cursor: 'pointer' }}><ChevronRight size={20} /></button>
              <div className="absolute bottom-5 right-6 flex gap-1.5">
                {items.map((_, i) => <button key={i} onClick={e => { e.preventDefault(); setCur(i); }} className="rounded-full transition-all" style={{ width: i === cur ? 22 : 7, height: 7, background: i === cur ? '#D4AF37' : 'rgba(255,255,255,.4)', border: 'none', cursor: 'pointer' }} />)}
              </div>
            </>
          )}
        </Link>

        <div className="flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: 420 }}>
          {items.map((a, i) => {
            const ts = a.images?.[0]?.url || a.images?.[0];
            const active = i === cur;
            return (
              <button key={a._id} onClick={() => setCur(i)}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2"
                style={{ borderColor: active ? '#A67C52' : 'transparent', background: active ? 'rgba(166,124,82,.08)' : 'rgba(255,255,255,.75)', backdropFilter: 'blur(4px)', cursor: 'pointer', width: '100%' }}>
                <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#A67C52,#C48A6A)' }}>
                  {ts && <img src={ts} alt={a.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate" style={{ fontFamily: "'Cinzel Decorative',serif", color: '#4A3F35', fontSize: 11 }}>{a.title}</p>
                  <p className="text-xs truncate mt-0.5" style={{ fontFamily: "'Libre Baskerville',serif", color: 'rgba(46,46,46,.5)' }}>{a.artist?.fullName || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#8DAA91', fontFamily: "'Libre Baskerville',serif" }}><Eye size={9} />{a.views || 0}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#A67C52', fontFamily: "'Libre Baskerville',serif" }}><Heart size={9} />{a.likes || 0}</span>
                  </div>
                </div>
                {active && <div className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ background: '#A67C52' }} />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks]             = useState([]);
  const [featured, setFeatured]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [featLoading, setFeatLoading]       = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeProvince, setActiveProvince] = useState(PROVINCE_OPTIONS[0]);
  const [search, setSearch]                 = useState('');
  const [showFilters, setShowFilters]       = useState(false);
  const [pagination, setPagination]         = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [likedArtworks, setLikedArtworks]   = useState(() => JSON.parse(localStorage.getItem('likedArtworks') || '[]'));
  const catRef = useRef(null);
  const sTmr   = useRef(null);

  useEffect(() => {
    const load = async () => {
      setFeatLoading(true);
      try {
        const res = await axios.get('/api/artworks/featured');
        if (res.data.success) setFeatured(res.data.data?.filter(a => a.images?.length > 0) || []);
      } catch {}
      finally { setFeatLoading(false); }
    };
    load();
  }, []);

  const fetchArtworks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page, limit: 20,
        ...(activeCategory !== 'All' && { category: activeCategory }),
        ...(activeProvince !== PROVINCE_OPTIONS[0] && { province: activeProvince }),
        ...(search && { search }),
      };
      const res = await axios.get('/api/artworks', { params });
      if (res.data.success) {
        setArtworks(res.data.data || []);
        setPagination({ currentPage: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
      }
    } catch { setArtworks([]); }
    finally { setLoading(false); }
  }, [activeCategory, activeProvince, search]);

  useEffect(() => { fetchArtworks(1); }, [activeCategory, activeProvince]);
  useEffect(() => {
    clearTimeout(sTmr.current);
    sTmr.current = setTimeout(() => fetchArtworks(1), 400);
    return () => clearTimeout(sTmr.current);
  }, [search]);

  const handleLike = async (artworkId, e) => {
    e?.preventDefault(); e?.stopPropagation();
    const isLiked = likedArtworks.includes(artworkId);
    const updated = isLiked ? likedArtworks.filter(id => id !== artworkId) : [...likedArtworks, artworkId];
    setLikedArtworks(updated);
    localStorage.setItem('likedArtworks', JSON.stringify(updated));
    setArtworks(prev => prev.map(a => a._id === artworkId ? { ...a, likes: (a.likes || 0) + (isLiked ? -1 : 1) } : a));
    try {
      const res = await axios.post(`/api/artworks/${artworkId}/like`, { action: isLiked ? 'unlike' : 'like' });
      if (res.data.success) setArtworks(prev => prev.map(a => a._id === artworkId ? { ...a, likes: res.data.data.likes } : a));
    } catch {}
  };

  const changeCategory = (cat) => {
    setActiveCategory(cat);
    cat !== 'All' ? setSearchParams({ category: cat }) : setSearchParams({});
  };
  const scrollCats = (d) => catRef.current?.scrollBy({ left: d * 220, behavior: 'smooth' });
  const skelH = [240, 320, 260, 360, 220, 300, 250, 340, 280, 210, 380, 250];
  const showFeatured = activeCategory === 'All' && !search && activeProvince === PROVINCE_OPTIONS[0];

  return (
    <div className="min-h-screen" style={{ background: '#F4EDE4' }}>

      {/* hero section*/}
      <section className="relative overflow-hidden" style={{ minHeight: 320 }}>
        <div className="absolute inset-0">
          <img src="/images/pt.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" />
        </div>
      
        <div className="relative z-10 flex flex-col items-center justify-center text-center pt-30 px-6 py-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-10" style={{ background: 'linear-gradient(to right,transparent,#D4AF37)' }} />
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#A67C52', fontFamily: "'Libre Baskerville',serif", letterSpacing: '.3em' }}>
              Sri Lanka Folk Art Collection
            </p>
            <div className="h-px w-10" style={{ background: 'linear-gradient(to left,transparent,#D4AF37)' }} />
          </div>
          <h1 className="text-black mb-4" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 'clamp(2.2rem,7vw,5rem)', fontWeight: 700, lineHeight: 1.06 }}>
            Artwork Gallery
          </h1>
          <p className="max-w-lg mb-8" style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, color: '#4A3F35', lineHeight: 1.8 }}>
            Discover the living heritage of Sri Lankan artisans — each piece carries centuries of tradition
          </p>
          <div className="relative w-full max-w-lg">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#A67C52' }} />
            <input type="text" placeholder="Search artworks, artists…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl border-0 outline-none"
              style={{ background: 'rgba(255,255,255,.95)', fontFamily: "'Libre Baskerville',serif", fontSize: 14, color: '#4A3F35', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(46,46,46,.35)' }}><X size={15} /></button>}
          </div>
        </div>
      </section>

      {/* sticky filter bar */}
      <div className="sticky top-0 z-40 border-b" style={{ background: 'rgba(244,237,228,.96)', backdropFilter: 'blur(14px)', borderColor: 'rgba(166,124,82,.15)', boxShadow: '0 2px 16px rgba(0,0,0,.05)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => scrollCats(-1)} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2"
              style={{ background: 'white', borderColor: 'rgba(166,124,82,.2)', color: '#A67C52', cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <div ref={catRef} className="cat-scroll flex gap-2 overflow-x-auto flex-1">
              {CATEGORY_OPTIONS.map(cat => (
                <button key={cat} onClick={() => changeCategory(cat)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap"
                  style={{ fontFamily: "'Libre Baskerville',serif", background: activeCategory === cat ? '#A67C52' : 'white', color: activeCategory === cat ? 'white' : '#4A3F35', borderColor: activeCategory === cat ? '#A67C52' : 'rgba(166,124,82,.2)', cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => scrollCats(1)} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2"
              style={{ background: 'white', borderColor: 'rgba(166,124,82,.2)', color: '#A67C52', cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all"
              style={{ fontFamily: "'Libre Baskerville',serif", background: showFilters || activeProvince !== PROVINCE_OPTIONS[0] ? '#A67C52' : 'white', color: showFilters || activeProvince !== PROVINCE_OPTIONS[0] ? 'white' : '#4A3F35', borderColor: showFilters || activeProvince !== PROVINCE_OPTIONS[0] ? '#A67C52' : 'rgba(166,124,82,.2)', cursor: 'pointer' }}>
              <SlidersHorizontal size={13} /> Filter
              {activeProvince !== PROVINCE_OPTIONS[0] && <span className="w-2 h-2 rounded-full" style={{ background: '#D4AF37' }} />}
            </button>
          </div>
          {showFilters && (
            <div className="pb-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: '#4A3F35', fontFamily: "'Libre Baskerville',serif" }}>Province:</span>
              {PROVINCE_OPTIONS.map(p => (
                <button key={p} onClick={() => setActiveProvince(p)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                  style={{ fontFamily: "'Libre Baskerville',serif", background: activeProvince === p ? '#8DAA91' : 'white', color: activeProvince === p ? 'white' : '#4A3F35', borderColor: activeProvince === p ? '#8DAA91' : 'rgba(141,170,145,.25)', cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* main content */}
      <main className="max-w-screen-xl mx-auto px-4 py-10">
        {showFeatured && (
          featLoading ? (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 rounded-full g-shimmer" />
                <div className="h-6 w-52 g-shimmer rounded-lg" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                <div className="g-shimmer rounded-2xl" style={{ height: 420 }} />
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="g-shimmer rounded-xl h-24" />)}
                </div>
              </div>
            </div>
          ) : featured.length > 0 ? <FeaturedCarousel items={featured} /> : null
        )}

        {showFeatured && !featLoading && featured.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(166,124,82,.3))' }} />
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#D4AF37,#A67C52)' }} />
              <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 15, color: '#4A3F35' }}>All Artworks</span>
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#A67C52,#D4AF37)' }} />
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left,transparent,rgba(166,124,82,.3))' }} />
          </div>
        )}

        {!loading && (
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
            <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 'clamp(.95rem,2.5vw,1.3rem)', color: '#4A3F35' }}>
              {activeCategory !== 'All' ? activeCategory : ''}
              {activeProvince !== PROVINCE_OPTIONS[0] && (
                <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 12, color: '#8DAA91', marginLeft: 8 }}>· {activeProvince}</span>
              )}
            </h2>
            <span style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13, color: 'rgba(46,46,46,.4)' }}>
              <b style={{ color: '#A67C52' }}>{pagination.total}</b> artworks
            </span>
          </div>
        )}

        {loading ? (
          <div className="g-masonry">{skelH.map((h, i) => <Skel key={i} h={h} />)}</div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-24">
            <Palette size={58} className="mx-auto mb-5" style={{ color: 'rgba(141,170,145,.4)' }} />
            <h3 className="mb-2" style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 20, color: '#4A3F35' }}>No Artworks Found</h3>
            <p className="mb-6" style={{ fontFamily: "'Libre Baskerville',serif", color: 'rgba(46,46,46,.4)' }}>Try adjusting your filters or search terms</p>
            <button onClick={() => { setSearch(''); changeCategory('All'); setActiveProvince(PROVINCE_OPTIONS[0]); setShowFilters(false); }}
              className="px-6 py-3 rounded-full text-white font-semibold"
              style={{ background: '#A67C52', fontFamily: "'Libre Baskerville',serif", border: 'none', cursor: 'pointer' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="g-masonry">
            {artworks.map((a, idx) => (
              <ArtCard key={a._id} artwork={a} liked={likedArtworks.includes(a._id)} onLike={handleLike} idx={idx} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && !loading && (
          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
            <button onClick={() => fetchArtworks(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all disabled:opacity-40"
              style={{ fontFamily: "'Libre Baskerville',serif", background: 'white', borderColor: 'rgba(166,124,82,.2)', color: '#4A3F35', cursor: 'pointer' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
              let p = i + 1;
              if (pagination.totalPages > 7) { const mid = Math.min(Math.max(pagination.currentPage, 4), pagination.totalPages - 3); p = mid - 3 + i; }
              if (p < 1 || p > pagination.totalPages) return null;
              const a = p === pagination.currentPage;
              return <button key={p} onClick={() => fetchArtworks(p)}
                className="w-10 h-10 rounded-full border-2 text-sm font-semibold transition-all"
                style={{ fontFamily: "'Libre Baskerville',serif", background: a ? '#A67C52' : 'white', color: a ? 'white' : '#4A3F35', borderColor: a ? '#A67C52' : 'rgba(166,124,82,.2)', cursor: 'pointer' }}>
                {p}
              </button>;
            })}
            <button onClick={() => fetchArtworks(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all disabled:opacity-40"
              style={{ fontFamily: "'Libre Baskerville',serif", background: 'white', borderColor: 'rgba(166,124,82,.2)', color: '#4A3F35', cursor: 'pointer' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}