import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, ArrowLeft, ChevronLeft, ChevronRight,
  Share2, X, ZoomIn, Check, Images, Building2, Palette,
  BookOpen, Landmark, Trees, Sparkles, ExternalLink,
  AlertTriangle, CheckCircle2, Navigation, Globe
} from 'lucide-react';
import { useHistoricalPlace } from '../../../hooks/useHistoricalPlaces';

/* ═══════════════════════ Lightbox ═══════════════════════ */
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080402]/97 backdrop-blur-xl"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 z-10 p-2.5 rounded-xl bg-white/10 border border-white/18 text-white hover:bg-white/20 transition-all">
        <X size={18}/>
      </button>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 font-body text-xs font-bold px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/70">
        {idx + 1} / {images.length}
      </div>
      <div className="relative max-w-5xl max-h-[85vh] w-full px-16" onClick={e => e.stopPropagation()}>
        <img src={images[idx]} alt="" className="w-full h-full object-contain rounded-2xl" style={{ maxHeight: '80vh' }}
          onError={e => { e.target.src = '/images/placeholder.jpg'; }}/>
      </div>
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 border border-white/18 text-white hover:bg-white/20 transition-all">
            <ChevronLeft size={22}/>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/10 border border-white/18 text-white hover:bg-white/20 transition-all">
            <ChevronRight size={22}/>
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200"
              style={{ width: i === idx ? 60 : 44, height: 40, opacity: i === idx ? 1 : 0.45, outline: i === idx ? '2px solid #C97B5A' : '2px solid transparent', transform: i === idx ? 'scale(1.08)' : 'scale(1)' }}>
              <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = '/images/placeholder.jpg'; }}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════ Main ═══════════════════════ */
const HistoricalPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex]         = useState(null);
  const [copied, setCopied]                       = useState(false);
  const [heroLoaded, setHeroLoaded]               = useState(false);

  const { place, loading, error } = useHistoricalPlace(id);

  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 80); return () => clearTimeout(t); }, []);

  const nextImage = () => { if (place?.images) setCurrentImageIndex(p => (p + 1) % place.images.length); };
  const prevImage = () => { if (place?.images) setCurrentImageIndex(p => (p - 1 + place.images.length) % place.images.length); };

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-[#C97B5A]/12"/>
          <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-[#C97B5A]"/>
        </div>
        <p className="font-body text-sm text-[#C4917A]">Loading historical place…</p>
      </div>
    </div>
  );

  if (error || !place) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5 bg-red-50 border border-red-200">
          <AlertTriangle size={28} className="text-red-500"/>
        </div>
        <h2 className="font-heading text-xl font-normal mb-4 text-[#3D3530]">{error || 'Place not found'}</h2>
        <button onClick={() => navigate('/historical-places')} className="font-body flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#C97B5A] text-[#FDF6EE] mx-auto">
          <ArrowLeft size={14}/> Back to Places
        </button>
      </div>
    </div>
  );

  const images = place.images?.length ? place.images : ['/images/placeholder.jpg'];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {lightboxIndex !== null && (
        <Lightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)}/>
      )}

      {/* ════ HERO — Split editorial layout, NO dark overlays ════ */}
      <div className="bg-[#FDF6EE] border-b border-[#C97B5A]/10">
        <div className="max-w-7xl mx-auto">

          {/* Top nav strip */}
          <div className="flex items-center justify-end px-8 py-4 border-b border-[#C97B5A]/8">
            <button
              onClick={handleShare}
              className={`font-body flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                copied
                  ? 'bg-[#7A9E8E]/10 text-[#5F8B8C] border-[#7A9E8E]/30'
                  : 'bg-[#C97B5A]/8 text-[#C97B5A] border-[#C97B5A]/20 hover:bg-[#C97B5A]/14'
              }`}
            >
              {copied ? <><Check size={13}/> Copied!</> : <><Share2 size={13}/> Share</>}
            </button>
          </div>

          {/* Hero split: text left, image right */}
          <div className="grid lg:grid-cols-5 min-h-[520px]">

            {/* ── Text panel (left 2 cols) ── */}
            <div className="lg:col-span-2 flex flex-col justify-between px-8 py-10 border-r border-[#C97B5A]/8">

              {/* Top: badges + title */}
              <div>
                {/* Ornamental line */}
                <div className="flex items-center gap-3 mb-6"
                  style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
                  <div className="h-px flex-1 bg-[#C97B5A]/20"/>
                  <span className="font-body text-[9px] font-black uppercase tracking-[0.3em] text-[#C97B5A]/50">Heritage Site</span>
                  <div className="h-px w-8 bg-[#C97B5A]/20"/>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5"
                  style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.5s ease 0.2s' }}>
                  <span className="font-body inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#C97B5A]/10 text-[#C97B5A] border border-[#C97B5A]/20">
                    <Building2 size={10}/>{place.province} Province
                  </span>
                  {place.artType && (
                    <span className="font-body inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#7A9E8E]/10 text-[#5F8B8C] border border-[#7A9E8E]/20">
                      <Palette size={10}/>{place.artType}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="font-heading font-normal text-[#2E1F18] leading-[1.08] mb-5"
                  style={{
                    fontSize: 'clamp(1.7rem, 3vw, 2.6rem)',
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? 'translateY(0)' : 'translateY(14px)',
                    transition: 'all 0.6s ease 0.25s',
                  }}
                >
                  {place.name}
                </h1>

                {/* Location */}
                {(place.city || place.district || place.location) && (
                  <div className="flex items-start gap-2"
                    style={{ opacity: heroLoaded ? 1 : 0, transition: 'all 0.6s ease 0.38s' }}>
                    <MapPin size={13} className="text-[#C97B5A] flex-shrink-0 mt-0.5"/>
                    <span className="font-body text-sm text-[#9A8A80] leading-relaxed">
                      {[place.city, place.district, place.location].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom: mini meta stats */}
              <div className="pt-8 border-t border-[#C97B5A]/8 mt-8"
                style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
                <div className="grid grid-cols-2 gap-4">
                  {place.district && (
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-[0.22em] font-black text-[#C97B5A]/50 mb-1">District</p>
                      <p className="font-body text-sm font-semibold text-[#3D3530]">{place.district}</p>
                    </div>
                  )}
                  {place.artType && (
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-[0.22em] font-black text-[#7A9E8E]/60 mb-1">Art Form</p>
                      <p className="font-body text-sm font-semibold text-[#3D3530]">{place.artType}</p>
                    </div>
                  )}
                  {images.length > 1 && (
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-[0.22em] font-black text-[#C97B5A]/50 mb-1">Photos</p>
                      <p className="font-body text-sm font-semibold text-[#3D3530]">{images.length} images</p>
                    </div>
                  )}
                  {place.province && (
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-[0.22em] font-black text-[#C97B5A]/50 mb-1">Province</p>
                      <p className="font-body text-sm font-semibold text-[#3D3530]">{place.province}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Image panel (right 3 cols) ── */}
            <div className="lg:col-span-3 relative overflow-hidden bg-[#F0E8DF]">

              {/* Main image — no overlay at all */}
              <img
                src={images[currentImageIndex]}
                alt={place.name}
                className="w-full h-full object-cover transition-all duration-700"
                style={{ minHeight: 420 }}
                onError={e => { e.target.src = '/images/placeholder.jpg'; }}
              />

              {/* Nav arrows — float on image edges with solid bg pills */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#FDF6EE]/90 border border-[#C97B5A]/20 text-[#C97B5A] hover:bg-[#FDF6EE] shadow-sm transition-all backdrop-blur-sm">
                    <ChevronLeft size={18}/>
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#FDF6EE]/90 border border-[#C97B5A]/20 text-[#C97B5A] hover:bg-[#FDF6EE] shadow-sm transition-all backdrop-blur-sm">
                    <ChevronRight size={18}/>
                  </button>

                  {/* Dot indicators — solid pill at bottom with opaque bg */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF6EE]/90 border border-[#C97B5A]/15 backdrop-blur-sm">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setCurrentImageIndex(i)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: i === currentImageIndex ? 18 : 5, height: 5,
                          background: i === currentImageIndex ? '#C97B5A' : '#C97B5A40',
                        }}/>
                    ))}
                  </div>
                </>
              )}

              {/* Image count badge — top right, opaque */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF6EE]/90 border border-[#C97B5A]/15 backdrop-blur-sm">
                  <Images size={11} className="text-[#C97B5A]"/>
                  <span className="font-body text-[10px] font-bold text-[#C97B5A]">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              )}

              {/* Zoom hint — bottom left, opaque */}
              <button
                onClick={() => setLightboxIndex(currentImageIndex)}
                className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDF6EE]/90 border border-[#C97B5A]/15 backdrop-blur-sm hover:bg-[#FDF6EE] transition-all"
              >
                <ZoomIn size={11} className="text-[#C97B5A]"/>
                <span className="font-body text-[10px] font-bold text-[#C97B5A]">View Full</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════ BODY ════ */}
      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Back to Historical Places */}
        <button
          onClick={() => navigate('/historical-places')}
          className="font-body group flex items-center gap-2 text-sm font-semibold text-[#9A8A80] hover:text-[#C97B5A] transition-colors mb-6"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#C97B5A]/20 group-hover:bg-[#C97B5A]/8 transition-all">
            <ArrowLeft size={14}/>
          </span>
          Back to Historical Places
        </button>

        <div className="grid lg:grid-cols-3 gap-7">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image gallery strip */}
            {images.length > 1 && (
              <Section label="Image Gallery" icon={<Images size={15}/>} accent="#C97B5A" accentLight="bg-[#C97B5A]/8">
                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setLightboxIndex(i)}
                      className="relative flex-shrink-0 rounded-xl overflow-hidden group transition-all duration-200"
                      style={{
                        width: 130, height: 90,
                        outline: i === currentImageIndex ? '2.5px solid #C97B5A' : '2.5px solid transparent',
                        boxShadow: i === currentImageIndex ? '0 4px 14px rgba(201,123,90,0.25)' : 'none',
                      }}>
                      <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={e => { e.target.src = '/images/placeholder.jpg'; }}/>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#C97B5A]/60">
                        <ZoomIn size={18} className="text-white"/>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setLightboxIndex(0)}
                  className="font-body mt-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#C97B5A]/8 text-[#C97B5A] border border-[#C97B5A]/15 hover:bg-[#C97B5A]/15 transition-all">
                  <ExternalLink size={12}/> View All Photos
                </button>
              </Section>
            )}

            {/* About */}
            <Section label="About This Place" icon={<BookOpen size={15}/>} accent="#C97B5A" accentLight="bg-[#C97B5A]/8">
              <p className="font-body text-sm leading-[1.95] text-[#3D3530]/75">{place.description}</p>
            </Section>

            {/* Cultural Importance */}
            {place.culturalImportance && (
              <Section label="Cultural Importance" icon={<Landmark size={15}/>} accent="#7A9E8E" accentLight="bg-[#7A9E8E]/8">
                <p className="font-body text-sm leading-[1.95] text-[#3D3530]/75">{place.culturalImportance}</p>
              </Section>
            )}

            {/* History */}
            {place.history && (
              <Section label="History" icon={<Sparkles size={15}/>} accent="#9B7EA8" accentLight="bg-[#9B7EA8]/8">
                <p className="font-body text-sm leading-[1.95] text-[#3D3530]/75">{place.history}</p>
              </Section>
            )}

            {/* Facilities */}
            {place.facilities?.length > 0 && (
              <Section label="Facilities Available" icon={<CheckCircle2 size={15}/>} accent="#5F8B8C" accentLight="bg-[#5F8B8C]/8">
                <div className="grid sm:grid-cols-2 gap-2">
                  {place.facilities.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#C97B5A]/5 border border-[#C97B5A]/15">
                      <CheckCircle2 size={14} className="flex-shrink-0 text-[#C97B5A]"/>
                      <span className="font-body text-sm font-medium text-[#3D3530]">{f}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Nearby */}
            {place.nearbyAttractions?.length > 0 && (
              <Section label="Nearby Places" icon={<Trees size={15}/>} accent="#4a7a4a" accentLight="bg-[#4a7a4a]/8">
                <div className="grid sm:grid-cols-2 gap-2">
                  {place.nearbyAttractions.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#7A9E8E]/6 border border-[#7A9E8E]/15">
                      <MapPin size={13} className="flex-shrink-0 text-[#7A9E8E]"/>
                      <span className="font-body text-sm text-[#3D3530]">{a}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Location card */}
            <div className="rounded-2xl overflow-hidden bg-[#FDF6EE] border border-[#C97B5A]/12 shadow-[0_4px_24px_rgba(61,53,48,0.08)]">
              <div className="relative h-36 overflow-hidden">
                <img src={images[0]} alt={place.name} className="w-full h-full object-cover"
                  onError={e => { e.target.src = '/images/placeholder.jpg'; }}/>
                {/* Light bottom fade — very subtle, just for the text legibility */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FDF6EE] to-transparent"/>
                <p className="absolute bottom-2 left-4 right-4 font-heading text-xs font-normal text-[#3D3530] truncate">{place.name}</p>
              </div>
              <div className="p-5">
                <p className="font-body text-[9px] font-black uppercase tracking-[0.22em] text-[#C97B5A]/70 mb-4">Location Details</p>
                <div className="space-y-0">
                  <DetailRow icon={<Building2 size={12}/>} label="Province"  value={place.province}/>
                  {place.district  && <DetailRow icon={<MapPin size={12}/>}   label="District"  value={place.district}/>}
                  {place.city      && <DetailRow icon={<Navigation size={12}/>} label="City"    value={place.city}/>}
                  {place.location  && <DetailRow icon={<Globe size={12}/>}    label="Location"  value={place.location}/>}
                  {place.artType   && <DetailRow icon={<Palette size={12}/>}  label="Art Form"  value={place.artType} last/>}
                </div>
              </div>
            </div>

            {/* Art form highlight */}
            {place.artType && (
              <div className="rounded-2xl p-5 bg-[#7A9E8E]/6 border border-[#7A9E8E]/18">
                <p className="font-body text-[9px] font-black uppercase tracking-[0.22em] text-[#7A9E8E] mb-3">Art Form</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7A9E8E]/15 flex-shrink-0">
                    <Palette size={18} className="text-[#5F8B8C]"/>
                  </div>
                  <span className="font-heading text-base font-normal text-[#3D3530]">{place.artType}</span>
                </div>
              </div>
            )}

            {/* Share card */}
            <div className="rounded-2xl p-5 bg-[#C97B5A]/5 border border-[#C97B5A]/15">
              <p className="font-heading text-base font-normal text-[#3D3530] mb-1">Enjoyed this place?</p>
              <p className="font-body text-xs text-[#9A8A80] mb-4 leading-relaxed">
                Share it with friends and family who love Sri Lanka's heritage.
              </p>
              <button onClick={handleShare}
                className={`font-body w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  copied
                    ? 'bg-[#7A9E8E] text-[#FDF6EE] shadow-[0_4px_14px_rgba(122,158,142,0.3)]'
                    : 'bg-[#C97B5A] text-[#FDF6EE] shadow-[0_4px_14px_rgba(201,123,90,0.28)] hover:shadow-[0_6px_20px_rgba(201,123,90,0.4)]'
                }`}>
                {copied ? <><Check size={15}/> Link Copied!</> : <><Share2 size={15}/> Share This Place</>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════ Section Block ═══════════════════════ */
const Section = ({ label, icon, accent, accentLight, children }) => (
  <div className="rounded-2xl overflow-hidden bg-[#FDF6EE] border border-[#C97B5A]/10 shadow-[0_2px_16px_rgba(61,53,48,0.06)]">
    <div className={`flex items-center gap-3 px-6 py-4 border-b border-[#C97B5A]/8 ${accentLight}`}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}28` }}>
        {icon}
      </div>
      <h2 className="font-heading text-sm font-normal text-[#2E1F18] tracking-wide">{label}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

/* ═══════════════════════ Detail Row ═══════════════════════ */
const DetailRow = ({ icon, label, value, last }) => (
  <div className={`flex items-center gap-3 py-3 ${!last ? 'border-b border-[#C97B5A]/8' : ''}`}>
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#C97B5A]/8 text-[#C97B5A]">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-body text-[9px] uppercase tracking-wider font-bold text-[#C97B5A]/60 mb-0.5">{label}</p>
      <p className="font-body text-xs font-semibold text-[#3D3530] truncate">{value}</p>
    </div>
  </div>
);

export default HistoricalPlaceDetail;