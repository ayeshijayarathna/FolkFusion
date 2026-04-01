import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Calendar, Heart, Users, Landmark, Palette,
  BookOpen, UserCircle, ShoppingBag, HandHeart, ChevronLeft, ChevronRight,
  Newspaper, Clock, Eye, MapPin, Phone, Mail, Send, CheckCircle,
} from 'lucide-react';
import { artworkAPI, artistAPI, newsAPI, inquiryAPI } from '../../services/api';
import { PROVINCES } from '../../utils/constants';

/* join our jurney card */
const JoinOurJourney = () => {
  const artists = [
    '/images/p1.jpg', '/images/p2.jpg', '/images/p3.jpg', '/images/p4.jpg',
    '/images/p5.jpg', '/images/p6.jpg', '/images/p7.jpg', '/images/p8.jpg',
  ];
  return (
    <section
      className="py-20 bg-cover bg-center overflow-hidden relative"
      style={{ backgroundImage: "url('/images/jj.png')" }}
    >
      <div className="max-w-5xl mx-auto px-4">
    <div className="bg-[#F4EDE4]/50 relative rounded-[3rem] shadow-xl overflow-hidden" style={{ minHeight: 340 }}>
          {/* artist Orbit SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 340"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="400" cy="170" rx="350" ry="130"
              stroke="#C97B5A" strokeWidth="1" fill="none" strokeDasharray="8 6" opacity="0.35"/>
            <ellipse cx="400" cy="170" rx="330" ry="112"
              stroke="#C97B5A" strokeWidth="0.5" fill="none" opacity="0.2"/>
            {artists.map((src, i) => {
              const angle = (i / artists.length) * 2 * Math.PI - Math.PI / 2;
              const cx = 400 + 350 * Math.cos(angle);
              const cy = 170 + 130 * Math.sin(angle);
              const r  = 26;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={r + 3} fill="white" opacity="0.9"/>
                  <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#C97B5A" strokeWidth="1" opacity="0.4"/>
                  <clipPath id={`jjclip-${i}`}><circle cx={cx} cy={cy} r={r}/></clipPath>
                  <image href={src} x={cx - r} y={cy - r} width={r * 2} height={r * 2}
                    clipPath={`url(#jjclip-${i})`} preserveAspectRatio="xMidYMid slice"/>
                </g>
              );
            })}
          </svg>

          {/* Content */}
          <div
            className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16 md:py-20"
            style={{ minHeight: 340 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-clay-faint"/>
              <span className="font-body text-[10px] tracking-[0.22em] uppercase text-muted-clay">Our Mission</span>
              <div className="w-8 h-px bg-clay-faint"/>
            </div>

            <h2 className="font-heading font-normal text-[clamp(1.8rem,4vw,2.8rem)] text-deep-brown leading-[1.2] mb-5">
              Join Our{' '}
              <span className="text-muted-clay italic">Journey</span>
            </h2>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-px bg-muted-clay/35"/>
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/55"/>
              <div className="w-10 h-px bg-muted-clay/35"/>
            </div>

            <p className="font-body text-[0.9rem] leading-[1.85] text-deep-brown/70 max-w-[420px] mb-3">
              By joining our journey, you become part of a shared mission to celebrate and sustain this
              extraordinary creative heritage — connecting skilled artists with wider audiences, promoting fair
              livelihoods, and ensuring that the spirit of these crafts continues to inspire across all
              provinces and beyond.
            </p>

            <p className="font-body text-[0.82rem] leading-[1.8] text-deep-brown/45 italic mb-8">
              Whether you're an enthusiast, researcher, or simply curious — there is a place for you here.
            </p>

            <Link
              to="/partnership"
              className="font-body inline-flex items-center gap-3 px-8 py-3 rounded-full font-medium text-sm bg-muted-clay text-warm-sand tracking-[0.03em] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              Get Started <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* category slider */
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
        <button
          key={side}
          onClick={fn}
          disabled={!can}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            can ? 'bg-muted-clay text-warm-sand' : 'bg-[#E8D8CC] text-[#B8A090]'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 px-4">
        {categories.slice(current, current + visible).map((cat, i) => (
         <Link
  key={cat.name + current + i}
  to={`/categories?category=${encodeURIComponent(cat.name)}`}
  className="group relative overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.03]"
  style={{ borderRadius: '50% 50% 16px 16px / 28% 28% 16px 16px', aspectRatio: '3/4' }}
>
  <img
    src={cat.image}
    alt={cat.name}
    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(to bottom,#C97B5A,#C4917A)'; }}
  />
  
  <div className="absolute inset-0 bg-gradient-to-t from-warm-sand/95 via-warm-sand/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"/>
  
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-muted-clay/10 to-transparent"/>
  
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 bg-muted-clay rounded-b"/>
  
  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-center text-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
    <h3 className="font-heading font-semibold text-deep-brown leading-tight mb-2.5 text-[0.95rem] drop-shadow-sm">
      {cat.name}
    </h3>
    
    {/* decorative divider */}
    <div className="flex items-center gap-1.5 mb-2.5">
      <div className="h-px w-5 bg-muted-clay/60"/>
      <div className="w-1.5 h-1.5 rounded-full bg-muted-clay"/>
      <div className="h-px w-5 bg-muted-clay/60"/>
    </div>
    
    {/* artwork count */}
    <p className="font-body text-[13px] font-medium text-deep-brown/80 drop-shadow-sm">
      {getCategoryCount(cat.name)} Artworks
    </p>
  </div>
</Link>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 mt-6">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i * visible)}
            className={`rounded-full transition-all duration-300 h-1.5 ${
              Math.floor(current / visible) === i ? 'w-5 bg-muted-clay' : 'w-1.5 bg-[#D4BBA8]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/*home */
const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats]                 = useState({ totalArtists: 0, totalArtworks: 0, provinces: 9 });
  const [loading, setLoading]             = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [currentSlide, setCurrentSlide]   = useState(0);
  const [hoveredNews, setHoveredNews]     = useState(null);
  const [newsData, setNewsData]           = useState([]);
  const [loadingNews, setLoadingNews]     = useState(true);
  const [heroLoaded, setHeroLoaded]       = useState(false);

  useEffect(() => { fetchHomeData(); fetchNews(); }, []);
  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 120); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setCurrentSlide(p => (p + 1) % 3), 5000); return () => clearInterval(t); }, []);

  const fetchNews = async () => {
    try { const r = await newsAPI.getLatest({ limit: 5 }); if (r.data.success) setNewsData(r.data.data); }
    catch { setNewsData([]); } finally { setLoadingNews(false); }
  };
  const fetchHomeData = async () => {
    try {
      const [a, b] = await Promise.all([artistAPI.getAll({ page: 1, limit: 1 }), artworkAPI.getAll({ page: 1, limit: 1 })]);
      setStats({ totalArtists: a.data.total || 0, totalArtworks: b.data.total || 0, provinces: 9 });
      try { const cr = await artworkAPI.getStatsByCategory(); setCategoryStats(cr.data.data || []); } catch {}
    } catch {} finally { setLoading(false); }
  };
  const getCategoryCount = (name) => { const s = categoryStats.find(s => s._id === name); return s ? s.count : 0; };

  const categories = [
    { name: 'Folk Mural Painting',  image: '/images/trapainting.jpg' },
    { name: 'Pottery & Clay',       image: '/images/pottery.jpg'     },
    { name: 'Lacquer Work',         image: '/images/lacquerwork.jpg' },
    { name: 'Handloom Saree',       image: '/images/hadloom.jpg'     },
    { name: 'Coconut Crafts',       image: '/images/coco.jpg'        },
    { name: 'Traditional Masks',    image: '/images/mask.jpg'        },
    { name: 'Metal Craft',          image: '/images/metal.jpg'       },
    { name: 'Cane Work',            image: '/images/cane.jpg'        },
    { name: 'Statues',              image: '/images/status.jpg'      },
    { name: 'Folk Jewelry',         image: '/images/jewl.jpg'        },
    { name: 'Ceramic',              image: '/images/cermic.jpg'      },
    { name: 'Wood Carving',         image: '/images/wood.jpg'        },
    { name: 'Batik Clothing',       image: '/images/batic.jpg'       },
    { name: 'Hana Fiber Crafts',    image: '/images/hana.jpg'        },
    { name: 'Sri Lankan Sculpture', image: '/images/sculpture.jpg'   },
    { name: 'Mats',                 image: '/images/mats.jpg'        },
    { name: 'Puppetry',             image: '/images/pupperty.jpg'    },
    { name: 'Drum Craft',           image: '/images/drum.jpg'        },
    { name: 'Rabana Making',        image: '/images/rabana.jpg'      },
    { name: 'Other',                image: '/images/heritage2.png'   },
  ];

  const features = [
    { icon: Landmark,    title: 'Historical Places',  desc: 'Explore locations famous for traditional folk arts across Sri Lanka' },
    { icon: Palette,     title: 'Artwork Gallery',    desc: 'Browse stunning artworks uploaded by talented traditional artisans' },
    { icon: BookOpen,    title: 'Learning Center',    desc: 'Learn about folk arts with AR experiences and detailed guides' },
    { icon: UserCircle,  title: 'Meet Artists',       desc: 'Connect with registered traditional artists from all provinces' },
    { icon: ShoppingBag, title: 'Marketplace',        desc: 'Purchase authentic handcrafted folk art directly from artisans' },
    { icon: HandHeart,   title: 'Support Heritage',   desc: 'Donate to preserve and promote Sri Lankan folk art traditions' },
  ];

  const carousel = [
    { url: '/images/h1.png', title: 'Preserving Cultural Heritage', desc: 'Supporting traditional artisans across Sri Lanka' },
    { url: '/images/h2.jpg', title: 'Empowering Communities',       desc: 'Connecting artists with opportunities' },
    { url: '/images/h3.jpg', title: 'Celebrating Tradition',        desc: 'Showcasing the beauty of folk arts' },
  ];

  const hBase = 'transition-[opacity,transform] duration-[800ms] ease-[ease]';
  const hShow = 'opacity-100 translate-y-0';
  const hHide = 'opacity-0 translate-y-5';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-warm-sand">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-clay"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
       {/* hero section*/}
<section className="relative flex overflow-hidden min-h-screen bg-[#FAF7F2]">

  {/* left -Video panel with smooth curve */}
  <div
    className="relative hidden lg:block flex-shrink-0 z-20 overflow-hidden"
    style={{
      width: '55%',
      minHeight: '100vh',
      clipPath: 'ellipse(95% 100% at 0% 50%)'
    }}
  >
    {/* video */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
    >
      <source src="/videos/banner1.mp4" type="video/mp4" />
    </video>
  </div>

  {/* right side content*/}
  <div className="relative flex items-center flex-1 overflow-hidden">
    <img
      src="/images/heroh.jpg"
      alt="hero"
      className="absolute inset-0 w-full h-full object-cover z-0"
      style={{
        WebkitMaskImage: 'linear-gradient(to left, black 75%, transparent 100%)',
        maskImage: 'linear-gradient(to left, black 75%, transparent 100%)'
      }}
    />
    <div className="absolute inset-0 bg-[#FAF7F2]/60 z-10" />

    {/*content*/}
    <div
      className="relative z-20 w-full pt-[6.5rem] pb-16"
      style={{
        paddingLeft: 'clamp(2rem,4vw,4.5rem)',
        paddingRight: 'clamp(1.5rem,3vw,3rem)',
        maxWidth: 540,
      }}
    >

      {/* badge */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-px bg-muted-clay/40" />
        <span className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-clay">
          Sri Lankan Heritage
        </span>
        <div className="w-[22px] h-px bg-muted-clay/22" />
      </div>

      {/* title */}
      <h1 className="font-heading leading-[1.18] text-deep-brown text-[clamp(2rem,4.2vw,3.3rem)]">
        Discover the <br />
        <span className="text-muted-clay italic">Beauty</span> of <br />
        Folk Arts
      </h1>

      {/* divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="w-10 h-px bg-muted-clay/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-clay/55" />
        <div className="w-[22px] h-px bg-muted-clay/25" />
      </div>

      {/* description */}
      <p className="font-body text-sm leading-[1.85] text-[#6B5A50] max-w-[370px]">
        Empowering Sri Lanka's traditional artisans by bridging communities,
        safeguarding cultural heritage, and creating sustainable opportunities
        across all provinces.
      </p>

      {/* buttons */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Link
          to="/gallery"
          className="px-7 py-3 rounded-full text-sm bg-muted-clay text-warm-sand hover:scale-105 transition"
        >
          Explore Gallery →
        </Link>

        <Link
          to="/artists"
          className="px-7 py-3 rounded-full text-sm border border-muted-clay/40 hover:bg-muted-clay hover:text-white transition"
        >
          Meet Artists
        </Link>
      </div>

      {/* stats */}
      <div className="flex gap-9 mt-11 pt-7 border-t border-muted-clay/14">
        <div>
          <p className="text-[1.55rem] text-muted-clay">3+</p>
          <p className="text-xs text-[#9A8A80] uppercase">Artists</p>
        </div>
        <div>
          <p className="text-[1.55rem] text-muted-clay">5+</p>
          <p className="text-xs text-[#9A8A80] uppercase">Artworks</p>
        </div>
        <div>
          <p className="text-[1.55rem] text-muted-clay">9</p>
          <p className="text-xs text-[#9A8A80] uppercase">Provinces</p>
        </div>
      </div>

    </div>
  </div>
</section>
      {/* ══ ART CATEGORIES SLIDER ══ */}
      <section className="py-24 bg-[#FAF7F2]">
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
            <Link
              to="/categories"
              className="font-body inline-flex items-center gap-2.5 px-8 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown tracking-[0.03em] transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay"
            >
              <Eye size={15}/> View All Categories <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="py-24 relative overflow-hidden bg-white"
      style={{ backgroundImage: "url('/images/discover.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-3">What We Offer</p>
            <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown mb-5">
              What You Can <span className="text-muted-clay italic">Discover</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="w-[50px] h-px bg-muted-clay/30"/>
              <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50"/>
              <div className="w-[50px] h-px bg-muted-clay/30"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-[#FAF7F2] shadow-[0_4px_28px_rgba(61,53,48,0.09)]"
                  style={{ borderRadius: '50% 50% 16px 16px / 22% 22% 16px 16px' }}
                >
                  <div className="flex items-center justify-center pt-10 pb-6 bg-gradient-to-b from-muted-clay/10 to-transparent">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted-clay/12 border border-muted-clay/20 transition-all duration-500 group-hover:scale-110">
                      <Icon size={30} className="text-muted-clay" strokeWidth={1.6}/>
                    </div>
                  </div>
                  <div className="px-7 pb-8 text-center">
                    <h3 className="font-heading text-base font-normal text-deep-brown mb-3">{f.title}</h3>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-6 h-px bg-muted-clay/35"/>
                      <div className="w-1 h-1 rounded-full bg-muted-clay/50"/>
                      <div className="w-6 h-px bg-muted-clay/35"/>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-deep-brown/75">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* join our jurney*/}
      <JoinOurJourney/>

      {/*department programmes */}
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
              { icon: BookOpen, label: 'Education', title: 'Training Programs', desc: 'Join professional training programs organized by the Traditional Industry Development Department to learn authentic folk art techniques from master artisans.', items: ['Certificate programs in traditional crafts', 'Hands-on workshops with expert guidance', 'Skills development for artisan communities'], link: '/courses', btn: 'View Courses', img: '/images/sesth.png' },
              { icon: Calendar, label: 'Events',    title: 'Cultural Events',   desc: 'Participate in cultural events and exhibitions organized by provincial councils to celebrate and promote Sri Lankan traditional arts.',               items: ['Traditional art exhibitions and fairs',  'Cultural festivals across provinces',          'Networking opportunities for artisans'],       link: '/events',  btn: 'View Events',  img: '/images/ce.png' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-[#FAF7F2] shadow-[0_4px_28px_rgba(61,53,48,0.08)]"
                >
                  <div className="relative overflow-hidden h-[220px]">
                    <img
                      src={card.img} alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}
                    />
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
                    <Link
                      to={card.link}
                      className="font-body inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-sm bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105"
                    >
                      {card.btn} <ArrowRight size={15}/>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* latest news*/}
      <section className="py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-14">
            <div>
              <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-2.5">Stay Informed</p>
              <h2 className="font-heading text-4xl md:text-5xl font-normal text-deep-brown">
                Latest <span className="text-muted-clay italic">News</span>
              </h2>
            </div>
            <Link
              to="/news"
              className="font-body hidden md:inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay"
            >
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
                  <div
                    key={news._id}
                    onClick={() => navigate(`/news/${news._id}`)}
                    onMouseEnter={() => setHoveredNews(idx)}
                    onMouseLeave={() => setHoveredNews(null)}
                    className={`cursor-pointer transition-all duration-300 rounded-[14px] p-5 bg-warm-sand shadow-[0_2px_16px_rgba(61,53,48,0.06)] border-l-4 ${
                      hoveredNews === idx ? 'border-muted-clay scale-[1.015]' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-[88px] h-[88px] rounded-[10px] overflow-hidden">
                        <img
                          src={news.images?.[0] || '/images/placeholder.jpg'} alt={news.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}
                        />
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

              {/* folk art slider*/}
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

      {/* CTA section*/}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-8 h-px bg-muted-clay"/>
                <span className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-clay">Featured Initiative</span>
                <div className="w-4 h-px bg-muted-clay/35"/>
              </div>

              <div className="overflow-hidden mb-2.5">
                <h3
                  key={currentSlide}
                  className="font-heading font-normal text-[clamp(1rem,1.8vw,1.25rem)] text-muted-clay leading-[1.4] animate-cta-slide-up"
                >
                  {carousel[currentSlide].title}
                </h3>
              </div>

              <h2 className="font-heading font-normal text-[clamp(2rem,4vw,3.2rem)] text-deep-brown leading-[1.15] mb-[18px]">
                Be Part of<br/>
                Preserving Our{' '}
                <span className="text-muted-clay italic">Heritage</span>
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
                <Link
                  to="/donations"
                  className="font-body inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-medium text-sm bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <Heart size={15}/> Make a Donation
                </Link>
                <Link
                  to="/partnership"
                  className="font-body inline-flex items-center gap-2.5 px-7 py-3 rounded-full font-medium text-sm border border-muted-clay/40 text-deep-brown bg-transparent transition-all duration-300 hover:scale-105 hover:bg-muted-clay hover:text-warm-sand hover:border-muted-clay"
                >
                  <Users size={15}/> Become a Partner
                </Link>
              </div>

              {/* Slide thumbnail nav */}
              <div className="flex items-center gap-3">
                {carousel.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`transition-all duration-300 hover:scale-105 overflow-hidden rounded-lg flex-shrink-0 border-2 ${
                      i === currentSlide ? 'border-muted-clay opacity-100' : 'border-muted-clay/20 opacity-55'
                    }`}
                    style={{ width: i === currentSlide ? 72 : 52, height: i === currentSlide ? 48 : 36 }}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover"/>
                  </button>
                ))}
                <div className="flex gap-1.5 ml-2">
                  {carousel.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 h-[5px] ${
                        i === currentSlide ? 'w-[18px] bg-muted-clay' : 'w-[5px] bg-muted-clay/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* right side Arch framed slider */}
            <div className="relative flex justify-center lg:justify-end">
              <div
                className="relative overflow-hidden w-full max-w-[520px] aspect-[4/5] shadow-[0_20px_60px_rgba(61,53,48,0.14)] border border-muted-clay/12"
                style={{ borderRadius: '50% 50% 16px 16px / 28% 28% 16px 16px' }}
              >
                {carousel.map((img, i) => (
                  <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === currentSlide ? 1 : 0 }}>
                    <img
                      src={img.url} alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-[6000ms] ease-linear"
                      style={{ transform: i === currentSlide ? 'scale(1.05)' : 'scale(1)' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}
                    />
                  </div>
                ))}

                <button
                  onClick={() => setCurrentSlide(p => (p - 1 + carousel.length) % carousel.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/70 backdrop-blur border border-muted-clay/25"
                >
                  <ChevronLeft size={18} className="text-deep-brown"/>
                </button>
                <button
                  onClick={() => setCurrentSlide(p => (p + 1) % carousel.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/70 backdrop-blur border border-muted-clay/25"
                >
                  <ChevronRight size={18} className="text-deep-brown"/>
                </button>

                <div className="absolute bottom-0 left-0 right-0 z-20 flex h-[3px]">
                  {carousel.map((_, i) => (
                    <div key={i} className="flex-1 bg-warm-sand/20">
                      <div
                        className="h-full bg-muted-clay"
                        style={{ width: i === currentSlide ? '100%' : '0%', transition: i === currentSlide ? 'width 5s linear' : 'width 0s' }}
                      />
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

      {/* contact form*/}
      <ContactFormSection/>

    </div>
  );
};

/* folk art slider  */
const FolkArtSliderInline = ({ navigate }) => {
  const slides = [
    { image: '/images/lacquerwork.jpg', category: 'Lacquer Work',      desc: 'Hand-painted wooden crafts passed down through generations.',   path: '/learning?category=Lacquer%20Work' },
    { image: '/images/pottery.jpg',     category: 'Pottery & Clay',    desc: 'Ancient pottery traditions shaped by hand and fired in kilns.', path: '/learning?category=Pottery%20%26%20Clay' },
    { image: '/images/mask.jpg',        category: 'Traditional Masks', desc: 'Ceremonial masks carved from kaduru wood.',                     path: '/learning?category=Traditional%20Masks' },
    { image: '/images/hadloom.jpg',     category: 'Handloom Saree',    desc: 'Hand-woven sarees celebrated for geometric motifs.',            path: '/learning?category=Handloom%20Saree' },
    { image: '/images/wood.jpg',        category: 'Wood Carving',      desc: 'Masterful woodwork — a hallmark of Sri Lankan temple art.',     path: '/learning?category=Wood%20Carving' },
  ];
  const [active, setActive] = useState(0);
  const [anim, setAnim] = useState(false);
  const timer = useRef(null);
  const goTo = (i) => { if (anim || i === active) return; setAnim(true); setTimeout(() => { setActive(i); setAnim(false); }, 280); };
  const nav = (fn) => { clearInterval(timer.current); fn(); timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4000); };
  useEffect(() => { timer.current = setInterval(() => setActive(p => (p + 1) % slides.length), 4000); return () => clearInterval(timer.current); }, []);
  const s = slides[active];

  return (
    <div className="overflow-hidden shadow-xl rounded-2xl border border-muted-clay/15">
      <div className="relative overflow-hidden h-[280px]">
        <img
          key={active} src={s.image} alt={s.category}
          className={`w-full h-full object-cover transition-all duration-500 ${anim ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#C97B5A,#C4917A)'; }}
        />
        <button
          onClick={() => nav(() => goTo((active - 1 + slides.length) % slides.length))}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/22 backdrop-blur"
        >
          <ChevronLeft size={16} className="text-warm-sand"/>
        </button>
        <button
          onClick={() => nav(() => goTo((active + 1) % slides.length))}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-warm-sand/22 backdrop-blur"
        >
          <ChevronRight size={16} className="text-warm-sand"/>
        </button>
        <span className="font-body absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-soft-charcoal/55 text-warm-sand/80">
          {active + 1}/{slides.length}
        </span>
      </div>
      <div className="bg-warm-sand px-5 py-4">
        <h4 className="font-heading font-bold text-sm mb-1 text-deep-brown">{s.category}</h4>
        <p className="font-body text-xs leading-relaxed mb-2.5 text-deep-brown/60">{s.desc}</p>
        <button
          onClick={() => navigate(s.path)}
          className="font-body inline-flex items-center gap-1 text-xs font-semibold text-muted-clay transition-colors duration-200 hover:text-deep-brown"
        >
          Learn More <ArrowRight size={12}/>
        </button>
      </div>
      <div className="bg-warm-sand pb-3 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => nav(() => goTo(i))}
            className={`rounded-full transition-all duration-300 h-[5px] ${i === active ? 'w-[18px] bg-muted-clay' : 'w-[5px] bg-deep-brown/18'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* contact form section*/
const ContactFormSection = () => {
  const [form, setForm] = useState({ name: '', email: '', contactNo: '', province: '', address: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.contactNo || !form.province || !form.message) { setError('Please fill in all required fields.'); return; }
    setSubmitting(true);
    try {
      const res = await inquiryAPI.create(form);
      if (res.data.success) { setSuccess(true); setForm({ name: '', email: '', contactNo: '', province: '', address: '', message: '' }); }
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong.'); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-4 py-3 text-sm focus:outline-none focus:border-muted-clay transition-colors duration-200 font-body bg-warm-sand border border-muted-clay/25 rounded-[10px] text-deep-brown placeholder:text-deep-brown/35";

  return (
    <section className="py-24 relative overflow-hidden bg-[#FAF7F2]">
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url('/images/contact.png')" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="font-body text-[11px] tracking-[0.22em] uppercase text-muted-clay mb-[14px]">Provincial Inquiry</p>
          <h2 className="font-heading font-normal text-[clamp(2rem,4vw,3rem)] text-deep-brown leading-[1.2]">
            Get In <span className="text-muted-clay italic">Touch</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-[50px] h-px bg-muted-clay/30"/>
            <div className="w-[5px] h-[5px] rounded-full bg-muted-clay/50"/>
            <div className="w-[50px] h-px bg-muted-clay/30"/>
          </div>
          <p className="font-body max-w-xl mx-auto mt-5 text-sm leading-relaxed text-deep-brown/55">
            Have a question about folk arts, artists, or programs in your province? Submit your inquiry and the relevant administration will respond directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Info cards */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: MapPin, title: 'Provincial Coverage', desc: 'Your inquiry is automatically routed to your selected province for a faster, more relevant response.' },
              { icon: Mail,   title: 'Email Confirmation',  desc: 'You will receive an immediate confirmation email once your inquiry is submitted.' },
              { icon: Phone,  title: 'Response Time',       desc: 'Provincial teams typically respond within 2–3 business days.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-md bg-white/30 rounded-[14px] p-[1.1rem_1.25rem] border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.08)]" >
                  <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-muted-clay/10 border border-muted-clay/20">
                    <Icon size={18} className="text-muted-clay"/>
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold mb-1 text-deep-brown">{item.title}</h4>
                    <p className="font-body text-xs leading-relaxed text-deep-brown/55">{item.desc}</p>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 px-2">
              <div className="w-7 h-px bg-muted-clay/40 mb-2.5"/>
              <p className="font-body text-xs italic leading-relaxed text-deep-brown/40">
                "Preserving the art is preserving the soul of a nation."
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-lg bg-white/30 rounded-[20px] p-9 border border-white/30 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-12 gap-5">
                  <div className="w-[72px] h-[72px] rounded-full bg-sage-green/15 border border-sage-green/30 flex items-center justify-center">
                    <CheckCircle size={38} className="text-sage-green"/>
                  </div>
                  <h3 className="font-heading text-xl font-normal text-deep-brown">Inquiry Submitted!</h3>
                  <p className="font-body max-w-sm text-sm leading-relaxed text-deep-brown/55">Your inquiry has been forwarded to the provincial administration. We'll be in touch soon!</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="font-body px-7 py-3 rounded-full text-sm font-medium bg-muted-clay text-warm-sand transition-all duration-300 hover:scale-105 mt-2"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { label: 'Full Name',      name: 'name',      type: 'text',  ph: 'Your full name' },
                      { label: 'Email',          name: 'email',     type: 'email', ph: 'your@email.com' },
                      { label: 'Contact Number', name: 'contactNo', type: 'tel',   ph: '+94 77 123 4567' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="font-body block text-xs mb-2 tracking-wider uppercase text-deep-brown/50">
                          {f.label} <span className="text-muted-clay">*</span>
                        </label>
                        <input
                          type={f.type} name={f.name} value={form[f.name]}
                          onChange={handleChange} placeholder={f.ph}
                          className={inputCls}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="font-body block text-xs mb-2 tracking-wider uppercase text-deep-brown/50">
                        Province <span className="text-muted-clay">*</span>
                      </label>
                      <select
                        name="province" value={form.province} onChange={handleChange}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-body block text-xs mb-2 tracking-wider uppercase text-deep-brown/50">
                      Address{' '}
                      <span className="font-body text-[11px] normal-case tracking-normal text-deep-brown/35">(optional)</span>
                    </label>
                    <input
                      type="text" name="address" value={form.address}
                      onChange={handleChange} placeholder="Your address"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="font-body block text-xs mb-2 tracking-wider uppercase text-deep-brown/50">
                      Message <span className="text-muted-clay">*</span>
                    </label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange}
                      rows={5} placeholder="Describe your inquiry..." maxLength={2000}
                      className={`${inputCls} resize-none`}
                    />
                    <p className="font-body text-right text-xs mt-1 text-deep-brown/35">{form.message.length}/2000</p>
                  </div>

                  {error && (
                    <p className="font-body text-xs px-4 py-3 rounded-xl text-[#e05c5c] bg-[#e05c5c]/7 border border-[#e05c5c]/20">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit" disabled={submitting}
                    className="font-body w-full flex items-center justify-center gap-3 py-4 rounded-full font-medium text-sm bg-muted-clay text-warm-sand shadow-[0_4px_20px_rgba(201,123,90,0.30)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-warm-sand/60 border-t-transparent rounded-full animate-spin"/><span>Submitting...</span></>
                    ) : (
                      <><Send size={16}/><span>Submit Inquiry</span><ArrowRight size={16}/></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;