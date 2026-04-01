import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { marketplaceAPI, artworkAPI } from '../../../services/api';
import {
  FiEye, FiEdit2, FiTrash2, FiPlus, FiX,
  FiAlertTriangle, FiCheckCircle, FiStar,
  FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight,
  FiShoppingBag, FiPackage, FiDollarSign,
} from 'react-icons/fi';
import { MdOutlinePalette, MdOutlinePayment } from 'react-icons/md';
import { BsCashCoin, BsCreditCard, BsBank, BsGlobe } from 'react-icons/bs';
import { HiCheckCircle } from 'react-icons/hi';

//constants 
const SHIPPING_METHODS = ['standard', 'express', 'pickup'];
const fmt = (n) => n != null ? `LKR ${Number(n).toLocaleString()}` : '—';

const PAY_ICON = {
  cash:          <BsCashCoin   size={13} />,
  card:          <BsCreditCard size={13} />,
  bank_transfer: <BsBank       size={13} />,
  online:        <BsGlobe      size={13} />,
};

//Input class
const inputCls = "w-full border border-[#d3ab2a55] rounded-[10px] px-3 py-2 text-[13px] text-[#2E2E2E] bg-white outline-none transition-colors focus:border-[#d3ab2a]";

//Badge component
const Badge = ({ label, color, icon }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap"
    style={{ background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'Libre Baskerville, serif' }}
  >
    {icon}{label}
  </span>
);

//pagination component
const buildPages = (current, total) => {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 5) pages.push('…');
  const start = Math.max(2, current - 3); const end = Math.min(total - 1, current + 3);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 4) pages.push('…');
  pages.push(total); return pages;
};

const PageBtn = ({ label, active, disabled, onClick }) => (
  <button
    className="mp-page-btn inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg font-bold text-[13px] px-2.5 transition-all"
    onClick={onClick} disabled={disabled}
    style={{
      border: active ? 'none' : '1.5px solid #d3ab2a44',
      background: active ? '#d3ab2a' : disabled ? '#f5f0e8' : '#fff',
      color: active ? '#4A3F35' : disabled ? '#ccc' : '#2E2E2E',
      boxShadow: active ? '0 2px 8px #d3ab2a66' : 'none',
      opacity: disabled ? .55 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Libre Baskerville, serif',
    }}
  >{label}</button>
);

const Pagination = ({ page, totalPages, total, limit, onPage, onLimitChange }) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem   = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-5 py-3.5 bg-white rounded-xl" style={{ border: '1px solid #d3ab2a33' }}>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          Showing <strong>{startItem}–{endItem}</strong> of <strong>{total}</strong> listings
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Rows:</span>
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="border border-[#d3ab2a55] rounded-lg px-2 py-1 text-xs text-[#2E2E2E] bg-white cursor-pointer" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            {[12, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-1.5 items-center flex-wrap">
          <PageBtn label={<FiChevronsLeft size={14} />} disabled={page <= 1} onClick={() => onPage(1)} />
          <PageBtn label={<FiChevronLeft  size={14} />} disabled={page <= 1} onClick={() => onPage(page - 1)} />
          {buildPages(page, totalPages).map((item, i) =>
            item === '…'
              ? <span key={`el-${i}`} className="text-[#C48A6A] px-1 text-sm select-none" style={{ fontFamily: 'Libre Baskerville, serif' }}>…</span>
              : <PageBtn key={item} label={item} active={item === page} onClick={() => onPage(item)} />
          )}
          <PageBtn label={<FiChevronRight  size={14} />} disabled={page >= totalPages} onClick={() => onPage(page + 1)} />
          <PageBtn label={<FiChevronsRight size={14} />} disabled={page >= totalPages} onClick={() => onPage(totalPages)} />
        </div>
      )}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold"
      style={{ background: type === 'error' ? '#c0392b' : '#5F8B8C', animation: 'mpToastIn .3s ease', maxWidth: 380, fontFamily: 'Libre Baskerville, serif' }}
    >
      {type === 'error' ? <FiAlertTriangle size={18} /> : <FiCheckCircle size={18} />}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, width = 680, children }) => {
  useEffect(() => { if (!open) return; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }, [open]);
  useEffect(() => { if (!open) return; const h = (e) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [open, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[9000] flex items-center justify-center p-5" style={{ background: 'rgba(46,46,46,.7)', animation: 'mpFadeIn .18s ease' }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[#FFF8E1] rounded-[18px] w-full overflow-y-auto" style={{ maxWidth: width, maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,.45)', border: '1.5px solid #d3ab2a55', animation: 'mpModalIn .22s cubic-bezier(.22,1,.36,1)' }}>
        <div className="flex items-center justify-between px-7 pt-5 pb-4 sticky top-0 bg-[#FFF8E1] rounded-t-[18px] z-[2]" style={{ borderBottom: '1px solid #d3ab2a33' }}>
          <h3 className="m-0 text-sm font-bold text-[#4A3F35]" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.03em' }}>{title}</h3>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-[#2E2E2E] p-1 rounded-lg flex items-center"><FiX size={20} /></button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ─── Form primitives ──────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-1.5 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>
      {label}{required && <span className="text-[#C48A6A]"> *</span>}
    </label>
    {children}
  </div>
);

const Inp = ({ className = '', ...props }) => (
  <input className={`${inputCls} ${className}`} {...props} />
);
const Sel = ({ children, className = '', ...props }) => (
  <select
    className={`${inputCls} appearance-none cursor-pointer pr-8 ${className}`}
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C48A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
    {...props}
  >{children}</select>
);
const TextArea = (props) => (
  <textarea className={`${inputCls} min-h-[90px] resize-y`} {...props} />
);

const variantCls = {
  primary: 'bg-[#d3ab2a] text-[#4A3F35] border-transparent hover:opacity-90',
  danger:  'bg-[#e53e3e22] text-[#e53e3e] border border-[#e53e3e55] hover:opacity-90',
  ghost:   'bg-transparent text-[#5F8B8C] border border-[#5F8B8C55] hover:bg-[#5F8B8C12]',
  teal:    'bg-[#5F8B8C] text-white border-transparent hover:opacity-90',
};

const Btn = ({ variant = 'primary', className = '', children, disabled, ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 cursor-pointer rounded-[10px] font-bold text-[12px] tracking-wide px-4 py-2 transition-all whitespace-nowrap ${variantCls[variant]} ${className}`}
    style={{ fontFamily: 'Libre Baskerville, serif', opacity: disabled ? .6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    disabled={disabled}
    {...props}
  >{children}</button>
);

const DRow = ({ label, value }) => (
  <div className="flex gap-2.5 mb-2.5">
    <span className="min-w-[130px] text-[#5F8B8C] font-bold text-[10px] uppercase tracking-[.1em] pt-0.5 flex-shrink-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</span>
    <span className="text-[#2E2E2E] flex-1 text-[13px] leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>{value ?? '—'}</span>
  </div>
);

// Artwork listing form component
const ListingForm = ({ initial, myArtworks, onSave, onCancel, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    artworkId:         initial?.artwork?._id || initial?.artwork || '',
    listingTitle:      initial?.listingTitle  || '',
    description:       initial?.description   || '',
    priceAmount:       initial?.price?.amount ?? '',
    stockQuantity:     initial?.stock?.quantity ?? 1,
    shippingAvailable: initial?.shipping?.available ?? true,
    shippingCost:      initial?.shipping?.cost ?? 0,
    shippingEstDays:   initial?.shipping?.estimatedDays ?? '',
    shippingMethods:   initial?.shipping?.methods || ['standard'],
    status:            initial?.status || 'active',
  });
  const [submitting, setSub] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleMethod = (method) => setForm((f) => ({
    ...f,
    shippingMethods: f.shippingMethods.includes(method)
      ? f.shippingMethods.filter((m) => m !== method)
      : [...f.shippingMethods, method],
  }));

  const handleSubmit = (e) => {
    e.preventDefault(); if (submitting) return; setSub(true);
    const payload = {
      listingTitle: form.listingTitle, description: form.description,
      price: { amount: parseFloat(form.priceAmount), currency: 'LKR' },
      stock: { quantity: parseInt(form.stockQuantity) },
      shipping: { available: form.shippingAvailable, cost: parseFloat(form.shippingCost) || 0, methods: form.shippingMethods, estimatedDays: form.shippingEstDays ? parseInt(form.shippingEstDays) : undefined },
      status: form.status,
    };
    if (!isEdit) payload.artworkId = form.artworkId;
    onSave(payload); setTimeout(() => setSub(false), 800);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        {!isEdit && (
          <div className="col-span-2">
            <Field label="Select Artwork" required>
              <Sel value={form.artworkId} onChange={set('artworkId')} required>
                <option value="">— Choose an artwork —</option>
                {myArtworks.map((aw) => <option key={aw._id} value={aw._id}>{aw.title}{aw.category ? ` (${aw.category})` : ''}</option>)}
              </Sel>
            </Field>
          </div>
        )}
        <div className="col-span-2"><Field label="Listing Title" required><Inp value={form.listingTitle} onChange={set('listingTitle')} required placeholder="e.g. Hand-painted Batik Wall Art" /></Field></div>
        <div className="col-span-2"><Field label="Description" required><TextArea value={form.description} onChange={set('description')} required placeholder="Describe your listing in detail…" /></Field></div>
        <Field label="Price (LKR)" required><Inp type="number" min="0" step="0.01" value={form.priceAmount} onChange={set('priceAmount')} required /></Field>
        <Field label="Stock Quantity" required><Inp type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} required /></Field>
        {isEdit && <Field label="Status"><Sel value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></Sel></Field>}

        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-2.5 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>Shipping</label>
          <div className="bg-white rounded-xl p-4" style={{ border: '1.5px solid #d3ab2a44' }}>
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#2E2E2E] mb-3.5" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              <input type="checkbox" checked={form.shippingAvailable} onChange={(e) => setForm((f) => ({ ...f, shippingAvailable: e.target.checked }))} className="w-4 h-4 accent-[#d3ab2a]" />
              Shipping Available
            </label>
            {form.shippingAvailable && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Shipping Cost (LKR)"><Inp type="number" min="0" value={form.shippingCost} onChange={set('shippingCost')} /></Field>
                <Field label="Estimated Days"><Inp type="number" min="1" placeholder="e.g. 5" value={form.shippingEstDays} onChange={set('shippingEstDays')} /></Field>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-2 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>Shipping Methods</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {SHIPPING_METHODS.map((method) => (
                      <label
                        key={method}
                        className="flex items-center gap-1.5 cursor-pointer text-xs text-[#2E2E2E] px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          fontFamily: 'Libre Baskerville, serif',
                          border: `1.5px solid ${form.shippingMethods.includes(method) ? '#d3ab2a' : '#d3ab2a44'}`,
                          background: form.shippingMethods.includes(method) ? '#d3ab2a18' : '#fff',
                        }}
                      >
                        <input type="checkbox" checked={form.shippingMethods.includes(method)} onChange={() => toggleMethod(method)} className="accent-[#d3ab2a]" />
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2.5 justify-end mt-6 pt-5" style={{ borderTop: '1px solid #d3ab2a33' }}>
        <Btn type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={loading || submitting}>
          {(loading || submitting) ? 'Saving…' : isEdit ? <><FiEdit2 size={13} /> Update Listing</> : <><FiShoppingBag size={13} /> Create Listing</>}
        </Btn>
      </div>
    </form>
  );
};

//record sale form
const RecordSaleForm = ({ item, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({ quantity: 1, buyerName: '', buyerEmail: '', buyerPhone: '', paymentMethod: 'cash', shippingMethod: 'standard', notes: '' });
  const [submitting, setSub] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const available = (item?.stock?.quantity || 0) - (item?.stock?.soldQuantity || 0) - (item?.stock?.reserved || 0);
  const total = (item?.price?.amount || 0) * form.quantity + (item?.shipping?.cost || 0);

  const handleSubmit = (e) => {
    e.preventDefault(); if (submitting) return; setSub(true);
    onSave({ quantity: parseInt(form.quantity), buyer: { name: form.buyerName, email: form.buyerEmail, phone: form.buyerPhone }, paymentMethod: form.paymentMethod, shippingMethod: form.shippingMethod, notes: form.notes || undefined });
    setTimeout(() => setSub(false), 800);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl p-3.5 mb-5" style={{ background: '#5F8B8C15', border: '1px solid #5F8B8C44' }}>
        <div className="font-bold text-[13px] text-[#4A3F35] mb-1" style={{ fontFamily: 'Cinzel Decorative, serif' }}>{item?.listingTitle}</div>
        <div className="text-xs text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          Unit price: <strong>{fmt(item?.price?.amount)}</strong>
          {item?.shipping?.cost > 0 && <> · Shipping: <strong>{fmt(item.shipping.cost)}</strong></>}
          <span className="ml-3 text-[#C48A6A]">Available stock: <strong>{available}</strong></span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Quantity" required><Inp type="number" min="1" max={available} value={form.quantity} onChange={set('quantity')} required /></Field>
        <Field label="Payment Method" required>
          <Sel value={form.paymentMethod} onChange={set('paymentMethod')}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </Sel>
        </Field>
        <Field label="Buyer Name"><Inp value={form.buyerName} onChange={set('buyerName')} placeholder="Optional" /></Field>
        <Field label="Buyer Phone"><Inp value={form.buyerPhone} onChange={set('buyerPhone')} placeholder="Optional" /></Field>
        <Field label="Buyer Email"><Inp type="email" value={form.buyerEmail} onChange={set('buyerEmail')} placeholder="Optional" /></Field>
        <Field label="Shipping Method">
          <Sel value={form.shippingMethod} onChange={set('shippingMethod')}>
            {SHIPPING_METHODS.map((m) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </Sel>
        </Field>
        <div className="col-span-2">
          <Field label="Notes"><TextArea value={form.notes} onChange={set('notes')} placeholder="Any additional notes…" className="!min-h-[60px]" /></Field>
        </div>
      </div>
      <div className="flex justify-between items-center px-4 py-3 rounded-[10px] mb-1" style={{ background: '#d3ab2a18', border: '1px solid #d3ab2a55' }}>
        <span className="font-bold text-[13px] text-[#4A3F35]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Total Amount</span>
        <span className="font-black text-[16px] text-[#4A3F35]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>{fmt(total)}</span>
      </div>
      <div className="flex gap-2.5 justify-end mt-5 pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
        <Btn type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Btn>
        <Btn type="submit" variant="teal" disabled={loading || submitting}>
          <FiDollarSign size={13} />{(loading || submitting) ? 'Recording…' : 'Record Sale'}
        </Btn>
      </div>
    </form>
  );
};

// table row component
const TableRow = ({ item, onView, onEdit, onDelete, onRecordSale }) => {
  const img       = item?.artwork?.images?.find((i) => i.isPrimary) || item?.artwork?.images?.[0];
  const available = (item.stock?.quantity || 0) - (item.stock?.soldQuantity || 0) - (item.stock?.reserved || 0);
  const statusColor = { active: '#5F8B8C', inactive: '#C48A6A', 'out-of-stock': '#e53e3e', suspended: '#888' }[item.status] || '#2E2E2E';

  return (
    <tr className="mp-tr-hover transition-colors" style={{ borderBottom: '1px solid #d3ab2a22' }}>
      <td className="p-3 w-[60px]">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#4A3F3511] flex items-center justify-center">
          {img ? <img src={img.url} alt={item.listingTitle} className="w-full h-full object-cover" /> : <FiShoppingBag size={20} color="#4A3F35" />}
        </div>
      </td>
      <td className="p-3 min-w-[180px]">
        <div onClick={() => onView(item)} className="font-bold text-[13px] text-[#4A3F35] cursor-pointer leading-snug line-clamp-2 mb-0.5" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.01em' }}>{item.listingTitle}</div>
        <div className="text-[11px] text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{item.artwork?.title || '—'}</div>
        {item.isFeatured && <div className="mt-1"><Badge label="Featured" color="#d3ab2a" icon={<FiStar size={9} />} /></div>}
      </td>
      <td className="p-3 text-[13px] font-bold whitespace-nowrap" style={{ color: '#5F8B8C', fontFamily: 'Libre Baskerville, serif' }}>{fmt(item.price?.amount)}</td>
      <td className="p-3 text-center">
        <div className="font-bold text-sm" style={{ color: available > 0 ? '#5F8B8C' : '#e53e3e', fontFamily: 'Libre Baskerville, serif' }}>{available}</div>
        <div className="text-[10px] text-gray-400" style={{ fontFamily: 'Libre Baskerville, serif' }}>/ {item.stock?.quantity || 0}</div>
      </td>
      <td className="p-3 text-center">
        <div className="font-bold text-[#2E2E2E]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{item.stock?.soldQuantity || 0} sold</div>
        <div className="text-[11px] text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{fmt(item.totalRevenue)}</div>
      </td>
      <td className="p-3 text-xs text-gray-400" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        <span className="inline-flex items-center gap-1"><FiEye size={12} /> {(item.analytics?.views || 0).toLocaleString()}</span>
      </td>
      <td className="p-3">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}44`, fontFamily: 'Libre Baskerville, serif' }}>{item.status}</span>
      </td>
      <td className="p-3 whitespace-nowrap">
        <div className="flex gap-1.5">
          <Btn variant="ghost"   className="!py-1 !px-2.5 !text-[11px]" onClick={() => onView(item)}><FiEye size={12} /> View</Btn>
          <Btn variant="primary" className="!py-1 !px-2.5 !text-[11px]" onClick={() => onEdit(item)}><FiEdit2 size={12} /> Edit</Btn>
          <Btn variant="teal"    className="!py-1 !px-2.5 !text-[11px]" onClick={() => onRecordSale(item)} disabled={available <= 0}><FiDollarSign size={12} /> Sale</Btn>
          <Btn variant="danger"  className="!py-1 !px-2.5 !text-[11px]" onClick={() => onDelete(item)}><FiTrash2 size={12} /></Btn>
        </div>
      </td>
    </tr>
  );
};

// main component
const MarketplaceManagement = () => {
  const [items, setItems]           = useState([]);
  const [myArtworks, setMyArtworks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(12);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewItem, setViewItem]     = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [saleItem, setSaleItem]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState({ msg: '', type: 'success' });

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  useEffect(() => { artworkAPI.getMyArtworks({ limit: 200 }).then((res) => setMyArtworks(res.data.data || [])).catch(() => {}); }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit }; if (statusFilter) params.status = statusFilter;
      const res = await marketplaceAPI.getMyListings(params);
      setItems(res.data.data || []); const t = res.data.total || 0; setTotal(t); setTotalPages(Math.ceil(t / limit) || 1);
    } catch { notify('Failed to load listings', 'error'); }
    finally { setLoading(false); }
  }, [page, limit, statusFilter, notify]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (payload) => {
    setSaving(true);
    try { await marketplaceAPI.create(payload); notify('Listing created successfully!'); setAddOpen(false); setPage(1); fetchItems(); }
    catch (e) { notify(e.response?.data?.message || 'Creation failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    try { await marketplaceAPI.update(editItem._id, payload); notify('Listing updated!'); setEditItem(null); fetchItems(); }
    catch (e) { notify(e.response?.data?.message || 'Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true); const dId = confirmDel._id;
    try { await marketplaceAPI.delete(dId); setConfirmDel(null); setItems((p) => p.filter((i) => i._id !== dId)); setTotal((p) => Math.max(0, p - 1)); notify('Listing deleted.'); fetchItems(); }
    catch (e) {
      if (e.response?.status === 500) { setConfirmDel(null); setItems((p) => p.filter((i) => i._id !== dId)); notify('Listing deleted (with minor error).'); fetchItems(); }
      else notify(e.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleting(false); }
  };

  const handleRecordSale = async (payload) => {
    setSaving(true);
    try { await marketplaceAPI.recordSale(saleItem._id, payload); notify('Sale recorded successfully!'); setSaleItem(null); fetchItems(); }
    catch (e) { notify(e.response?.data?.message || 'Failed to record sale', 'error'); }
    finally { setSaving(false); }
  };

  const totalRevenue = items.reduce((s, i) => s + (i.totalRevenue || 0), 0);
  const totalSold    = items.reduce((s, i) => s + (i.stock?.soldQuantity || 0), 0);
  const activeCount  = items.filter((i) => i.status === 'active').length;

  const STATS = [
    { label: 'Total Listings', value: total,             icon: <FiShoppingBag size={20} />, color: '#5F8B8C'  },
    { label: 'Active',         value: activeCount,       icon: <HiCheckCircle size={20} />, color: '#27ae60'  },
    { label: 'Units Sold',     value: totalSold,         icon: <FiPackage     size={20} />, color: '#C48A6A'  },
    { label: 'Revenue',        value: fmt(totalRevenue), icon: <FiDollarSign  size={20} />, color: '#d3ab2a'  },
  ];

  const anyModalOpen = !!viewItem || !!editItem || addOpen || !!saleItem || !!confirmDel;

  return (
    <>
      <div
        className="p-6 min-h-screen transition-all duration-200"
        style={{
          fontFamily: 'Libre Baskerville, serif',
          color: '#2E2E2E',
          background: '#FFF8E1',
          filter: anyModalOpen ? 'blur(3px) brightness(.96)' : 'none',
          pointerEvents: anyModalOpen ? 'none' : 'auto',
          userSelect: anyModalOpen ? 'none' : 'auto',
        }}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Marketplace Listings</h2>
            <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]">{total.toLocaleString()} listing{total !== 1 ? 's' : ''} in your shop</p>
          </div>
          <Btn variant="primary" onClick={() => setAddOpen(true)} className="!px-5 !text-[13px]"><FiPlus size={15} /> New Listing</Btn>
        </div>

        {/* stats */}
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {STATS.map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-xl px-4 py-3.5" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div className="mb-1" style={{ color }}>{icon}</div>
              <div className="font-black text-[18px] leading-tight" style={{ color, fontFamily: 'Cinzel Decorative, serif' }}>{value}</div>
              <div className="text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.1em] mt-0.5" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* filter bar */}
        <div className="bg-white rounded-[14px] px-4 py-3 mb-4 flex gap-2.5 flex-wrap items-center" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <Sel value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-none w-40">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="suspended">Suspended</option>
          </Sel>
          {statusFilter && <Btn variant="ghost" onClick={() => { setStatusFilter(''); setPage(1); }}><FiX size={13} /> Clear</Btn>}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3.5">
            <div className="w-10 h-10 rounded-full border-4 border-[#d3ab2a44] border-t-[#d3ab2a]" style={{ animation: 'mpSpin .8s linear infinite' }} />
            <p className="text-[#5F8B8C] m-0 text-[13px]">Loading listings…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-14 text-[#5F8B8C]">
            <FiShoppingBag size={52} color="#5F8B8C" className="mx-auto mb-3" />
            <p className="text-[15px] font-bold m-0 mb-1.5" style={{ fontFamily: 'Cinzel Decorative, serif' }}>No listings found</p>
            <p className="text-xs text-gray-400 m-0 mb-5">Create your first marketplace listing to start selling.</p>
            <Btn variant="primary" onClick={() => setAddOpen(true)}><FiPlus size={13} /> New Listing</Btn>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] mb-1.5 overflow-hidden" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 920 }}>
                <thead>
                  <tr>
                    {['Image','Listing / Artwork','Price','Stock','Sold / Revenue','Views','Status','Actions'].map((h) => (
                      <th key={h} className="p-3 text-left text-[10px] font-bold text-[#5F8B8C] tracking-[.1em] uppercase whitespace-nowrap sticky top-0 z-[1]" style={{ background: '#fffbef', borderBottom: '2px solid #d3ab2a44', fontFamily: 'Libre Baskerville, serif' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <TableRow key={item._id} item={item} onView={setViewItem} onEdit={setEditItem} onDelete={setConfirmDel} onRecordSale={setSaleItem} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={(p) => setPage(p)} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Listing Details" width={720}>
        {viewItem && (() => {
          const img   = viewItem?.artwork?.images?.find((i) => i.isPrimary) || viewItem?.artwork?.images?.[0];
          const avail = (viewItem.stock?.quantity || 0) - (viewItem.stock?.soldQuantity || 0) - (viewItem.stock?.reserved || 0);
          return (
            <div>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-xl overflow-hidden bg-[#4A3F3511] h-[220px] flex items-center justify-center">
                  {img ? <img src={img.url} alt={viewItem.listingTitle} className="w-full h-full object-cover" /> : <FiShoppingBag size={48} color="#5F8B8C" />}
                </div>
                <div>
                  <h3 className="m-0 mb-1 text-sm font-bold text-[#4A3F35] leading-snug" style={{ fontFamily: 'Cinzel Decorative, serif' }}>{viewItem.listingTitle}</h3>
                  <p className="m-0 mb-3 text-[11px] font-bold uppercase tracking-[.07em] text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{viewItem.artwork?.title || '—'}</p>
                  <div className="flex gap-1.5 mb-3.5 flex-wrap">
                    {viewItem.isFeatured && <Badge label="Featured" color="#d3ab2a" icon={<FiStar size={9} />} />}
                    <Badge label={viewItem.status} color="#5F8B8C" />
                  </div>
                  <DRow label="Price"     value={fmt(viewItem.price?.amount)} />
                  <DRow label="Stock"     value={`${avail} available / ${viewItem.stock?.quantity} total`} />
                  <DRow label="Sold"      value={`${viewItem.stock?.soldQuantity || 0} units`} />
                  <DRow label="Revenue"   value={fmt(viewItem.totalRevenue)} />
                  <DRow label="Views"     value={(viewItem.analytics?.views || 0).toLocaleString()} />
                  <DRow label="Shipping"  value={viewItem.shipping?.available ? `${fmt(viewItem.shipping?.cost)} · ${(viewItem.shipping?.methods || []).join(', ')}` : 'Not available'} />
                  <DRow label="Est. Days" value={viewItem.shipping?.estimatedDays} />
                </div>
              </div>
              <div className="mt-5">
                <label className="text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Description</label>
                <p className="mt-2 m-0 text-[#2E2E2E] leading-relaxed text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{viewItem.description}</p>
              </div>
              <div className="flex gap-2.5 justify-end mt-5 pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
                <Btn variant="teal"    disabled={avail <= 0} onClick={() => { setSaleItem(viewItem); setViewItem(null); }}><FiDollarSign size={13} /> Record Sale</Btn>
                <Btn variant="primary" onClick={() => { setEditItem(viewItem); setViewItem(null); }}><FiEdit2 size={13} /> Edit</Btn>
                <Btn variant="danger"  onClick={() => { setConfirmDel(viewItem); setViewItem(null); }}><FiTrash2 size={13} /> Delete</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={addOpen}    onClose={() => setAddOpen(false)} title="Create New Listing" width={760}>
        <ListingForm myArtworks={myArtworks} onSave={handleCreate} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Listing" width={760}>
        {editItem && <ListingForm initial={editItem} myArtworks={myArtworks} onSave={handleUpdate} onCancel={() => setEditItem(null)} loading={saving} />}
      </Modal>
      <Modal open={!!saleItem} onClose={() => setSaleItem(null)} title="Record a Sale" width={560}>
        {saleItem && <RecordSaleForm item={saleItem} onSave={handleRecordSale} onCancel={() => setSaleItem(null)} loading={saving} />}
      </Modal>
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirm Delete" width={440}>
        {confirmDel && (
          <div>
            <p className="text-[#2E2E2E] mt-0 leading-relaxed text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Are you sure you want to permanently delete <strong className="text-[#4A3F35]">"{confirmDel.listingTitle}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end mt-5">
              <Btn variant="ghost"  onClick={() => setConfirmDel(null)} disabled={deleting}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting}><FiTrash2 size={13} />{deleting ? 'Deleting…' : 'Delete Listing'}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </>
  );
};

export default MarketplaceManagement;