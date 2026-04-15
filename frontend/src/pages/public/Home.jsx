import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Calendar, Heart, Users, Landmark, Palette,
  BookOpen, UserCircle, ShoppingBag, HandHeart, ChevronLeft, ChevronRight,
  Newspaper, Clock, Eye, MapPin, Phone, Mail, Send, CheckCircle,
} from 'lucide-react';
import { artworkAPI, artistAPI, newsAPI, inquiryAPI, marketplaceAPI } from '../../services/api';

/*-------------------------new arrival card----------------------------------------------------------------- */
const NewArrivalCard = ({ item, index }) => {
  const img       = item.artwork?.images?.find(i => i.isPrimary) || item.artwork?.images?.[0];
  const available = (item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) - (item.stock?.reserved || 0);

  return (
    <div
      className="group relative flex-shrink-0 w-[240px] md:w-[260px] bg-[#FFF8E1] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(61,53,48,0.14)]"
      style={{ borderRadius: '50% 50% 12px 12px / 20% 20% 12px 12px' }}
    >
      <div className="relative overflow-hidden bg-[#F5EDE4]" style={{ height: 270 }}>
        {img ? (
          <img
            src={img.url}
            alt={item.listingTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#E8C4A8)'; }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <ShoppingBag size={36} className="text-muted-clay/30" />
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="font-body text-[9px] px-2 py-0.5 rounded-full bg-deep-brown/75 text-warm-sand backdrop-blur-sm">★</span>
          </div>
        )}
        {available <= 0 && (
          <div className="absolute inset-0 bg-[#3D3530]/55 flex items-center justify-center">
            <span className="font-body text-xs text-warm-sand font-bold tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>
      <div className="px-5 py-4 text-center">
        {item.artwork?.category && (
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-clay/60 mb-1">
            {item.artwork.category}
          </p>
        )}
        <h3 className="font-heading text-[0.85rem] font-normal text-deep-brown leading-snug mb-1 line-clamp-2">
          {item.listingTitle}
        </h3>
        <p className="font-body text-[11px] text-deep-brown/40 mb-3">
          by {item.artist?.fullName}
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px w-5 bg-muted-clay/20" />
          <span className="font-heading text-sm text-muted-clay">
            LKR {Number(item.price?.amount || 0).toLocaleString('en-LK')}
          </span>
          <div className="h-px w-5 bg-muted-clay/20" />
        </div>
      </div>
    </div>
  );
};

/*---------------------------------------------------new arrival section------------------------------------------------------- */
const NewArrivalsSection = () => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef               = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await marketplaceAPI.getAll({ sort: '-createdAt', limit: 10, status: 'active' });
        setItems(res.data.data || []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = dir => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 580, behavior: 'smooth' });
    setTimeout(checkScroll, 400);
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #C97B5A 0%, transparent 55%), radial-gradient(circle at 75% 50%, #C4917A 0%, transparent 55%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-muted-clay/40" />
              <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-clay flex items-center gap-1.5">
                <Sparkles size={10} /> Fresh Additions
              </span>
              <div className="w-8 h-px bg-muted-clay/40" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown">
              New <span className="text-muted-clay italic">Arrivals</span>
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-[50px] h-px bg-muted-clay/30" />
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50" />
              <div className="w-[20px] h-px bg-muted-clay/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll(-1)} disabled={!canLeft}
              className="w-10 h-10 rounded-full border border-muted-clay/25 flex items-center justify-center text-deep-brown hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)} disabled={!canRight}
              className="w-10 h-10 rounded-full border border-muted-clay/25 flex items-center justify-center text-deep-brown hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
            </button>
            <Link to="/marketplace"
              className="font-body hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm border border-muted-clay/35 text-deep-brown hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay transition-all duration-300">
              Shop All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px] bg-[#F5EDE4] animate-pulse"
                style={{ height: 340, borderRadius: '50% 50% 12px 12px / 20% 20% 12px 12px' }} />
            ))}
          </div>
        ) : (
          <div ref={scrollRef} onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {items.map((item, i) => <NewArrivalCard key={item._id} item={item} index={i} />)}
          </div>
        )}

        <div className="mt-8 flex justify-center md:hidden">
          <Link to="/marketplace"
            className="font-body inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105">
            Shop All New Arrivals <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

/*---------------------------------------------------join our jurney-------------------------------------------------*/
const JoinOurJourney = () => {
  const artists = [
    '/images/p1.png', '/images/p2.png', '/images/p3.png', '/images/p4.png',
    '/images/p5.png', '/images/p6.png', '/images/p7.png', '/images/p8.png',
  ];
  const VW = 800, VH = 500;
  const ECX = 400, ECY = 250, ERX = 340, ERY = 175, R = 26;
  return (
   <section className="py-20 overflow-hidden relative">
  
  {/* blurred background */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/join our jurney.jpg')",
      filter: "blur(2px)",
      zIndex: 0
    }}
  />
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-[#FFF8E1]/60 relative rounded-[3rem] shadow-xl overflow-hidden"
          style={{ height: 500 }}>
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${VW} ${VH}`}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx={ECX} cy={ECY} rx={ERX} ry={ERY}
              stroke="#3D3530" strokeWidth="1" fill="none" strokeDasharray="8 6" opacity="0.35"/>
            <ellipse cx={ECX} cy={ECY} rx={ERX - 18} ry={ERY - 16}
              stroke="#3D3530" strokeWidth="0.5" fill="none" opacity="0.2"/>
            {artists.map((src, i) => {
              const angle = (i / artists.length) * 2 * Math.PI - Math.PI / 2;
              const ax = ECX + ERX * Math.cos(angle);
              const ay = ECY + ERY * Math.sin(angle);
              return (
                <g key={i}>
                  <circle cx={ax} cy={ay} r={R + 3} fill="white" opacity="0.9"/>
                  <circle cx={ax} cy={ay} r={R + 3} fill="none" stroke="#C97B5A" strokeWidth="1" opacity="0.4"/>
                  <clipPath id={`jjclip-${i}`}><circle cx={ax} cy={ay} r={R}/></clipPath>
                  <image href={src} x={ax - R} y={ay - R} width={R * 2} height={R * 2}
                    clipPath={`url(#jjclip-${i})`} preserveAspectRatio="xMidYMid slice"/>
                </g>
              );
            })}
          </svg>
          <div className="absolute top-5 inset-x-0 z-20 flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-muted-clay/40"/>
            <span className="font-body text-[10px] tracking-[0.22em] uppercase text-dark-brown">Our Mission</span>
            <div className="w-8 h-px bg-muted-clay/40"/>
          </div>
          <div
            className="absolute z-10 flex flex-col items-center justify-center text-center px-10"
            style={{ top: '21%', bottom: '23%', left: 0, right: 0 }}
          >
            <h2 className="font-heading font-normal text-[clamp(1.7rem,3.8vw,2.7rem)] text-deep-brown leading-[1.2] mb-3">
              Join Our{' '}<span className="text-muted-clay italic">Journey</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-px bg-muted-clay/30"/>
              <div className="w-1 h-1 rounded-full bg-muted-clay/50"/>
              <div className="w-8 h-px bg-muted-clay/30"/>
            </div>
            <p className="font-body text-[0.85rem] leading-[1.8] text-deep-brown max-w-[400px] mb-3">
              By joining our journey, you become part of a shared mission to celebrate and sustain this
              extraordinary creative heritage — connecting skilled artists with wider audiences, promoting fair
              livelihoods, and ensuring that the spirit of these crafts continues to inspire across all
              provinces and beyond.
            </p>
          </div>
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center">
            <Link to="/partnership"
              className="font-body inline-flex items-center gap-3 px-9 py-[11px] rounded-full font-medium text-sm bg-muted-clay text-warm-sand tracking-[0.04em] transition-all duration-300 hover:scale-105 shadow-[0_4px_18px_rgba(201,123,90,0.35)] hover:shadow-[0_6px_24px_rgba(201,123,90,0.45)]">
              Get Started <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/*------------------------------------------------categories slider--------------------------------------- */
const CategoriesSlider = ({ categories, getCategoryCount }) => {
  const [current, setCurrent] = useState(0);
  const visible = 4;
  const total   = categories.length;
  const prev = () => { if (current > 0) setCurrent(c => c - 1); };
  const next = () => { if (current + visible < total) setCurrent(c => c + 1); };
  const pages = Math.ceil(total / visible);

  return (
    <div className="relative">
      {[
        { fn: prev, Icon: ChevronLeft,  side: '-left-5',  can: current > 0 },
        { fn: next, Icon: ChevronRight, side: '-right-5', can: current + visible < total },
      ].map(({ fn, Icon, side, can }) => (
        <button key={side} onClick={fn} disabled={!can}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${can ? 'bg-muted-clay text-warm-sand' : 'bg-[#E8D8CC] text-[#B8A090]'}`}>
          <Icon size={18} />
        </button>
      ))}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 px-4">
        {categories.slice(current, current + visible).map((cat, i) => (
          <Link key={cat.name + current + i}
            to={`/categories?category=${encodeURIComponent(cat.name)}`}
            className="group relative overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.03]"
            style={{ borderRadius: '50% 50% 16px 16px / 28% 28% 16px 16px', aspectRatio: '3/4' }}>
            <img src={cat.image} alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(to bottom,#C97B5A,#C4917A)'; }}/>
            <div className="absolute inset-0 bg-gradient-to-t from-warm-sand/95 via-warm-sand/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"/>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 bg-muted-clay rounded-b"/>
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-center text-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <h3 className="font-heading font-semibold text-deep-brown leading-tight mb-2.5 text-[0.95rem] drop-shadow-sm">{cat.name}</h3>
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="h-px w-5 bg-muted-clay/60"/>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-clay"/>
                <div className="h-px w-5 bg-muted-clay/60"/>
              </div>
              <p className="font-body text-[13px] font-medium text-deep-brown/80 drop-shadow-sm">
                {getCategoryCount(cat.name)} Artworks
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-6">
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} onClick={() => setCurrent(i * visible)}
            className={`rounded-full transition-all duration-300 h-1.5 ${Math.floor(current / visible) === i ? 'w-5 bg-muted-clay' : 'w-1.5 bg-[#D4BBA8]'}`}/>
        ))}
      </div>
    </div>
  );
};

/*---------------------------------------------------folk art slider (learning page navigation)---------------------------------------- */
const FolkArtSliderInline = ({ navigate }) => {
  const slides = [
    { image: '/images/liq2.jpg', category: 'Lacquer Work',      desc: 'Hand-painted wooden crafts passed down through generations.',   path: '/learning?category=Lacquer%20Work' },
    { image: '/images/pot.jpg',     category: 'Pottery & Clay',    desc: 'Ancient pottery traditions shaped by hand and fired in kilns.', path: '/learning?category=Pottery%20%26%20Clay' },
    { image: '/images/tmask.jpg',        category: 'Traditional Masks', desc: 'Ceremonial masks carved from kaduru wood.',                     path: '/learning?category=Traditional%20Masks' },
    { image: '/images/Handloom.jpg',     category: 'Handloom Saree',    desc: 'Hand-woven sarees celebrated for geometric motifs.',            path: '/learning?category=Handloom%20Saree' },
    { image: '/images/woodencraft.jpg',        category: 'Wood Carving',      desc: 'Masterful woodwork — a hallmark of Sri Lankan temple art.',     path: '/learning?category=Wood%20Carving' },
  ];
  const [active, setActive] = useState(0);
  const [anim, setAnim]     = useState(false);
  const timer               = useRef(null);
  const goTo = i => { if (anim || i === active) return; setAnim(true); setTimeout(() => { setActive(i); setAnim(false); }, 280); };
  const nav  = fn => { clearInterval(timer.current); fn(); timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4000); };
  useEffect(() => { timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4000); return () => clearInterval(timer.current); }, []);
  const s = slides[active];

  return (
    <div className="overflow-hidden shadow-xl rounded-2xl border border-muted-clay/15">
      <div className="relative overflow-hidden h-[280px]">
        <img key={active} src={s.image} alt={s.category}
          className={`w-full h-full object-cover transition-all duration-500 ${anim ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}/>
        <button onClick={() => nav(() => goTo((active - 1 + slides.length) % slides.length))}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/22 backdrop-blur">
          <ChevronLeft size={16} className="text-warm-sand"/>
        </button>
        <button onClick={() => nav(() => goTo((active + 1) % slides.length))}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/22 backdrop-blur">
          <ChevronRight size={16} className="text-warm-sand"/>
        </button>
        <span className="font-body absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-soft-charcoal/55 text-warm-sand/80">
          {active + 1}/{slides.length}
        </span>
      </div>
      <div className="bg-warm-sand px-5 py-4">
        <h4 className="font-heading font-bold text-sm mb-1 text-deep-brown">{s.category}</h4>
        <p className="font-body text-xs leading-relaxed mb-2.5 text-deep-brown/60">{s.desc}</p>
        <button onClick={() => navigate(s.path)}
          className="font-body inline-flex items-center gap-1 text-xs font-semibold text-muted-clay transition-colors duration-200 hover:text-deep-brown">
          Learn More <ArrowRight size={12}/>
        </button>
      </div>
      <div className="bg-warm-sand pb-3 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => nav(() => goTo(i))}
            className={`rounded-full transition-all duration-300 h-[5px] ${i === active ? 'w-[18px] bg-muted-clay' : 'w-[5px] bg-deep-brown/18'}`}
            aria-label={`Slide ${i + 1}`}/>
        ))}
      </div>
    </div>
  );
};

/*--------------------------------------------------------------contact form section--------------------------------------------------- */
const ContactFormSection = () => {
  const [form, setForm] = useState({
    name: '', email: '', contactNo: '', province: '', address: '', message: '',
  });
  const [submitting, setSubmitting]           = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [successProvince, setSuccessProvince] = useState('');
  const [error, setError]                     = useState('');
  const [selectedProv, setSelectedProv]       = useState(null);

  const provinceData = [
    { value: 'Western',       short: 'Western',       capital: 'Colombo',      mapQ: 'Western+Provincial+Council+Sri+Lanka' },
    { value: 'Central',       short: 'Central',       capital: 'Kandy',        mapQ: 'Central+Provincial+Council+Kandy+Sri+Lanka' },
    { value: 'Southern',      short: 'Southern',      capital: 'Galle',        mapQ: 'Southern+Provincial+Council+Galle+Sri+Lanka' },
    { value: 'Northern',      short: 'Northern',      capital: 'Jaffna',       mapQ: 'Northern+Provincial+Council+Jaffna+Sri+Lanka' },
    { value: 'Eastern',       short: 'Eastern',       capital: 'Trincomalee',  mapQ: 'Eastern+Provincial+Council+Trincomalee+Sri+Lanka' },
    { value: 'North Western', short: 'N. Western',    capital: 'Kurunegala',   mapQ: 'North+Western+Provincial+Council+Kurunegala+Sri+Lanka' },
    { value: 'North Central', short: 'N. Central',    capital: 'Anuradhapura', mapQ: 'North+Central+Provincial+Council+Anuradhapura+Sri+Lanka' },
    { value: 'Uva',           short: 'Uva',           capital: 'Badulla',      mapQ: 'Uva+Provincial+Council+Badulla+Sri+Lanka' },
    { value: 'Sabaragamuwa',  short: 'Sabaragamuwa',  capital: 'Ratnapura',    mapQ: 'Sabaragamuwa+Provincial+Council+Ratnapura+Sri+Lanka' },
  ];

  /* hero images */
  const heroImgs = [
    { src: '/images/mural art.jpg'},
    { src: '/images/potterywork.jpg' },
    { src: '/images/aukana.jpg' },
    { src: '/images/folkjewl.jpg' },
    { src: '/images/srilanka fort.jpg' },
  ];

  const mapSrc = selectedProv
    ? `https://maps.google.com/maps?q=${selectedProv.mapQ}&z=14&output=embed`
    : `https://maps.google.com/maps?q=Sri+Lanka&z=7&output=embed`;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
    if (name === 'province') {
      setSelectedProv(provinceData.find(p => p.value === value) || null);
    }
  };

  const handleProvSelect = prov => {
    setSelectedProv(prov);
    setForm(f => ({ ...f, province: prov.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.contactNo || !form.province || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await inquiryAPI.create(form);
      if (res.data.success) {
        setSuccessProvince(form.province);
        setSuccess(true);
        setForm({ name: '', email: '', contactNo: '', province: '', address: '', message: '' });
        setSelectedProv(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 text-sm focus:outline-none focus:border-muted-clay transition-colors duration-200 font-body bg-[#FAF7F2] border border-muted-clay/20 rounded-[10px] text-deep-brown placeholder:text-deep-brown/30';

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* top banner contact section*/}
        <div className="flex flex-col lg:flex-row items-center gap-10 mb-16">

          {/*header text */}
          <div className="lg:w-[42%] flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-muted-clay/40" />
              <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-clay">
                Provincial Inquiry
              </span>
              <div className="w-8 h-px bg-muted-clay/40" />
            </div>
            <h2 className="font-heading font-normal text-[clamp(2.2rem,4vw,3.2rem)] text-deep-brown leading-[1.18] mb-4">
              Get In <span className="text-muted-clay italic">Touch</span>
            </h2>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-[50px] h-px bg-muted-clay/30" />
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50" />
              <div className="w-[50px] h-px bg-muted-clay/30" />
            </div>
            <p className="font-body text-sm leading-relaxed text-deep-brown/55 max-w-[380px] mb-7">
              Select your province to locate the nearest council on the map, then submit
              your inquiry directly to the relevant administration.
            </p>
            {/* Quote accent */}
            <div className="flex items-start gap-3 pl-4 border-l-2 border-muted-clay/30">
              <p className="font-body text-xs italic leading-relaxed text-deep-brown/40">
                "Preserving the art is preserving the soul of a nation."
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-3 justify-center lg:justify-end">
              {heroImgs.map((img, i) => {
                const tall    = i % 2 === 0;
                const heightPx = tall ? 200 : 160;
                const marginPx = tall ? 0 : 20;
                return (
                  <div
                    key={i}
                    className="group relative flex-shrink-0 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(61,53,48,0.18)] cursor-default"
                    style={{
                      width: 90,
                      height: heightPx,
                      marginBottom: marginPx,
                      borderRadius: '50% 50% 10px 10px / 22% 22% 10px 10px',
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#E8C4A8)';
                      }}
                    />
                    {/* label overlay on hover */}
                    <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(61,53,48,0.72) 0%, transparent 55%)' }}>
                      <span className="font-body text-[8px] tracking-[0.12em] uppercase text-warm-sand/90 text-center leading-tight px-1">
                        {img.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/*divider*/}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px bg-muted-clay/10" />
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-muted-clay/30" />
            <div className="w-1 h-1 rounded-full bg-muted-clay/50" />
            <div className="w-1 h-1 rounded-full bg-muted-clay/30" />
          </div>
          <div className="flex-1 h-px bg-muted-clay/10" />
        </div>

        {/*two column layout*/}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">

          {/*province Selector & map*/}
          <div className="space-y-5">

            {/* section label */}
            <div className="flex items-center gap-3">
              <span className="font-body text-[10px] tracking-[0.22em] uppercase text-muted-clay">
                9 Provincial Councils
              </span>
              <div className="flex-1 h-px bg-muted-clay/15" />
            </div>

            {/*province button grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {provinceData.map(prov => {
                const active = selectedProv?.value === prov.value;
                return (
                  <button
                    key={prov.value}
                    type="button"
                    onClick={() => handleProvSelect(prov)}
                    className={`group flex flex-col items-start px-3.5 py-3 rounded-[12px] border text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      active
                        ? 'bg-muted-clay border-muted-clay shadow-[0_4px_16px_rgba(201,123,90,0.28)]'
                        : 'bg-[#FAF7F2] border-muted-clay/20 hover:border-muted-clay/50 hover:shadow-md'
                    }`}
                  >
                    <span className={`font-body text-[9px] tracking-wider uppercase mb-0.5 ${active ? 'text-warm-sand/65' : 'text-muted-clay/55'}`}>
                      {prov.capital}
                    </span>
                    <span className={`font-heading text-[0.78rem] leading-tight ${active ? 'text-warm-sand' : 'text-deep-brown'}`}>
                      {prov.short}
                    </span>
                  </button>
                );
              })}
            </div>

            {/*google maps iframe */}
            <div
              className="relative overflow-hidden rounded-[16px] border border-muted-clay/15 shadow-[0_4px_24px_rgba(61,53,48,0.09)]"
              style={{ height: 300 }}
            >
              {selectedProv && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-deep-brown/80 backdrop-blur-sm pointer-events-none">
                  <MapPin size={10} className="text-warm-sand" />
                  <span className="font-body text-[10px] text-warm-sand tracking-wide">
                    {selectedProv.value} · {selectedProv.capital}
                  </span>
                </div>
              )}
              {!selectedProv && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-deep-brown/60 backdrop-blur-sm pointer-events-none whitespace-nowrap">
                  <span className="font-body text-[10px] text-warm-sand/80">
                    Select a province above to zoom in
                  </span>
                </div>
              )}
              <iframe
                key={mapSrc}
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Provincial Council Map"
              />
            </div>
          </div>

          {/*contact form*/}
          <div className="bg-[#FAF7F2] rounded-[20px] border border-muted-clay/15 shadow-[0_4px_32px_rgba(61,53,48,0.07)] p-8">

            {success ? (
              /* succses state*/
              <div className="flex flex-col items-center justify-center text-center py-16 gap-5">
                <div className="w-[72px] h-[72px] rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                  <CheckCircle size={38} className="text-green-600" />
                </div>
                <h3 className="font-heading text-xl font-normal text-deep-brown">Inquiry Submitted!</h3>
                <p className="font-body max-w-sm text-sm leading-relaxed text-deep-brown/55">
                  Your inquiry has been forwarded to the{' '}
                  <span className="text-muted-clay font-medium">{successProvince}</span>{' '}
                  administration. We'll be in touch within 2–3 business days.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="font-body px-7 py-3 rounded-full text-sm font-medium bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105 mt-2"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                {/* selected province indicator bar */}
                <div className={`mb-6 transition-all duration-300 overflow-hidden ${selectedProv ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] bg-muted-clay/8 border border-muted-clay/20">
                    <MapPin size={14} className="text-muted-clay flex-shrink-0" />
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-wider text-muted-clay/60">Inquiry routing to</p>
                      <p className="font-heading text-sm text-deep-brown">
                        {selectedProv?.value} · {selectedProv?.capital}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Full Name',      name: 'name',      type: 'text',  ph: 'Your full name' },
                      { label: 'Email',          name: 'email',     type: 'email', ph: 'your@email.com' },
                      { label: 'Contact Number', name: 'contactNo', type: 'tel',   ph: '+94 77 123 4567' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="font-body block text-[10px] mb-2 tracking-wider uppercase text-deep-brown/50">
                          {f.label} <span className="text-muted-clay">*</span>
                        </label>
                        <input
                          type={f.type}
                          name={f.name}
                          value={form[f.name]}
                          onChange={handleChange}
                          placeholder={f.ph}
                          className={inputCls}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="font-body block text-[10px] mb-2 tracking-wider uppercase text-deep-brown/50">
                        Province <span className="text-muted-clay">*</span>
                      </label>
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="">Select Province</option>
                        {provinceData.map(p => (
                          <option key={p.value} value={p.value}>{p.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-body block text-[10px] mb-2 tracking-wider uppercase text-deep-brown/50">
                      Address{' '}
                      <span className="font-body text-[10px] normal-case tracking-normal text-deep-brown/30">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Your address"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="font-body block text-[10px] mb-2 tracking-wider uppercase text-deep-brown/50">
                      Message <span className="text-muted-clay">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe your inquiry..."
                      maxLength={2000}
                      className={`${inputCls} resize-none`}
                    />
                    <p className="font-body text-right text-xs mt-1 text-deep-brown/30">
                      {form.message.length}/2000
                    </p>
                  </div>

                  {error && (
                    <p className="font-body text-xs px-4 py-3 rounded-xl text-[#e05c5c] bg-[#e05c5c]/7 border border-[#e05c5c]/20">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="font-body w-full flex items-center justify-center gap-3 py-4 rounded-full font-medium text-sm bg-muted-clay text-warm-sand shadow-[0_4px_20px_rgba(201,123,90,0.28)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-warm-sand/60 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Inquiry</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/*----------------------------------------home main-----------------------------------------------------*/
const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats]                 = useState({ totalArtists: 0, totalArtworks: 0, provinces: 9 });
  const [loading, setLoading]             = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [currentSlide, setCurrentSlide]   = useState(0);
  const [hoveredNews, setHoveredNews]     = useState(null);
  const [newsData, setNewsData]           = useState([]);
  const [loadingNews, setLoadingNews]     = useState(true);

  useEffect(() => { fetchHomeData(); fetchNews(); }, []);
  useEffect(() => { const t = setInterval(() => setCurrentSlide(p => (p + 1) % 3), 5000); return () => clearInterval(t); }, []);

  const fetchNews = async () => {
    try { const r = await newsAPI.getLatest({ limit: 5 }); if (r.data.success) setNewsData(r.data.data); }
    catch { setNewsData([]); } finally { setLoadingNews(false); }
  };

  const fetchHomeData = async () => {
    try {
      const [a, b] = await Promise.all([
        artistAPI.getAll({ page: 1, limit: 1 }),
        artworkAPI.getAll({ page: 1, limit: 1 }),
      ]);
      setStats({
        totalArtists:  a.data.total || a.data.data?.length || 0,
        totalArtworks: b.data.total || b.data.data?.length || 0,
        provinces: 9,
      });
      try { const cr = await artworkAPI.getStatsByCategory(); setCategoryStats(cr.data.data || []); } catch {}
    } catch {} finally { setLoading(false); }
  };

  const getCategoryCount = name => { const s = categoryStats.find(s => s._id === name); return s ? s.count : 0; };

  const categories = [
    { name: 'Cane Work',            image: '/images/canecraft.jpg'   },
    { name: 'Traditional Masks',    image: '/images/tmask.jpg'        },
    { name: 'Handloom Saree',       image: '/images/handloomS.jpg'   },
    { name: 'Coconut Crafts',       image: '/images/cococraft.jpg'        },
    { name: 'Pottery & Clay',       image: '/images/potterywork.jpg' },
    { name: 'Lacquer Work',         image: '/images/Laquerware.jpg' },
    { name: 'Folk Mural Painting',  image: '/images/mural art.jpg'   },
    { name: 'Metal Craft',          image: '/images/metalcraft.jpg'       },
    { name: 'Statues',              image: '/images/stonestatus.jpg'      },
    { name: 'Folk Jewelry',         image: '/images/folkjewl.jpg'        },
    { name: 'Ceramic',              image: '/images/ceramic.jpg'      },
    { name: 'Wood Carving',         image: '/images/woodcraving.jpg'        },
    { name: 'Batik Clothing',       image: '/images/batikclothing.jpg'       },
    { name: 'Hana Fiber Crafts',    image: '/images/hanacraft.jpg'        },
    { name: 'Sri Lankan Sculpture', image: '/images/sclp.jpg'   },
    { name: 'Mats',                 image: '/images/matscraft.jpg'        },
    { name: 'Puppetry',             image: '/images/puppertee.png'    },
    { name: 'Drum Craft',           image: '/images/drum.jpg'        },
    { name: 'Rabana Making',        image: '/images/rabana.jpg'      },
    { name: 'Other',                image: '/images/other.jpg'   },
  ];

  const carousel = [
    { url: '/images/h1.jpg', title: 'Preserving Cultural Heritage', desc: 'Supporting traditional artisans across Sri Lanka' },
    { url: '/images/Neutral.jpg', title: 'Empowering Communities',  desc: 'Connecting artists with opportunities' },
    { url: '/images/h3.jpg', title: 'Celebrating Tradition',        desc: 'Showcasing the beauty of folk arts' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-warm-sand">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-clay"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/*-------------------------------------------------hero section----------------------------------------------- */}
      <section className="relative flex overflow-hidden min-h-screen bg-[#FAF7F2]">
        <div className="relative hidden lg:block flex-shrink-0 z-20 overflow-hidden"
          style={{ width: '55%', minHeight: '100vh', clipPath: 'ellipse(95% 100% at 0% 50%)' }}>
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover scale-[1.05]">
            <source src="/videos/banner1.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative flex items-center flex-1 overflow-hidden">
          <img src="/images/heroh.jpg" alt="hero"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ WebkitMaskImage: 'linear-gradient(to left, black 75%, transparent 100%)', maskImage: 'linear-gradient(to left, black 75%, transparent 100%)' }}/>
          <div className="absolute inset-0 bg-[#FAF7F2]/60 z-10" />
          <div className="relative z-20 w-full pt-[6.5rem] pb-16"
            style={{ paddingLeft: 'clamp(2rem,4vw,4.5rem)', paddingRight: 'clamp(1.5rem,3vw,3rem)', maxWidth: 540 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-muted-clay/40" />
              <span className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-clay">Sri Lankan Heritage</span>
              <div className="w-[22px] h-px bg-muted-clay/22" />
            </div>
            <h1 className="font-heading leading-[1.18] text-deep-brown text-[clamp(2rem,4.2vw,3.3rem)]">
              Discover the <br /><span className="text-muted-clay italic">Beauty</span> of <br />Folk Arts
            </h1>
            <div className="flex items-center gap-3 my-6">
              <div className="w-10 h-px bg-muted-clay/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-clay/55" />
              <div className="w-[22px] h-px bg-muted-clay/25" />
            </div>
            <p className="font-body text-sm leading-[1.85] text-[#6B5A50] max-w-[370px]">
              Empowering Sri Lanka's traditional artisans by bridging communities, safeguarding cultural heritage,
              and creating sustainable opportunities across all provinces.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/gallery" className="px-7 py-3 rounded-full text-sm bg-muted-clay text-warm-sand hover:scale-105 transition">
                Explore Gallery →
              </Link>
              <Link to="/artists" className="px-7 py-3 rounded-full text-sm border border-muted-clay/40 hover:bg-muted-clay hover:text-white transition">
                Meet Artists
              </Link>
            </div>

            {/*dynamic stats from API */}
            <div className="flex gap-9 mt-11 pt-7 border-t border-muted-clay/14">
              <div>
                <p className="text-[1.55rem] text-muted-clay">
                  {stats.totalArtists > 0 ? `${stats.totalArtists}+` : '0'}
                </p>
                <p className="text-xs text-[#9A8A80] uppercase">Artists</p>
              </div>
              <div>
                <p className="text-[1.55rem] text-muted-clay">
                  {stats.totalArtworks > 0 ? `${stats.totalArtworks}+` : '0'}
                </p>
                <p className="text-xs text-[#9A8A80] uppercase">Artworks</p>
              </div>
              <div>
                <p className="text-[1.55rem] text-muted-clay">{stats.provinces}</p>
                <p className="text-xs text-[#9A8A80] uppercase">Provinces</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/*-------------------------------------------------Art category section--------------------------------------- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-3">Explore Our Collection</p>
            <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown mb-5">
              Art <span className="text-muted-clay italic">Categories</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-[50px] h-px bg-muted-clay/30"/>
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50"/>
              <div className="w-4 h-px bg-muted-clay/20"/>
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50"/>
              <div className="w-[50px] h-px bg-muted-clay/30"/>
            </div>
          </div>
          <CategoriesSlider categories={categories} getCategoryCount={getCategoryCount}/>
          <div className="mt-10 flex justify-center">
            <Link to="/categories"
              className="font-body inline-flex items-center gap-2.5 px-8 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown tracking-[0.03em] transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay">
              <Eye size={15}/> View All Categories <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </section>

      {/*-------------------------------------------------features section----------------------------------------------- */}
      <section className="py-20 overflow-hidden" style={{ background: '#FAF7F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-[38%] flex-shrink-0 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-muted-clay/40"/>
                <span className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-clay">What We Offer</span>
              </div>
              <h2 className="font-heading font-normal text-[clamp(2rem,3.5vw,3rem)] text-deep-brown leading-[1.18] mb-5">
                What You Can{' '}
                <span className="text-muted-clay italic">Discover</span>
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-px bg-muted-clay/30"/>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-clay/50"/>
                <div className="w-5 h-px bg-muted-clay/20"/>
              </div>
              <div
                className="w-full overflow-hidden shadow-[0_8px_32px_rgba(61,53,48,0.12)] mb-6"
                style={{ borderRadius: '50% 50% 14px 14px / 18% 18% 14px 14px', height: 280 }}
              >
                <img
                  src="/images/discoversection.jpg"
                  alt="Sri Lankan Folk Arts"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(160deg,#E8C4A8,#C97B5A)'; }}
                />
              </div>
              <p className="font-body text-[0.88rem] leading-[1.85] text-deep-brown/65 max-w-[340px]">
                This site is a digital platform that focuses on the conservation and appreciation of cultural heritage.
                The site helps in identifying historic locations, taking users through the art gallery, as well as getting
                to interact with the artists. The combination of all these elements enables the platform to help modernize
                traditions. Individuals can take online courses, interact with creators, engage in a marketplace, make
                donations towards heritage as well as partnerships within a single platform.
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Palette,    title: 'Artwork Gallery' },
                    { icon: BookOpen,   title: 'Learning Center' },
                    { icon: Landmark,   title: 'Historical Places' },
                    { icon: UserCircle, title: 'Meet Artists' },
                  ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="flex flex-col items-center text-center gap-2 group cursor-default">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-muted-clay/20 shadow-sm transition-all duration-300 group-hover:bg-muted-clay group-hover:border-muted-clay group-hover:scale-110">
                          <Icon size={18} className="text-muted-clay transition-colors duration-300 group-hover:text-warm-sand" strokeWidth={1.5}/>
                        </div>
                        <p className="font-body text-[10px] leading-tight text-deep-brown/60 group-hover:text-deep-brown transition-colors duration-200">
                          {f.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-3 mt-3">
                  {[
                    { icon: ShoppingBag, title: 'Marketplace' },
                    { icon: HandHeart,   title: 'Support Heritage' },
                  ].map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div key={i} className="flex flex-col items-center text-center gap-2 group cursor-default w-[25%]">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-muted-clay/20 shadow-sm transition-all duration-300 group-hover:bg-muted-clay group-hover:border-muted-clay group-hover:scale-110">
                          <Icon size={18} className="text-muted-clay transition-colors duration-300 group-hover:text-warm-sand" strokeWidth={1.5}/>
                        </div>
                        <p className="font-body text-[10px] leading-tight text-deep-brown/60 group-hover:text-deep-brown transition-colors duration-200">
                          {f.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-b border-muted-clay/12 mb-6"/>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { img: '/images/ds1.jpg', title: 'Lacquer Work',      link: '/categories?category=Lacquer%20Work' },
                  { img: '/images/ds2.jpg', title: 'Pottery & Clay',    link: '/categories?category=Pottery%20%26%20Clay' },
                  { img: '/images/ds3.jpg', title: 'Traditional Masks', link: '/categories?category=Traditional%20Masks' },
                  { img: '/images/ds4.jpg', title: 'Handloom Saree',    link: '/categories?category=Handloom%20Saree' },
                  { img: '/images/ds5.jpg', title: 'Wood Carving',      link: '/categories?category=Wood%20Carving' },
                  { img: '/images/ds6.jpg', title: 'Folk Jewelry',      link: '/categories?category=Folk%20Jewelry' },
                ].map((card, i) => (
                  <Link
                    key={i}
                    to={card.link}
                    className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1.5 block"
                    style={{ borderRadius: '50% 50% 10px 10px / 22% 22% 10px 10px', aspectRatio: '3/4' }}
                  >
                    <img
                      src={card.img}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(to bottom,#C97B5A,#E8C4A8)'; }}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*-----------------------------------join our jurney section--------------------------------------------*/}
      <JoinOurJourney/>

      {/*-----------------------------------department programmes section------------------------------------------*/}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-3">Organised Initiatives</p>
            <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown">
              Department <span className="text-muted-clay italic">Programs</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: BookOpen, label: 'Education', title: 'Training Programs', desc: 'Join professional training programs organized by the Traditional Industry Development Department to learn authentic folk art techniques from master artisans.', items: ['Certificate programs in traditional crafts', 'Hands-on workshops with expert guidance', 'Skills development for artisan communities'], link: '/courses', btn: 'View Courses', img: '/images/trainning.jpg' },
              { icon: Calendar, label: 'Events',    title: 'Cultural Events',   desc: 'Participate in cultural events and exhibitions organized by provincial councils to celebrate and promote Sri Lankan traditional arts.',               items: ['Traditional art exhibitions and fairs',  'Cultural festivals across provinces',          'Networking opportunities for artisans'],       link: '/events',  btn: 'View Events',  img: '/images/events.jpg' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-[#FFF8E1] shadow-[0_4px_28px_rgba(61,53,48,0.08)]">
                  <div className="relative overflow-hidden h-[220px]">
                    <img src={card.img} alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}/>
                    <div className="absolute bottom-4 left-6">
                      <span className="font-body text-[10px] tracking-[0.18em] uppercase text-warm-sand/70">{card.label}</span>
                    </div>
                  </div>
                  <div className="px-8 py-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon size={22} className="text-muted-clay" strokeWidth={1.5}/>
                      <h3 className="font-heading text-xl font-normal text-deep-brown">{card.title}</h3>
                    </div>
                    <p className="font-body text-sm leading-relaxed mb-5 text-deep-brown/65">{card.desc}</p>
                    <ul className="space-y-2.5 mb-7">
                      {card.items.map((it, j) => (
                        <li key={j} className="font-body flex items-start gap-3 text-sm text-deep-brown/60">
                          <div className="flex-shrink-0 w-[5px] h-[5px] rounded-full bg-muted-clay mt-[7px]"/>
                          {it}
                        </li>
                      ))}
                    </ul>
                    <Link to={card.link}
                      className="font-body inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-sm bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105">
                      {card.btn} <ArrowRight size={15}/>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*-----------------------------------------------news section------------------------------------------------------*/}
      <section className="py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-14">
            <div>
              <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-2.5">Stay Informed</p>
              <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown">
                Latest <span className="text-muted-clay italic">News</span>
              </h2>
            </div>
            <Link to="/news"
              className="font-body hidden md:inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay">
              <Newspaper size={15}/> See All News <ArrowRight size={15}/>
            </Link>
          </div>

          {loadingNews ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-clay"/>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {newsData.map((news, idx) => (
                  <div key={news._id}
                    onClick={() => navigate(`/news/${news._id}`)}
                    onMouseEnter={() => setHoveredNews(idx)}
                    onMouseLeave={() => setHoveredNews(null)}
                    className={`cursor-pointer transition-all duration-300 rounded-[14px] p-5 bg-warm-sand shadow-[0_2px_16px_rgba(61,53,48,0.06)] border-l-4 ${hoveredNews === idx ? 'border-muted-clay scale-[1.015]' : 'border-transparent'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-[88px] h-[88px] rounded-[10px] overflow-hidden">
                        <img src={news.images?.[0] || '/images/placeholder.jpg'} alt={news.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-body px-3 py-1 rounded-full text-xs font-semibold bg-muted-clay/10 text-muted-clay">{news.category}</span>
                          <span className="font-body flex items-center gap-1 text-xs text-deep-brown/50">
                            <Clock size={12}/>{new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-heading text-[0.95rem] font-normal text-deep-brown mb-1.5 line-clamp-2 hover:text-muted-clay transition-colors">{news.title}</h3>
                        <p className="font-body text-xs line-clamp-2 text-deep-brown/55">{news.excerpt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="flex items-center justify-center mb-3 gap-2">
                    <div className="w-9 h-px bg-muted-clay/50"/>
                    <span className="font-body text-[10px] tracking-[0.18em] uppercase text-muted-clay">Explore Folk Arts</span>
                    <div className="w-9 h-px bg-muted-clay/50"/>
                  </div>
                  <FolkArtSliderInline navigate={navigate}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/*--------------------------------------------------new arrival section----------------------------------------*/}
      <NewArrivalsSection />

      {/*----------------------------------------partnership & donation section-------------------------------------------*/}
      <section className="py-20 bg-warm-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-px bg-muted-clay"/>
                <span className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-clay">Featured Initiative</span>
                <div className="w-4 h-px bg-muted-clay/35"/>
              </div>
              <div className="overflow-hidden mb-2.5">
                <h3 key={currentSlide}
                  className="font-heading font-normal text-[clamp(1rem,1.8vw,1.25rem)] text-muted-clay leading-[1.4] animate-cta-slide-up">
                  {carousel[currentSlide].title}
                </h3>
              </div>
              <h2 className="font-heading font-normal text-[clamp(2rem,4vw,3.2rem)] text-deep-brown leading-[1.15] mb-[18px]">
                Be Part of<br/>Preserving Our{' '}<span className="text-muted-clay italic">Heritage</span>
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-px bg-muted-clay/40"/>
                <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/55"/>
                <div className="w-[22px] h-px bg-muted-clay/25"/>
              </div>
              <p className="font-body text-sm text-[#6B5A50] leading-[1.85] max-w-[400px] mb-8">
                Whether you're an artist, researcher, or culture enthusiast — join our community in
                protecting and promoting Sri Lanka's intangible folk art traditions.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <Link to="/donations"
                  className="font-body inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-medium text-sm bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105 shadow-md">
                  <Heart size={15}/> Make a Donation
                </Link>
                <Link to="/partnership"
                  className="font-body inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown bg-transparent transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay">
                  <Users size={15}/> Become a Partner
                </Link>
              </div>
              <div className="flex items-center gap-3">
                {carousel.map((img, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`transition-all duration-300 hover:scale-105 overflow-hidden rounded-lg flex-shrink-0 border-2 ${i === currentSlide ? 'border-muted-clay opacity-100' : 'border-muted-clay/20 opacity-55'}`}
                    style={{ width: i === currentSlide ? 72 : 52, height: i === currentSlide ? 48 : 36 }}>
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover"/>
                  </button>
                ))}
                <div className="flex gap-1.5 ml-2">
                  {carousel.map((_, i) => (
                    <div key={i} className={`rounded-full transition-all duration-300 h-[5px] ${i === currentSlide ? 'w-[18px] bg-muted-clay' : 'w-[5px] bg-muted-clay/25'}`}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative overflow-hidden w-full max-w-[520px] aspect-[4/5] shadow-[0_20px_60px_rgba(61,53,48,0.14)] border border-muted-clay/12"
                style={{ borderRadius: '50% 50% 16px 16px / 28% 28% 16px 16px' }}>
                {carousel.map((img, i) => (
                  <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === currentSlide ? 1 : 0 }}>
                    <img src={img.url} alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-[6000ms] ease-linear"
                      style={{ transform: i === currentSlide ? 'scale(1.05)' : 'scale(1)' }}
                      onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}/>
                  </div>
                ))}
                <button onClick={() => setCurrentSlide(p => (p - 1 + carousel.length) % carousel.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/70 backdrop-blur border border-muted-clay/25">
                  <ChevronLeft size={18} className="text-deep-brown"/>
                </button>
                <button onClick={() => setCurrentSlide(p => (p + 1) % carousel.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/70 backdrop-blur border border-muted-clay/25">
                  <ChevronRight size={18} className="text-deep-brown"/>
                </button>
                <div className="absolute bottom-0 left-0 right-0 z-20 flex h-[3px]">
                  {carousel.map((_, i) => (
                    <div key={i} className="flex-1 bg-warm-sand/20">
                      <div className="h-full bg-muted-clay"
                        style={{ width: i === currentSlide ? '100%' : '0%', transition: i === currentSlide ? 'width 5s linear' : 'width 0s' }}/>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-sand/72 backdrop-blur border border-muted-clay/18">
                  <span className="font-body text-[10px] text-muted-clay tracking-[0.1em]">0{currentSlide + 1}</span>
                  <div className="w-4 h-px bg-muted-clay/40"/>
                  <span className="font-body text-[10px] text-deep-brown/40 tracking-[0.1em]">0{carousel.length}</span>
                </div>
              </div>
              <div className="absolute pointer-events-none -bottom-5 left-0 w-20 h-20 rounded-full border border-muted-clay/18"/>
              <div className="absolute pointer-events-none bottom-0 left-5 w-9 h-9 rounded-full bg-muted-clay/7"/>
            </div>
          </div>
        </div>
      </section>

      {/*--------------------------------------------------------contact section----------------------------------------------*/}
      <ContactFormSection/>

    </div>
  );
};

export default Home;