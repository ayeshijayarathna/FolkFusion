import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Heart, Share2, MapPin, Calendar, Eye, ArrowLeft,
  ChevronLeft, ChevronRight, Palette, Tag, ShoppingCart,
  Sparkles, Ruler, Layers, Clock, X, ZoomIn
} from 'lucide-react';
import axios from 'axios';

const STYLES = `
  @keyframes adFadeIn { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
  @keyframes adHeartPop {
    0%{transform:scale(1);}40%{transform:scale(1.5);}70%{transform:scale(.88);}100%{transform:scale(1);}
  }
  .ad-fadein { animation:adFadeIn .45s ease both; }
  .ad-heart-pop { animation:adHeartPop .35s ease forwards; }
  .ad-thumb { transition:all .22s ease; border:2px solid transparent; cursor:pointer; }
  .ad-thumb:hover { transform:scale(1.04); }
  .ad-thumb.active { border-color:#A67C52; transform:scale(1.06); box-shadow:0 4px 14px rgba(166,124,82,.35); }
  .ad-related { transition:transform .28s ease, box-shadow .28s ease; }
  .ad-related:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(74,63,53,.14); }
  .ad-related:hover .ad-related-img { transform:scale(1.07); }
  .ad-related-img { transition:transform .45s ease; }
`;

export default function ArtworkDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [artwork, setArtwork]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [imgIdx, setImgIdx]         = useState(0);
  const [isLiked, setIsLiked]       = useState(false);
  const [likeCount, setLikeCount]   = useState(0);
  const [viewCount, setViewCount]   = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const [copied, setCopied]         = useState(false);
  const [heartAnim, setHeartAnim]   = useState(false);

  /* Fetch & view */
  useEffect(() => {
    window.scrollTo(0,0);
    setImgIdx(0);
    fetchArtwork();
    incrementView();
  }, [id]);

  const fetchArtwork = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/artworks/${id}`);
      if (res.data.success) {
        const d = res.data.data;
        setArtwork(d);
        setLikeCount(d.statistics?.likes ?? d.likes ?? 0);
        setViewCount(d.statistics?.views ?? d.views ?? 0);
        const liked = JSON.parse(localStorage.getItem('likedArtworks')||'[]');
        setIsLiked(liked.includes(id));
        if (d.category) fetchRelated(d.category);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchRelated = async (category) => {
    try {
      const res = await axios.get('/api/artworks', { params:{ category, limit:5 } });
      if (res.data.success) setRelated(res.data.data.filter(a=>a._id!==id).slice(0,4));
    } catch {}
  };

  const incrementView = async () => {
    try {
      const res = await axios.post(`/api/artworks/${id}/view`);
      if (res.data.success && res.data.data?.views) setViewCount(res.data.data.views);
    } catch {}
  };

  /* Like */
  const handleLike = async () => {
    const action = isLiked ? 'unlike' : 'like';
    setIsLiked(!isLiked);
    setLikeCount(p => p + (isLiked ? -1 : 1));
    setHeartAnim(false);
    requestAnimationFrame(() => setHeartAnim(true));
    setTimeout(() => setHeartAnim(false), 380);
    const arr = JSON.parse(localStorage.getItem('likedArtworks')||'[]');
    const updated = isLiked ? arr.filter(x=>x!==id) : [...arr,id];
    localStorage.setItem('likedArtworks', JSON.stringify(updated));
    try {
      const res = await axios.post(`/api/artworks/${id}/like`, { action });
      if (res.data.success) setLikeCount(res.data.data.likes);
    } catch {}
  };

  /* Share */
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title:artwork?.title, url:window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true); setTimeout(()=>setCopied(false),2000);
    }
  };

  const nextImg = () => setImgIdx(p => (p+1)%(artwork?.images?.length||1));
  const prevImg = () => setImgIdx(p => (p-1+(artwork?.images?.length||1))%(artwork?.images?.length||1));
  const getImgSrc = (img) => img?.url || img || null;

  /* Loading */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#F4EDE4' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:'#A67C52', borderTopColor:'transparent' }}/>
        <p style={{ fontFamily:"'Libre Baskerville',serif",color:'#A67C52',fontSize:14 }}>Loading artwork…</p>
      </div>
    </div>
  );

  if (!artwork) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:'#F4EDE4' }}>
      <div className="text-center">
        <Palette size={56} className="mx-auto mb-4" style={{ color:'rgba(141,170,145,.4)' }}/>
        <h2 className="mb-3" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:22,color:'#4A3F35' }}>Artwork Not Found</h2>
        <Link to="/gallery" style={{ fontFamily:"'Libre Baskerville',serif",color:'#A67C52',fontWeight:600 }}>
          Return to Gallery
        </Link>
      </div>
    </div>
  );

  const curImg = getImgSrc(artwork.images?.[imgIdx]);
  const price  = artwork.price?.amount || null;
  const imgs   = artwork.images || [];

  return (
    <div className="min-h-screen" style={{ background:'#F4EDE4' }}>
      <style>{STYLES}</style>

      {/* lightbox */}
      {lightbox && curImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,.93)' }}
          onClick={()=>setLightbox(false)}>
          <button className="absolute top-5 right-5 text-white/60 hover:text-white" style={{ background:'none',border:'none',cursor:'pointer',fontSize:24 }}>✕</button>
          <img src={curImg} alt={artwork.title} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e=>e.stopPropagation()}/>
          {imgs.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();prevImg();}}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',color:'#fff',border:'none',cursor:'pointer' }}>
                <ChevronLeft size={22}/>
              </button>
              <button onClick={e=>{e.stopPropagation();nextImg();}}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',color:'#fff',border:'none',cursor:'pointer' }}>
                <ChevronRight size={22}/>
              </button>
            </>
          )}
        </div>
      )}

      {/* breadcrumb */}
      <div style={{ background:'rgba(74,63,53,.06)',borderBottom:'1px solid rgba(166,124,82,.12)' }}>
        <div className="max-w-7xl mx-auto pt-30 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 font-semibold transition-colors hover:opacity-75 text-sm"
            style={{ color:'#A67C52',fontFamily:"'Libre Baskerville',serif",background:'none',border:'none',cursor:'pointer' }}
          >
            <ArrowLeft size={15}/> Gallery
          </button>
          <span style={{ color:'rgba(166,124,82,.4)' }}>/</span>
          <span className="truncate max-w-xs text-sm" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(74,63,53,.55)' }}>
            {artwork.title}
          </span>
        </div>
      </div>

      {/* main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">

          {/* left */}
          <div className="space-y-4 ad-fadein">

            {/* primary imges */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white cursor-zoom-in"
              style={{ aspectRatio:'1/1' }}
              onClick={()=>setLightbox(true)}>
              {curImg
                ? <img src={curImg} alt={artwork.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={e=>e.target.style.opacity='0'}/>
                : <div className="w-full h-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,rgba(166,124,82,.15),rgba(141,170,145,.1))' }}>
                    <Palette size={64} style={{ color:'rgba(166,124,82,.25)' }}/>
                  </div>
              }
              {/* zoom hint*/}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background:'rgba(255,255,255,.85)',backdropFilter:'blur(4px)' }}>
                <ZoomIn size={16} style={{ color:'#A67C52' }}/>
              </div>
              {/* badges */}
              {artwork.isFeatured && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background:'rgba(212,175,55,.95)',color:'#4A3F35',fontFamily:"'Libre Baskerville',serif" }}>
                  <Sparkles size={11}/>Featured
                </div>
              )}
              {/* nav arrows */}
              {imgs.length > 1 && (
                <>
                  <button onClick={e=>{e.stopPropagation();prevImg();}}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background:'rgba(255,255,255,.9)',border:'none',cursor:'pointer',color:'#4A3F35' }}>
                    <ChevronLeft size={20}/>
                  </button>
                  <button onClick={e=>{e.stopPropagation();nextImg();}}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background:'rgba(255,255,255,.9)',border:'none',cursor:'pointer',color:'#4A3F35' }}>
                    <ChevronRight size={20}/>
                  </button>
                  <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-xs text-white"
                    style={{ background:'rgba(0,0,0,.6)',fontFamily:"'Libre Baskerville',serif" }}>
                    {imgIdx+1}/{imgs.length}
                  </div>
                </>
              )}
            </div>

            {/* thumbnails */}
            {imgs.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {imgs.map((img,i) => (
                  <button key={i} onClick={()=>setImgIdx(i)}
                    className={`ad-thumb w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ${i===imgIdx?'active':''}`}
                    style={{ background:'linear-gradient(135deg,#A67C52,#C48A6A)',border:'none',padding:0 }}>
                    <img src={getImgSrc(img)} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}

            {/* stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(95,139,140,.12)' }}>
                  <Eye size={18} style={{ color:'#5F8B8C' }}/>
                </div>
                <div>
                  <p className="text-xs" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.5)' }}>Total Views</p>
                  <p className="font-bold" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:'#4A3F35' }}>{viewCount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:'rgba(220,38,38,.08)' }}>
                  <Heart size={18} style={{ color:'#ef4444' }}/>
                </div>
                <div>
                  <p className="text-xs" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.5)' }}>Likes</p>
                  <p className="font-bold" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:'#4A3F35' }}>{likeCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* right info */}
          <div className="space-y-5 ad-fadein" style={{ animationDelay:'.1s' }}>
            <div>
              <span className="inline-block text-xs px-3 py-1.5 rounded-full mb-3 font-semibold border"
                style={{ background:'rgba(141,170,145,.12)',color:'#5F8B8C',borderColor:'rgba(141,170,145,.25)',fontFamily:"'Libre Baskerville',serif" }}>
                {artwork.category}
              </span>
              <h1 className="leading-tight mb-1.5" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:'clamp(1.4rem,3.5vw,2rem)',color:'#4A3F35',fontWeight:700 }}>
                {artwork.title}
              </h1>
              {artwork.creationYear && (
                <p className="text-sm" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>
                  Created {artwork.creationYear}
                </p>
              )}
            </div>

            {/* artist card */}
            <Link to={`/artists/${artwork.artist?._id}`}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-muted-clay/20 transition-all group block"
              style={{ textDecoration:'none' }}>
              <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#A67C52,#C48A6A)' }}>
                {artwork.artist?.profileImage?.url
                  ? <img src={artwork.artist.profileImage.url} alt={artwork.artist.fullName} className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ fontFamily:"'Cinzel Decorative',serif" }}>
                      {artwork.artist?.fullName?.[0]||'A'}
                    </div>
                }
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.5)' }}>Created by</p>
                <p className="font-bold" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:13,color:'#4A3F35' }}>
                  {artwork.artist?.fullName||'Unknown Artist'}
                </p>
                {artwork.artist?.province && (
                  <div className="flex items-center gap-1 mt-0.5" style={{ fontFamily:"'Libre Baskerville',serif",fontSize:12,color:'rgba(46,46,46,.45)' }}>
                    <MapPin size={11} style={{ color:'#8DAA91' }}/> {artwork.artist.province} Province
                  </div>
                )}
              </div>
            </Link>

            {/* price & actions */}
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
              {price && (
                <div className="flex items-baseline justify-between pb-4 border-b" style={{ borderColor:'rgba(244,237,228,1)' }}>
                  <div>
                    <p className="text-xs mb-1" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>Price</p>
                    <p className="font-bold" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:28,color:'#A67C52' }}>
                      Rs. {price.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      fontFamily:"'Libre Baskerville',serif",
                      background: artwork.availability==='available'?'rgba(134,239,172,.25)':artwork.availability==='sold'?'rgba(254,202,202,.4)':'rgba(253,230,138,.3)',
                      color: artwork.availability==='available'?'#16a34a':artwork.availability==='sold'?'#dc2626':'#d97706'
                    }}>
                    {artwork.availability?.charAt(0).toUpperCase()+(artwork.availability?.slice(1)||'')}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleLike}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border-2 transition-all text-sm"
                  style={{
                    fontFamily:"'Libre Baskerville',serif",
                    background:isLiked?'rgba(254,202,202,.35)':'#F4EDE4',
                    color:isLiked?'#dc2626':'#4A3F35',
                    borderColor:isLiked?'rgba(220,38,38,.25)':'rgba(166,124,82,.2)',
                    cursor:'pointer'
                  }}>
                  <Heart size={17} fill={isLiked?'currentColor':'none'} className={heartAnim?'ad-heart-pop':''}/>
                  {isLiked?'Liked':'Like'} · {likeCount}
                </button>
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border-2 transition-all text-sm"
                  style={{ fontFamily:"'Libre Baskerville',serif",background:'#F4EDE4',color:'#4A3F35',borderColor:'rgba(166,124,82,.2)',cursor:'pointer' }}>
                  <Share2 size={17}/> {copied?'Copied!':'Share'}
                </button>
              </div>
            </div>

            {/* description */}
            {artwork.description && (
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="mb-3" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:14,color:'#4A3F35' }}>Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.72)' }}>
                  {artwork.description}
                </p>
              </div>
            )}

            {/* details */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="mb-4" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:14,color:'#4A3F35' }}>Details</h3>
              <div className="space-y-3">
                {artwork.dimensions && (artwork.dimensions.height || artwork.dimensions.width) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#F4EDE4' }}>
                      <Ruler size={14} style={{ color:'#A67C52' }}/>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>Dimensions</p>
                      <p className="text-sm font-semibold" style={{ fontFamily:"'Libre Baskerville',serif",color:'#4A3F35' }}>
                        {[artwork.dimensions.height,artwork.dimensions.width,artwork.dimensions.depth].filter(Boolean).join(' × ')} {artwork.dimensions.unit||'cm'}
                      </p>
                    </div>
                  </div>
                )}
                {artwork.materials?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#F4EDE4' }}>
                      <Layers size={14} style={{ color:'#A67C52' }}/>
                    </div>
                    <div>
                      <p className="text-xs mb-1.5" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>Materials</p>
                      <div className="flex flex-wrap gap-1.5">
                        {artwork.materials.map((m,i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full border"
                            style={{ fontFamily:"'Libre Baskerville',serif",background:'rgba(141,170,145,.1)',color:'#5F8B8C',borderColor:'rgba(141,170,145,.22)' }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {artwork.tags?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#F4EDE4' }}>
                      <Tag size={14} style={{ color:'#A67C52' }}/>
                    </div>
                    <div>
                      <p className="text-xs mb-1.5" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {artwork.tags.map((t,i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full border"
                            style={{ fontFamily:"'Libre Baskerville',serif",background:'rgba(166,124,82,.08)',color:'#A67C52',borderColor:'rgba(166,124,82,.2)' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {artwork.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'#F4EDE4' }}>
                      <Clock size={14} style={{ color:'#A67C52' }}/>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ fontFamily:"'Libre Baskerville',serif",color:'rgba(46,46,46,.45)' }}>Posted</p>
                      <p className="text-sm font-semibold" style={{ fontFamily:"'Libre Baskerville',serif",color:'#4A3F35' }}>
                        {new Date(artwork.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* related artworks */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="batik-divider mb-8"/>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background:'linear-gradient(to bottom,#D4AF37,#A67C52)' }}/>
                <h2 style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:'clamp(1rem,3vw,1.5rem)',color:'#4A3F35' }}>
                  More in {artwork.category}
                </h2>
              </div>
              <Link to={`/gallery?category=${encodeURIComponent(artwork.category)}`}
                className="text-sm font-semibold transition-colors hover:opacity-70"
                style={{ fontFamily:"'Libre Baskerville',serif",color:'#A67C52' }}>
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(a => {
                const s = a.images?.[0]?.url || a.images?.[0];
                return (
                  <Link key={a._id} to={`/gallery/${a._id}`} className="ad-related bg-white rounded-xl overflow-hidden shadow-md block" style={{ textDecoration:'none' }}>
                    <div className="relative h-52 overflow-hidden" style={{ background:'linear-gradient(135deg,#A67C52,#C48A6A)' }}>
                      {s
                        ? <img src={s} alt={a.title} className="ad-related-img w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center"><Palette size={36} className="text-white/30"/></div>
                      }
                    </div>
                    <div className="p-4">
                      <p className="font-bold mb-1 truncate" style={{ fontFamily:"'Cinzel Decorative',serif",fontSize:12,color:'#4A3F35' }}>{a.title}</p>
                      <div className="flex items-center justify-between text-xs" style={{ fontFamily:"'Libre Baskerville',serif" }}>
                        <span style={{ color:'rgba(46,46,46,.5)' }}>{a.artist?.fullName||'Unknown'}</span>
                        {a.price?.amount && <span style={{ color:'#A67C52',fontWeight:700 }}>Rs.{a.price.amount.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}