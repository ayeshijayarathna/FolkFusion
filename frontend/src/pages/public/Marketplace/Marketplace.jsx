import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiX, FiChevronLeft, FiChevronRight,
  FiSearch, FiFilter, FiTrash2, FiPlus, FiMinus,
  FiMapPin, FiPackage, FiTruck, FiStar,
  FiArrowRight, FiEye, FiRefreshCw,
} from 'react-icons/fi';
import { BsGrid3X3Gap, BsListUl } from 'react-icons/bs';
import { marketplaceAPI } from '../../../services/api';
import CheckoutModal from './CheckoutModal';
import { ART_CATEGORIES, PROVINCES } from '../../../utils/constants';

const CINZEL      = { fontFamily: '"Cinzel Decorative", serif' };
const BASKERVILLE = { fontFamily: '"Libre Baskerville", serif' };
const fmt = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`;

const CATEGORIES    = ['All', ...ART_CATEGORIES];
const PROVINCE_LIST = ['All', ...PROVINCES];

const SLIDES = [
  { image: '/images/cane works.jpg',     tag: 'Artisan Picks',       title: 'Cane Work\n& Woven Crafts',    sub: 'Handwoven cane and rattan creations shaped with patience and precision — bringing natural elegance into everyday living.', cta: 'View Collection',   category: 'Cane Work',      accent: 'var(--color-dusty-rose)', accentHex: '#C4917A', accentLight: '#FDF6EE' },
  { image: '/images/folk jewal.jpg', tag: 'Heritage Adornments', title: 'Folk Jewellery\nCollection',   sub: 'Timeless pieces inspired by tradition — handcrafted jewellery that reflects culture, identity, and artistic heritage in every detail.', cta: 'Explore Collection', category: 'Folk Jewellery', accent: 'var(--color-muted-clay)', accentHex: '#C97B5A', accentLight: '#FDF6EE' },
  { image: '/images/clay.jpg',   tag: 'Clay & Earth',        title: 'Pottery & Clay\nCreations',    sub: "Earth-fired vessels and sculptures from traditional kilns — timeless forms rooted in Sri Lanka's ancient ceramic heritage.", cta: 'Discover More',      category: 'Pottery & Clay', accent: 'var(--color-muted-clay)', accentHex: '#C97B5A', accentLight: '#FDF6EE' },
  { image: '/images/Puppet.jpg',   tag: 'Rare Finds',          title: 'Traditional\nPuppetry Arts',   sub: 'Hand-carved and hand-painted string puppets kept alive by dedicated artisan families across the southern provinces.', cta: 'Meet the Puppets',   category: 'Puppetry',       accent: 'var(--color-muted-clay)', accentHex: '#C97B5A', accentLight: '#FDF6EE' },
];

const SORT_OPTIONS = [
  { label: 'Newest',          value: '-createdAt'       },
  { label: 'Oldest',          value: 'createdAt'        },
  { label: 'Price: Low–High', value: 'price.amount'     },
  { label: 'Price: High–Low', value: '-price.amount'    },
  { label: 'Most Viewed',     value: '-analytics.views' },
];

/* ── Toast ── */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  const bg    = type === 'error' ? 'bg-red-600' : type === 'cart' ? 'bg-[color:var(--color-muted-teal)]' : 'bg-green-500';
  const icons = { error: <FiX size={16}/>, cart: <FiShoppingCart size={16}/>, success: '✓' };
  return createPortal(
    <div className={`fixed bottom-7 left-1/2 -translate-x-1/2 z-[99999] ${bg} text-[color:var(--color-warm-sand)] px-6 py-3.5 rounded-xl shadow-2xl font-bold text-[13px] mp-fadein flex items-center gap-2.5 max-w-sm whitespace-nowrap`} style={BASKERVILLE}>
      <span className="flex items-center">{icons[type] || '✓'}</span><span>{msg}</span>
    </div>,
    document.body
  );
};

/* modal*/
const Modal = ({ open, onClose, width = 700, children }) => {
  useEffect(() => { if (!open) return; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }, [open]);
  useEffect(() => { if (!open) return; const h = e => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[8000] flex items-center justify-center p-5 bg-gray-800/65 mp-fadein">
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: width }}
        className="bg-[color:var(--color-warm-sand)] rounded-[20px] w-full max-h-[92vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-[color:var(--color-muted-clay)]/25 mp-pop">
        {children}
      </div>
    </div>,
    document.body
  );
};

/*hero carousel */
const HeroCarousel = ({ onSearch }) => {
  const [current, setCurrent]         = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const timerRef = useRef(null);

  const go = useCallback(idx => {
    const next = (idx + SLIDES.length) % SLIDES.length;
    if (next === current || animating) return;
    setAnimating(true);
    setCurrent(next);
    setTimeout(() => setAnimating(false), 700);
  }, [current, animating]);

  useEffect(() => { timerRef.current = setInterval(() => go(current + 1), 5500); return () => clearInterval(timerRef.current); }, [current, go]);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(460px, 68vh, 700px)', background: slide.accentLight, transition: 'background 0.7s ease' }}>
      {SLIDES.map((s, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}>
          <div className="absolute top-0 right-0 bottom-0" style={{ left: '38%' }}>
            <img src={s.image} alt={s.title} className="w-full h-full object-cover block" onError={e => { e.target.style.display = 'none'; }}/>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(to right, ${s.accentLight} 0%, ${s.accentLight}dd 8%, ${s.accentLight}88 25%, ${s.accentLight}22 50%, transparent 72%)` }}/>
          </div>
        </div>
      ))}
      <div className="relative z-10 h-full flex flex-col justify-center" style={{ paddingLeft: 'clamp(32px, 7vw, 110px)', maxWidth: '50%' }}>
        <div key={current} className="mp-fadeup">
          <h1 className="font-bold m-0 mb-5 leading-[1.1] whitespace-pre-line"
            style={{ ...CINZEL, fontSize: 'clamp(26px, 3.8vw, 54px)', color: 'var(--color-deep-brown)' }}>{slide.title}</h1>
          <p className="m-0 mb-8 leading-[1.8]"
            style={{ ...BASKERVILLE, fontSize: 'clamp(13px, 1.15vw, 15px)', color: 'color-mix(in srgb, var(--color-deep-brown) 80%, transparent)', maxWidth: 400 }}>{slide.sub}</p>
        </div>
        <div className="mt-9 flex items-center gap-0 rounded-2xl py-2 pl-4 pr-2 border"
          style={{ maxWidth: 440, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderColor: 'color-mix(in srgb, var(--color-muted-clay) 16%, transparent)' }}>
          <FiSearch size={14} className="flex-shrink-0 mr-2.5 text-[color:var(--color-dusty-rose)]/50" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSearch(searchInput); }}
            placeholder="Search artworks, crafts, jewelry…"
            className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-[color:var(--color-deep-brown)]/35"
            style={{ ...BASKERVILLE, color: 'var(--color-deep-brown)' }}/>
          <button onClick={() => onSearch(searchInput)}
            className="border-none rounded-xl px-5 py-2.5 font-bold text-[12px] cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-90 text-[color:var(--color-warm-sand)]"
            style={{ ...BASKERVILLE, background: slide.accent }}>Search</button>
        </div>
      </div>
      <div className="absolute bottom-7 z-30 flex items-center gap-2" style={{ left: 'clamp(32px, 7vw, 110px)' }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} className="rounded-full border-none p-0 cursor-pointer transition-all duration-400"
            style={{ width: i === current ? 28 : 8, height: 8, background: i === current ? slide.accent : `color-mix(in srgb, ${slide.accent} 25%, transparent)` }}/>
        ))}
        <span className="ml-3 text-[11px] font-bold tracking-widest text-[color:var(--color-muted-clay)]/50" style={BASKERVILLE}>
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>
      </div>
      {[{ dir: -1, Icon: FiChevronLeft, pos: 'right-[72px]' }, { dir: 1, Icon: FiChevronRight, pos: 'right-6' }].map(({ dir, Icon, pos }) => (
        <button key={dir} onClick={() => go(current + dir)}
          className={`absolute bottom-5 z-30 ${pos} w-10 h-10 rounded-full border cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110`}
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', borderColor: 'color-mix(in srgb, var(--color-muted-clay) 16%, transparent)', color: slide.accent }}>
          <Icon size={16}/>
        </button>
      ))}
    </div>
  );
};

/*item detail modal ── */
const ItemDetailModal = ({ item, onClose, onAddToCart }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty]       = useState(1);
  if (!item) return null;
  const imgs      = item.artwork?.images || [];
  const available = (item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) - (item.stock?.reserved || 0);
  const primaryImg = imgs.find(i => i.isPrimary) || imgs[0];

  return (
    <Modal open={!!item} onClose={onClose} width={860}>
      <div className="grid grid-cols-2 min-h-[480px]">
        <div className="bg-[color:var(--color-warm-sand)] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden">
          <div className="h-[380px] overflow-hidden">
            <img src={imgs[imgIdx]?.url || primaryImg?.url} alt={item.listingTitle}
              className="w-full h-full object-cover block transition-transform duration-300"/>
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 p-3 flex-wrap">
              {imgs.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)}
                  className={`rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${i === imgIdx ? 'border-[color:var(--color-muted-clay)]' : 'border-transparent'}`}
                  style={{ width: 52, height: 52 }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-8 flex flex-col gap-3.5">
          <button onClick={onClose} className="self-end bg-transparent border-none cursor-pointer text-[color:var(--color-deep-brown)] flex items-center justify-center w-8 h-8 rounded-full hover:bg-[color:var(--color-warm-sand)] transition-colors">
            <FiX size={20}/>
          </button>
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-[color:var(--color-muted-clay)]/15 text-[color:var(--color-muted-clay)] border border-[color:var(--color-muted-clay)]/30 px-3 py-1 rounded-full text-[11px] font-bold w-fit" style={BASKERVILLE}>
              <FiStar size={11}/> Featured
            </span>
          )}
          <div>
            <h2 className="m-0 mt-1 mb-1.5 font-bold text-[18px] text-[color:var(--color-deep-brown)] leading-snug" style={CINZEL}>{item.listingTitle}</h2>
            <p className="m-0 text-xs text-[color:var(--color-muted-clay)] tracking-wide uppercase" style={BASKERVILLE}>{item.artwork?.category} · by {item.artist?.fullName}</p>
          </div>
          <div className="text-2xl font-bold text-[color:var(--color-muted-teal)]" style={BASKERVILLE}>{fmt(item.price?.amount)}</div>
          <p className="text-[13px] text-[color:var(--color-soft-charcoal)] leading-relaxed m-0" style={BASKERVILLE}>{item.description}</p>
          <div className="flex flex-col gap-1.5">
            {[
              [<FiMapPin size={12}/>,  'Province', item.province],
              [<FiTruck size={12}/>,   'Shipping', item.shipping?.available ? `${fmt(item.shipping.cost)} · ${item.shipping.estimatedDays || '?'} days` : 'Pickup only'],
              [<FiPackage size={12}/>, 'In Stock',  available > 0 ? `${available} available` : 'Out of stock'],
            ].map(([icon, k, v]) => (
              <div key={k} className="flex gap-2.5 items-center">
                <span className="text-[color:var(--color-muted-teal)] flex">{icon}</span>
                <span className="text-[11px] font-bold text-[color:var(--color-muted-teal)] uppercase tracking-wide min-w-[72px]" style={BASKERVILLE}>{k}</span>
                <span className="text-[13px] text-[color:var(--color-soft-charcoal)]" style={BASKERVILLE}>{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-center mt-auto">
            <div className="flex items-center border border-[color:var(--color-muted-clay)]/25 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-10 border-none bg-white cursor-pointer flex items-center justify-center text-[color:var(--color-deep-brown)] hover:bg-[color:var(--color-warm-sand)] transition-colors"><FiMinus size={14}/></button>
              <span className="w-9 text-center font-bold text-sm text-[color:var(--color-soft-charcoal)]" style={BASKERVILLE}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(available, q + 1))} className="w-9 h-10 border-none bg-white cursor-pointer flex items-center justify-center text-[color:var(--color-deep-brown)] hover:bg-[color:var(--color-warm-sand)] transition-colors"><FiPlus size={14}/></button>
            </div>
            <button disabled={available <= 0} onClick={() => { onAddToCart(item, qty); onClose(); }}
              className={`flex-1 h-11 border-none rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-colors ${available > 0 ? 'bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] cursor-pointer hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              style={BASKERVILLE}>
              <FiShoppingCart size={15}/>{available > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/*cart drawer ── */
const CartDrawer = ({ open, cart, onClose, onUpdate, onRemove, onCheckout }) => {
  const subtotal = cart.reduce((s, i) => s + i.price.amount * i.qty, 0);
  const shipping  = cart.reduce((s, i) => s + (i.shipping?.cost || 0) * i.qty, 0);
  return createPortal(
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-[8500] bg-gray-800/45 mp-fadein" />}
      <div className={`fixed top-0 right-0 z-[8600] w-[400px] max-w-full h-screen bg-[color:var(--color-warm-sand)] shadow-[-8px_0_48px_rgba(0,0,0,0.2)] border-l-2 border-[color:var(--color-muted-clay)]/20 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-5 py-5 pb-4 border-b border-[color:var(--color-muted-clay)]/20 flex items-center justify-between bg-[color:var(--color-deep-brown)]">
          <div className="flex items-center gap-2.5">
            <FiShoppingCart size={18} className="text-[color:var(--color-muted-clay)]"/>
            <h3 className="m-0 text-sm text-[color:var(--color-warm-sand)] font-bold" style={CINZEL}>Your Cart</h3>
            <span className="bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={BASKERVILLE}>{cart.reduce((s, c) => s + c.qty, 0)}</span>
          </div>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-[color:var(--color-warm-sand)]/70 flex items-center hover:text-[color:var(--color-warm-sand)] transition-colors"><FiX size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center pt-20">
              <FiShoppingCart size={52} className="mx-auto mb-4 opacity-30 text-[color:var(--color-deep-brown)]"/>
              <p className="text-sm text-[color:var(--color-deep-brown)]" style={BASKERVILLE}>Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1" style={BASKERVILLE}>Add some beautiful artworks!</p>
            </div>
          ) : cart.map(ci => {
            const img = ci.artwork?.images?.find(i => i.isPrimary) || ci.artwork?.images?.[0];
            return (
              <div key={ci._id} className="flex gap-3 mb-3.5 pb-3.5 border-b border-[color:var(--color-muted-clay)]/10">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[color:var(--color-deep-brown)]/10 flex-shrink-0">
                  {img ? <img src={img.url} alt={ci.listingTitle} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[color:var(--color-deep-brown)]"><FiPackage size={22}/></div>}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[color:var(--color-deep-brown)] font-bold leading-tight mb-0.5" style={BASKERVILLE}>{ci.listingTitle}</div>
                  <div className="text-[11px] text-[color:var(--color-muted-clay)] mb-2" style={BASKERVILLE}>{ci.artist?.fullName}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-[color:var(--color-muted-clay)]/20 rounded-lg overflow-hidden">
                      <button onClick={() => onUpdate(ci._id, ci.qty - 1)} className="w-6 h-6 border-none bg-white cursor-pointer text-[color:var(--color-deep-brown)] flex items-center justify-center hover:bg-[color:var(--color-warm-sand)] transition-colors"><FiMinus size={12}/></button>
                      <span className="w-6 text-center font-bold text-xs text-[color:var(--color-soft-charcoal)]" style={BASKERVILLE}>{ci.qty}</span>
                      <button onClick={() => onUpdate(ci._id, ci.qty + 1)} className="w-6 h-6 border-none bg-white cursor-pointer text-[color:var(--color-deep-brown)] flex items-center justify-center hover:bg-[color:var(--color-warm-sand)] transition-colors"><FiPlus size={12}/></button>
                    </div>
                    <div className="text-[13px] font-bold text-[color:var(--color-muted-teal)]" style={BASKERVILLE}>{fmt(ci.price.amount * ci.qty)}</div>
                  </div>
                </div>
                <button onClick={() => onRemove(ci._id)} className="self-start bg-transparent border-none cursor-pointer text-red-500 flex items-center p-1 rounded-md hover:bg-red-50 transition-colors"><FiTrash2 size={14}/></button>
              </div>
            );
          })}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-[color:var(--color-muted-clay)]/20 bg-[color:var(--color-warm-sand)]">
            {[['Subtotal', subtotal], ['Shipping', shipping]].map(([k, v]) => (
              <div key={k} className="flex justify-between mb-1.5">
                <span className="text-xs text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>{k}</span>
                <span className="text-xs font-bold text-[color:var(--color-soft-charcoal)]" style={BASKERVILLE}>{fmt(v)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-dashed border-[color:var(--color-muted-clay)]/30 pt-2 mt-2 mb-3.5">
              <span className="text-[13px] font-bold text-[color:var(--color-deep-brown)]" style={BASKERVILLE}>Total</span>
              <span className="text-[13px] font-bold text-[color:var(--color-muted-teal)]" style={BASKERVILLE}>{fmt(subtotal + shipping)}</span>
            </div>
            <button onClick={onCheckout}
              className="w-full h-12 bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] border-none rounded-xl font-bold text-[13px] tracking-widest cursor-pointer uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={BASKERVILLE}>
              Proceed to Checkout <FiArrowRight size={15}/>
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

/*item Card */
const ItemCard = ({ item, idx, onView, onAddToCart }) => {
  const img       = item.artwork?.images?.find(i => i.isPrimary) || item.artwork?.images?.[0];
  const available = (item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) - (item.stock?.reserved || 0);
  return (
    <div className="mp-card bg-white rounded-2xl overflow-hidden border border-[color:var(--color-muted-clay)]/10 shadow-sm flex flex-col mp-fadeup hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      style={{ animationDelay: `${idx * 40}ms` }}>
      <div className="mp-card-img relative overflow-hidden bg-[color:var(--color-warm-sand)] cursor-pointer" style={{ height: 210 }} onClick={() => onView(item)}>
        {img ? <img src={img.url} alt={item.listingTitle} className="w-full h-full object-cover block transition-transform duration-300" /> : <div className="h-full flex items-center justify-center opacity-20 text-[color:var(--color-deep-brown)]"><FiPackage size={48}/></div>}
        {item.isFeatured && (
          <div className="absolute top-2.5 left-2.5 bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1" style={BASKERVILLE}>
            <FiStar size={10}/> Featured
          </div>
        )}
        {available <= 0 && <div className="absolute inset-0 bg-[color:var(--color-deep-brown)]/55 flex items-center justify-center"><span className="text-[13px] text-[color:var(--color-warm-sand)] font-bold tracking-wide" style={BASKERVILLE}>Out of Stock</span></div>}
        {available > 0 && available <= 3 && <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={BASKERVILLE}>Only {available} left</div>}
        <div className="mp-overlay absolute inset-0 bg-[color:var(--color-deep-brown)]/35 flex items-center justify-center">
          <span className="mp-overlay-badge bg-white/90 rounded-full px-3.5 py-1.5 text-xs font-bold text-[color:var(--color-deep-brown)] flex items-center gap-1.5" style={BASKERVILLE}><FiEye size={13}/> Quick View</span>
        </div>
      </div>
      <div className="p-3.5 px-4 flex-1 flex flex-col gap-2">
        <div onClick={() => onView(item)} className="cursor-pointer">
          <div className="text-[14px] font-bold text-[color:var(--color-deep-brown)] leading-snug line-clamp-2 mb-0.5" style={CINZEL}>{item.listingTitle}</div>
          <div className="text-[11px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>by {item.artist?.fullName}</div>
        </div>
        {item.artwork?.category && <span className="inline-flex bg-[color:var(--color-sage-green)]/15 text-[color:var(--color-sage-green)] border border-[color:var(--color-sage-green)]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit" style={BASKERVILLE}>{item.artwork.category}</span>}
        {item.province && <div className="flex items-center gap-1 text-[11px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}><FiMapPin size={10}/> {item.province}</div>}
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-[color:var(--color-muted-clay)]/10">
          <div className="text-[15px] font-bold text-[color:var(--color-muted-teal)]" style={BASKERVILLE}>{fmt(item.price?.amount)}</div>
          <button onClick={e => { e.stopPropagation(); onAddToCart(item, 1); }} disabled={available <= 0}
            className={`border-none rounded-xl px-3.5 py-1.5 font-bold text-[11px] tracking-wide flex items-center gap-1 transition-colors ${available > 0 ? 'bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] cursor-pointer hover:opacity-90' : 'bg-[color:var(--color-warm-sand)] text-[color:var(--color-muted-clay)] cursor-not-allowed'}`}
            style={BASKERVILLE}>
            <FiShoppingCart size={12}/>{available > 0 ? 'Add' : 'Sold'}
          </button>
        </div>
      </div>
    </div>
  );
};

/*pagination  */
const Pagination = ({ page, totalPages, total, limit, onPage }) => {
  if (total === 0) return null;
  const pages = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else {
    pages.push(1);
    if (page > 4) pages.push('…');
    const s = Math.max(2, page - 2); const e = Math.min(totalPages - 1, page + 2);
    for (let i = s; i <= e; i++) pages.push(i);
    if (page < totalPages - 3) pages.push('…');
    pages.push(totalPages);
  }
  const btnBase = 'w-9 h-9 rounded-xl border border-[color:var(--color-muted-clay)]/25 font-bold text-[13px] cursor-pointer flex items-center justify-center transition-colors hover:bg-[color:var(--color-muted-clay)]/10';
  return (
    <div className="flex flex-col items-center gap-3 mt-12">
      <div className="flex gap-1.5 items-center flex-wrap justify-center">
        <button onClick={() => onPage(1)} disabled={page <= 1} className={`${btnBase} bg-white text-[color:var(--color-deep-brown)] disabled:opacity-40 disabled:cursor-not-allowed`} style={BASKERVILLE}>«</button>
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className={`${btnBase} bg-white text-[color:var(--color-deep-brown)] disabled:opacity-40 disabled:cursor-not-allowed`}><FiChevronLeft size={16}/></button>
        {pages.map((p, i) => p === '…' ? <span key={`e${i}`} className="text-[color:var(--color-muted-clay)] px-1 self-center" style={BASKERVILLE}>…</span>
          : <button key={p} onClick={() => onPage(p)} className={`${btnBase} ${p === page ? 'bg-[color:var(--color-muted-teal)] text-[color:var(--color-warm-sand)] border-[color:var(--color-muted-teal)]' : 'bg-white text-[color:var(--color-deep-brown)]'}`} style={BASKERVILLE}>{p}</button>)}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className={`${btnBase} bg-white text-[color:var(--color-deep-brown)] disabled:opacity-40 disabled:cursor-not-allowed`}><FiChevronRight size={16}/></button>
        <button onClick={() => onPage(totalPages)} disabled={page >= totalPages} className={`${btnBase} bg-white text-[color:var(--color-deep-brown)] disabled:opacity-40 disabled:cursor-not-allowed`} style={BASKERVILLE}>»</button>
      </div>
      <p className="text-xs text-[color:var(--color-muted-clay)] m-0" style={BASKERVILLE}>
        Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total.toLocaleString()}</strong> items
      </p>
    </div>
  );
};

/* spinner*/
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
    <div className="w-11 h-11 border-4 border-[color:var(--color-warm-sand)] border-t-[color:var(--color-muted-teal)] rounded-full mp-spin" />
    <span className="text-[13px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>Loading artworks…</span>
  </div>
);

/* new arrivals*/
const MarketplaceNewArrivals = ({ onView, onAddToCart }) => {
  const [newItems, setNewItems]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [scrollIdx, setScrollIdx] = useState(0);
  const VISIBLE = 4;

  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await marketplaceAPI.getAll({ sort: '-createdAt', limit: 8, status: 'active' });
        setNewItems(res.data.data || []);
      } catch { setNewItems([]); }
      finally { setLoading(false); }
    };
    fetchNew();
  }, []);

  if (!loading && newItems.length === 0) return null;

  const canPrev = scrollIdx > 0;
  const canNext = scrollIdx + VISIBLE < newItems.length;

  return (
    <div className="mb-8">
      {/* section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[color:var(--color-muted-clay)] rounded-full" />
          <div>
            <p className="text-[9px] tracking-[.22em] uppercase text-[color:var(--color-muted-clay)] font-bold m-0" style={BASKERVILLE}>
              Just Landed
            </p>
            <h3 className="text-lg font-bold text-[color:var(--color-deep-brown)] m-0 leading-tight" style={CINZEL}>
              New Arrivals
            </h3>
          </div>
          {!loading && (
            <span className="text-[10px] text-[color:var(--color-muted-clay)] bg-[color:var(--color-muted-clay)]/10 px-2.5 py-0.5 rounded-full" style={BASKERVILLE}>
              {newItems.length} items
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScrollIdx(i => Math.max(0, i - 1))} disabled={!canPrev}
            className="w-8 h-8 rounded-full border border-[color:var(--color-muted-clay)]/25 flex items-center justify-center text-[color:var(--color-deep-brown)] bg-white hover:bg-[color:var(--color-muted-clay)] hover:text-[color:var(--color-warm-sand)] hover:border-[color:var(--color-muted-clay)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <FiChevronLeft size={14} />
          </button>
          <button onClick={() => setScrollIdx(i => canNext ? i + 1 : i)} disabled={!canNext}
            className="w-8 h-8 rounded-full border border-[color:var(--color-muted-clay)]/25 flex items-center justify-center text-[color:var(--color-deep-brown)] bg-white hover:bg-[color:var(--color-muted-clay)] hover:text-[color:var(--color-warm-sand)] hover:border-[color:var(--color-muted-clay)] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl animate-pulse" style={{ height: 270 }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newItems.slice(scrollIdx, scrollIdx + VISIBLE).map((item, idx) => {
            const img       = item.artwork?.images?.find(i => i.isPrimary) || item.artwork?.images?.[0];
            const available = (item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) - (item.stock?.reserved || 0);
            const daysAgo   = Math.floor((Date.now() - new Date(item.createdAt)) / 86400000);

            return (
              <div key={item._id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[color:var(--color-muted-clay)]/8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => onView(item)}>
                {/* image */}
                <div className="relative overflow-hidden bg-[#F5EDE4]" style={{ height: 190 }}>
                  {img ? (
                    <img src={img.url} alt={item.listingTitle}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                      onError={e => { e.target.style.display = 'none'; }}/>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-25"><FiPackage size={34} className="text-[color:var(--color-deep-brown)]" /></div>
                  )}
                  {/* quick view overlay */}
                  <div className="absolute inset-0 bg-[color:var(--color-deep-brown)]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white/90 rounded-full px-3 py-1.5 text-[11px] font-bold text-[color:var(--color-deep-brown)] flex items-center gap-1.5" style={BASKERVILLE}>
                      <FiEye size={11} /> Quick View
                    </span>
                  </div>
                  {/* date badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)]" style={BASKERVILLE}>
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
                    </span>
                  </div>
                  {available <= 0 && (
                    <div className="absolute inset-0 bg-[color:var(--color-deep-brown)]/55 flex items-center justify-center">
                      <span className="text-xs text-[color:var(--color-warm-sand)] font-bold" style={BASKERVILLE}>Sold Out</span>
                    </div>
                  )}
                </div>
                {/* info */}
                <div className="p-3.5">
                  {item.artwork?.category && (
                    <p className="text-[9px] tracking-[.14em] uppercase text-[color:var(--color-muted-clay)]/65 mb-1 m-0" style={BASKERVILLE}>{item.artwork.category}</p>
                  )}
                  <p className="text-[13px] font-bold text-[color:var(--color-deep-brown)] leading-snug mb-0.5 line-clamp-1 m-0" style={CINZEL}>{item.listingTitle}</p>
                  <p className="text-[10px] text-[color:var(--color-muted-clay)] mb-2.5 m-0" style={BASKERVILLE}>by {item.artist?.fullName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[color:var(--color-muted-teal)]" style={BASKERVILLE}>{fmt(item.price?.amount)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); if (available > 0) onAddToCart(item, 1); }}
                      disabled={available <= 0}
                      className="border-none rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] hover:opacity-90 cursor-pointer"
                      style={BASKERVILLE}>
                      <FiShoppingCart size={10} />{available > 0 ? 'Add' : 'Sold'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ornament divider */}
      <div className="flex items-center gap-4 mt-8">
        <div className="flex-1 h-px bg-[color:var(--color-muted-clay)]/12" />
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[color:var(--color-muted-clay)]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-muted-clay)]/50" />
          <div className="w-1 h-1 rounded-full bg-[color:var(--color-muted-clay)]/30" />
        </div>
        <div className="flex-1 h-px bg-[color:var(--color-muted-clay)]/12" />
      </div>
    </div>
  );
};

/*marketplace*/
const Marketplace = () => {
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [limit]                     = useState(12);

  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory]       = useState('All');
  const [province, setProvince]       = useState('All');
  const [sort, setSort]               = useState('-createdAt');
  const [maxPrice, setMaxPrice]       = useState(500000);
  const [priceInput, setPriceInput]   = useState(500000);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [cart, setCart]                 = useState([]);
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailItem, setDetailItem]     = useState(null);
  const [toast, setToast]               = useState({ msg: '', type: 'success' });
  const [viewMode, setViewMode]         = useState('grid');

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 1000, sort, status: 'active' };
      if (search)             params.search   = search;
      if (province !== 'All') params.province = province;

      const res = await marketplaceAPI.getAll(params);
      let allItems = res.data.data || [];

      if (category !== 'All') {
        const sel = category.toLowerCase().trim();
        allItems = allItems.filter(item => (item.artwork?.category || item.category || '').toLowerCase().trim() === sel);
      }
      allItems = allItems.filter(item => (item.price?.amount || 0) <= maxPrice);

      const totalCount      = allItems.length;
      const totalPagesCount = Math.max(1, Math.ceil(totalCount / limit));
      const safePage        = Math.min(page, totalPagesCount);
      const pageItems       = allItems.slice((safePage - 1) * limit, safePage * limit);

      setItems(pageItems);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
    } catch { notify('Failed to load marketplace', 'error'); }
    finally { setLoading(false); }
  }, [page, limit, sort, search, category, province, maxPrice, notify]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search, category, province, sort, maxPrice]);

  const addToCart = (item, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(c => c._id === item._id);
      return ex ? prev.map(c => c._id === item._id ? { ...c, qty: c.qty + qty } : c) : [...prev, { ...item, qty }];
    });
    notify(`"${item.listingTitle}" added to cart!`, 'cart');
  };

  const updateQty      = (id, qty) => { if (qty <= 0) { removeFromCart(id); return; } setCart(p => p.map(c => c._id === id ? { ...c, qty } : c)); };
  const removeFromCart = id => setCart(p => p.filter(c => c._id !== id));
  const cartCount      = cart.reduce((s, c) => s + c.qty, 0);
  const hasFilters     = category !== 'All' || province !== 'All' || search || maxPrice < 500000;

  const clearFilters = () => {
    setCategory('All'); setProvince('All');
    setSearch(''); setSearchInput('');
    setMaxPrice(500000); setPriceInput(500000);
  };

  const handlePageChange = p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="bg-[color:var(--color-warm-sand)] min-h-screen" style={BASKERVILLE}>

      <HeroCarousel onSearch={q => { setSearch(q); setSearchInput(q); }}/>

      {/* sticky toolbar */}
      <div className="sticky top-0 z-50 bg-[color:var(--color-warm-sand)]/95 backdrop-blur-sm border-b border-[color:var(--color-muted-clay)]/20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="flex items-center gap-1.5 bg-transparent border border-[color:var(--color-muted-clay)]/25 rounded-lg px-3 py-1.5 cursor-pointer text-xs font-bold text-[color:var(--color-deep-brown)] hover:bg-[color:var(--color-muted-clay)]/10 transition-colors"
              style={BASKERVILLE}>
              <FiFilter size={13}/> Filters
              {hasFilters && <span className="bg-[color:var(--color-muted-teal)] text-[color:var(--color-warm-sand)] rounded-full px-1.5 text-[10px]">ON</span>}
            </button>
            <span className="text-[14px] font-bold text-[color:var(--color-deep-brown)]" style={CINZEL}>
              {category !== 'All' ? category : 'Artisan Marketplace'}
            </span>
            {!loading && <span className="text-xs text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>{total.toLocaleString()} items</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>Sort:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-[color:var(--color-muted-clay)]/25 text-xs text-[color:var(--color-soft-charcoal)] bg-white cursor-pointer outline-none"
                style={BASKERVILLE}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex border border-[color:var(--color-muted-clay)]/25 rounded-lg overflow-hidden">
              {[{ v: 'grid', Icon: BsGrid3X3Gap }, { v: 'list', Icon: BsListUl }].map(({ v, Icon }) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`w-8 h-8 border-none flex items-center justify-center cursor-pointer transition-colors ${viewMode === v ? 'bg-[color:var(--color-muted-teal)] text-[color:var(--color-warm-sand)]' : 'bg-white text-[color:var(--color-muted-clay)] hover:bg-[color:var(--color-warm-sand)]'}`}>
                  <Icon size={14}/>
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/track-order')}
              className="flex items-center gap-1.5 bg-transparent border border-[color:var(--color-muted-clay)]/30 rounded-xl px-4 py-2 cursor-pointer font-bold text-xs text-[color:var(--color-deep-brown)] hover:bg-[color:var(--color-muted-clay)]/10 transition-colors"
              style={BASKERVILLE}>
              <FiPackage size={14}/> Track Order
            </button>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-[color:var(--color-deep-brown)] text-[color:var(--color-warm-sand)] border-none rounded-xl px-4 py-2 cursor-pointer font-bold text-xs tracking-wide hover:bg-[color:var(--color-muted-teal)] transition-colors"
              style={BASKERVILLE}>
              <FiShoppingCart size={15}/> Cart
              {cartCount > 0 && <span className="bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] rounded-full px-1.5 text-[11px] font-black">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* active filter chips */}
      {hasFilters && (
        <div className="max-w-[1400px] mx-auto px-6 pt-3 flex gap-2 flex-wrap items-center">
          {search && <span className="bg-[color:var(--color-muted-teal)]/10 text-[color:var(--color-muted-teal)] border border-[color:var(--color-muted-teal)]/25 px-3.5 py-1 rounded-full text-xs flex items-center gap-1.5" style={BASKERVILLE}><FiSearch size={11}/> "{search}"</span>}
          {category !== 'All' && <span className="bg-[color:var(--color-sage-green)]/15 text-[color:var(--color-sage-green)] border border-[color:var(--color-sage-green)]/30 px-3.5 py-1 rounded-full text-xs" style={BASKERVILLE}>{category}</span>}
          {province !== 'All' && <span className="bg-[color:var(--color-muted-clay)]/10 text-[color:var(--color-muted-clay)] border border-[color:var(--color-muted-clay)]/25 px-3.5 py-1 rounded-full text-xs flex items-center gap-1.5" style={BASKERVILLE}><FiMapPin size={11}/> {province}</span>}
          {maxPrice < 500000 && <span className="bg-[color:var(--color-dusty-rose)]/15 text-[color:var(--color-dusty-rose)] border border-[color:var(--color-dusty-rose)]/30 px-3.5 py-1 rounded-full text-xs" style={BASKERVILLE}>Max: {fmt(maxPrice)}</span>}
          <button onClick={clearFilters} className="flex items-center gap-1.5 bg-transparent border border-red-300/40 rounded-full px-3.5 py-1 cursor-pointer text-xs text-red-500 hover:bg-red-50 transition-colors" style={BASKERVILLE}>
            <FiRefreshCw size={11}/> Clear All
          </button>
        </div>
      )}

      {/* main layout */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 pb-12 grid items-start transition-all duration-300"
        style={{ gridTemplateColumns: sidebarOpen ? '256px 1fr' : '0px 1fr', gap: sidebarOpen ? 24 : 0 }}>

        {/* Sidebar */}
        <div className={`overflow-hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-white rounded-[18px] p-5 border border-[color:var(--color-muted-clay)]/10 shadow-sm sticky top-[72px]">
            <h3 className="m-0 mb-4 text-[14px] text-[color:var(--color-deep-brown)] font-bold flex items-center gap-2" style={CINZEL}>
              <FiFilter size={14} className="text-[color:var(--color-muted-teal)]"/> Filters
            </h3>
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-[color:var(--color-muted-teal)] tracking-[.14em] uppercase mb-2" style={BASKERVILLE}>Category</label>
              <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`text-left px-2.5 py-1.5 rounded-lg border-none cursor-pointer text-xs transition-colors ${c === category ? 'bg-[color:var(--color-muted-teal)] text-[color:var(--color-warm-sand)] font-bold' : 'bg-transparent text-[color:var(--color-soft-charcoal)] hover:bg-[color:var(--color-muted-teal)]/10 hover:text-[color:var(--color-muted-teal)]'}`}
                    style={BASKERVILLE}>{c}</button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-[color:var(--color-muted-teal)] tracking-[.14em] uppercase mb-2" style={BASKERVILLE}>Province</label>
              <select value={province} onChange={e => setProvince(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[color:var(--color-muted-clay)]/25 text-xs text-[color:var(--color-soft-charcoal)] bg-white cursor-pointer outline-none" style={BASKERVILLE}>
                {PROVINCE_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-bold text-[color:var(--color-muted-teal)] tracking-[.14em] uppercase" style={BASKERVILLE}>Max Price</label>
                <span className="text-xs text-[color:var(--color-deep-brown)] font-bold" style={BASKERVILLE}>{fmt(priceInput)}</span>
              </div>
              <input type="range" className="mp-range w-full" min={0} max={500000} step={1000}
                value={priceInput} onChange={e => setPriceInput(Number(e.target.value))}
                onMouseUp={() => setMaxPrice(priceInput)} onTouchEnd={() => setMaxPrice(priceInput)}
                style={{ background: `linear-gradient(to right, var(--color-muted-teal) 0%, var(--color-muted-teal) ${(priceInput / 500000) * 100}%, color-mix(in srgb, var(--color-muted-clay) 20%, transparent) ${(priceInput / 500000) * 100}%, color-mix(in srgb, var(--color-muted-clay) 20%, transparent) 100%)` }}/>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>LKR 0</span>
                <span className="text-[10px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>LKR 500,000</span>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="w-full py-2.5 rounded-xl border border-red-300/40 bg-transparent text-red-500 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors"
                style={BASKERVILLE}>
                <FiX size={13}/> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div>
          {/* All Artworks heading */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="m-0 text-2xl md:text-3xl font-bold text-[color:var(--color-deep-brown)] leading-tight" style={CINZEL}>
                {category !== 'All' ? category : 'All Artworks'}
              </h2>
              {!loading && (
                <p className="m-0 mt-1 text-xs text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>
                  {total.toLocaleString()} authentic handcrafted {total === 1 ? 'item' : 'items'} available
                </p>
              )}
            </div>
          </div>

          {/* new arrival */}
          <MarketplaceNewArrivals onView={setDetailItem} onAddToCart={addToCart} />

          {/* items grid */}
          {loading ? <Spinner /> : items.length === 0 ? (
            <div className="text-center py-20 text-[color:var(--color-muted-clay)]">
              <FiSearch size={52} className="mx-auto mb-4 opacity-20 text-[color:var(--color-deep-brown)]" style={{ display: 'block' }}/>
              <p className="text-base m-0 mb-1.5 text-[color:var(--color-deep-brown)] font-bold" style={CINZEL}>No items found</p>
              <p className="text-[13px] text-[color:var(--color-muted-clay)]" style={BASKERVILLE}>Try adjusting your filters or search terms.</p>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="mt-4 bg-[color:var(--color-muted-teal)] text-[color:var(--color-warm-sand)] border-none rounded-xl px-6 py-2.5 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  style={BASKERVILLE}>
                  <FiRefreshCw size={13}/> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }
                : { display: 'flex', flexDirection: 'column', gap: 16 }}>
                {items.map((item, idx) =>
                  viewMode === 'grid'
                    ? <ItemCard key={item._id} item={item} idx={idx} onView={setDetailItem} onAddToCart={addToCart} />
                    : (
                      <div key={item._id} className="mp-card bg-white rounded-2xl border border-[color:var(--color-muted-clay)]/10 shadow-sm flex overflow-hidden mp-fadeup hover:shadow-lg transition-all duration-200"
                        style={{ animationDelay: `${idx * 30}ms` }}>
                        <div className="w-[120px] flex-shrink-0 overflow-hidden bg-[color:var(--color-warm-sand)]">
                          {item.artwork?.images?.[0]?.url
                            ? <img src={item.artwork.images[0].url} alt={item.listingTitle} className="w-full h-full object-cover block" />
                            : <div className="h-[100px] flex items-center justify-center opacity-30"><FiPackage size={28} className="text-[color:var(--color-deep-brown)]"/></div>}
                        </div>
                        <div className="flex-1 p-3.5 px-4 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="text-[13px] font-bold text-[color:var(--color-deep-brown)] mb-0.5" style={CINZEL}>{item.listingTitle}</div>
                            <div className="text-[11px] text-[color:var(--color-muted-clay)] mb-1.5" style={BASKERVILLE}>by {item.artist?.fullName} · {item.province}</div>
                            {item.artwork?.category && <span className="bg-[color:var(--color-sage-green)]/15 text-[color:var(--color-sage-green)] border border-[color:var(--color-sage-green)]/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold" style={BASKERVILLE}>{item.artwork.category}</span>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[15px] font-bold text-[color:var(--color-muted-teal)] mb-2" style={BASKERVILLE}>{fmt(item.price?.amount)}</div>
                            <div className="flex gap-2">
                              <button onClick={() => setDetailItem(item)}
                                className="bg-[color:var(--color-warm-sand)] text-[color:var(--color-deep-brown)] border border-[color:var(--color-muted-clay)]/25 rounded-lg px-3 py-1.5 font-bold text-[11px] cursor-pointer flex items-center gap-1 hover:bg-[color:var(--color-muted-clay)]/10 transition-colors"
                                style={BASKERVILLE}>
                                <FiEye size={12}/> View
                              </button>
                              <button onClick={() => addToCart(item, 1)}
                                disabled={(item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) <= 0}
                                className="bg-[color:var(--color-muted-clay)] text-[color:var(--color-warm-sand)] border-none rounded-lg px-3 py-1.5 font-bold text-[11px] cursor-pointer flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={BASKERVILLE}>
                                <FiShoppingCart size={12}/> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
              <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={handlePageChange} />
            </>
          )}
        </div>
      </div>

      <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} onAddToCart={addToCart} />
      <CartDrawer open={cartOpen} cart={cart} onClose={() => setCartOpen(false)} onUpdate={updateQty} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}/>
      <CheckoutModal open={checkoutOpen} cart={cart} onClose={() => setCheckoutOpen(false)} onOrderPlaced={() => setCart([])}/>
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
};

export default Marketplace;