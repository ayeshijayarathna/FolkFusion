import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Users, TrendingUp, Heart, BookOpen, Calendar,
  Inbox, FileText, ShoppingBag, RefreshCw,
  Sun, Moon, Coffee, Zap, Clock,
  Cpu, Loader2, Target, AlertTriangle, CheckCircle2,
  Activity, BarChart2, Upload, X, File,
  Bell, ChevronRight,
} from 'lucide-react';
import {
  artistAPI, adminAPI, artworkAPI, donationAPI, eventAPI,
  inquiryAPI, marketplaceAPI, newsAPI, notificationAPI,
} from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import jsPDF from 'jspdf';

// colors
const P = {
  brown:   '#A67C52',
  gold:    '#D4A855',
  sage:    '#7A9E8E',
  terra:   '#C97B5A',
  dark:    '#3D3530',
  muted:   '#9A8880',
  border:  '#E8DDD5',
  bg:      '#FAF7F2',
  green:   '#5A8A6E',
  blue:    '#4A7FA5',
  teal:    '#5F8B8C',
  red:     '#B85450',
  purple:  '#8B6EA0',
};

const CHART_COLS = [P.brown, P.sage, P.terra, P.gold, P.green, P.teal, P.blue, P.purple, '#7C6045', '#6B9080'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// helpers
const fmt  = n => new Intl.NumberFormat('si-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n ?? 0);
const fmtN = n => new Intl.NumberFormat().format(n ?? 0);
const pct  = (n, t) => t > 0 ? `${((n / t) * 100).toFixed(1)}%` : '0%';

const timeAgo = d => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
};

// clock hook
const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const getGreeting = h => {
  if (h >= 5  && h < 12) return { text: 'Good Morning',   Icon: Sun    };
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', Icon: Coffee };
  if (h >= 17 && h < 21) return { text: 'Good Evening',   Icon: Zap    };
  return                         { text: 'Good Night',     Icon: Moon   };
};

//welcome banner
const WelcomeBanner = ({ adminName, province }) => {
  const now      = useClock();
  const { text: greetText, Icon: GIcon } = getGreeting(now.getHours());
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ minHeight: 220 }}>

      {/* background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/images/download.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" />

      <img src="/images/adminlogin.png" alt="Admin"
        style={{
          position: 'absolute',
          top: 0,
          left: 28,
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'top center',
          filter: 'drop-shadow(4px 0 16px rgba(0,0,0,0.35))',
          zIndex: 10,
          pointerEvents: 'none',
        }} />

      {/* text content */}
      <div className="relative z-20 flex items-center justify-end px-8 py-6" style={{ minHeight: 220, paddingLeft: 200 }}>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-2 mb-1">
            <GIcon size={15} color={`${P.gold}dd`} />
            <span className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: `${P.gold}dd`, fontFamily: 'Libre Baskerville, serif' }}>{greetText}</span>
          </div>
          <h1 className="text-[22px] font-black m-0 leading-tight"
            style={{ color: 'black', fontFamily: 'Cinzel Decorative, serif' }}>
            Welcome back,&nbsp;<span style={{ color: P.terra }}>{adminName || 'Admin'}</span>
          </h1>
          <p className="text-[11px] m-0 mt-0.5"
            style={{ color:P.brown , fontFamily: 'Libre Baskerville, serif' }}>
            {province ? `${province} Province` : 'Provincial Admin'} · FolkFusion Admin Panel
          </p>
          <div className="flex items-center justify-end gap-2.5 mt-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}>
              <Calendar size={11} color={`${P.dark}cc`} />
              <span className="text-[11px]" style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif' }}>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{ background: `${P.dark}22`, border: `1px solid ${P.gold}55` }}>
              <Clock size={11} color={P.dark} />
              <span className="text-[13px] font-bold tabular-nums"
                style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif', letterSpacing: '.05em' }}>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//toast
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-[13px] font-semibold"
      style={{ background: type === 'error' ? P.red : P.teal, fontFamily: 'Libre Baskerville, serif' }}>
      {type === 'error' ? <AlertTriangle size={15}/> : <CheckCircle2 size={15}/>}
      {msg}
    </div>,
    document.body
  );
};

// shared card wrapper
const SCard = ({ title, subtitle, Icon, children, className = '', action }) => (
  <div className={`bg-warm-sand rounded-2xl border border-[#E8DDD5] shadow-sm overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD5]">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted-clay/10">
              <Icon size={15} color={P.brown} />
            </div>
          )}
          <div>
            <h3 className="text-[13px] font-bold m-0 text-deep-brown font-heading">{title}</h3>
            {subtitle && <p className="text-[11px] m-0 mt-0.5 text-[#9A8880] font-body">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

//KPI card
const KpiCard = ({ label, value, sub, color, Icon, loading }) => (
  <div className="bg-warm-sand rounded-xl border border-[#E8DDD5] shadow-sm p-5 flex items-center justify-between">
    <div className="min-w-0 flex-1 mr-3">
      <p className="text-[12px] font-medium m-0 mb-1 text-[#9A8880] font-body">{label}</p>
      {loading
        ? <div className="h-7 w-20 rounded-lg animate-pulse bg-[#E8DDD5]" />
        : <p className="text-[26px] font-black leading-tight m-0 truncate text-deep-brown">{value ?? '—'}</p>
      }
      {sub && !loading && <p className="text-[11px] mt-0.5 m-0 truncate text-[#9A8880] font-body">{sub}</p>}
    </div>
    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${color}18` }}>
      <Icon size={20} color={color} />
    </div>
  </div>
);

// chart tool tip
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-[11px] border border-[#E8DDD5] font-body">
      {label && <p className="font-semibold mb-1 m-0 text-muted-clay">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="m-0" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{
            String(p.name || '').toLowerCase().includes('revenue') || String(p.name || '').toLowerCase().includes('amount')
              ? fmt(p.value) : fmtN(p.value)
          }</strong>
        </p>
      ))}
    </div>
  );
};

// empty chart state
const ChartEmpty = ({ msg = 'No data available', h = 180 }) => (
  <div className="flex flex-col items-center justify-center gap-2" style={{ height: h }}>
    <Activity size={22} color={`${P.gold}88`} />
    <p className="text-[12px] m-0 text-[#9A8880] font-body">{msg}</p>
  </div>
);

// pie legend
const PieLegend = ({ items, total }) => (
  <div className="flex flex-col gap-2">
    {items.map((it, i) => (
      <div key={i} className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: it.color }} />
          <span className="text-[11px] truncate text-[#9A8880] font-body">{it.name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-bold" style={{ color: P.dark }}>{fmtN(it.value)}</span>
          {total > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: it.color, background: `${it.color}18` }}>{pct(it.value, total)}</span>}
        </div>
      </div>
    ))}
  </div>
);

//CSV parser
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return null;

  // parse header
  const headers = [];
  let cur = '', inQ = false;
  for (const ch of lines[0] + ',') {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { headers.push(cur.trim().replace(/^"|"$/g, '')); cur = ''; }
    else cur += ch;
  }

  // parse rows
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = []; let c2 = '', inQ2 = false;
    for (const ch of line + ',') {
      if (ch === '"') inQ2 = !inQ2;
      else if (ch === ',' && !inQ2) { vals.push(c2.trim().replace(/^"|"$/g, '')); c2 = ''; }
      else c2 += ch;
    }
    return vals;
  });

  // column stats
  const cols = headers.map((h, ci) => {
    const vals = rows.map(r => r[ci] ?? '').filter(v => v !== '');
    const nums = vals.map(Number).filter(n => !isNaN(n) && n !== null);
    if (nums.length > 0 && nums.length / vals.length > 0.6) {
      const sum = nums.reduce((a, b) => a + b, 0);
      return { h, type: 'number', count: nums.length, min: Math.min(...nums), max: Math.max(...nums), avg: +(sum / nums.length).toFixed(2), sum: +sum.toFixed(2) };
    }
    return { h, type: 'text', count: vals.length, unique: new Set(vals).size };
  });

  return { headers, rows, cols };
}

//CSV section 
const CsvSection = () => {
  const [csv,      setCsv]      = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = f => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      if (parsed) setCsv({ ...parsed, name: f.name, size: f.size });
    };
    reader.readAsText(f);
  };

  const numCols  = csv?.cols.filter(c => c.type === 'number') ?? [];
  const textCols = csv?.cols.filter(c => c.type === 'text')   ?? [];

  //  EDA observations
  const edaObservations = csv ? (() => {
    const obs = [];
    obs.push(`Dataset contains ${fmtN(csv.rows.length)} records across ${csv.headers.length} column${csv.headers.length !== 1 ? 's' : ''}: ${numCols.length} numeric and ${textCols.length} categorical.`);
    numCols.forEach(c => {
      const range = c.max - c.min;
      if (c.avg !== 0 && range / Math.abs(c.avg) > 5)
        obs.push(`"${c.h}" shows high variability — range ${fmtN(c.min)} to ${fmtN(c.max)} with mean ${fmtN(c.avg)}.`);
      if (c.min === 0)
        obs.push(`"${c.h}" contains zero values; verify whether these represent missing data or true zeros.`);
      if (c.max > 0 && c.min >= 0 && c.avg > 0) {
        const skew = (c.max - c.avg) / (c.avg - c.min + 0.001);
        if (skew > 3) obs.push(`"${c.h}" appears right-skewed (max ${fmtN(c.max)} is far above average ${fmtN(c.avg)}).`);
      }
    });
    textCols.forEach(c => {
      const ratio = c.unique / (c.count || 1);
      if (ratio < 0.05)
        obs.push(`"${c.h}" is a low-cardinality category — only ${fmtN(c.unique)} distinct value${c.unique !== 1 ? 's' : ''} across ${fmtN(c.count)} non-empty records.`);
      else if (ratio > 0.95)
        obs.push(`"${c.h}" is nearly unique per row (${fmtN(c.unique)}/${fmtN(c.count)}) — likely an identifier or free-text field.`);
      else
        obs.push(`"${c.h}" has moderate diversity: ${fmtN(c.unique)} unique value${c.unique !== 1 ? 's' : ''} from ${fmtN(c.count)} non-empty records (${((ratio)*100).toFixed(1)}% distinct).`);
    });
    const totalCells = csv.rows.length * csv.headers.length;
    const emptyCells = csv.cols.reduce((s, c) => s + (csv.rows.length - c.count), 0);
    if (emptyCells > 0)
      obs.push(`${fmtN(emptyCells)} empty cell${emptyCells !== 1 ? 's' : ''} detected across all columns (${((emptyCells/totalCells)*100).toFixed(1)}% of total cells).`);
    return obs;
  })() : [];

  const downloadPDF = () => {
    if (!csv) return;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const W = 210, margin = 14;
    let y = margin;

    // Header
    doc.setFillColor(61, 53, 48);
    doc.rect(0, 0, W, 24, 'F');
    doc.setTextColor(255, 248, 225);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FolkFusion — EDA Report', margin, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 17);
    doc.text(`File: ${csv.name}  |  ${fmtN(csv.rows.length)} rows · ${csv.headers.length} cols · ${(csv.size/1024).toFixed(1)} KB`, margin, 22);
    y = 32;

    // EDA Observations
    doc.setFillColor(95, 139, 140, 0.1);
    doc.setDrawColor(95, 139, 140);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, W - margin * 2, 7 + edaObservations.length * 6, 2, 2, 'D');
    y += 5;
    doc.setTextColor(61, 53, 48);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EDA Observations', margin + 3, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    edaObservations.forEach(obs => {
      const lines = doc.splitTextToSize(`• ${obs}`, W - margin * 2 - 6);
      doc.text(lines, margin + 3, y);
      y += lines.length * 5;
    });
    y += 6;

    // Column stats table header
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 53, 48);
    doc.text('Column Statistics', margin, y);
    y += 5;

    const colW = [40, 18, 20, 20, 22, 22, 28];
    const headers = ['Column', 'Type', 'Non-Empty', 'Min', 'Max', 'Average', 'Unique Values'];

    // Table header row
    doc.setFillColor(166, 124, 82);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setTextColor(255, 248, 225);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    let x = margin + 1;
    headers.forEach((h, i) => { doc.text(h, x, y + 5); x += colW[i]; });
    y += 7;

    // Table rows
    doc.setFont('helvetica', 'normal');
    csv.cols.forEach((c, ri) => {
      const bg = ri % 2 === 0 ? [250, 247, 242] : [255, 255, 255];
      doc.setFillColor(...bg);
      doc.rect(margin, y, W - margin * 2, 6.5, 'F');
      doc.setTextColor(61, 53, 48);
      x = margin + 1;
      const rowVals = c.type === 'number'
        ? [c.h, 'numeric', fmtN(c.count), fmtN(c.min), fmtN(c.max), fmtN(c.avg), '—']
        : [c.h, 'text',    fmtN(c.count), '—',          '—',          '—',          fmtN(c.unique)];
      rowVals.forEach((v, i) => {
        const txt = String(v ?? '').slice(0, 22);
        doc.text(txt, x, y + 4.5);
        x += colW[i];
      });
      y += 6.5;
      if (y > 270) { doc.addPage(); y = margin; }
    });

    // footer
    doc.setFontSize(7);
    doc.setTextColor(154, 136, 128);
    doc.text('FolkFusion Admin Dashboard — CSV EDA Report', margin, 290);
    doc.text(`Page 1`, W - margin - 10, 290);

    doc.save(`EDA_${csv.name.replace('.csv', '')}_${Date.now()}.pdf`);
  };

  return (
    <SCard
      title="CSV File Analysis — EDA Report"
      subtitle="Upload a CSV file for exploratory data analysis with auto-generated observations"
      Icon={File}
      action={csv && (
        <button onClick={downloadPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all"
          style={{ color: P.brown, border: `1px solid ${P.brown}44`, background: `${P.brown}0e`, fontFamily: 'Libre Baskerville, serif' }}>
          <FileText size={12} /> Download PDF
        </button>
      )}
    >
      {!csv ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-xl cursor-pointer transition-all select-none"
          style={{ height: 170, border: `2px dashed ${dragging ? P.brown : P.border}`, background: dragging ? `${P.brown}06` : `${P.gold}05` }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${P.brown}12`, border: `1px solid ${P.brown}30` }}>
            <Upload size={24} color={P.brown} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[14px] m-0" style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif' }}>
              Drop a <strong>.csv</strong> file here or{' '}
              <span style={{ color: P.brown, textDecoration: 'underline' }}>click to browse</span>
            </p>
            <p className="text-[11px] m-0 mt-1" style={{ color: P.muted, fontFamily: 'Libre Baskerville, serif' }}>
              Instant EDA · auto-generated observations · PDF report · 100% local
            </p>
          </div>
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* file info bar */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: `${P.brown}0e`, border: `1px solid ${P.brown}28` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${P.brown}18` }}>
                <File size={16} color={P.brown} />
              </div>
              <div>
                <p className="text-[13px] font-bold m-0" style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif' }}>{csv.name}</p>
                <p className="text-[11px] m-0" style={{ color: P.muted, fontFamily: 'Libre Baskerville, serif' }}>
                  {fmtN(csv.rows.length)} rows · {csv.headers.length} columns · {(csv.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button onClick={() => setCsv(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-all"
              style={{ color: P.red, border: `1px solid ${P.red}33`, background: `${P.red}08` }}>
              <X size={12} /> Clear
            </button>
          </div>

          {/* EDA observations */}
          <div className="rounded-xl px-4 py-3.5"
            style={{ background: `${P.teal}0a`, border: `1px solid ${P.teal}28` }}>
            <p className="text-[11px] font-bold uppercase tracking-widest m-0 mb-2.5"
              style={{ color: P.teal, fontFamily: 'Cinzel Decorative, serif' }}>EDA Observations</p>
            <ul className="m-0 p-0 space-y-1.5 list-none">
              {edaObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: P.teal }} />
                  <span className="text-[12px] leading-relaxed" style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif' }}>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* column stats grid */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: P.muted, fontFamily: 'Cinzel Decorative, serif' }}>Column Statistics</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {csv.cols.map((c, i) => (
                <div key={i} className="rounded-xl p-3"
                  style={{ background: `${CHART_COLS[i % CHART_COLS.length]}0e`, border: `1px solid ${CHART_COLS[i % CHART_COLS.length]}28` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase truncate m-0"
                      style={{ color: CHART_COLS[i % CHART_COLS.length], fontFamily: 'Libre Baskerville, serif', maxWidth: '75%' }}>{c.h}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ color: c.type === 'number' ? P.teal : P.sage, background: `${c.type === 'number' ? P.teal : P.sage}18` }}>
                      {c.type === 'number' ? 'numeric' : 'text'}
                    </span>
                  </div>
                  {c.type === 'number' ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {[['Min', fmtN(c.min)], ['Max', fmtN(c.max)], ['Average', fmtN(c.avg)], ['Sum', fmtN(c.sum)]].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-[9px] m-0" style={{ color: P.muted }}>{l}</p>
                          <p className="text-[12px] font-bold m-0" style={{ color: P.dark }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <p className="text-[9px] m-0" style={{ color: P.muted }}>Total Records</p>
                        <p className="text-[12px] font-bold m-0" style={{ color: P.dark }}>{fmtN(c.count)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] m-0" style={{ color: P.muted }}>Unique Values</p>
                        <p className="text-[12px] font-bold m-0" style={{ color: P.dark }}>{fmtN(c.unique)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* data table preview */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: P.muted, fontFamily: 'Cinzel Decorative, serif' }}>
              Data Preview {csv.rows.length > 100 && <span style={{ color: P.terra }}>(first 100 of {fmtN(csv.rows.length)} rows)</span>}
            </p>
            <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${P.border}`, maxHeight: 300 }}>
              <table className="w-full border-collapse text-[11px]" style={{ minWidth: csv.headers.length * 100 }}>
                <thead className="sticky top-0">
                  <tr style={{ background: P.brown }}>
                    {csv.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap"
                        style={{ color: '#FFF8E1', fontFamily: 'Libre Baskerville, serif' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csv.rows.slice(0, 100).map((row, ri) => (
                    <tr key={ri} className="border-b" style={{ background: ri % 2 === 0 ? 'white' : '#FAF7F2', borderColor: P.border }}>
                      {csv.headers.map((_, ci) => (
                        <td key={ci} className="px-3 py-2 whitespace-nowrap"
                          style={{ color: P.dark, fontFamily: 'Libre Baskerville, serif' }}>
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </SCard>
  );
};

//AI analytics 
const AISection = ({ notify }) => {
  const [ai,      setAi]      = useState(null);
  const [loading, setLoading] = useState(false);
  const [genAt,   setGenAt]   = useState(null);

  const catConfig = {
    'Artists & Growth':       { color: P.sage,  Icon: Users     },
    'Revenue & Sales':        { color: P.gold,  Icon: TrendingUp},
    'Events & Courses':       { color: P.brown, Icon: BookOpen  },
    'Inquiries & Engagement': { color: P.teal,  Icon: Inbox     },
  };
  const statusBg = { good: `${P.green}12|${P.green}30`, warning: `${P.terra}12|${P.terra}30`, neutral: `${P.teal}08|${P.teal}22` };

  const generate = async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAiInsights();
      setAi(r.data.data);
      setGenAt(r.data.generatedAt);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'AI insights generation failed. Check GROQ_API_KEY or server logs.';
      notify(msg, 'error');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-warm-sand rounded-2xl border border-[#E8DDD5] shadow-sm overflow-hidden">
      {/* header bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DDD5]"
        style={{ background: 'linear-gradient(90deg, rgba(166,124,82,.06) 0%, rgba(212,168,85,.08) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${P.gold}22`, border: `1.5px solid ${P.gold}55` }}>
            <Cpu size={16} color={P.dark} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold m-0 text-deep-brown font-heading">
              AI Province Analytics
            </h3>
            <p className="text-[10px] m-0 mt-0.5 text-[#9A8880] font-body">
              Powered by Groq · LLaMA3 · Tailored to your province data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {genAt && <span className="text-[10px] hidden sm:block text-[#9A8880] font-body">Generated {timeAgo(genAt)}</span>}
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all font-body text-deep-brown"
            style={{
              background: loading ? `${P.gold}22` : P.gold,
              border: `1.5px solid ${P.gold}`,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? <><Loader2 size={12} className="animate-spin" /> Analyzing…</> : <><Zap size={12} /> {ai ? 'Regenerate' : 'Generate Insights'}</>}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* empty state */}
        {!ai && !loading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${P.gold}12`, border: `1.5px solid ${P.gold}33` }}>
              <Cpu size={22} color={P.muted} />
            </div>
            <div>
              <p className="text-[14px] font-semibold m-0 text-deep-brown font-body">
                AI-Powered Province Insights
              </p>
              <p className="text-[12px] m-0 mt-1 text-[#9A8880] font-body" style={{ maxWidth: 400 }}>
                Get personalized recommendations for your province — artists, revenue, events, and inquiries.
                Click <strong>"Generate Insights"</strong> to start.
              </p>
            </div>
          </div>
        )}

        {/* skeleton */}
        {loading && (
          <div className="space-y-2.5 py-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl animate-pulse"
                style={{ height: 56, background: `${P.gold}12`, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}

        {/* results */}
        {ai && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-xl px-4 py-3.5 bg-muted-teal/5 border border-muted-teal/20">
              <p className="text-[11px] font-bold uppercase tracking-widest m-0 mb-1.5 text-muted-teal font-heading">Province Summary</p>
              <p className="text-[12px] m-0 leading-relaxed text-deep-brown font-body">{ai.summary}</p>
            </div>

            {/* Insight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(ai.insights || []).map((ins, i) => {
                const cfg  = catConfig[ins.category] || { color: P.brown, Icon: Target };
                const [bg, bd] = (statusBg[ins.status] || statusBg.neutral).split('|');
                return (
                  <div key={i} className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cfg.color}20` }}>
                        <cfg.Icon size={12} color={cfg.color} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest font-body" style={{ color: cfg.color }}>{ins.category}</span>
                      <div className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0"
                        style={{ background: ins.status === 'good' ? P.green : ins.status === 'warning' ? P.terra : P.teal }} />
                    </div>
                    <p className="text-[12px] font-bold m-0 mb-1 leading-snug text-deep-brown font-body">{ins.title}</p>
                    <p className="text-[11px] m-0 leading-relaxed text-[#9A8880] font-body">{ins.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Top recommendation */}
            {ai.topRecommendation && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                style={{ background: `${P.gold}12`, border: `1.5px solid ${P.gold}40` }}>
                <Target size={16} color={P.gold} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest m-0 mb-1 text-[#9A8880] font-heading">Top Recommendation</p>
                  <p className="text-[12px] font-semibold m-0 leading-relaxed text-deep-brown font-body">{ai.topRecommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

//main component
export default function Overview() {
  const { user } = useAuth();
  const province = user?.province;

  const [stats,        setStats]        = useState({});
  const [adminProfile, setAdminProfile] = useState(null);
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState({ msg: '', type: 'success' });

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        artistRes, courseRes, donationRes, eventRes,
        inquiryRes, salesRes, newsRes, artworkCatRes,
        profileRes, notifRes, specRes,
      ] = await Promise.allSettled([
        artistAPI.getStats(),
        adminAPI.getCourseStats(),
        donationAPI.getStats(),
        eventAPI.getEventStats(),
        inquiryAPI.getProvinceStats(),
        marketplaceAPI.getProvinceSalesStats({ period: 'year' }),
        newsAPI.getProvinceStats(),
        artworkAPI.getStatsByCategory({ province }),
        adminAPI.getMyProfile(),
        notificationAPI.getAll({ limit: 6, read: false }),
        artistAPI.getSpecializationStats(),
      ]);

      setStats({
        artists:    artistRes.status    === 'fulfilled' ? artistRes.value.data.data         : null,
        courses:    courseRes.status    === 'fulfilled' ? courseRes.value.data.data          : null,
        donations:  donationRes.status  === 'fulfilled' ? donationRes.value.data.data        : null,
        events:     eventRes.status     === 'fulfilled' ? eventRes.value.data.data           : null,
        inquiries:  inquiryRes.status   === 'fulfilled' ? inquiryRes.value.data.data         : null,
        sales:      salesRes.status     === 'fulfilled' ? salesRes.value.data.data           : null,
        news:       newsRes.status      === 'fulfilled' ? newsRes.value.data.data            : null,
        artworkCat: artworkCatRes.status === 'fulfilled' ? artworkCatRes.value.data.data     : null,
        specStats:  specRes.status      === 'fulfilled' ? specRes.value.data                 : null,
      });

      if (profileRes.status === 'fulfilled')
        setAdminProfile(profileRes.value.data.data?.profile);
      if (notifRes.status === 'fulfilled')
        setNotifs(notifRes.value.data.data || []);
    } catch {
      notify('Some dashboard data failed to load.', 'error');
    } finally {
      setLoading(false);
    }
  }, [province, notify]);

  useEffect(() => { load(); }, [load]);

  // chart data

  // revenue trend(12-month skeleton)
  const revenueTrend = Array.from({ length: 12 }, (_, i) => {
    const d     = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const found = (stats.sales?.salesByPeriod || []).find(
      p => p._id?.year === d.getFullYear() && p._id?.month === d.getMonth() + 1
    );
    return {
      name:    `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
      Revenue: found?.revenue || 0,
      Sales:   found?.count   || 0,
    };
  });

  // artist status pie
  const artistPie = stats.artists ? [
    { name: 'Approved', value: stats.artists.approved ?? 0,                                           color: P.sage  },
    { name: 'Pending',  value: Math.max(0, (stats.artists.total ?? 0) - (stats.artists.approved ?? 0)), color: P.terra },
    { name: 'Active',   value: stats.artists.active   ?? 0,                                           color: P.brown },
  ].filter(d => d.value > 0) : [];

  // artwork by category (top 10 from province, ordered by count)
  const artworkCatPie = (stats.artworkCat || [])
    .filter(c => c._id && c.count > 0)
    .slice(0, 10)
    .map((c, i) => ({ name: c._id, value: c.count, forSale: c.forSale, color: CHART_COLS[i % CHART_COLS.length] }));
  const artworkTotal = artworkCatPie.reduce((s, d) => s + d.value, 0);

  // sales by category bar
  const categoryBar = (stats.sales?.categoryBreakdown ?? []).slice(0, 8).map(c => ({
    name:    (c.category?.length > 13 ? c.category.slice(0, 12) + '…' : c.category) || 'Other',
    Revenue: Math.round(c.revenue ?? 0),
    Sales:   c.sales ?? 0,
  }));

  // Inquiry pie
  const inquiryPie = stats.inquiries ? [
    { name: 'New',     value: stats.inquiries.new     ?? 0, color: P.terra },
    { name: 'Read',    value: stats.inquiries.read    ?? 0, color: P.sage  },
    { name: 'Replied', value: stats.inquiries.replied ?? 0, color: P.gold  },
    { name: 'Closed',  value: stats.inquiries.closed  ?? 0, color: P.muted },
  ].filter(d => d.value > 0) : [];
  const inquiryTotal = inquiryPie.reduce((s, d) => s + d.value, 0);

  // Course bars
  const courseBar = stats.courses ? [
    { name: 'Active',    value: stats.courses.active    ?? 0 },
    { name: 'Ongoing',   value: stats.courses.ongoing   ?? 0 },
    { name: 'Upcoming',  value: stats.courses.upcoming  ?? 0 },
    { name: 'Completed', value: stats.courses.completed ?? 0 },
  ] : [];

  // Event bars
  const eventBar = stats.events?.byStatus ? [
    { name: 'Upcoming',  value: stats.events.byStatus.upcoming  ?? 0 },
    { name: 'Ongoing',   value: stats.events.byStatus.ongoing   ?? 0 },
    { name: 'Completed', value: stats.events.byStatus.completed ?? 0 },
    { name: 'Cancelled', value: stats.events.byStatus.cancelled ?? 0 },
  ] : [];

  // News pie (key is newsByCategory)
  const newsPie = (stats.news?.newsByCategory ?? [])
    .filter(c => c._id && c.count > 0)
    .map((c, i) => ({ name: c._id, value: c.count, color: CHART_COLS[i % CHART_COLS.length] }));
  const newsTotal = newsPie.reduce((s, d) => s + d.value, 0);

  // Courses by art form
  const artFormBar = (stats.courses?.byArtForm ?? []).slice(0, 8).map(f => ({
    name:  (f._id?.length > 13 ? f._id.slice(0, 12) + '…' : f._id) || 'Other',
    Courses: f.count ?? 0,
  }));

  // artist specialization breakdown
  const specTotal  = stats.specStats?.total ?? 0;
  const specBar    = (stats.specStats?.data ?? []).slice(0, 15).map((s, i) => ({
    name:    (s._id?.length > 16 ? s._id.slice(0, 15) + '…' : s._id) || 'Other',
    Artists: s.count ?? 0,
    pct:     specTotal > 0 ? +((s.count / specTotal) * 100).toFixed(1) : 0,
    color:   CHART_COLS[i % CHART_COLS.length],
  }));

  // KPIs
  const kpis = [
    { label: 'Total Artists',    value: fmtN(stats.artists?.total),            sub: `${stats.artists?.approved ?? 0} approved · ${Math.max(0, (stats.artists?.total ?? 0) - (stats.artists?.approved ?? 0))} pending`, color: P.brown, Icon: Users        },
    { label: 'Province Revenue', value: stats.sales?.summary?.totalRevenue != null ? fmt(stats.sales.summary.totalRevenue) : '—', sub: `${fmtN(stats.sales?.summary?.totalSales)} sales this year`, color: P.gold, Icon: TrendingUp },
    { label: 'Donations',        value: fmtN(stats.donations?.total),          sub: stats.donations?.amount ? fmt(stats.donations.amount) : '—', color: P.red, Icon: Heart },
    { label: 'Courses',          value: fmtN(stats.courses?.total),            sub: `${stats.courses?.active ?? 0} active · ${fmtN(stats.courses?.totalEnrolled)} enrolled`, color: P.terra, Icon: BookOpen },
    { label: 'Events',           value: fmtN(stats.events?.total),             sub: `${stats.events?.byStatus?.upcoming ?? 0} upcoming`,             color: P.sage, Icon: Calendar  },
    { label: 'New Inquiries',    value: fmtN(stats.inquiries?.new),            sub: `${stats.inquiries?.total ?? 0} total inquiries`,                 color: P.teal, Icon: Inbox     },
    { label: 'News Articles',    value: fmtN(stats.news?.totalNews),           sub: `${stats.news?.publishedNews ?? 0} published`,                    color: P.blue, Icon: FileText  },
    { label: 'Avg Order Value',  value: stats.sales?.summary?.averageOrderValue != null ? fmt(stats.sales.summary.averageOrderValue) : '—', sub: `${fmtN(stats.sales?.summary?.totalQuantity)} items sold`, color: P.purple, Icon: ShoppingBag },
  ];

  // render
  return (
    <div className="space-y-5 pb-8">

      {/* welcome banner */}
      <WelcomeBanner adminName={adminProfile?.fullName} province={province} />

      {/* header & refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black m-0 text-deep-brown font-heading">
            Province Overview
          </h2>
          <p className="text-[12px] m-0 mt-0.5 text-[#9A8880] font-body">
            Live analytics across artists, sales, events &amp; more for {province || 'your'} Province
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-all text-[#9A8880] font-body bg-white border border-[#E8DDD5]"
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* revenue trend */}
      <SCard title="Revenue Trend — Last 12 Months" subtitle="Monthly sales revenue & order count" Icon={TrendingUp}>
        {revenueTrend.some(d => d.Revenue > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={P.brown} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={P.brown} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${P.border}`} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: P.muted, fontFamily: 'Libre Baskerville, serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: P.muted }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={40} />
              <Tooltip content={<CTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: P.muted, fontFamily: 'Libre Baskerville, serif' }} />
              <Area type="monotone" dataKey="Revenue" stroke={P.brown} strokeWidth={2.5} fill="url(#revGrad)"
                dot={{ r: 3, fill: P.brown, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Sales" stroke={P.sage} strokeWidth={2} fill="none"
                dot={{ r: 3, fill: P.sage, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 5 }}
                strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty msg="No sales data for this year" />
        )}
      </SCard>

      {/* artist status  & artwork by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* artist status donut */}
        <SCard title="Artist Status" subtitle="Approved · Pending · Active" Icon={Users}>
          {artistPie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={190}>
                <PieChart>
                  <Pie data={artistPie} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {artistPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  {/* centre label */}
                  <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: 22, fontWeight: 900, fill: P.dark, fontFamily: 'Cinzel Decorative, serif' }}>
                    {fmtN(stats.artists?.total)}
                  </text>
                  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: 10, fill: P.muted, fontFamily: 'Libre Baskerville, serif' }}>
                    total
                  </text>
                  <Tooltip content={<CTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <PieLegend items={artistPie} total={stats.artists?.total ?? 0} />
              </div>
            </div>
          ) : (
            <ChartEmpty msg="No artist data available" />
          )}
        </SCard>

        {/* Artwork by category pie */}
        <SCard title="Artworks by Category" subtitle={`Province artworks by folk art type${artworkTotal > 0 ? ` · ${fmtN(artworkTotal)} total` : ''}`} Icon={BarChart2}>
          {artworkCatPie.length > 0 ? (
            <div className="flex items-start gap-3">
              <ResponsiveContainer width="45%" height={190}>
                <PieChart>
                  <Pie data={artworkCatPie} cx="50%" cy="50%" outerRadius={72} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {artworkCatPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 190 }}>
                <PieLegend items={artworkCatPie} total={artworkTotal} />
              </div>
            </div>
          ) : (
            <ChartEmpty msg="No approved artworks yet" />
          )}
        </SCard>
      </div>

      {/* sales by category  & Inquiry donut chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SCard title="Sales by Art Category" subtitle="Revenue & order count breakdown by folk art type" Icon={ShoppingBag}>
            {categoryBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryBar} margin={{ top: 5, right: 10, left: 0, bottom: 38 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false}
                    angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} width={38} />
                  <Tooltip content={<CTip />} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: P.muted, fontFamily: 'Libre Baskerville, serif' }} />
                  <Bar dataKey="Revenue" fill={P.brown} radius={[4,4,0,0]} maxBarSize={32} />
                  <Bar dataKey="Sales"   fill={P.sage}  radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty msg="No sales data available" />
            )}
          </SCard>
        </div>

        <SCard title="Inquiry Status" subtitle="Status breakdown of province inquiries" Icon={Inbox}>
          {inquiryPie.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={inquiryPie} cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {inquiryPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CTip />} />
                </PieChart>
              </ResponsiveContainer>
              <PieLegend items={inquiryPie} total={inquiryTotal} />
            </div>
          ) : (
            <ChartEmpty msg="No inquiries yet" />
          )}
        </SCard>
      </div>

      {/* Course status &  Event status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SCard title="Course Status" subtitle="Active · Ongoing · Upcoming · Completed" Icon={BookOpen}>
          {courseBar.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={courseBar} layout="vertical" margin={{ top: 0, right: 20, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: P.dark }} axisLine={false} tickLine={false} width={68} />
                <Tooltip content={<CTip />} />
                <Bar dataKey="value" name="Courses" radius={[0,4,4,0]} maxBarSize={22}>
                  {courseBar.map((_, i) => <Cell key={i} fill={[P.brown, P.gold, P.sage, P.terra][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty msg="No course data" />
          )}
        </SCard>

        <SCard title="Event Status" subtitle="Upcoming · Ongoing · Completed · Cancelled" Icon={Calendar}>
          {eventBar.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={195}>
              <BarChart data={eventBar} layout="vertical" margin={{ top: 0, right: 20, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.border} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: P.dark }} axisLine={false} tickLine={false} width={68} />
                <Tooltip content={<CTip />} />
                <Bar dataKey="value" name="Events" radius={[0,4,4,0]} maxBarSize={22}>
                  {eventBar.map((_, i) => <Cell key={i} fill={[P.sage, P.gold, P.green, P.red][i % 4]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty msg="No event data" />
          )}
        </SCard>
      </div>

      {/* News by category  & Courses by art form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SCard title="News by Category" subtitle={`Distribution of ${province || 'province'} news articles`} Icon={FileText}>
          {newsPie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={newsPie} cx="50%" cy="50%" outerRadius={72} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {newsPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <PieLegend items={newsPie} total={newsTotal} />
              </div>
            </div>
          ) : (
            <ChartEmpty msg="No news articles yet" />
          )}
        </SCard>

        <SCard title="Courses by Art Form" subtitle="Number of courses per traditional art form" Icon={BarChart2}>
          {artFormBar.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={artFormBar} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false}
                  angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false} width={26} />
                <Tooltip content={<CTip />} />
                <Bar dataKey="Courses" radius={[4,4,0,0]} maxBarSize={30}>
                  {artFormBar.map((_, i) => <Cell key={i} fill={CHART_COLS[i % CHART_COLS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty msg="No art-form course data" />
          )}
        </SCard>
      </div>

      {/* artist Specialization */}
      <SCard
        title="Artists by Folk Art Specialization"
        subtitle={`Registration breakdown by specialization${specTotal > 0 ? ` · ${fmtN(specTotal)} total artists` : ''}`}
        Icon={Users}
      >
        {specBar.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(220, specBar.length * 28)}>
            <BarChart data={specBar} layout="vertical" margin={{ top: 0, right: 60, left: 6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: P.muted }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: P.dark }} axisLine={false} tickLine={false} width={130} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-[11px]"
                      style={{ border: `1px solid ${P.border}`, fontFamily: 'Libre Baskerville, serif' }}>
                      <p className="font-semibold m-0 mb-1" style={{ color: P.brown }}>{d.name}</p>
                      <p className="m-0" style={{ color: P.dark }}>{fmtN(d.Artists)} artist{d.Artists !== 1 ? 's' : ''} · <strong>{d.pct}%</strong></p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="Artists" radius={[0, 4, 4, 0]} maxBarSize={20}
                label={{ position: 'right', formatter: v => `${v}`, fontSize: 10, fill: P.muted }}>
                {specBar.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty msg="No specialization data available" />
        )}
      </SCard>

      {/* AI analytics section */}
      <AISection notify={notify} />

      {/* CSV analysis section */}
      <CsvSection />

      {/* notifications */}
      <SCard title="Recent Notifications" subtitle="Latest unread alerts for your province" Icon={Bell}
        action={
          <a href="/admin/notifications"
            className="flex items-center gap-1 text-[11px] font-semibold no-underline"
            style={{ color: P.brown, fontFamily: 'Libre Baskerville, serif' }}>
            View all <ChevronRight size={12} />
          </a>
        }>
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckCircle2 size={28} color={`${P.green}88`} />
            <p className="text-[12px] m-0 text-[#9A8880] font-body">
              All caught up — no unread notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notifs.map(n => (
              <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl bg-muted-teal/5 border border-[#E8DDD5]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-muted-clay/10 border border-[#E8DDD5]">
                  <Bell size={13} color={P.brown} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate m-0 text-deep-brown font-body">{n.title}</p>
                  <p className="text-[11px] truncate m-0 mt-0.5 text-[#9A8880] font-body">{n.message}</p>
                </div>
                <span className="text-[10px] flex-shrink-0 mt-0.5 text-[#9A8880] font-body">{timeAgo(n.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </SCard>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </div>
  );
}
