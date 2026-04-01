import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { inquiryAPI } from '../../../services/api';
import {
  FiEye, FiEdit2, FiTrash2, FiPlus, FiSearch, FiX,
  FiAlertTriangle, FiCheckCircle, FiSend,
  FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight,
  FiMessageSquare, FiMapPin, FiMail, FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi';
import { MdOutlineInbox } from 'react-icons/md';

//status config
const STATUS_CFG = {
  new:     { label: 'Pending',      color: '#3B82F6' },
  read:    { label: 'Under Review', color: '#d3ab2a' },
  replied: { label: 'Responded',    color: '#22C55E' },
  closed:  { label: 'Closed',       color: '#9CA3AF' },
};

// badge component
const Badge = ({ label, color }) => (
  <span
    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap"
    style={{ background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'Libre Baskerville, serif' }}
  >
    {label}
  </span>
);

// form inputs
const inputCls = "w-full border border-[#d3ab2a55] rounded-[10px] px-3 py-2 text-[13px] text-[#2E2E2E] bg-white outline-none transition-colors focus:border-[#d3ab2a]";

const Inp = ({ className = '', ...p }) => (
  <input className={`${inputCls} ${className}`} {...p} />
);

const Sel = ({ children, className = '', ...p }) => (
  <select
    className={`${inputCls} appearance-none cursor-pointer pr-8 ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C48A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
    }}
    {...p}
  >
    {children}
  </select>
);

const TA = (p) => (
  <textarea className={`${inputCls} min-h-[110px] resize-y`} {...p} />
);

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-1.5 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>
      {label}{required && <span className="text-[#C48A6A]"> *</span>}
    </label>
    {children}
  </div>
);

// ─── Buttons ──────────────────────────────────────────────────────────────────
const variantCls = {
  primary: 'bg-[#d3ab2a] text-[#4A3F35] border-transparent hover:opacity-90',
  danger:  'bg-[#e53e3e22] text-[#e53e3e] border border-[#e53e3e55] hover:opacity-90',
  ghost:   'bg-transparent text-[#5F8B8C] border border-[#5F8B8C55] hover:bg-[#5F8B8C12]',
};

const Btn = ({ variant = 'primary', className = '', children, ...p }) => (
  <button
    className={`inline-flex items-center gap-1.5 cursor-pointer rounded-[10px] font-bold text-[12px] tracking-wide px-4 py-2 transition-all whitespace-nowrap ${variantCls[variant]} ${className}`}
    style={{ fontFamily: 'Libre Baskerville, serif' }}
    {...p}
  >
    {children}
  </button>
);

// ─── Detail row ───────────────────────────────────────────────────────────────
const DRow = ({ label, value }) => (
  <div className="flex gap-2.5 mb-2.5">
    <span className="min-w-[120px] text-[#5F8B8C] font-bold text-[10px] uppercase tracking-[.1em] pt-0.5 flex-shrink-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</span>
    <span className="text-[#2E2E2E] flex-1 text-[13px] leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>{value ?? '—'}</span>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold"
      style={{ background: type === 'error' ? '#c0392b' : '#5F8B8C', animation: 'inqToastIn .3s ease', fontFamily: 'Libre Baskerville, serif' }}
    >
      {type === 'error' ? <FiAlertTriangle size={18} /> : <FiCheckCircle size={18} />}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, width = 640, children }) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-5"
      style={{ background: 'rgba(46,46,46,.7)', animation: 'inqFadeIn .18s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFF8E1] rounded-[18px] w-full overflow-y-auto relative"
        style={{ maxWidth: width, maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,.45)', border: '1.5px solid #d3ab2a55', animation: 'inqModalIn .22s cubic-bezier(.22,1,.36,1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-5 pb-4 sticky top-0 bg-[#FFF8E1] rounded-t-[18px] z-[2]" style={{ borderBottom: '1px solid #d3ab2a33' }}>
          <h3 className="m-0 text-sm font-bold text-[#4A3F35]" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.03em' }}>{title}</h3>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-[#2E2E2E] p-1 rounded-lg flex items-center">
            <FiX size={20} />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const buildPages = (cur, tot) => {
  if (tot <= 9) return Array.from({ length: tot }, (_, i) => i + 1);
  const p = [1];
  if (cur > 5) p.push('…');
  for (let i = Math.max(2, cur - 3); i <= Math.min(tot - 1, cur + 3); i++) p.push(i);
  if (cur < tot - 4) p.push('…');
  p.push(tot);
  return p;
};

const PB = ({ label, active, disabled, onClick }) => (
  <button
    className="inq-pgbtn inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg font-bold text-[13px] px-2.5 transition-all"
    onClick={onClick}
    disabled={disabled}
    style={{
      border: active ? 'none' : '1.5px solid #d3ab2a44',
      background: active ? '#d3ab2a' : disabled ? '#f5f0e8' : '#fff',
      color: active ? '#4A3F35' : disabled ? '#ccc' : '#2E2E2E',
      boxShadow: active ? '0 2px 8px #d3ab2a66' : 'none',
      opacity: disabled ? .55 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Libre Baskerville, serif',
    }}
  >
    {label}
  </button>
);

const Pagination = ({ page, totalPages, total, limit, onPage, onLimitChange }) => (
  <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-5 py-3.5 bg-white rounded-xl" style={{ border: '1px solid #d3ab2a33' }}>
    <div className="flex items-center gap-4">
      <span className="text-xs text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        Showing <strong>{total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> inquiries
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-bold text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Rows:</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-[#d3ab2a55] rounded-lg px-2 py-1 text-xs text-[#2E2E2E] bg-white cursor-pointer"
          style={{ fontFamily: 'Libre Baskerville, serif' }}
        >
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
    {totalPages > 1 && (
      <div className="flex gap-1.5 items-center flex-wrap">
        <PB label={<FiChevronsLeft size={14} />} disabled={page <= 1} onClick={() => onPage(1)} />
        <PB label={<FiChevronLeft size={14} />} disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {buildPages(page, totalPages).map((item, i) =>
          item === '…'
            ? <span key={`e${i}`} className="text-[#C48A6A] px-1 text-sm select-none" style={{ fontFamily: 'Libre Baskerville, serif' }}>…</span>
            : <PB key={item} label={item} active={item === page} onClick={() => onPage(item)} />
        )}
        <PB label={<FiChevronRight size={14} />} disabled={page >= totalPages} onClick={() => onPage(page + 1)} />
        <PB label={<FiChevronsRight size={14} />} disabled={page >= totalPages} onClick={() => onPage(totalPages)} />
      </div>
    )}
  </div>
);

//Inquiry form component
const InquiryForm = ({ initial, province, userEmail, userName, onSave, onCancel, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name:      initial?.name      || userName  || '',
    email:     initial?.email     || userEmail || '',
    contactNo: initial?.contactNo || '',
    address:   initial?.address   || '',
    message:   initial?.message   || '',
  });
  const [sub, setSub] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sub) return;
    if (!form.name.trim() || !form.email.trim() || !form.contactNo.trim() || !form.message.trim()) {
      setErr('Please fill in all required fields.');
      return;
    }
    setErr(''); setSub(true);
    try { await onSave(form); } catch {}
    finally { setSub(false); }
  };

  return (
    <form onSubmit={submit}>
      {err && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-[10px] text-red-700 text-[13px] mb-4" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          <FiAlertTriangle size={14} />{err}
        </div>
      )}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-[#4A3F35] text-xs mb-[18px]" style={{ background: '#8DAA9118', border: '1px solid #8DAA9144', fontFamily: 'Libre Baskerville, serif' }}>
        <FiMapPin size={13} color="#8DAA91" />
        Sending to <strong className="ml-1">{province} Province Administration</strong>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" required><Inp value={form.name} onChange={set('name')} placeholder="Your full name" required /></Field>
        <Field label="Email" required><Inp type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required /></Field>
        <Field label="Contact No" required><Inp value={form.contactNo} onChange={set('contactNo')} placeholder="+94 77 123 4567" required /></Field>
        <Field label="Address"><Inp value={form.address} onChange={set('address')} placeholder="Your address (optional)" /></Field>
        <div className="col-span-2">
          <Field label="Message" required>
            <TA value={form.message} onChange={set('message')} placeholder="Describe your inquiry in detail…" required maxLength={2000} />
            <div className="text-right text-[11px] text-gray-400 mt-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>{form.message.length}/2000</div>
          </Field>
        </div>
      </div>
      <div className="flex items-start gap-2 px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-[10px] text-blue-700 text-xs mb-5" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        <FiMail size={13} className="flex-shrink-0 mt-0.5" />
        A confirmation will be sent to <strong className="mx-1">{form.email || 'your email'}</strong>.
        {isEdit ? ' Your inquiry will be updated.' : ' The admin will respond within 2–3 business days.'}
      </div>
      <div className="flex gap-2.5 justify-end pt-5" style={{ borderTop: '1px solid #d3ab2a33' }}>
        <Btn type="button" variant="ghost" onClick={onCancel} disabled={loading || sub}>Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={loading || sub}>
          {(loading || sub) ? 'Saving…' : isEdit ? <><FiEdit2 size={13} /> Update Inquiry</> : <><FiSend size={13} /> Submit Inquiry</>}
        </Btn>
      </div>
    </form>
  );
};

//Table row component
const TR = ({ item, onView, onEdit, onDelete }) => {
  const cfg = STATUS_CFG[item.status] || STATUS_CFG.new;
  const canEdit = item.status === 'new';
  return (
    <tr className="inq-tr transition-colors" style={{ borderBottom: '1px solid #d3ab2a22' }}>
      <td className="p-3 w-[52px]">
        <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ background: cfg.color + '18' }}>
          <FiMessageSquare size={20} color={cfg.color} />
        </div>
      </td>
      <td className="p-3 min-w-[220px]">
        <div
          onClick={() => onView(item)}
          className="font-bold text-[13px] text-[#4A3F35] cursor-pointer leading-snug line-clamp-2 mb-1"
          style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.01em' }}
        >
          {item.message?.slice(0, 80)}{item.message?.length > 80 ? '…' : ''}
        </div>
        {item.adminNote && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#22C55E22', color: '#16A34A', border: '1px solid #22C55E44', fontFamily: 'Libre Baskerville, serif' }}>✓ Admin replied</span>
        )}
      </td>
      <td className="p-3 text-xs text-[#C48A6A] whitespace-nowrap" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        <span className="inline-flex items-center gap-1"><FiMapPin size={11} />{item.province}</span>
      </td>
      <td className="p-3 text-xs text-gray-400" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        <span className="inline-flex items-center gap-1"><FiCalendar size={11} />{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '—'}</span>
      </td>
      <td className="p-3"><Badge label={cfg.label} color={cfg.color} /></td>
      <td className="p-3 whitespace-nowrap">
        <div className="flex gap-1.5">
          <Btn variant="ghost" className="!py-1 !px-2.5 !text-[11px]" onClick={() => onView(item)}><FiEye size={12} /> View</Btn>
          {canEdit && <Btn variant="primary" className="!py-1 !px-2.5 !text-[11px]" onClick={() => onEdit(item)}><FiEdit2 size={12} /> Edit</Btn>}
          <Btn variant="danger" className="!py-1 !px-2.5 !text-[11px]" onClick={() => onDelete(item)}><FiTrash2 size={12} /></Btn>
        </div>
      </td>
    </tr>
  );
};

//main
const ArtistInquiries = ({ user, artistProfile }) => {
  const [inquiries, setInquiries] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [limit,     setLimit]     = useState(25);
  const [search,    setSearch]    = useState('');
  const [fStatus,   setFStatus]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: 'success' });

  const [viewItem,   setViewItem]   = useState(null);
  const [editItem,   setEditItem]   = useState(null);
  const [addOpen,    setAddOpen]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const province  = artistProfile?.province  || user?.province  || '';
  const userEmail = artistProfile?.email     || user?.email     || '';
  const userName  = artistProfile?.fullName  || user?.name      || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inquiryAPI.getMyInquiries();
      if (res.data.success) { setInquiries(res.data.data || []); setTotal(res.data.count || res.data.data?.length || 0); }
    } catch { notify('Failed to load inquiries', 'error'); }
    finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const filtered = inquiries.filter((i) => {
    if (fStatus && i.status !== fStatus) return false;
    if (search) { const q = search.toLowerCase(); return i.message?.toLowerCase().includes(q) || i.name?.toLowerCase().includes(q); }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated  = filtered.slice((page - 1) * limit, page * limit);

  const counts = {
    total:   inquiries.length,
    pending: inquiries.filter((i) => i.status === 'new' || i.status === 'read').length,
    replied: inquiries.filter((i) => i.status === 'replied').length,
    closed:  inquiries.filter((i) => i.status === 'closed').length,
  };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const res = await inquiryAPI.createArtistInquiry(form);
      if (res.data.success) { notify('Inquiry submitted! ✓'); setAddOpen(false); await load(); }
      else { notify(res.data.message || 'Failed.', 'error'); throw new Error(); }
    } catch (e) { notify(e?.response?.data?.message || 'Failed to submit.', 'error'); throw e; }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const res = await inquiryAPI.updateMyInquiry(editItem._id, form);
      if (res.data.success) { notify('Inquiry updated! ✓'); setEditItem(null); await load(); }
      else { notify(res.data.message || 'Update failed.', 'error'); throw new Error(); }
    } catch (e) { notify(e?.response?.data?.message || 'Update failed.', 'error'); throw e; }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const id = confirmDel._id;
    try {
      await inquiryAPI.deleteMyInquiry(id);
      setConfirmDel(null);
      setInquiries((p) => p.filter((i) => i._id !== id));
      setTotal((p) => Math.max(0, p - 1));
      notify('Inquiry deleted.');
    } catch (e) { notify(e?.response?.data?.message || 'Delete failed.', 'error'); }
    finally { setDeleting(false); }
  };

  const anyModal = !!viewItem || !!editItem || addOpen || !!confirmDel;

  return (
    <>
      <div
        className="p-6 min-h-screen transition-all duration-200"
        style={{
          fontFamily: 'Libre Baskerville, serif',
          color: '#2E2E2E',
          background: '#FFF8E1',
          filter: anyModal ? 'blur(3px) brightness(.96)' : 'none',
          pointerEvents: anyModal ? 'none' : 'auto',
          userSelect: anyModal ? 'none' : 'auto',
        }}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={{ fontFamily: 'Cinzel Decorative, serif' }}>My Inquiries</h2>
            <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {total} inquiry{total !== 1 ? 's' : ''} submitted to <strong>{province} Province</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={load} className="!px-3.5" title="Refresh"><FiRefreshCw size={14} /></Btn>
            <Btn variant="primary" onClick={() => setAddOpen(true)} className="!px-5 !text-[13px]"><FiPlus size={15} /> New Inquiry</Btn>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          {[
            { label: 'Total',     value: counts.total,   color: '#5F8B8C', bg: '#5F8B8C14' },
            { label: 'Pending',   value: counts.pending, color: '#3B82F6', bg: '#3B82F614' },
            { label: 'Responded', value: counts.replied, color: '#22C55E', bg: '#22C55E14' },
            { label: 'Closed',    value: counts.closed,  color: '#9CA3AF', bg: '#9CA3AF14' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-3.5 flex items-center justify-between" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div>
                <p className="m-0 text-[10px] text-gray-400 uppercase tracking-[.1em]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</p>
                <p className="m-0 mt-1 text-2xl font-black" style={{ color, fontFamily: 'Cinzel Decorative, serif' }}>{value}</p>
              </div>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ background: bg }}>
                <FiMessageSquare size={18} color={color} />
              </div>
            </div>
          ))}
        </div>

        {/* filter bar */}
        <div className="bg-white rounded-[14px] px-4 py-3.5 mb-4 flex gap-2.5 flex-wrap items-center" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <div className="relative flex-1 min-w-[160px]">
            <FiSearch size={14} color="#C48A6A" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <Inp placeholder="Search inquiries…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="!pl-9" />
          </div>
          <Sel value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1); }} className="flex-none w-40">
            <option value="">All Statuses</option>
            <option value="new">Pending</option>
            <option value="read">Under Review</option>
            <option value="replied">Responded</option>
            <option value="closed">Closed</option>
          </Sel>
          {(search || fStatus) && (
            <Btn variant="ghost" onClick={() => { setSearch(''); setFStatus(''); setPage(1); }}>
              <FiX size={13} /> Clear
            </Btn>
          )}
        </div>

        {/* table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3.5">
            <div className="w-10 h-10 rounded-full border-4 border-[#d3ab2a44] border-t-[#d3ab2a]" style={{ animation: 'inqSpin .8s linear infinite' }} />
            <p className="text-[#5F8B8C] m-0 text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Loading inquiries…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-14 text-[#5F8B8C]">
            <MdOutlineInbox size={52} color="#5F8B8C" className="mx-auto mb-3" />
            <p className="text-[15px] font-bold m-0 mb-1.5" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              {inquiries.length === 0 ? 'No inquiries yet' : 'No inquiries match your filters'}
            </p>
            <p className="text-xs text-gray-400 m-0 mb-5" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {inquiries.length === 0 ? 'Click "+ New Inquiry" to contact your province administrator.' : 'Try adjusting your search or filters.'}
            </p>
            {inquiries.length === 0 && <Btn variant="primary" onClick={() => setAddOpen(true)} className="!px-5 !text-[13px]"><FiPlus size={15} /> New Inquiry</Btn>}
          </div>
        ) : (
          <div className="bg-white rounded-[14px] mb-1.5 overflow-hidden" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    {['', 'Message', 'Province', 'Submitted', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="p-3 text-left text-[10px] font-bold text-[#5F8B8C] tracking-[.1em] uppercase whitespace-nowrap sticky top-0 z-[1]" style={{ background: '#fffbef', borderBottom: '2px solid #d3ab2a44', fontFamily: 'Libre Baskerville, serif' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => (
                    <TR key={item._id} item={item} onView={setViewItem} onEdit={setEditItem} onDelete={setConfirmDel} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={limit} onPage={(p) => setPage(p)} onLimitChange={(n) => { setLimit(n); setPage(1); }} />
        )}
      </div>

      {/*view model */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Inquiry Details" width={660}>
        {viewItem && (() => {
          const cfg = STATUS_CFG[viewItem.status] || STATUS_CFG.new;
          return (
            <div>
              <div className="flex items-center justify-between px-4 py-2.5 rounded-[10px] mb-5" style={{ background: cfg.color + '14', border: `1px solid ${cfg.color}44` }}>
                <span className="inline-flex items-center gap-2 text-[13px] font-bold" style={{ color: cfg.color, fontFamily: 'Libre Baskerville, serif' }}>Status: {cfg.label}</span>
                <Badge label={cfg.label} color={cfg.color} />
              </div>
              <div className="rounded-xl px-5 py-4 mb-5" style={{ background: '#FFF8E1', border: '1px solid #d3ab2a33' }}>
                <DRow label="Name"      value={viewItem.name} />
                <DRow label="Email"     value={viewItem.email} />
                <DRow label="Contact"   value={viewItem.contactNo} />
                <DRow label="Province"  value={viewItem.province} />
                {viewItem.address && <DRow label="Address" value={viewItem.address} />}
                <DRow label="Submitted" value={viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                {viewItem.repliedAt && <DRow label="Replied On" value={new Date(viewItem.repliedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })} />}
              </div>
              <div className="mb-5">
                <label className="block text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em] mb-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>Your Message</label>
                <div className="bg-white rounded-xl px-4 py-3.5 text-[13px] text-[#2E2E2E] leading-relaxed whitespace-pre-wrap" style={{ border: '1px solid #d3ab2a44', fontFamily: 'Libre Baskerville, serif' }}>{viewItem.message}</div>
              </div>
              {viewItem.adminNote && (
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-[#16A34A] uppercase tracking-[.12em] mb-2" style={{ fontFamily: 'Libre Baskerville, serif' }}>✓ Response from Province Administration</label>
                  <div className="bg-[#F0FDF4] rounded-r-xl px-4 py-3.5 text-[13px] text-[#2E2E2E] leading-relaxed whitespace-pre-wrap" style={{ borderLeft: '4px solid #22C55E', fontFamily: 'Libre Baskerville, serif' }}>{viewItem.adminNote}</div>
                </div>
              )}
              <div className="flex gap-2.5 justify-end pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
                {viewItem.status === 'new' && <Btn variant="primary" onClick={() => { setViewItem(null); setEditItem(viewItem); }}><FiEdit2 size={13} /> Edit</Btn>}
                <Btn variant="danger" onClick={() => { setViewItem(null); setConfirmDel(viewItem); }}><FiTrash2 size={13} /> Delete</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Submit New Inquiry" width={680}>
        <InquiryForm province={province} userEmail={userEmail} userName={userName} onSave={handleCreate} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* edit modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Inquiry" width={680}>
        {editItem && <InquiryForm initial={editItem} province={province} userEmail={userEmail} userName={userName} onSave={handleUpdate} onCancel={() => setEditItem(null)} loading={saving} />}
      </Modal>

      {/* delete modal */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete Inquiry" width={440}>
        {confirmDel && (
          <div>
            <p className="text-[#2E2E2E] mt-0 leading-relaxed text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Are you sure you want to permanently delete this inquiry? <strong className="text-[#4A3F35]">This cannot be undone.</strong>
            </p>
            <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-[10px] mb-5 text-xs text-red-800 overflow-hidden" style={{ fontFamily: 'Libre Baskerville, serif', WebkitLineClamp: 3 }}>
              "{confirmDel.message?.slice(0, 120)}{confirmDel.message?.length > 120 ? '…' : ''}"
            </div>
            <div className="flex gap-2.5 justify-end">
              <Btn variant="ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting}><FiTrash2 size={13} />{deleting ? 'Deleting…' : 'Delete Inquiry'}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </>
  );
};

export default ArtistInquiries;