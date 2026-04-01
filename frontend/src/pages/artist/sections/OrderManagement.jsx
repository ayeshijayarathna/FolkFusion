import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { marketplaceAPI } from '../../../services/api';
import {
  FiPackage, FiDollarSign, FiShoppingBag, FiBarChart2,
  FiEye, FiChevronLeft, FiChevronRight, FiX,
  FiAlertTriangle, FiCheckCircle, FiTruck, FiEdit3,
  FiCheck, FiClock, FiRefreshCw,
} from 'react-icons/fi';
import { MdOutlinePayment } from 'react-icons/md';
import { BsCashCoin, BsCreditCard, BsBank, BsGlobe } from 'react-icons/bs';

// helpers
const fmt   = (n) => `LKR ${Number(n || 0).toLocaleString('en-LK')}`;
const fdate = (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const ftime = (d) => d ? new Date(d).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' }) : '';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ORDER_STATUS_CFG = {
  pending:    { label: 'Pending',    color: '#8B6914', bg: '#FEFCBF' },
  confirmed:  { label: 'Confirmed',  color: '#2B6CB0', bg: '#EBF8FF' },
  processing: { label: 'Processing', color: '#6B46C1', bg: '#FAF5FF' },
  shipped:    { label: 'Shipped',    color: '#2C7A7B', bg: '#E6FFFA' },
  delivered:  { label: 'Delivered',  color: '#276749', bg: '#F0FFF4' },
  cancelled:  { label: 'Cancelled',  color: '#9B2C2C', bg: '#FFF5F5' },
};
const PAY_STATUS_CFG = {
  pending:   { label: 'Pending',   color: '#8B6914', bg: '#FEFCBF33' },
  completed: { label: 'Paid',      color: '#276749', bg: '#F0FFF433' },
  failed:    { label: 'Failed',    color: '#9B2C2C', bg: '#FFF5F533' },
  refunded:  { label: 'Refunded',  color: '#6B46C1', bg: '#FAF5FF33' },
};
const PAY_ICON = {
  cash:          <BsCashCoin   size={13}/>,
  card:          <BsCreditCard size={13}/>,
  bank_transfer: <BsBank       size={13}/>,
  online:        <BsGlobe      size={13}/>,
};
const PAY_LABEL = {
  cash:          'Cash on Delivery',
  card:          'Credit / Debit Card',
  bank_transfer: 'Bank Transfer',
  online:        'Online',
};

const SERIF   = { fontFamily: '"Libre Baskerville", Georgia, serif' };
const DISPLAY = { fontFamily: '"Cinzel Decorative", "Times New Roman", serif' };

// toast
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg) return null;
  return createPortal(
    <div className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold"
      style={{ background: type === 'error' ? '#b93535' : '#5F8B8C', animation: 'omToastIn .3s ease', maxWidth: 380, ...SERIF }}>
      {type === 'error' ? <FiAlertTriangle size={18}/> : <FiCheckCircle size={18}/>}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// modal
const Modal = ({ open, onClose, title, width = 700, children }) => {
  useEffect(() => {
    if (!open) return;
    const p = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = p; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[9000] flex items-center justify-center p-5"
      style={{ background: 'rgba(46,46,46,.68)', animation: 'omFadeIn .18s ease' }}>
      <div onClick={e => e.stopPropagation()} className="bg-[#FFF8E1] rounded-[18px] w-full overflow-y-auto"
        style={{ maxWidth: width, maxHeight: '92vh', boxShadow: '0 40px 100px rgba(0,0,0,.4)', border: '1.5px solid #d3ab2a55', animation: 'omModalIn .22s cubic-bezier(.22,1,.36,1)' }}>
        <div className="flex items-center justify-between px-7 pt-5 pb-4 sticky top-0 bg-[#FFF8E1] rounded-t-[18px] z-[2]"
          style={{ borderBottom: '1px solid #d3ab2a33' }}>
          <h3 className="m-0 text-sm font-bold text-[#4A3F35]" style={DISPLAY}>{title}</h3>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-[#2E2E2E] p-1 rounded-lg flex items-center">
            <FiX size={20}/>
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color = '#5F8B8C' }) => (
  <div className="bg-white rounded-[14px] px-5 py-4"
    style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(74,63,53,.07)' }}>
    <div className="text-2xl mb-1.5" style={{ color }}>{icon}</div>
    <div className="font-black leading-tight" style={{ ...DISPLAY, fontSize: 20, color }}>{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-[.1em] mt-1" style={{ color: '#5F8B8C', ...SERIF }}>{label}</div>
  </div>
);

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
const RevenueBarChart = ({ salesByMonth }) => {
  const [hovered, setHovered] = useState(null);
  if (!salesByMonth?.length) return (
    <div className="flex items-center justify-center h-[140px] text-xs" style={{ color: '#2E2E2E40', ...SERIF }}>
      No revenue data yet
    </div>
  );
  const maxRev = Math.max(...salesByMonth.map(s => s.revenue || 0), 1);
  const W = 500, H = 140;
  const PAD = { top: 10, right: 10, bottom: 30, left: 55 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n    = salesByMonth.length;
  const barW = Math.min(48, Math.floor(chartW / n) - 8);
  const step = chartW / n;
  const barX = i => PAD.left + i * step + (step - barW) / 2;
  const barH = rev => Math.max(4, Math.round((rev / maxRev) * chartH));
  const barY = rev => PAD.top + chartH - barH(rev);
  const yTicks = [0,.25,.5,.75,1].map(f => ({ val: Math.round(maxRev * f), y: PAD.top + chartH - f * chartH }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="#2E2E2E10" strokeWidth={1} strokeDasharray={i===0?'0':'4 3'}/>
          <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fontSize={8} fill="#2E2E2E55" fontWeight={600}>
            {t.val >= 1000000 ? `${(t.val/1000000).toFixed(1)}M` : t.val >= 1000 ? `${(t.val/1000).toFixed(0)}K` : t.val}
          </text>
        </g>
      ))}
      {salesByMonth.map((m, i) => {
        const x = barX(i), h = barH(m.revenue||0), y = barY(m.revenue||0);
        const isHov = hovered === i;
        const monthLabel = MONTH_NAMES[(m._id?.month||1)-1];
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={barW} height={h} rx={4} fill={isHov ? '#5F8B8C' : '#5F8B8Cbb'} style={{ transition: 'fill .15s' }}/>
            <text x={x+barW/2} y={H-PAD.bottom+14} textAnchor="middle" fontSize={9} fill="#2E2E2E66" fontWeight={600}>{monthLabel}</text>
            {isHov && (() => {
              const label = `${monthLabel}: ${fmt(m.revenue||0)}`;
              const tw = label.length * 6.2 + 16;
              const tx = Math.min(Math.max(x+barW/2-tw/2, PAD.left), W-PAD.right-tw);
              const ty = y - 28;
              return (
                <g>
                  <rect x={tx} y={ty} width={tw} height={20} rx={5} fill="#2E2E2E" opacity={0.85}/>
                  <text x={tx+tw/2} y={ty+13} textAnchor="middle" fontSize={9.5} fill="#fff" fontWeight={700}>{label}</text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
};

//update order modal
const UpdateOrderModal = ({ order, open, onClose, onSave, saving }) => {
  const [orderStatus,     setOrderStatus]     = useState('');
  const [trackingNumber,  setTrackingNumber]  = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [trackingNote,    setTrackingNote]    = useState('');

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus || 'pending');
      setTrackingNumber(order.trackingNumber || '');
      setShippingCarrier(order.shippingCarrier || '');
      setTrackingNote('');
    }
  }, [order]);

  if (!order) return null;

  const inpCls = "w-full border border-[#d3ab2a55] rounded-xl px-3.5 py-2.5 text-[13px] text-[#2E2E2E] bg-white outline-none focus:border-[#5F8B8C] transition-colors";

  return (
    <Modal open={open} onClose={onClose} title="Update Order" width={520}>
      {/* order mini-header */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5" style={{ background: '#F4EDE4' }}>
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#d3ab2a22] flex-shrink-0">
          {order.marketplaceItem?.artwork?.images?.[0]?.url
            ? <img src={order.marketplaceItem.artwork.images[0].url} alt="" className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-lg">🎨</div>}
        </div>
        <div>
          <div className="text-xs font-bold text-[#4A3F35]" style={SERIF}>{order.marketplaceItem?.listingTitle || '—'}</div>
          <div className="text-[11px]" style={{ color: '#A67C52', ...SERIF }}>Ref: <strong>#{order._id?.slice(-8).toUpperCase()}</strong> · {order.buyer?.name || '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em] mb-1.5" style={SERIF}>Order Status</label>
          <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className={inpCls} style={SERIF}>
            {Object.entries(ORDER_STATUS_CFG).map(([v, cfg]) => (
              <option key={v} value={v}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em] mb-1.5" style={SERIF}>Tracking Number</label>
          <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
            placeholder="e.g. SLP123456789" className={inpCls} style={SERIF}/>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em] mb-1.5" style={SERIF}>Carrier / Courier</label>
          <input value={shippingCarrier} onChange={e => setShippingCarrier(e.target.value)}
            placeholder="e.g. SL Post, DHL" className={inpCls} style={SERIF}/>
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em] mb-1.5" style={SERIF}>Update Note <span className="normal-case text-[#A67C52]">(optional)</span></label>
          <textarea value={trackingNote} onChange={e => setTrackingNote(e.target.value)}
            placeholder="e.g. Package handed to courier, expected delivery in 3 days…"
            className={`${inpCls} min-h-[70px] resize-none`} style={SERIF}/>
        </div>
      </div>

      {order.paymentMethod === 'card' && (
        <div className="mt-3.5 p-3 rounded-xl flex items-center gap-2.5"
          style={{ background: '#EBF8FF', border: '1px solid #2B6CB044' }}>
          <BsCreditCard size={15} className="text-[#2B6CB0] flex-shrink-0"/>
          <span className="text-[11px] text-[#2B6CB0]" style={SERIF}>Card payment auto-confirmed via Stripe — no manual action needed.</span>
        </div>
      )}

      <div className="flex gap-2.5 justify-end mt-5 pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
        <button onClick={onClose} disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-[#d3ab2a55] bg-transparent text-[#5C4A2A] font-bold text-xs cursor-pointer hover:bg-[#F4EDE4] transition-colors"
          style={SERIF}>Cancel</button>
        <button onClick={() => onSave({ orderStatus, trackingNumber, shippingCarrier, trackingNote })}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border-none bg-[#5F8B8C] text-white font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5"
          style={SERIF}>
          <FiTruck size={13}/>{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
};

// order details modal
const OrderDetailModal = ({ sale, open, onClose, onUpdate, onConfirmPayment, saving }) => {
  if (!sale) return null;

  const osCfg  = ORDER_STATUS_CFG[sale.orderStatus]  || { label: sale.orderStatus,  color: '#666', bg: '#f0f0f0' };
  const psCfg  = PAY_STATUS_CFG[sale.paymentStatus]  || { label: sale.paymentStatus, color: '#666', bg: '#f0f0f0' };
  const isCard = sale.paymentMethod === 'card';
  const isPendingPay = sale.paymentStatus === 'pending';

  const Row = ({ label, value }) => (
    <div className="flex gap-2.5 mb-2.5">
      <span className="min-w-[130px] text-[#5F8B8C] font-bold text-[10px] uppercase tracking-[.1em] pt-0.5 flex-shrink-0" style={SERIF}>{label}</span>
      <span className="text-[#2E2E2E] flex-1 text-[13px] leading-relaxed" style={SERIF}>{value ?? '—'}</span>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Order Details" width={720}>
      {/* header strip */}
      <div className="flex justify-between items-center flex-wrap gap-2.5 px-4 py-3.5 rounded-xl mb-5" style={{ background: '#F4EDE4' }}>
        <div>
          <div className="text-[11px] tracking-[.08em] mb-0.5" style={{ color: '#A67C52', ...DISPLAY }}>ORDER REFERENCE</div>
          <div className="text-sm font-bold text-[#4A3F35]" style={DISPLAY}>#{sale._id?.slice(-8).toUpperCase()}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* order status badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: osCfg.bg, color: osCfg.color, border: `1px solid ${osCfg.color}44`, ...SERIF }}>
            {osCfg.label}
          </span>
          {/* payment status badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: psCfg.bg, color: psCfg.color, border: `1px solid ${psCfg.color}44`, ...SERIF }}>
            {PAY_ICON[sale.paymentMethod] || <MdOutlinePayment size={12}/>}
            {psCfg.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[11px] font-bold text-[#5F8B8C] uppercase tracking-[.1em] mb-3" style={DISPLAY}>Order Info</div>
          <Row label="Item"       value={sale.marketplaceItem?.listingTitle || 'N/A'}/>
          <Row label="Category"   value={sale.marketplaceItem?.artwork?.category}/>
          <Row label="Qty"        value={sale.quantity}/>
          <Row label="Unit Price" value={fmt(sale.unitPrice)}/>
          <Row label="Shipping"   value={fmt(sale.shippingCost)}/>
          <Row label="Total"      value={<strong style={{ color: '#5F8B8C', fontSize: 14, ...DISPLAY }}>{fmt(sale.totalAmount)}</strong>}/>
          <Row label="Date"       value={`${fdate(sale.orderDate)} ${ftime(sale.orderDate)}`}/>
          <Row label="Ship Method" value={sale.shippingMethod}/>
          {sale.notes && <Row label="Notes" value={sale.notes}/>}
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#5F8B8C] uppercase tracking-[.1em] mb-3" style={DISPLAY}>Buyer</div>
          <Row label="Name"  value={sale.buyer?.name}/>
          <Row label="Email" value={sale.buyer?.email}/>
          <Row label="Phone" value={sale.buyer?.phone}/>
          <Row label="Address" value={[sale.buyer?.address?.street, sale.buyer?.address?.city].filter(Boolean).join(', ') || sale.buyer?.address}/>
          <Row label="Payment" value={
            <span className="inline-flex items-center gap-1.5">
              {PAY_ICON[sale.paymentMethod] || <MdOutlinePayment size={12}/>}
              {PAY_LABEL[sale.paymentMethod] || sale.paymentMethod}
            </span>
          }/>

          {/* tracking info if available */}
          {(sale.trackingNumber || sale.shippingCarrier) && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: '#E6FFFA', border: '1px solid #2C7A7B44' }}>
              <div className="text-[10px] font-bold text-[#2C7A7B] uppercase tracking-[.08em] mb-1.5" style={SERIF}>Tracking</div>
              {sale.shippingCarrier && <div className="text-xs font-bold text-[#2C3E35]" style={SERIF}>{sale.shippingCarrier}</div>}
              {sale.trackingNumber  && <div className="text-xs text-[#2C7A7B] font-bold mt-0.5" style={SERIF}>#{sale.trackingNumber}</div>}
            </div>
          )}
        </div>
      </div>

      {/* tracking history */}
      {sale.trackingHistory?.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] font-bold text-[#5F8B8C] uppercase tracking-[.1em] mb-3" style={DISPLAY}>Tracking History</div>
          <div className="space-y-2">
            {[...sale.trackingHistory].reverse().map((h, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#5F8B8C] mt-1.5 flex-shrink-0"/>
                <div>
                  <div className="text-[11px] font-bold text-[#4A3F35]" style={SERIF}>{h.status?.toUpperCase()}</div>
                  {h.note && <div className="text-[12px] text-[#5C4A2A]" style={SERIF}>{h.note}</div>}
                  <div className="text-[10px]" style={{ color: '#A67C52', ...SERIF }}>{fdate(h.date)} {ftime(h.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* action buttons */}
      <div className="flex gap-2.5 justify-end mt-5 pt-4 flex-wrap" style={{ borderTop: '1px solid #d3ab2a33' }}>
        {!isCard && isPendingPay && (
          <button onClick={() => onConfirmPayment(sale)} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-none font-bold text-[12px] cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: '#276749', color: '#fff', ...SERIF }}>
            <FiCheck size={13}/> Confirm Payment Received
          </button>
        )}
        {/* update status / tracking */}
        <button onClick={() => onUpdate(sale)} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-none font-bold text-[12px] cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: '#5F8B8C', color: '#fff', ...SERIF }}>
          <FiEdit3 size={13}/> Update Status / Tracking
        </button>
      </div>
    </Modal>
  );
};

//main component
const OrderManagement = () => {
  const [sales, setSales]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [period, setPeriod]             = useState('all');
  const [payStatus, setPayStatus]       = useState('');
  const [orderStatus, setOrderStatus]   = useState('');
  const [summary, setSummary]           = useState({ totalSales: 0, totalRevenue: 0, totalQuantity: 0, averageOrderValue: 0 });
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [topItems, setTopItems]         = useState([]);
  const [toast, setToast]               = useState({ msg: '', type: 'success' });
  const [page, setPage]                 = useState(1);
  const limit = 15;

  const [detailSale, setDetailSale] = useState(null);
  const [updateSale, setUpdateSale] = useState(null);

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      // getMySales r
      const res  = await marketplaceAPI.getMySales({ period });
      const data = res.data.data;
      setSummary(data.summary || {});
      setSalesByMonth(data.salesByMonth || []);
      setTopItems(data.topItems || []);
      setSales(data.recentSales || []);
    } catch {
      notify('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, notify]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // client-side filtering & pagination
  const filtered = sales.filter(s => {
    if (payStatus   && s.paymentStatus !== payStatus)   return false;
    if (orderStatus && s.orderStatus   !== orderStatus) return false;
    return true;
  });
  const paged      = filtered.slice((page-1)*limit, page*limit);
  const totalPages = Math.ceil(filtered.length / limit);

  // pending payment count (non-card only)
  const pendingPayCount = sales.filter(s => s.paymentStatus === 'pending' && s.paymentMethod !== 'card').length;

  const handleUpdateStatus = async (data) => {
    setSaving(true);
    try {
      await marketplaceAPI.updateOrderStatus(updateSale._id, data);
      notify('Order updated!');
      setUpdateSale(null);
      setDetailSale(null);
      fetchSales();
    } catch (e) {
      notify(e.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const handleConfirmPayment = async (sale) => {
    if (!window.confirm(`Confirm payment received for order #${sale._id?.slice(-8).toUpperCase()}?`)) return;
    setSaving(true);
    try {
      await marketplaceAPI.confirmPayment(sale._id);
      notify('Payment confirmed!');
      setDetailSale(null);
      fetchSales();
    } catch (e) {
      notify(e.response?.data?.message || 'Failed to confirm payment', 'error');
    } finally { setSaving(false); }
  };

  return (
    <>
      <style>{`
        @keyframes omToastIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes omFadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes omModalIn  { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:none} }
        @keyframes omSpin     { to{transform:rotate(360deg)} }
        .om-tr:hover { background: #FFFBF0; }
      `}</style>

      <div className="p-6 min-h-screen" style={{ ...SERIF, background: '#FFF8E1', color: '#2E2E2E' }}>

        {/* header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={DISPLAY}>Order Management</h2>
            <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]">Track sales, confirm payments & update delivery status</p>
          </div>
          <button onClick={fetchSales}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#d3ab2a55] bg-transparent text-[#4A3F35] font-bold text-xs cursor-pointer hover:bg-[#F4EDE4] transition-colors"
            style={SERIF}>
            <FiRefreshCw size={13}/> Refresh
          </button>
        </div>

        {/* pending payment alert */}
        {pendingPayCount > 0 && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-5 cursor-pointer"
            style={{ background: '#FEFCBF', border: '1.5px solid #d3ab2a66' }}
            onClick={() => { setPayStatus('pending'); setPage(1); }}>
            <BsCashCoin size={18} className="text-[#B7791F] flex-shrink-0"/>
            <div>
              <span className="text-[13px] font-bold text-[#B7791F]" style={SERIF}>
                {pendingPayCount} order{pendingPayCount !== 1 ? 's' : ''} awaiting payment confirmation
              </span>
              <span className="text-[11px] text-[#8B6914] ml-2" style={SERIF}>— Click to filter</span>
            </div>
          </div>
        )}

        {/* period tabs */}
        <div className="flex gap-1.5 mb-5 bg-white rounded-xl p-1.5 w-fit" style={{ border: '1px solid #d3ab2a33' }}>
          {[['all','All Time'],['today','Today'],['week','This Week'],['month','This Month'],['year','This Year']].map(([v, l]) => (
            <button key={v} onClick={() => { setPeriod(v); setPage(1); }}
              className="px-4 py-2 rounded-[9px] border-none cursor-pointer font-bold text-xs tracking-wide transition-all"
              style={{ ...SERIF, background: period===v?'#5F8B8C':'transparent', color: period===v?'#fff':'#A67C52' }}>
              {l}
            </button>
          ))}
        </div>

        {/* stats */}
        {!loading && (
          <div className="grid gap-3.5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <StatCard icon={<FiPackage     size={22}/>} label="Total Orders"  value={summary.totalSales?.toLocaleString() || 0}    color="#5F8B8C"/>
            <StatCard icon={<FiDollarSign  size={22}/>} label="Total Revenue" value={fmt(summary.totalRevenue)}                     color="#d3ab2a"/>
            <StatCard icon={<FiShoppingBag size={22}/>} label="Items Sold"    value={summary.totalQuantity?.toLocaleString() || 0}  color="#C48A6A"/>
            <StatCard icon={<FiBarChart2   size={22}/>} label="Avg Order"     value={fmt(summary.averageOrderValue)}                 color="#8DAA91"/>
          </div>
        )}

        {/* charts */}
        {!loading && salesByMonth.length > 0 && (
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl px-5 py-5" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(74,63,53,.06)' }}>
              <h4 className="m-0 mb-3.5 text-[12px] font-bold text-[#4A3F35] tracking-wide" style={DISPLAY}>Monthly Revenue</h4>
              <RevenueBarChart salesByMonth={salesByMonth}/>
            </div>
            <div className="bg-white rounded-2xl px-5 py-5" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(74,63,53,.06)' }}>
              <h4 className="m-0 mb-3.5 text-[12px] font-bold text-[#4A3F35] tracking-wide" style={DISPLAY}>Top Selling Items</h4>
              {topItems.length === 0
                ? <p className="text-xs" style={{ color: '#A67C52', ...SERIF }}>No data yet</p>
                : topItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px]"
                      style={{ background: '#5F8B8C22', color: '#5F8B8C', ...DISPLAY }}>{i+1}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#4A3F35] leading-snug" style={SERIF}>{item._id?.listingTitle || 'Item'}</div>
                      <div className="text-[11px]" style={{ color: '#A67C52', ...SERIF }}>{item.totalSales} orders · {fmt(item.totalRevenue)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* orders table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(74,63,53,.06)' }}>

          {/* table toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-2.5" style={{ borderBottom: '1px solid #d3ab2a22' }}>
            <div className="text-[13px] font-bold text-[#4A3F35]" style={DISPLAY}>
              Orders
              <span className="ml-2 text-xs font-normal" style={{ color: '#A67C52', ...SERIF }}>
                ({filtered.length} record{filtered.length!==1?'s':''})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* payment filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: '#A67C52', ...SERIF }}>Payment:</span>
                <select value={payStatus} onChange={e => { setPayStatus(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-[#2E2E2E] bg-white cursor-pointer outline-none"
                  style={{ border: '1.5px solid #A67C5244', ...SERIF }}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              {/* order status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: '#A67C52', ...SERIF }}>Status:</span>
                <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-[#2E2E2E] bg-white cursor-pointer outline-none"
                  style={{ border: '1.5px solid #A67C5244', ...SERIF }}>
                  <option value="">All</option>
                  {Object.entries(ORDER_STATUS_CFG).map(([v,cfg]) => (
                    <option key={v} value={v}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              {/* clear filters */}
              {(payStatus || orderStatus) && (
                <button onClick={() => { setPayStatus(''); setOrderStatus(''); setPage(1); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-red-300/50 text-red-500 bg-transparent hover:bg-red-50"
                  style={SERIF}>
                  <FiX size={11}/> Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[200px] gap-3.5">
              <div className="w-9 h-9 rounded-full border-4 border-[#d3ab2a44] border-t-[#5F8B8C]" style={{ animation: 'omSpin .8s linear infinite' }}/>
              <span className="text-[13px]" style={{ color: '#A67C52', ...SERIF }}>Loading orders…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <FiPackage size={48} color="#5F8B8C" className="mx-auto mb-2.5"/>
              <p className="text-[15px] font-bold text-[#4A3F35] m-0 mb-1.5" style={DISPLAY}>No orders found</p>
              <p className="text-xs m-0" style={{ color: '#A67C52', ...SERIF }}>
                {payStatus || orderStatus ? 'Try changing the filters above.' : 'Orders from your marketplace listings will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      {['#Ref','Item','Buyer','Qty','Amount','Payment Method','Pay Status','Order Status','Date','Actions'].map(h => (
                        <th key={h} className="p-3 text-left text-[10px] font-bold text-[#5F8B8C] tracking-[.1em] uppercase whitespace-nowrap sticky top-0 z-[1]"
                          style={{ background: '#fffbef', borderBottom: '2px solid #d3ab2a44', ...SERIF }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(sale => {
                      const osCfg = ORDER_STATUS_CFG[sale.orderStatus] || { label: sale.orderStatus||'—', color: '#666', bg: '#f0f0f0' };
                      const psCfg = PAY_STATUS_CFG[sale.paymentStatus] || { label: sale.paymentStatus||'—', color: '#666', bg: '#f0f0f0' };
                      const needsPayConfirm = sale.paymentStatus === 'pending' && sale.paymentMethod !== 'card';

                      return (
                        <tr key={sale._id} className="om-tr transition-colors" style={{ borderBottom: '1px solid #d3ab2a22' }}>
                          {/* ref */}
                          <td className="p-3 text-[11px] whitespace-nowrap" style={{ color: '#A67C52', ...SERIF }}>
                            #{sale._id?.slice(-8).toUpperCase()}
                          </td>
                          {/* item */}
                          <td className="p-3 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#d3ab2a22]">
                                {sale.marketplaceItem?.artwork?.images?.[0]?.url
                                  ? <img src={sale.marketplaceItem.artwork.images[0].url} alt="" className="w-full h-full object-cover"/>
                                  : <div className="h-full flex items-center justify-center text-sm">🎨</div>}
                              </div>
                              <div className="text-[11px] font-bold text-[#4A3F35] leading-snug line-clamp-2" style={SERIF}>
                                {sale.marketplaceItem?.listingTitle || 'N/A'}
                              </div>
                            </div>
                          </td>
                          {/* byer*/}
                          <td className="p-3">
                            <div className="text-xs text-[#2E2E2E]" style={SERIF}>{sale.buyer?.name || '—'}</div>
                            {sale.buyer?.email && <div className="text-[10px]" style={{ color: '#A67C52', ...SERIF }}>{sale.buyer.email}</div>}
                          </td>
                          {/* qty */}
                          <td className="p-3 text-[13px] font-bold text-[#2E2E2E] text-center" style={SERIF}>{sale.quantity}</td>
                          {/* amount */}
                          <td className="p-3 font-bold text-[13px] whitespace-nowrap" style={{ color: '#5F8B8C', ...DISPLAY }}>
                            {fmt(sale.totalAmount)}
                          </td>
                          {/* payment method */}
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#4A3F35', ...SERIF }}>
                              {PAY_ICON[sale.paymentMethod] || <MdOutlinePayment size={12}/>}
                              {PAY_LABEL[sale.paymentMethod] || sale.paymentMethod || '—'}
                            </span>
                          </td>
                          {/* pay status */}
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                                style={{ background: psCfg.bg, color: psCfg.color, border: `1px solid ${psCfg.color}44`, ...SERIF }}>
                                {psCfg.label}
                              </span>
                              {needsPayConfirm && (
                                <span className="text-[10px] font-bold text-[#B7791F] animate-pulse" style={SERIF}>⚠ Confirm receipt</span>
                              )}
                            </div>
                          </td>
                          {/* order status */}
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                              style={{ background: osCfg.bg, color: osCfg.color, border: `1px solid ${osCfg.color}44`, ...SERIF }}>
                              {osCfg.label}
                            </span>
                          </td>
                          {/* date */}
                          <td className="p-3 text-[11px] whitespace-nowrap" style={{ color: '#A67C52', ...SERIF }}>
                            <div>{fdate(sale.orderDate)}</div>
                            <div className="text-gray-400">{ftime(sale.orderDate)}</div>
                          </td>
                          {/* actions */}
                          <td className="p-3">
                            <div className="flex gap-1.5 flex-wrap">
                              <button onClick={() => setDetailSale(sale)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition-all bg-transparent hover:opacity-90"
                                style={{ border: '1.5px solid #5F8B8C55', color: '#5F8B8C', ...SERIF }}>
                                <FiEye size={12}/> View
                              </button>
                              <button onClick={() => setUpdateSale(sale)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition-all border-none"
                                style={{ background: '#5F8B8C', color: '#fff', ...SERIF }}>
                                <FiTruck size={12}/> Update
                              </button>
                              {needsPayConfirm && (
                                <button onClick={() => handleConfirmPayment(sale)} disabled={saving}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition-all border-none disabled:opacity-50"
                                  style={{ background: '#276749', color: '#fff', ...SERIF }}>
                                  <FiCheck size={12}/> Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-2.5" style={{ borderTop: '1px solid #d3ab2a22' }}>
                  <span className="text-xs" style={{ color: '#A67C52', ...SERIF }}>
                    Showing {(page-1)*limit+1}–{Math.min(page*limit, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
                      className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-all"
                      style={{ border:'1.5px solid #A67C5244', background:page<=1?'#F4EDE4':'#fff', color:page<=1?'#A67C52':'#4A3F35', cursor:page<=1?'not-allowed':'pointer' }}>
                      <FiChevronLeft size={16}/>
                    </button>
                    {Array.from({length:totalPages},(_,i)=>i+1)
                      .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=2)
                      .map((p,i,arr)=>(
                        <React.Fragment key={p}>
                          {i>0&&arr[i-1]!==p-1&&<span className="px-0.5 leading-[34px]" style={{ color:'#A67C52', ...SERIF }}>…</span>}
                          <button onClick={()=>setPage(p)}
                            className="w-[34px] h-[34px] rounded-lg border-none cursor-pointer font-bold text-[13px] transition-all"
                            style={{ background:p===page?'#5F8B8C':'#F4EDE4', color:p===page?'#fff':'#4A3F35', ...SERIF }}>
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)}
                      className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-all"
                      style={{ border:'1.5px solid #A67C5244', background:page>=totalPages?'#F4EDE4':'#fff', color:page>=totalPages?'#A67C52':'#4A3F35', cursor:page>=totalPages?'not-allowed':'pointer' }}>
                      <FiChevronRight size={16}/>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* modals */}
      <OrderDetailModal
        sale={detailSale}
        open={!!detailSale}
        onClose={() => setDetailSale(null)}
        onUpdate={s => { setUpdateSale(s); setDetailSale(null); }}
        onConfirmPayment={handleConfirmPayment}
        saving={saving}
      />
      <UpdateOrderModal
        order={updateSale}
        open={!!updateSale}
        onClose={() => setUpdateSale(null)}
        onSave={handleUpdateStatus}
        saving={saving}
      />
      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg:'', type:'success' })}/>
    </>
  );
};

export default OrderManagement;