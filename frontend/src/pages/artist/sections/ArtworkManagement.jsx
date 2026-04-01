import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { artworkAPI } from '../../../services/api';
import {
  FiEye, FiEdit2, FiTrash2, FiPlus, FiSearch, FiX,
  FiAlertTriangle, FiCheckCircle, FiStar,
  FiArrowUp, FiArrowDown, FiChevronsLeft, FiChevronLeft,
  FiChevronRight, FiChevronsRight,
} from 'react-icons/fi';
import { MdOutlinePalette } from 'react-icons/md';
import { BsImages } from 'react-icons/bs';

//constants
const CATEGORIES = [
  'Batik Clothing','Handloom Saree','Folk Jewelry','Ceramic','Statues',
  'Sri Lankan Sculpture','Wood Carving','Cane Work','Mats','Hana Fiber Crafts',
  'Coconut Crafts','Metal Craft','Lacquer Work','Folk Mural Painting',
  'Puppetry','Drum Craft','Rabana Making','Traditional Masks','Other',
];

const fmt = (n) => n != null ? `LKR ${Number(n).toLocaleString()}` : '—';

// base input class
const inputCls = "w-full border border-[#d3ab2a55] rounded-[10px] px-3 py-2 text-[13px] text-[#2E2E2E] bg-white outline-none transition-colors focus:border-[#d3ab2a]";

//badge component
const Badge = ({ label, color, icon }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap"
    style={{ background: color + '22', color, border: `1px solid ${color}44`, fontFamily: 'Libre Baskerville, serif' }}
  >
    {icon}{label}
  </span>
);

// ─── Pagination helpers ───────────────────────────────────────────────────────
const buildPages = (current, total) => {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 5) pages.push('…');
  const start = Math.max(2, current - 3);
  const end   = Math.min(total - 1, current + 3);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 4) pages.push('…');
  pages.push(total);
  return pages;
};

const PageBtn = ({ label, active, disabled, onClick }) => (
  <button
    className="aw-page-btn inline-flex items-center justify-center min-w-[36px] h-9 rounded-lg font-bold text-[13px] px-2.5 transition-all"
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

const Pagination = ({ page, totalPages, total, limit, onPage, onLimitChange }) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem   = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-5 py-3.5 bg-white rounded-xl" style={{ border: '1px solid #d3ab2a33' }}>
      <div className="flex items-center gap-4">
        <span className="text-xs text-[#5F8B8C]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
          Showing <strong>{startItem.toLocaleString()}–{endItem.toLocaleString()}</strong> of <strong>{total.toLocaleString()}</strong> artworks
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Rows:</span>
          <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="border border-[#d3ab2a55] rounded-lg px-2 py-1 text-xs text-[#2E2E2E] bg-white cursor-pointer" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            {[25, 50, 100, 250, 500].map((n) => <option key={n} value={n}>{n}</option>)}
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
      {totalPages > 10 && (
        <form
          onSubmit={(e) => { e.preventDefault(); const v = parseInt(e.target.jump.value); if (v >= 1 && v <= totalPages) { onPage(v); e.target.reset(); } }}
          className="flex items-center gap-1.5"
        >
          <span className="text-[11px] font-bold text-[#C48A6A]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Go to:</span>
          <input name="jump" type="number" min={1} max={totalPages} placeholder="Page #" className="w-[72px] border border-[#d3ab2a55] rounded-lg px-2 py-1 text-xs text-[#2E2E2E] bg-white" style={{ fontFamily: 'Libre Baskerville, serif' }} />
          <button type="submit" className="bg-[#d3ab2a] text-[#4A3F35] border-none rounded-lg px-2.5 py-1 font-bold text-xs cursor-pointer" style={{ fontFamily: 'Libre Baskerville, serif' }}>Go</button>
        </form>
      )}
    </div>
  );
};

//toast component
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [msg, onDone]);
  if (!msg || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed bottom-7 right-7 z-[99999] flex items-center gap-2.5 px-6 py-3.5 rounded-xl shadow-2xl text-white text-sm font-bold"
      style={{ background: type === 'error' ? '#c0392b' : '#5F8B8C', animation: 'awToastIn .3s ease', maxWidth: 380, fontFamily: 'Libre Baskerville, serif' }}
    >
      {type === 'error' ? <FiAlertTriangle size={18} /> : <FiCheckCircle size={18} />}
      <span>{msg}</span>
    </div>,
    document.body
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, width = 680, children }) => {
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
      style={{ background: 'rgba(46,46,46,.7)', animation: 'awFadeIn .18s ease' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFF8E1] rounded-[18px] w-full overflow-y-auto relative"
        style={{ maxWidth: width, maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,.45)', border: '1.5px solid #d3ab2a55', animation: 'awModalIn .22s cubic-bezier(.22,1,.36,1)' }}
      >
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

// ─── Form input components ────────────────────────────────────────────────────
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
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C48A6A' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
    }}
    {...props}
  >
    {children}
  </select>
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

const Btn = ({ variant = 'primary', className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 cursor-pointer rounded-[10px] font-bold text-[12px] tracking-wide px-4 py-2 transition-all whitespace-nowrap ${variantCls[variant]} ${className}`}
    style={{ fontFamily: 'Libre Baskerville, serif' }}
    {...props}
  >
    {children}
  </button>
);

//gallery component
const Gallery = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return (
    <div className="h-[220px] flex flex-col items-center justify-center bg-[#4A3F3511] rounded-xl text-[#5F8B8C] gap-2">
      <BsImages size={32} /> <span className="text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>No images</span>
    </div>
  );
  return (
    <div>
      <div className="relative h-60 rounded-xl overflow-hidden bg-[#4A3F3511]">
        <img src={images[idx]?.url} alt="" className="w-full h-full object-cover block" />
        {images[idx]?.isPrimary && <div className="absolute top-2.5 left-2.5"><Badge label="Primary" color="#d3ab2a" icon={<FiStar size={9} />} /></div>}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} onClick={() => setIdx(i)} className="w-[52px] h-[52px] rounded-lg overflow-hidden cursor-pointer transition-all" style={{ border: `2.5px solid ${i === idx ? '#d3ab2a' : 'transparent'}` }}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// deatil row component
const DRow = ({ label, value }) => (
  <div className="flex gap-2.5 mb-2.5">
    <span className="min-w-[120px] text-[#5F8B8C] font-bold text-[10px] uppercase tracking-[.1em] pt-0.5 flex-shrink-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>{label}</span>
    <span className="text-[#2E2E2E] flex-1 text-[13px] leading-relaxed" style={{ fontFamily: 'Libre Baskerville, serif' }}>{value ?? '—'}</span>
  </div>
);

//Artwork form component
const ArtworkForm = ({ initial, onSave, onCancel, loading }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title: initial?.title || '', description: initial?.description || '',
    category: initial?.category || CATEGORIES[0],
    isForSale: initial?.isForSale ?? false, price: initial?.price?.amount ?? '',
    availability: initial?.availability || 'available',
    materials: (initial?.materials || []).join(', '), tags: (initial?.tags || []).join(', '),
    creationYear: initial?.creationYear || '',
    dimH: initial?.dimensions?.height || '', dimW: initial?.dimensions?.width || '',
    dimD: initial?.dimensions?.depth || '', dimU: initial?.dimensions?.unit || 'cm',
  });
  const [images, setImages]     = useState([]);
  const [submitting, setSub]    = useState(false);
  const fileRef                 = useRef();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault(); if (submitting) return; setSub(true);
    if (isEdit) { onSave(null, form); setTimeout(() => setSub(false), 500); }
    else {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('description', form.description);
      fd.append('category', form.category); fd.append('isForSale', form.isForSale);
      fd.append('availability', form.availability);
      if (form.materials) fd.append('materials', form.materials);
      if (form.tags) fd.append('tags', form.tags);
      if (form.creationYear) fd.append('creationYear', form.creationYear);
      if (form.isForSale && form.price) fd.append('price[amount]', form.price);
      if (form.dimH) fd.append('dimensions[height]', form.dimH);
      if (form.dimW) fd.append('dimensions[width]', form.dimW);
      if (form.dimD) fd.append('dimensions[depth]', form.dimD);
      fd.append('dimensions[unit]', form.dimU);
      images.forEach((img) => fd.append('images', img));
      onSave(fd, form); setTimeout(() => setSub(false), 800);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Field label="Title" required><Inp value={form.title} onChange={set('title')} required /></Field></div>
        <Field label="Category" required><Sel value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Sel></Field>
        <Field label="Creation Year"><Inp type="number" min="1000" max="2030" value={form.creationYear} onChange={set('creationYear')} /></Field>
        <div className="col-span-2"><Field label="Description" required><TextArea value={form.description} onChange={set('description')} required /></Field></div>
        <Field label="Materials (comma-sep)"><Inp value={form.materials} onChange={set('materials')} placeholder="Clay, Gold leaf…" /></Field>
        <Field label="Tags (comma-sep)"><Inp value={form.tags} onChange={set('tags')} placeholder="traditional, handmade…" /></Field>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-2 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>Dimensions</label>
          <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 90px' }}>
            <Inp type="number" min="0" placeholder="Height" value={form.dimH} onChange={(e) => setForm((f) => ({ ...f, dimH: e.target.value }))} />
            <Inp type="number" min="0" placeholder="Width"  value={form.dimW} onChange={(e) => setForm((f) => ({ ...f, dimW: e.target.value }))} />
            <Inp type="number" min="0" placeholder="Depth"  value={form.dimD} onChange={(e) => setForm((f) => ({ ...f, dimD: e.target.value }))} />
            <Sel value={form.dimU} onChange={(e) => setForm((f) => ({ ...f, dimU: e.target.value }))}><option>cm</option><option>inches</option><option>feet</option></Sel>
          </div>
        </div>
        <Field label="For Sale?">
          <label className="flex items-center gap-2.5 cursor-pointer text-[13px] text-[#2E2E2E] mt-1" style={{ fontFamily: 'Libre Baskerville, serif' }}>
            <input type="checkbox" checked={form.isForSale} onChange={set('isForSale')} className="w-4 h-4 accent-[#d3ab2a]" />
            List this artwork for sale
          </label>
        </Field>
        {form.isForSale ? <Field label="Price (LKR)" required><Inp type="number" min="0" value={form.price} onChange={set('price')} required /></Field> : <div />}
        <Field label="Availability">
          <Sel value={form.availability} onChange={set('availability')}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="not-for-sale">Not for Sale</option>
          </Sel>
        </Field>
        {!isEdit && (
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#5F8B8C] tracking-[.12em] mb-2 uppercase" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Images <span className="text-[#C48A6A]">*</span>
            </label>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setImages(Array.from(e.dataTransfer.files).slice(0, 5)); }}
              className="border-2 border-dashed border-[#d3ab2a88] rounded-xl p-6 text-center cursor-pointer bg-[#d3ab2a08]"
            >
              <BsImages size={32} color="#d3ab2a" className="mx-auto mb-2" />
              <p className="m-0 text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Drag & drop or <strong className="text-[#d3ab2a]">click to browse</strong></p>
              <p className="m-0 mt-1 text-[#C48A6A] text-[11px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Up to 5 images · First image becomes the primary</p>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))} />
            {images.length > 0 && (
              <div className="flex gap-2 mt-2.5 flex-wrap">
                {images.map((f, i) => (
                  <div key={i} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full text-[#5F8B8C]" style={{ background: '#5F8B8C22', border: '1px solid #5F8B8C44', fontFamily: 'Libre Baskerville, serif' }}>
                    {i === 0 && <FiStar size={10} />}{f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2.5 justify-end mt-6 pt-5" style={{ borderTop: '1px solid #d3ab2a33' }}>
        <Btn type="button" variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Btn>
        <Btn type="submit" variant="primary" disabled={loading || submitting}>
          {(loading || submitting) ? 'Saving…' : isEdit ? <><FiEdit2 size={13} /> Update Artwork</> : <><FiPlus size={13} /> Create Artwork</>}
        </Btn>
      </div>
    </form>
  );
};

//Table row component
const TableRow = ({ aw, onView, onEdit, onDelete }) => {
  const img = aw.images?.find((i) => i.isPrimary) || aw.images?.[0];
  const availColor = { available: '#5F8B8C', sold: '#e53e3e', reserved: '#d3ab2a', 'not-for-sale': '#C48A6A' }[aw.availability] || '#2E2E2E';
  return (
    <tr className="aw-tr-hover transition-colors" style={{ borderBottom: '1px solid #d3ab2a22' }}>
      <td className="p-3 w-[60px]">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#4A3F3511] flex items-center justify-center">
          {img ? <img src={img.url} alt={aw.title} className="w-full h-full object-cover" /> : <MdOutlinePalette size={22} color="#4A3F35" />}
        </div>
      </td>
      <td className="p-3 min-w-[200px]">
        <div
          onClick={() => onView(aw)}
          className="font-bold text-[13px] text-[#4A3F35] cursor-pointer leading-snug line-clamp-2 mb-1"
          style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.01em' }}
        >
          {aw.title}
        </div>
        <div className="flex gap-1 flex-wrap">
          {aw.isFeatured && <Badge label="Featured" color="#d3ab2a" icon={<FiStar size={9} />} />}
          {aw.isForSale  && <Badge label="Sale" color="#5F8B8C" />}
        </div>
      </td>
      <td className="p-3 text-xs text-[#C48A6A] whitespace-nowrap" style={{ fontFamily: 'Libre Baskerville, serif' }}>{aw.category}</td>
      <td className="p-3 text-[13px] font-bold text-[#5F8B8C] whitespace-nowrap" style={{ fontFamily: 'Libre Baskerville, serif' }}>{aw.isForSale && aw.price?.amount ? fmt(aw.price.amount) : '—'}</td>
      <td className="p-3">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background: availColor + '18', color: availColor, border: `1px solid ${availColor}44`, fontFamily: 'Libre Baskerville, serif' }}>
          {aw.availability}
        </span>
      </td>
      <td className="p-3 text-xs text-gray-400" style={{ fontFamily: 'Libre Baskerville, serif' }}>
        <span className="inline-flex items-center gap-1"><FiEye size={12} /> {(aw.views || 0).toLocaleString()}</span>
        <span className="ml-2.5 inline-flex items-center gap-1 text-pink-500">♥ {(aw.likes || 0).toLocaleString()}</span>
      </td>
      <td className="p-3 text-xs text-[#2E2E2E]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{aw.creationYear || '—'}</td>
      <td className="p-3 whitespace-nowrap">
        <div className="flex gap-1.5">
          <Btn variant="ghost"   className="!py-1 !px-2.5 !text-[11px]" onClick={() => onView(aw)}><FiEye size={12} /> View</Btn>
          <Btn variant="primary" className="!py-1 !px-2.5 !text-[11px]" onClick={() => onEdit(aw)}><FiEdit2 size={12} /> Edit</Btn>
          <Btn variant="danger"  className="!py-1 !px-2.5 !text-[11px]" onClick={() => onDelete(aw)}><FiTrash2 size={12} /></Btn>
        </div>
      </td>
    </tr>
  );
};

//main component
const ArtworkManagement = () => {
  const [artworks, setArtworks]     = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(50);
  const [search, setSearch]         = useState('');
  const [isForSale, setIsForSale]   = useState('');
  const [sortCol, setSortCol]       = useState('createdAt');
  const [sortDir, setSortDir]       = useState('desc');
  const [viewAw, setViewAw]         = useState(null);
  const [editAw, setEditAw]         = useState(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState({ msg: '', type: 'success' });

  const notify = useCallback((msg, type = 'success') => setToast({ msg, type }), []);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const sortIcon = (col) => {
    if (sortCol !== col) return <FiArrowUp size={10} className="ml-1 opacity-30" />;
    return sortDir === 'asc'
      ? <FiArrowUp size={10} className="ml-1 text-[#d3ab2a]" />
      : <FiArrowDown size={10} className="ml-1 text-[#d3ab2a]" />;
  };

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await artworkAPI.getMyArtworks({ page, limit, sort: `${sortDir === 'desc' ? '-' : ''}${sortCol}` });
      setArtworks(res.data.data || []); setTotalPages(res.data.totalPages || 1); setTotal(res.data.total || 0);
    } catch { notify('Failed to load artworks', 'error'); }
    finally { setLoading(false); }
  }, [page, limit, sortCol, sortDir, notify]);

  useEffect(() => { fetchArtworks(); }, [fetchArtworks]);

  const filteredArtworks = artworks.filter((aw) => {
    if (search) {
      const q = search.toLowerCase();
      const hit = aw.title?.toLowerCase().includes(q) || aw.description?.toLowerCase().includes(q) || (aw.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    if (isForSale === 'true' && !aw.isForSale) return false;
    return true;
  });

  const handleCreate = async (fd) => {
    setSaving(true);
    try { await artworkAPI.create(fd); notify('Artwork created successfully!'); setAddOpen(false); setPage(1); fetchArtworks(); }
    catch (e) {
      const data = e.response?.data;
      let msg = data?.message || 'Creation failed';
      if (data?.details) msg += ' — ' + Object.entries(data.details).map(([k, v]) => `${k}: ${v}`).join(' | ');
      notify(msg, 'error');
    }
    finally { setSaving(false); }
  };

  const handleUpdate = async (_, form) => {
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), category: form.category, availability: form.availability, isForSale: Boolean(form.isForSale), materials: form.materials || '', tags: form.tags || '' };
      if (form.creationYear) payload.creationYear = Number(form.creationYear);
      if (form.isForSale && form.price) payload.price = { amount: parseFloat(form.price), currency: 'LKR' };
      if (form.dimH || form.dimW || form.dimD) payload.dimensions = { height: form.dimH ? Number(form.dimH) : undefined, width: form.dimW ? Number(form.dimW) : undefined, depth: form.dimD ? Number(form.dimD) : undefined, unit: form.dimU || 'cm' };
      await artworkAPI.update(editAw._id, payload); notify('Artwork updated!'); setEditAw(null); fetchArtworks();
    } catch (e) { notify(e.response?.data?.message || 'Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true); const dId = confirmDel._id;
    try {
      await artworkAPI.delete(dId); setConfirmDel(null);
      setArtworks((p) => p.filter((a) => a._id !== dId)); setTotal((p) => Math.max(0, p - 1));
      notify('Artwork deleted.'); fetchArtworks();
    } catch (e) {
      if (e.response?.status === 500) {
        setConfirmDel(null); setArtworks((p) => p.filter((a) => a._id !== dId)); setTotal((p) => Math.max(0, p - 1));
        notify('Artwork deleted (with minor error).'); fetchArtworks();
      } else notify(e.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleting(false); }
  };

  const TH = ({ col, label }) => (
    <th
      onClick={col ? () => handleSort(col) : undefined}
      className="p-3 text-left text-[10px] font-bold text-[#5F8B8C] tracking-[.1em] uppercase whitespace-nowrap sticky top-0 z-[1]"
      style={{ background: '#fffbef', borderBottom: '2px solid #d3ab2a44', cursor: col ? 'pointer' : 'default', userSelect: 'none', fontFamily: 'Libre Baskerville, serif' }}
    >
      <span className="inline-flex items-center">{label}{col && sortIcon(col)}</span>
    </th>
  );

  const anyModalOpen = !!viewAw || !!editAw || addOpen || !!confirmDel;

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
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="m-0 text-xl font-black text-[#4A3F35] tracking-tight" style={{ fontFamily: 'Cinzel Decorative, serif' }}>My Artworks</h2>
            <p className="mt-1.5 m-0 text-[#5F8B8C] text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{total.toLocaleString()} artwork{total !== 1 ? 's' : ''} in your collection</p>
          </div>
          <Btn variant="primary" onClick={() => setAddOpen(true)} className="!px-5 !text-[13px]"><FiPlus size={15} /> Add Artwork</Btn>
        </div>

        {/* filter bar */}
        <div className="bg-white rounded-[14px] px-4 py-3.5 mb-4 flex gap-2.5 flex-wrap items-center" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
          <div className="relative flex-1 min-w-[160px]">
            <FiSearch size={14} color="#C48A6A" className="absolute left-3 top-1/2 -translate-y-1/2" />
            <Inp placeholder="Search title, tags, description…" value={search} onChange={(e) => setSearch(e.target.value)} className="!pl-9" />
          </div>
          <Sel value={isForSale} onChange={(e) => setIsForSale(e.target.value)} className="flex-none w-[130px]">
            <option value="">All</option>
            <option value="true">For Sale</option>
          </Sel>
          {(search || isForSale) && <Btn variant="ghost" onClick={() => { setSearch(''); setIsForSale(''); }}><FiX size={13} /> Clear</Btn>}
        </div>

        {/* table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3.5">
            <div className="w-10 h-10 rounded-full border-4 border-[#d3ab2a44] border-t-[#d3ab2a]" style={{ animation: 'awSpin .8s linear infinite' }} />
            <p className="text-[#5F8B8C] m-0 text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Loading artworks…</p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-14 text-[#5F8B8C]">
            <BsImages size={52} color="#5F8B8C" className="mx-auto mb-3" />
            <p className="text-[15px] font-bold m-0 mb-1.5" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              {artworks.length === 0 ? 'No artworks yet' : 'No artworks match your filters'}
            </p>
            <p className="text-xs text-gray-400 m-0" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {artworks.length === 0 ? 'Click "+ Add Artwork" to upload your first piece.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] mb-1.5 overflow-hidden" style={{ border: '1px solid #d3ab2a33', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 820 }}>
                <thead>
                  <tr>
                    <TH label="Image" />
                    <TH col="title" label="Title" />
                    <TH col="category" label="Category" />
                    <TH col="price.amount" label="Price" />
                    <TH col="availability" label="Availability" />
                    <TH col="views" label="Views/Likes" />
                    <TH col="creationYear" label="Year" />
                    <TH label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredArtworks.map((aw) => (
                    <TableRow key={aw._id} aw={aw} onView={setViewAw} onEdit={setEditAw} onDelete={setConfirmDel} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPage={(p) => setPage(p)} onLimitChange={(n) => { setLimit(n); setPage(1); }} />}
      </div>

      {/* view Modal */}
      <Modal open={!!viewAw} onClose={() => setViewAw(null)} title="Artwork Details" width={800}>
        {viewAw && (
          <div>
            <div className="grid grid-cols-2 gap-6">
              <Gallery images={viewAw.images} />
              <div>
                <h3 className="m-0 mb-1 text-[15px] font-bold text-[#4A3F35] leading-snug" style={{ fontFamily: 'Cinzel Decorative, serif', letterSpacing: '.02em' }}>{viewAw.title}</h3>
                <p className="m-0 mb-3 text-[#C48A6A] font-bold text-[11px] uppercase tracking-[.07em]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{viewAw.category}</p>
                <div className="flex gap-1.5 mb-3.5 flex-wrap">
                  {viewAw.isFeatured && <Badge label="Featured (Admin)" color="#d3ab2a" icon={<FiStar size={9} />} />}
                  {viewAw.isForSale  && <Badge label="For Sale" color="#5F8B8C" />}
                  <Badge label={viewAw.availability} color="#C48A6A" />
                </div>
                <DRow label="Price"      value={viewAw.isForSale ? fmt(viewAw.price?.amount) : 'Not for sale'} />
                <DRow label="Province"   value={viewAw.province} />
                <DRow label="Materials"  value={(viewAw.materials || []).join(', ')} />
                <DRow label="Year"       value={viewAw.creationYear} />
                <DRow label="Dimensions" value={viewAw.dimensions?.height ? `${viewAw.dimensions.height} × ${viewAw.dimensions.width}${viewAw.dimensions.depth ? ` × ${viewAw.dimensions.depth}` : ''} ${viewAw.dimensions.unit}` : null} />
                <DRow label="Views"      value={(viewAw.views ?? 0).toLocaleString()} />
                <DRow label="Likes"      value={(viewAw.likes ?? 0).toLocaleString()} />
                <DRow label="Tags"       value={(viewAw.tags || []).join(', ')} />
              </div>
            </div>
            <div className="mt-5">
              <label className="text-[10px] font-bold text-[#5F8B8C] uppercase tracking-[.12em]" style={{ fontFamily: 'Libre Baskerville, serif' }}>Description</label>
              <p className="mt-2 m-0 text-[#2E2E2E] leading-relaxed text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>{viewAw.description}</p>
            </div>
            <div className="flex gap-2.5 justify-end mt-5 pt-4" style={{ borderTop: '1px solid #d3ab2a33' }}>
              <Btn variant="primary" onClick={() => { setViewAw(null); setEditAw(viewAw); }}><FiEdit2 size={13} /> Edit</Btn>
              <Btn variant="danger"  onClick={() => { setViewAw(null); setConfirmDel(viewAw); }}><FiTrash2 size={13} /> Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Artwork" width={760}>
        <ArtworkForm onSave={handleCreate} onCancel={() => setAddOpen(false)} loading={saving} />
      </Modal>

      {/* edit Modal */}
      <Modal open={!!editAw} onClose={() => setEditAw(null)} title="Edit Artwork" width={760}>
        {editAw && <ArtworkForm initial={editAw} onSave={handleUpdate} onCancel={() => setEditAw(null)} loading={saving} />}
      </Modal>

      {/* delete Modal */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirm Delete" width={440}>
        {confirmDel && (
          <div>
            <p className="text-[#2E2E2E] mt-0 leading-relaxed text-[13px]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              Are you sure you want to permanently delete <strong className="text-[#4A3F35]">"{confirmDel.title}"</strong>? This will also remove all associated images and cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end mt-5">
              <Btn variant="ghost"  onClick={() => setConfirmDel(null)} disabled={deleting}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting}><FiTrash2 size={13} />{deleting ? 'Deleting…' : 'Delete Artwork'}</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Toast msg={toast.msg} type={toast.type} onDone={() => setToast({ msg: '', type: 'success' })} />
    </>
  );
};

export default ArtworkManagement;