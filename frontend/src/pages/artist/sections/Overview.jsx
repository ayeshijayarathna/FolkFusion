import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { artistAPI, artworkAPI, notificationAPI } from '../../../services/api';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart as RBarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  FiTrendingUp, FiShoppingBag, FiEye, FiHeart,
  FiPackage, FiMessageSquare, FiBell, FiRefreshCw,
  FiAlertTriangle, FiCheckCircle, FiStar,
  FiBarChart2, FiPieChart, FiActivity, FiClock,
  FiCalendar, FiSun, FiMoon, FiCoffee, FiZap,
  FiChevronLeft, FiChevronRight, FiCpu, FiLoader,
  FiTarget,
} from 'react-icons/fi';
import { MdOutlinePalette } from 'react-icons/md';

const CV = {
  gold:     'var(--cinnamon)',     
  teal:     'var(--muted-teal)',    
  brown:    'var(--deep-brown)', 
  clay:     'var(--muted-clay)',     
  sage:     'var(--sage-green)',     
  sand:     'var(--warm-sand)',     
  charcoal: 'var(--soft-charcoal)',

  goldHex:  '#D4AF37',
  tealHex:  '#5F8B8C',
  brownHex: '#4A3F35',
  clayHex:  '#A67C52',
  sageHex:  '#8DAA91',
  greenHex: '#3a7d5b',
  redHex:   '#c0392b',
  blueHex:  '#2980b9',
};

// greeting by time of day
const getGreeting = (h) => {
  if (h >= 5  && h < 12) return { text: 'Good Morning',   icon: <FiSun     size={18} color={CV.goldHex} /> };
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', icon: <FiCoffee  size={18} color={CV.goldHex} /> };
  if (h >= 17 && h < 21) return { text: 'Good Evening',   icon: <FiZap     size={18} color={CV.goldHex} /> };
  return                         { text: 'Good Night',     icon: <FiMoon    size={18} color={CV.goldHex} /> };
};

const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
};

// ----------------------------------------------------------------------------
// Welcome Banner
// ----------------------------------------------------------------------------
const WelcomeBanner = ({ artistName }) => {
  const now      = useClock();
  const greeting = getGreeting(now.getHours());
  const dateStr  = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const timeStr  = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  return (
    <div className="relative rounded-2xl overflow-hidden mb-5 shadow-cultural" style={{ minHeight: 140 }}>
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-top" style={{ backgroundImage: 'url(/images/cards.jpg)' }} />

      {/* Gold bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${CV.greenHex}cc, transparent)` }} />

      {/* Content — right aligned */}
      <div className="relative z-10 flex flex-col items-end justify-center h-full px-8 py-6 gap-1 text-right" style={{ minHeight: 140 }}>
        {/* Greeting */}
        <div className="flex items-center justify-end gap-2 mb-1">
          {greeting.icon}
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `${CV.goldHex}dd`, fontFamily: 'Libre Baskerville, serif' }}>
            {greeting.text}
          </span>
        </div>
        {/* Name */}
        <h2 className="text-2xl font-black text-[#8DAA91] m-0 leading-tight" style={{ textShadow: '0 2px 14px rgba(0,0,0,.45)' }}>
          Welcome back,&nbsp;<span style={{ color: CV.greenHex }}>{artistName || 'Artist'}</span>
        </h2>
        <p className="text-xs m-0" style={{ color: 'deep-brown', fontFamily: 'Libre Baskerville, serif' }}>
          Your FolkFusion artist dashboard — all your stats at a glance.
        </p>
        {/* Pills */}
        <div className="flex items-center justify-end gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)' }}>
            <FiCalendar size={11} color={`${CV.goldHex}cc`} />
            <span className="text-xs" style={{ color: '#D4AF37', fontFamily: 'Libre Baskerville, serif' }}>{dateStr}</span>
          </div>
          <div className="ov-pulse flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: `${CV.goldHex}22`, border: `1px solid ${CV.goldHex}55` }}>
            <FiClock size={11} color={CV.goldHex} />
            <span className="text-sm font-bold tabular-nums" style={{ color: CV.goldHex, fontFamily: 'Libre Baskerville, serif', letterSpacing: '.06em' }}>{timeStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Toast
// ----------------------------------------------------------------------------
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed bottom-7 right-7 z-50 flex items-center gap-3 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold ov-fade"
      style={{ background: type === 'error' ? CV.redHex : CV.tealHex, fontFamily: 'Libre Baskerville, serif' }}>
      {type === 'error' ? <FiAlertTriangle size={16}/> : <FiCheckCircle size={16}/>}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ----------------------------------------------------------------------------
// Recharts tooltips
// ----------------------------------------------------------------------------
const TooltipLine = ({ active, payload, label, prefix='' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-xs" style={{ border: `1px solid ${CV.goldHex}44`, fontFamily: 'Libre Baskerville, serif' }}>
      <p className="mb-1 font-bold" style={{ color: CV.clayHex }}>{label}</p>
      <p className="font-black" style={{ color: CV.brownHex }}>{prefix}{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};
const TooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-xs" style={{ border: `1px solid ${CV.goldHex}44`, fontFamily: 'Libre Baskerville, serif' }}>
      <p className="mb-1 font-bold" style={{ color: CV.clayHex }}>{label}</p>
      <p className="font-black" style={{ color: CV.brownHex }}>{payload[0].value?.toLocaleString()} views</p>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Recharts — Area / Line chart
// ----------------------------------------------------------------------------
const LineChart = ({ data=[], color=CV.tealHex, height=150, prefix='' }) => {
  const hasData = data.some(d => d.value > 0);
  if (!hasData) return (
    <div className="flex flex-col items-center justify-center gap-2" style={{ height }}>
      <FiActivity size={22} color={`${CV.goldHex}88`}/>
      <span className="text-xs" style={{ color: CV.clayHex, fontFamily: 'Libre Baskerville, serif' }}>No data yet</span>
    </div>
  );
  const uid = `lg${color.replace('#','')}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:8, right:8, left:-20, bottom:0 }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={`${CV.goldHex}22`} vertical={false}/>
        <XAxis dataKey="label" tick={{ fontSize:10, fill:CV.clayHex, fontFamily:'Libre Baskerville, serif' }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fontSize:10, fill:CV.clayHex, fontFamily:'Libre Baskerville, serif' }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
        <Tooltip content={<TooltipLine prefix={prefix}/>}/>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${uid})`}
          dot={{ r:4, fill:color, stroke:'#fff', strokeWidth:2 }}
          activeDot={{ r:6, fill:color, stroke:'#fff', strokeWidth:2 }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ----------------------------------------------------------------------------
// Recharts — Bar chart
// ----------------------------------------------------------------------------
const BarChart = ({ data=[], color=CV.goldHex, height=150 }) => {
  const hasData = data.some(d => d.value > 0);
  if (!hasData) return (
    <div className="flex flex-col items-center justify-center gap-2" style={{ height }}>
      <FiBarChart2 size={22} color={`${CV.goldHex}88`}/>
      <span className="text-xs" style={{ color: CV.clayHex, fontFamily: 'Libre Baskerville, serif' }}>No data yet</span>
    </div>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={data} margin={{ top:8, right:8, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={`${CV.goldHex}22`} vertical={false}/>
        <XAxis dataKey="label" tick={{ fontSize:10, fill:CV.clayHex, fontFamily:'Libre Baskerville, serif' }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fontSize:10, fill:CV.clayHex, fontFamily:'Libre Baskerville, serif' }} axisLine={false} tickLine={false}/>
        <Tooltip content={<TooltipBar/>}/>
        <Bar dataKey="value" fill={color} radius={[5,5,0,0]} maxBarSize={48}/>
      </RBarChart>
    </ResponsiveContainer>
  );
};

//donut chart
const DonutChart = ({ segments=[], size=110 }) => {
  const total = segments.reduce((s,sg) => s+(sg.value||0), 0);
  if (!total) return (
    <div className="flex items-center justify-center" style={{ width:size, height:size }}>
      <FiPieChart size={26} color={`${CV.goldHex}88`}/>
    </div>
  );
  return (
    <div className="relative" style={{ width:size, height:size }}>
      <PieChart width={size} height={size}>
        <Pie data={segments.map(s=>({name:s.label,value:s.value,color:s.color}))}
          cx={size/2-1} cy={size/2-1}
          innerRadius={size*.30} outerRadius={size*.46}
          paddingAngle={2} dataKey="value" strokeWidth={0}>
          {segments.map((s,i) => <Cell key={i} fill={s.color}/>)}
        </Pie>
        <Tooltip formatter={(v,n)=>[v,n]} contentStyle={{ fontFamily:'Libre Baskerville, serif', fontSize:11, border:`1px solid ${CV.goldHex}44`, borderRadius:8 }}/>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-black leading-none" style={{ fontSize:size*.17, color:CV.brownHex }}>{total}</span>
        <span className="text-center" style={{ fontSize:size*.09, color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>total</span>
      </div>
    </div>
  );
};

// legend for charts
const Legend = ({ items }) => (
  <div className="flex flex-col gap-2 flex-1 justify-center">
    {items.map((item,i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }}/>
          <span className="text-xs" style={{ color: CV.charcoal, fontFamily: 'Libre Baskerville, serif' }}>{item.label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color: CV.brownHex, fontFamily: 'Libre Baskerville, serif' }}>{item.value}</span>
      </div>
    ))}
  </div>
);

// ----------------------------------------------------------------------------
// KPI Card — compact variant
// ----------------------------------------------------------------------------
const KpiCard = ({ icon, label, value, sub, color, delay=0, compact=false }) => (
  <div className="ov-card-hover bg-white rounded-2xl shadow-md ov-fade"
    style={{ borderTop:`4px solid ${color}`, padding: compact?'12px 14px':'18px 20px', animationDelay:`${delay}ms` }}>
    <div className="flex items-center gap-2 mb-2">
      <div className="rounded-lg flex items-center justify-center" style={{ background:`${color}1a`, padding: compact?6:9 }}>
        {React.cloneElement(icon, { size: compact?14:17, color })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CV.tealHex, fontFamily: 'Libre Baskerville, serif' }}>{label}</span>
    </div>
    <div className="font-black leading-tight" style={{ fontSize: compact?18:22, color: CV.brownHex }}>{value}</div>
    {sub && <div className="text-xs mt-1" style={{ color: CV.clayHex, fontFamily: 'Libre Baskerville, serif' }}>{sub}</div>}
  </div>
);

//section card 
const Card = ({ title, icon, children, className='', delay=0 }) => (
  <div className={`ov-card-hover bg-white rounded-2xl shadow-md ov-fade ${className}`} style={{ padding:'18px 20px', animationDelay:`${delay}ms` }}>
    {title && (
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom:`1px solid ${CV.goldHex}33` }}>
        {icon && React.cloneElement(icon, { size:13, color:CV.goldHex })}
        <h3 className="text-[10px] font-bold uppercase tracking-widest m-0" style={{ color: CV.brownHex, fontFamily: 'Libre Baskerville, serif' }}>{title}</h3>
      </div>
    )}
    {children}
  </div>
);

//artwork slider component
const ArtworkSlider = ({ artworks=[] }) => {
  const [idx, setIdx] = useState(0);
  const slides = artworks.flatMap(aw => (aw.images||[]).map(img => ({ url:img.url, title:aw.title, category:aw.category, availability:aw.availability })));
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i+1)%slides.length), 3500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl" style={{ height:188, background:`${CV.brownHex}0a`, border:`1.5px dashed ${CV.goldHex}55` }}>
      <MdOutlinePalette size={26} color={`${CV.goldHex}88`}/>
      <span className="text-xs" style={{ color: CV.clayHex, fontFamily: 'Libre Baskerville, serif' }}>No artwork photos yet</span>
    </div>
  );

  const cur = slides[idx];
  const availColor = { available:CV.greenHex, sold:CV.redHex, reserved:CV.goldHex, 'not-for-sale':CV.clayHex }[cur.availability] || CV.charcoal;

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height:188 }}>
      <img key={idx} src={cur.url} alt={cur.title} className="w-full h-full object-cover block ov-fade"/>
      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2.5 pt-7"
        style={{ background:'linear-gradient(to top, rgba(30,25,20,.82) 0%, transparent 100%)' }}>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate max-w-[170px]" style={{ fontFamily:'Libre Baskerville, serif' }}>{cur.title}</div>
          <div className="text-[10px] mt-0.5" style={{ color:`${CV.goldHex}cc`, fontFamily:'Libre Baskerville, serif' }}>{cur.category}</div>
        </div>
        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 flex-shrink-0" style={{ color:availColor, background:`${availColor}22`, border:`1px solid ${availColor}55` }}>{cur.availability}</span>
      </div>
      {/* prev/next */}
      {slides.length > 1 && <>
        <button onClick={() => setIdx(i => (i-1+slides.length)%slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/85 rounded-full shadow-md border-0 cursor-pointer"
          style={{ width:28, height:28 }}><FiChevronLeft size={14} color={CV.brownHex}/></button>
        <button onClick={() => setIdx(i => (i+1)%slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/85 rounded-full shadow-md border-0 cursor-pointer"
          style={{ width:28, height:28 }}><FiChevronRight size={14} color={CV.brownHex}/></button>
      </>}
      {/* dots */}
      {slides.length > 1 && (
        <div className="absolute top-2 right-2.5 flex gap-1">
          {slides.slice(0,8).map((_,i) => (
            <div key={i} onClick={() => setIdx(i)} className="rounded-full cursor-pointer transition-all duration-300"
              style={{ width:i===idx?16:6, height:6, background: i===idx?CV.goldHex:'rgba(255,255,255,.55)' }}/>
          ))}
        </div>
      )}
      {/* counter */}
      <div className="absolute top-2 left-2.5 text-[10px] text-white rounded-full px-2 py-0.5" style={{ background:'rgba(0,0,0,.45)', fontFamily:'Libre Baskerville, serif' }}>
        {idx+1} / {slides.length}
      </div>
    </div>
  );
};

// horizontal bar chart for top artworks
const HBar = ({ items=[] }) => {
  const max = Math.max(...items.map(d=>d.value), 1);
  if (!items.length) return (
    <div className="text-center py-6">
      <MdOutlinePalette size={28} color={`${CV.goldHex}88`}/>
      <p className="text-xs mt-2" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>No artworks yet.</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {items.map((item,i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {i===0 && <FiStar size={11} color={CV.goldHex}/>}
              <span className="text-xs font-bold truncate max-w-[160px]" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>{item.label}</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color:CV.clayHex, background:`${CV.clayHex}18`, border:`1px solid ${CV.clayHex}33` }}>{item.badge}</span>
            </div>
            <span className="text-xs font-bold flex items-center gap-1 flex-shrink-0" style={{ color:CV.tealHex, fontFamily:'Libre Baskerville, serif' }}>
              <FiEye size={10}/>{item.value.toLocaleString()}
            </span>
          </div>
          <div className="rounded-md overflow-hidden" style={{ background:`${CV.brownHex}11`, height:9 }}>
            <div className="h-full rounded-md transition-all duration-1000"
              style={{ width:`${(item.value/max)*100}%`, background: i===0?`linear-gradient(90deg,${CV.goldHex},${CV.clayHex})`:`linear-gradient(90deg,${CV.tealHex},${CV.tealHex}aa)` }}/>
          </div>
        </div>
      ))}
    </div>
  );
};

//notifications icon map
const notifIconMap = {
  ARTWORK_LIKED:           <FiHeart         size={14} color={CV.redHex}  />,
  ARTWORK_VIEWS_MILESTONE: <FiEye           size={14} color={CV.tealHex} />,
  ORDER_PLACED:            <FiShoppingBag   size={14} color={CV.greenHex}/>,
  ARTIST_FEATURED:         <FiStar          size={14} color={CV.goldHex} />,
  INQUIRY_REPLIED:         <FiMessageSquare size={14} color={CV.blueHex} />,
  EVENT_ADDED:             <FiCalendar      size={14} color={CV.clayHex} />,
  COURSE_PUBLISHED:        <FiPackage       size={14} color={CV.brownHex}/>,
};
const getNotifIcon = (type) => notifIconMap[type] || <FiBell size={14} color={CV.tealHex}/>;

const timeAgo = (d) => {
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if (m<1)  return 'Just now';
  if (m<60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

// main overview component
const Overview = () => {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState({ msg:'', type:'success' });
  const [artistName,    setArtistName]    = useState('');
  const [artworks,      setArtworks]      = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiInsights,    setAiInsights]    = useState(null);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiGenerated,   setAiGenerated]   = useState(null);

  const notify = useCallback((msg, type='success') => setToast({ msg, type }), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await artistAPI.getDashboardOverview();
      setData(res.data.data);
      setNotifications(res.data.data?.recentNotifications || []);
    } catch (err) {
      console.error(err);
      notify('Failed to load dashboard data.', 'error');
    } finally { setLoading(false); }
  }, [notify]);

  const markNotifRead = useCallback(async (id) => {
    try { await notificationAPI.markAsRead(id); } catch (_) {}
    setNotifications(prev => prev.filter(n => n._id !== id));
  }, []);

  const fetchAiInsights = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await artistAPI.getAiInsights();
      setAiInsights(res.data.data);
      setAiGenerated(res.data.generatedAt);
    } catch { notify('AI insights generation failed.', 'error'); }
    finally { setAiLoading(false); }
  }, [notify]);

  useEffect(() => {
    artistAPI.getMyProfile().then(r => setArtistName(r.data.data?.fullName||'')).catch(()=>{});
    artworkAPI.getMyArtworks({ limit:20 }).then(r => setArtworks(r.data.data||[])).catch(()=>{});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  //loading state
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-warm-sand">
      <div className="ov-spin rounded-full" style={{ width:42, height:42, border:`4px solid ${CV.goldHex}44`, borderTopColor:CV.goldHex }}/>
      <p className="text-sm text-muted-teal" style={{ fontFamily:'Libre Baskerville, serif' }}>Loading dashboard...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-warm-sand p-6">
      <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ background:'#fdf0ed', border:`1px solid ${CV.redHex}55`, color:CV.redHex, fontFamily:'Libre Baskerville, serif' }}>
        <FiAlertTriangle size={16}/> Failed to load dashboard data. Please refresh.
      </div>
    </div>
  );

  const { kpi, revenueByMonth, artworkBreakdown, artworkEngagement, topArtworks, listingsBreakdown, inquiriesByMonth, inquiryStatus } = data;

  const artworkSegs = [
    { label:'Available',    value:artworkBreakdown.available  ||0, color:CV.tealHex  },
    { label:'Sold',         value:artworkBreakdown.sold       ||0, color:CV.goldHex  },
    { label:'Not for Sale', value:artworkBreakdown.notForSale ||0, color:CV.clayHex  },
  ].filter(s=>s.value>0);

  const listingSegs = [
    { label:'Active',       value:listingsBreakdown.active     ||0, color:CV.greenHex },
    { label:'Out of Stock', value:listingsBreakdown.outOfStock ||0, color:CV.clayHex  },
    { label:'Inactive',     value:listingsBreakdown.inactive   ||0, color:'#bbb'      },
  ].filter(s=>s.value>0);

  const inqSegs = [
    { label:'New',     value:inquiryStatus?.new     ||0, color:CV.blueHex  },
    { label:'Read',    value:inquiryStatus?.read    ||0, color:CV.tealHex  },
    { label:'Replied', value:inquiryStatus?.replied ||0, color:CV.greenHex },
    { label:'Closed',  value:inquiryStatus?.closed  ||0, color:CV.clayHex  },
  ].filter(s=>s.value>0);

  // artwork categories for icons
  const catIcon = { 'Revenue & Sales':<FiTrendingUp size={12} color={CV.brownHex}/>, 'Top Artwork':<MdOutlinePalette size={12} color={CV.brownHex}/>, 'Listing Strategy':<FiPackage size={12} color={CV.brownHex}/>, 'Inquiries':<FiMessageSquare size={12} color={CV.brownHex}/> };
  const statusCls = { good:`${CV.greenHex}0f|${CV.greenHex}33|${CV.greenHex}`, warning:`${CV.clayHex}0f|${CV.clayHex}33|${CV.clayHex}`, neutral:`${CV.tealHex}08|${CV.tealHex}22|${CV.tealHex}` };

  return (
    <div className="min-h-screen bg-warm-sand p-5">

      {/*welcome banner */}
      <WelcomeBanner artistName={artistName}/>

      {/* Sub header */}
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-deep-brown m-0 text-xl font-black tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-teal text-xs mt-1 m-0" style={{ fontFamily:'Libre Baskerville, serif' }}>Your complete performance summary — real-time data</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 text-xs font-bold rounded-xl px-4 py-2 cursor-pointer transition-all"
          style={{ color:CV.tealHex, border:`1.5px solid ${CV.tealHex}55`, background:'transparent', fontFamily:'Libre Baskerville, serif' }}>
          <FiRefreshCw size={12}/> Refresh
        </button>
      </div>

      {/* AI analytics card */}
      <div className="ov-card-hover ov-fade relative rounded-2xl overflow-hidden mb-4" style={{ border:`1px solid ${CV.goldHex}33`, animationDelay:'60ms' }}>
        <div className="absolute inset-0 bg-cover bg-right" style={{ backgroundImage:'url(/images/Wallpaper_monstera.jpg)', opacity:0.3 }}/>
        <div className="relative z-10 p-5">
          {/* header */}
          <div className={`flex items-center justify-between flex-wrap gap-3 ${aiInsights?'mb-4 pb-3':'mb-0'}`} style={{ borderBottom: aiInsights?`1px solid ${CV.goldHex}33`:'none' }}>
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl flex items-center justify-center p-2" style={{ background:`${CV.goldHex}22`, border:`1px solid ${CV.goldHex}55` }}>
                <FiCpu size={14} color={CV.brownHex}/>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest m-0" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>AI Analytics</h3>
                <p className="text-[10px] m-0" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>Powered by Groq · LLaMA3</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {aiGenerated && <span className="text-[10px]" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>Generated {timeAgo(aiGenerated)}</span>}
              <button onClick={fetchAiInsights} disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-bold rounded-xl px-4 py-2 cursor-pointer transition-all"
                style={{ background:aiLoading?`${CV.goldHex}22`:CV.goldHex, color:CV.brownHex, border:`1.5px solid ${CV.goldHex}`, fontFamily:'Libre Baskerville, serif', cursor:aiLoading?'not-allowed':'pointer' }}>
                {aiLoading ? <><FiLoader size={11} className="ov-spin"/> Analyzing...</> : <><FiZap size={11}/> {aiInsights?'Regenerate':'Generate Insights'}</>}
              </button>
            </div>
          </div>
          {/* empty state */}
          {!aiInsights && !aiLoading && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="rounded-full flex items-center justify-center" style={{ width:46, height:46, background:`${CV.goldHex}18`, border:`1.5px solid ${CV.goldHex}44` }}>
                <FiCpu size={18} color={CV.clayHex}/>
              </div>
              <p className="text-xs m-0" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif', lineHeight:1.6 }}>
                Click <strong style={{ color:CV.brownHex }}>"Generate Insights"</strong> to get AI-powered analytics and recommendations.
              </p>
            </div>
          )}
          {/* loading skeleton */}
          {aiLoading && (
            <div className="py-2">
              {[1,2,3,4].map(i => <div key={i} className="ov-pulse rounded-xl mb-2.5" style={{ height:50, background:`${CV.goldHex}18`, animationDelay:`${i*.15}s` }}/>)}
            </div>
          )}
          {/* results */}
          {aiInsights && !aiLoading && (
            <div>
              <div className="rounded-xl p-3 mb-3.5" style={{ background:`${CV.tealHex}0f`, border:`1px solid ${CV.tealHex}33` }}>
                <p className="text-xs m-0 leading-relaxed" style={{ color:CV.charcoal, fontFamily:'Libre Baskerville, serif' }}>{aiInsights.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                {(aiInsights.insights||[]).map((ins,i) => {
                  const parts = (statusCls[ins.status]||statusCls.neutral).split('|');
                  return (
                    <div key={i} className="rounded-xl p-3" style={{ background:parts[0], border:`1px solid ${parts[1]}` }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {catIcon[ins.category]||<FiTarget size={12} color={CV.brownHex}/>}
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color:CV.tealHex, fontFamily:'Libre Baskerville, serif' }}>{ins.category}</span>
                        <div className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ background:parts[2] }}/>
                      </div>
                      <div className="text-xs font-bold mb-1 leading-snug" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>{ins.title}</div>
                      <div className="text-[11px] leading-relaxed" style={{ color:CV.charcoal, fontFamily:'Libre Baskerville, serif' }}>{ins.detail}</div>
                    </div>
                  );
                })}
              </div>
              {aiInsights.topRecommendation && (
                <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background:`${CV.goldHex}15`, border:`1.5px solid ${CV.goldHex}44` }}>
                  <FiTarget size={14} color={CV.goldHex} className="flex-shrink-0 mt-0.5"/>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>Top Recommendation</div>
                    <div className="text-xs font-semibold leading-relaxed" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>{aiInsights.topRecommendation}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI cards*/}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <KpiCard delay={0}   compact icon={<FiTrendingUp/>}    color={CV.tealHex}  label="Total Revenue" value={`LKR ${(kpi.totalRevenue||0).toLocaleString()}`}  sub={`${kpi.totalSales||0} sales`}/>
        <KpiCard delay={60}  compact icon={<FiShoppingBag/>}   color={CV.goldHex}  label="Total Sales"   value={kpi.totalSales||0} sub={`Avg LKR ${Math.round(kpi.avgOrderValue||0).toLocaleString()}`}/>
        <KpiCard delay={120} compact icon={<MdOutlinePalette/>} color={CV.brownHex} label="My Artworks"   value={kpi.totalArtworks||0} sub={`${kpi.activeListings||0} listings`}/>
        <KpiCard delay={180} compact icon={<FiEye/>}            color={CV.clayHex}  label="Total Views"   value={(kpi.totalViews||0).toLocaleString()} sub={<span className="inline-flex items-center gap-1"><FiHeart size={9} color={CV.redHex}/>{kpi.totalLikes||0} likes</span>}/>
      </div>

      {/* slider */}
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns:'340px 1fr' }}>
        {/* artwork slider */}
        <div className="ov-card-hover ov-fade bg-white rounded-2xl shadow-md" style={{ padding:'14px 16px', animationDelay:'80ms' }}>
          <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom:`1px solid ${CV.goldHex}33` }}>
            <MdOutlinePalette size={12} color={CV.goldHex}/>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>My Artwork Gallery</span>
            {artworks.length>0 && <span className="ml-auto text-[10px]" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>{artworks.reduce((s,a)=>s+(a.images?.length||0),0)} photos</span>}
          </div>
          <ArtworkSlider artworks={artworks}/>
          {/* mini stats */}
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            {[
              { label:'Total Photos', value:artworks.reduce((s,a)=>s+(a.images?.length||0),0), color:CV.brownHex },
              { label:'Total Views',  value:(kpi.totalViews||0).toLocaleString(),               color:CV.tealHex  },
              { label:'Total Likes',  value:kpi.totalLikes||0,                                  color:CV.clayHex  },
            ].map((s,i) => (
              <div key={i} className="rounded-lg text-center py-2" style={{ background:`${s.color}0d`, border:`1px solid ${s.color}22` }}>
                <div className="font-black leading-tight" style={{ fontSize:15, color:s.color }}>{s.value}</div>
                <div className="text-[8px] mt-0.5 uppercase tracking-wider" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* decorative image */}
          <div className="mt-2.5 rounded-xl overflow-hidden relative" style={{ height:100 }}>
            <img src="/images/card2.jpg" alt="" className="w-full h-full object-cover block"/>
            <div className="absolute inset-0 flex items-end p-2.5" style={{ background:'linear-gradient(to top, rgba(74,63,53,.7) 0%, transparent 60%)' }}>
              <span className="text-[10px] font-bold text-white" style={{ fontFamily:'Libre Baskerville, serif', letterSpacing:'.04em' }}>FolkFusion Art Gallery</span>
            </div>
          </div>
        </div>

        {/* right side (revenue,artwork status stacked) */}
        <div className="flex flex-col gap-3">
          <Card title="Monthly Revenue — Last 6 Months" icon={<FiTrendingUp/>} delay={200}>
            <LineChart data={revenueByMonth||[]} color={CV.tealHex} height={145} prefix="LKR "/>
          </Card>
          <Card title="Artwork Status" icon={<FiPieChart/>} delay={240}>
            <div className="flex items-center gap-4 mb-3">
              <DonutChart segments={artworkSegs} size={100}/>
              <div className="flex flex-col gap-2 flex-1">
                <Legend items={artworkSegs.length?artworkSegs:[{label:'No artworks',value:0,color:'#bbb'}]}/>
                <div className="h-px" style={{ background:`${CV.goldHex}22` }}/>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label:'For Sale', value:artworkBreakdown.forSale||0, color:CV.tealHex  },
                    { label:'Total',    value:artworkBreakdown.total  ||0, color:CV.brownHex },
                  ].map((s,i) => (
                    <div key={i} className="rounded-lg text-center py-1.5" style={{ background:`${s.color}0d` }}>
                      <div className="font-black leading-tight" style={{ fontSize:16, color:s.color }}>{s.value}</div>
                      <div className="text-[9px] mt-0.5 uppercase tracking-wider" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed m-0" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>
              Manage your artwork availability to maximize visibility. List artworks for sale to attract buyers on the marketplace.
            </p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4" style={{ gridTemplateColumns:'1fr 280px' }}>
        <Card title="Views per Artwork (Top 6)" icon={<FiBarChart2/>} delay={280}>
          <BarChart data={artworkEngagement||[]} color={CV.goldHex} height={155}/>
        </Card>
        <Card title="Marketplace Listings" icon={<FiPackage/>} delay={320}>
          <div className="flex items-center gap-4 mb-3">
            <DonutChart segments={listingSegs.length?listingSegs:[{label:'None',value:1,color:'#e8e0d4'}]} size={100}/>
            <Legend items={listingSegs.length?listingSegs:[{label:'No listings',value:0,color:'#bbb'}]}/>
          </div>
          <div className="h-px mb-3" style={{ background:`${CV.goldHex}22` }}/>
          <div className="grid grid-cols-2 gap-2">
            {[{label:'Total Listings',value:listingsBreakdown.total||0,color:CV.brownHex},{label:'Items Sold',value:listingsBreakdown.totalItemSold||0,color:CV.greenHex}].map((s,i)=>(
              <div key={i} className="rounded-lg text-center py-2" style={{ background:`${s.color}0d` }}>
                <div className="font-black leading-tight" style={{ fontSize:17, color:s.color }}>{s.value}</div>
                <div className="text-[9px] mt-0.5" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* top artworks & Inquiries */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card title="Top 5 Artworks by Views" icon={<FiEye/>} delay={360}>
          <HBar items={(topArtworks||[]).map(a=>({label:a.title,value:a.views||0,badge:a.category}))}/>
        </Card>
        <Card title="Inquiries Overview" icon={<FiMessageSquare/>} delay={400}>
          <LineChart data={inquiriesByMonth||[]} color={CV.blueHex} height={120}/>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {inqSegs.length
              ? inqSegs.map((s,i) => <span key={i} className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ color:s.color, background:`${s.color}22`, border:`1px solid ${s.color}44` }}>{s.label}: {s.value}</span>)
              : <span className="text-xs" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>No inquiries yet.</span>
            }
          </div>
        </Card>
      </div>

      {/* notifications */}
      <Card title={`Notifications${notifications.length?` (${notifications.length} unread)`:''}`} icon={<FiBell/>} delay={440}>
        <div className="flex justify-end -mt-2 mb-3">
          <a href="/artist/dashboard/notifications"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg px-3 py-1.5 no-underline transition-all"
            style={{ color:CV.tealHex, border:`1.5px solid ${CV.tealHex}44`, background:'transparent', fontFamily:'Libre Baskerville, serif' }}>
            <FiBell size={10}/> View All
          </a>
        </div>
        {!notifications.length ? (
          <div className="text-center py-5">
            <FiCheckCircle size={26} color={`${CV.greenHex}aa`} className="mx-auto mb-2"/>
            <p className="text-xs m-0" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>All caught up — no unread notifications.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {notifications.map(n => (
              <div key={n._id} className="ov-notif flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background:`${CV.tealHex}0a`, border:`1px solid ${CV.tealHex}33` }}
                onClick={() => markNotifRead(n._id)}>
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-warm-sand" style={{ border:`1px solid ${CV.goldHex}33` }}>
                  {getNotifIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color:CV.brownHex, fontFamily:'Libre Baskerville, serif' }}>{n.title}</div>
                  <div className="text-[11px] truncate max-w-[90%]" style={{ color:CV.charcoal, fontFamily:'Libre Baskerville, serif' }}>{n.message}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[10px]" style={{ color:CV.clayHex, fontFamily:'Libre Baskerville, serif' }}>{timeAgo(n.createdAt)}</span>
                  <div className="w-2 h-2 rounded-full" style={{ background:CV.tealHex }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg:'', type:'success' })}/>
    </div>
  );
};

export default Overview;