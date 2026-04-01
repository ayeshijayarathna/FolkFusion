import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Search, ArrowRight,
  ChevronLeft, ChevronRight, X, AlertTriangle,
  Music4, Clock, RefreshCw, LayoutGrid, LayoutList
} from 'lucide-react';
import { eventAPI } from '../../../services/api';
import { PROVINCE_OPTIONS, EVENT_TYPE_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants';

/* helpers */
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatDateShort = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getMonth = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

const getDay = (date) =>
  new Date(date).getDate();

const STATUS_CLASSES = {
  upcoming:  { dot: 'bg-[#7A9E8E]', text: 'text-[#7A9E8E]', bg: 'bg-[#7A9E8E]/10', border: 'border-[#7A9E8E]/30' },
  ongoing:   { dot: 'bg-[#5F8B8C]', text: 'text-[#5F8B8C]', bg: 'bg-[#5F8B8C]/10', border: 'border-[#5F8B8C]/30' },
  completed: { dot: 'bg-[#C97B5A]', text: 'text-[#C97B5A]', bg: 'bg-[#C97B5A]/10', border: 'border-[#C97B5A]/25' },
  cancelled: { dot: 'bg-[#e05555]', text: 'text-[#c43a3a]', bg: 'bg-red-500/10',   border: 'border-red-500/25'   },
};

/* grid card */
const GridCard = ({ event }) => {
  const s = STATUS_CLASSES[event.status] || STATUS_CLASSES.completed;
  const registered = Array.isArray(event.participants)
    ? event.participants.filter(p => p.status === 'registered').length : 0;
  const fillPct = event.capacity > 0 ? Math.min(100, (registered / event.capacity) * 100) : 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#C97B5A]/12 shadow-[0_2px_12px_rgba(61,53,48,0.07)] hover:shadow-[0_20px_48px_rgba(61,53,48,0.14)] hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* image */}
      <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#7A9E8E]/20 to-[#C97B5A]/15">
        {event.coverImage?.url ? (
          <img
            src={event.coverImage.url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7A9E8E] to-[#C97B5A]">
            <Music4 size={48} className="text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1208]/65 via-transparent to-transparent" />

        {/* type badge */}
        <div className="absolute top-3 left-3">
          <span className="font-body text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4AF37]/90 text-[#3D2510]">
            {event.eventType}
          </span>
        </div>
        {/* fee */}
        <div className="absolute top-3 right-3">
          {event.fees?.amount > 0 ? (
            <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1e1208]/72 text-[#D4AF37] backdrop-blur-sm">
              LKR {event.fees.amount.toLocaleString()}
            </span>
          ) : (
            <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7A9E8E]/88 text-white">
              FREE
            </span>
          )}
        </div>
        {/* date badge on image */}
        <div className="absolute bottom-3 left-3">
          <p className="font-body text-[10px] uppercase tracking-widest font-medium mb-0.5 text-white/65">Starts</p>
          <p className="font-heading text-sm font-normal text-white drop-shadow-md">
            {formatDate(event.startDate)}
          </p>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-body border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
            {event.status}
          </span>
          {event.province && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium font-body bg-[#5F8B8C]/10 text-[#5F8B8C]">
              {event.province}
            </span>
          )}
        </div>

        <h3 className="font-heading font-normal text-base leading-snug mb-2 line-clamp-2 text-[#3D2510] group-hover:text-[#C97B5A] transition-colors duration-200">
          {event.title}
        </h3>
        <p className="font-body text-xs leading-relaxed mb-4 line-clamp-2 flex-1 text-[#2E2828]/60">
          {event.description}
        </p>

        <div className="space-y-1.5 mb-4">
          {event.location?.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="flex-shrink-0 text-[#5F8B8C]" />
              <span className="font-body text-xs truncate text-[#2E2828]/55">
                {event.location.venue}{event.location.district ? `, ${event.location.district}` : ''}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="flex-shrink-0 text-[#5F8B8C]" />
            <span className="font-body text-xs text-[#2E2828]/55">
              {formatDate(event.startDate)} — {formatDateShort(event.endDate)}
            </span>
          </div>
          {event.capacity > 0 && (
            <div className="flex items-center gap-1.5">
              <Users size={11} className="flex-shrink-0 text-[#5F8B8C]" />
              <span className="font-body text-xs text-[#2E2828]/55">
                {registered} / {event.capacity}
              </span>
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-[#7A9E8E]/18">
                <div
                  className="h-full rounded-full bg-[#7A9E8E] transition-all duration-500"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          )}
          {event.registrationDeadline && event.status === 'upcoming' && (
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="flex-shrink-0 text-[#D4998A]" />
              <span className="font-body text-[10px] font-semibold text-[#D4998A]">
                Reg. closes {formatDate(event.registrationDeadline)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#C97B5A]/10">
          <span className="font-body text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all text-[#C97B5A]">
            View Details <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ── List Row ── */
const ListRow = ({ event }) => {
  const s = STATUS_CLASSES[event.status] || STATUS_CLASSES.completed;
  const registered = Array.isArray(event.participants)
    ? event.participants.filter(p => p.status === 'registered').length : 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex items-stretch gap-0 rounded-2xl overflow-hidden bg-white border border-[#C97B5A]/12 shadow-[0_1px_8px_rgba(61,53,48,0.06)] hover:shadow-[0_8px_32px_rgba(61,53,48,0.13)] hover:translate-x-0.5 transition-all duration-200"
    >
      {/* Date column */}
      <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center py-5 bg-[#C97B5A]/[0.07] border-r border-[#C97B5A]/10">
        <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-[#C97B5A]">
          {getMonth(event.startDate)}
        </span>
        <span className="font-heading text-3xl font-normal leading-none mt-0.5 text-[#3D2510]">
          {getDay(event.startDate)}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="w-28 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-[#7A9E8E]/20 to-[#C97B5A]/15">
        {event.coverImage?.url ? (
          <img
            src={event.coverImage.url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7A9E8E] to-[#C97B5A]">
            <Music4 size={28} className="text-white/60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 py-4 justify-center min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#7a6010] border border-[#D4AF37]/30">
            {event.eventType}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full font-body border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {event.status}
          </span>
        </div>

        <h3 className="font-heading font-normal text-base leading-snug line-clamp-1 mb-1 text-[#3D2510] group-hover:text-[#C97B5A] transition-colors duration-200">
          {event.title}
        </h3>
        <p className="font-body text-xs line-clamp-1 mb-2 text-[#2E2828]/55">
          {event.description}
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          {event.location?.venue && (
            <span className="flex items-center gap-1 font-body text-[11px] text-[#2E2828]/50">
              <MapPin size={10} className="text-[#5F8B8C]" />
              {event.location.venue}{event.location.district ? `, ${event.location.district}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1 font-body text-[11px] text-[#2E2828]/50">
            <Calendar size={10} className="text-[#5F8B8C]" />
            {formatDate(event.startDate)} — {formatDateShort(event.endDate)}
          </span>
          {event.capacity > 0 && (
            <span className="flex items-center gap-1 font-body text-[11px] text-[#2E2828]/50">
              <Users size={10} className="text-[#5F8B8C]" />
              {registered}/{event.capacity}
            </span>
          )}
          {event.province && (
            <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-[#5F8B8C]/10 text-[#5F8B8C]">
              {event.province}
            </span>
          )}
        </div>
      </div>

      {/* right: fee + cta */}
      <div className="flex flex-col items-end justify-center gap-3 px-5 flex-shrink-0">
        {event.fees?.amount > 0 ? (
          <div className="text-right">
            <p className="font-body text-[10px] uppercase tracking-wider text-[#2E2828]/45">Fee</p>
            <p className="font-heading text-sm font-normal text-[#3D2510]">
              LKR {event.fees.amount.toLocaleString()}
            </p>
          </div>
        ) : (
          <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7A9E8E]/15 text-[#7A9E8E] border border-[#7A9E8E]/30">
            FREE
          </span>
        )}
        <span className="flex items-center gap-1 font-body text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all text-[#C97B5A]">
          Details <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
};

/* ── FilterSelect ── */
const FilterSelect = ({ value, onChange, options, emptyLabel }) => (
  <div className="relative">
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full appearance-none pl-4 pr-9 py-3 rounded-xl text-sm outline-none cursor-pointer font-body bg-white border-[1.5px] border-[#7A9E8E]/25 text-[#3D2510] focus:border-[#C97B5A] transition-colors"
    >
      {options.map(opt => (
        <option key={opt} value={opt === emptyLabel ? '' : opt}>{opt}</option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9E8E]">▾</span>
  </div>
);

/* ── Pagination ── */
const Pagination = ({ page, total, onChange }) => {
  if (total <= 1) return null;
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
    if (page < total - 2) pages.push('…');
    pages.push(total);
  }
  return (
    <div className="flex items-center gap-1.5 justify-center mt-12 flex-wrap">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 rounded-[10px] flex items-center justify-center border-[1.5px] border-[#C97B5A]/20 bg-white text-[#C97B5A] text-sm font-semibold hover:bg-[#C97B5A]/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`d${i}`} className="text-[#C97B5A] px-1">···</span>
          : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-semibold transition-all ${
                p === page
                  ? 'bg-gradient-to-br from-[#C97B5A] to-[#8b5e38] text-white scale-105 border-0'
                  : 'border-[1.5px] border-[#C97B5A]/20 bg-white text-[#C97B5A] hover:bg-[#C97B5A]/10'
              }`}
            >
              {p}
            </button>
          )
      )}
      <button
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 rounded-[10px] flex items-center justify-center border-[1.5px] border-[#C97B5A]/20 bg-white text-[#C97B5A] text-sm font-semibold hover:bg-[#C97B5A]/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonGrid = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse border border-[#C97B5A]/10">
    <div className="h-48 bg-[#7A9E8E]/12" />
    <div className="p-5 space-y-3">
      <div className="h-4 rounded-lg w-3/4 bg-[#7A9E8E]/12" />
      <div className="h-3 rounded-lg w-full bg-[#7A9E8E]/08" />
      <div className="h-3 rounded-lg w-2/3 bg-[#7A9E8E]/08" />
    </div>
  </div>
);

const SkeletonList = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse flex h-24 bg-white border border-[#C97B5A]/10">
    <div className="w-20 flex-shrink-0 bg-[#C97B5A]/[0.07]" />
    <div className="w-28 flex-shrink-0 bg-[#7A9E8E]/10" />
    <div className="flex-1 p-4 space-y-2">
      <div className="h-3 rounded w-1/3 bg-[#C97B5A]/10" />
      <div className="h-4 rounded w-2/3 bg-[#C97B5A]/08" />
      <div className="h-3 rounded w-1/2 bg-[#C97B5A]/06" />
    </div>
  </div>
);

/* ── Main ── */
const Events = () => {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters]   = useState({ province: '', eventType: '', status: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {
        page: pagination.currentPage, limit: 12, sort: 'startDate',
        ...(filters.province  ? { province:  filters.province  } : {}),
        ...(filters.eventType ? { eventType: filters.eventType } : {}),
        ...(filters.status    ? { status:    filters.status    } : {}),
        ...(search            ? { search }                       : {}),
      };
      const res = await eventAPI.getAll(params);
      if (res.data.success) {
        setEvents(res.data.data || []);
        setPagination(prev => ({ ...prev, totalPages: res.data.totalPages || 1, total: res.data.total || 0 }));
      } else setError('Failed to load events.');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, search, pagination.currentPage]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  const handlePageChange = (p) => {
    setPagination(prev => ({ ...prev, currentPage: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearFilters = () => {
    setFilters({ province: '', eventType: '', status: '' });
    setSearchInput(''); setSearch('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  const hasActiveFilters = filters.province || filters.eventType || filters.status || search;

  return (
    <div className="min-h-screen bg-[#F4EDE4]">

      {/*hero */}
      <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.04]"
          style={{ backgroundImage: 'url("/images/event.png")' }}
        />
     <div className="relative max-w-7xl mx-auto px-6 py-28 text-center z-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-14 bg-[#D4AF37]/70" />
            <span className="font-body text-[10px] uppercase tracking-[0.38em] font-semibold text-[#D4AF37]/90">
              Sri Lanka Folk Art
            </span>
            <div className="h-px w-14 bg-[#D4AF37]/70" />
          </div>

          <h1
            className="font-heading font-normal text-white mb-4 leading-tight drop-shadow-2xl"
            style={{ fontSize: 'clamp(2.6rem,8vw,5rem)', letterSpacing: '-0.02em' }}
          >
            Cultural Events
          </h1>

          <p className="font-body text-base max-w-xl mx-auto leading-relaxed text-[#C4917A] ">
            Discover workshops, exhibitions, festivals and cultural events
            celebrating Sri Lanka's living folk art traditions
          </p>
        </div>
      </section>

      {/* filter bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        <div className="rounded-2xl p-4 bg-white/[0.97] backdrop-blur-md shadow-[0_12px_40px_rgba(61,53,48,0.12)] border border-[#C97B5A]/14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* search */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A9E8E]" />
              <input
                type="text"
                placeholder="Search events…"
                value={searchInput}
                onChange={e => { setSearchInput(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); }}
                className="w-full pl-10 pr-9 py-3 rounded-xl text-sm outline-none font-body bg-[#fdf6ee]/80 border-[1.5px] border-[#7A9E8E]/22 text-[#3D2510] focus:border-[#C97B5A] transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A9E8E] hover:text-[#C97B5A] transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <FilterSelect
              value={filters.eventType || EVENT_TYPE_OPTIONS[0]}
              onChange={v => handleFilter('eventType', v === EVENT_TYPE_OPTIONS[0] ? '' : v)}
              options={EVENT_TYPE_OPTIONS}
              emptyLabel={EVENT_TYPE_OPTIONS[0]}
            />
            <FilterSelect
              value={filters.province || PROVINCE_OPTIONS[0]}
              onChange={v => handleFilter('province', v === PROVINCE_OPTIONS[0] ? '' : v)}
              options={PROVINCE_OPTIONS}
              emptyLabel={PROVINCE_OPTIONS[0]}
            />
            <FilterSelect
              value={filters.status || STATUS_OPTIONS[0]}
              onChange={v => handleFilter('status', v === STATUS_OPTIONS[0] ? '' : v)}
              options={STATUS_OPTIONS}
              emptyLabel={STATUS_OPTIONS[0]}
            />
          </div>
        </div>

        {/* active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="font-body text-xs font-medium text-[#C97B5A]">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-body bg-[#C97B5A]/12 text-[#C97B5A] border border-[#C97B5A]/25">
                "{search}"
                <button onClick={() => { setSearchInput(''); setSearch(''); }}><X size={10} /></button>
              </span>
            )}
            {filters.eventType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-body bg-[#7A9E8E]/15 text-[#4a7a55] border border-[#7A9E8E]/30">
                {filters.eventType}
                <button onClick={() => handleFilter('eventType', '')}><X size={10} /></button>
              </span>
            )}
            {filters.province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-body bg-[#5F8B8C]/12 text-[#2e6566] border border-[#5F8B8C]/25">
                {filters.province}
                <button onClick={() => handleFilter('province', '')}><X size={10} /></button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-body bg-[#C97B5A]/10 text-[#7a5230] border border-[#C97B5A]/20">
                {filters.status}
                <button onClick={() => handleFilter('status', '')}><X size={10} /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="font-body text-xs underline ml-1 text-[#C97B5A] opacity-70 hover:opacity-100 transition-opacity"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-24">

        {/* error */}
        {error && (
          <div className="text-center py-20">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 bg-red-500/[0.08] border-[1.5px] border-red-500/[0.18]">
              <AlertTriangle size={28} className="text-[#dc5032]" />
            </div>
            <h3 className="font-heading text-lg font-normal mb-2 text-[#3D2510]">{error}</h3>
            <button
              onClick={fetchEvents}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 mx-auto bg-gradient-to-br from-[#C97B5A] to-[#8b5e38] hover:opacity-90 transition-opacity font-body"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* skeleton */}
        {loading && !error && (
          viewMode === 'grid'
            ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonGrid key={i} />)}
              </div>
            : <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonList key={i} />)}
              </div>
        )}

        {/* empty */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-28">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl mx-auto mb-5 bg-gradient-to-br from-[#7A9E8E]/15 to-[#C97B5A]/10 border-[1.5px] border-[#C97B5A]/20">
              <Music4 size={36} className="text-[#C97B5A]" />
            </div>
            <h3 className="font-heading text-xl font-normal mb-2 text-[#3D2510]">No Events Found</h3>
            <p className="font-body text-sm mb-6 text-[#2E2828]/55">
              {hasActiveFilters ? 'No events match your current filters' : 'No events are currently published'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#C97B5A] to-[#8b5e38] hover:opacity-90 transition-opacity font-body"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* results */}
        {!loading && !error && events.length > 0 && (
          <>
            {/* toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="font-body text-sm text-[#C97B5A]">
                Showing{' '}
                <span className="font-semibold text-[#3D2510]">{events.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-[#3D2510]">{pagination.total.toLocaleString()}</span>
                {' '}events
              </p>

              {/* view toggle */}
              <div className="flex items-center rounded-xl overflow-hidden border border-[#C97B5A]/20 bg-white">
                {[
                  { mode: 'list', Icon: LayoutList, label: 'List' },
                  { mode: 'grid', Icon: LayoutGrid, label: 'Grid' },
                ].map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold font-body transition-all ${
                      viewMode === mode
                        ? 'bg-gradient-to-br from-[#C97B5A] to-[#8b5e38] text-white'
                        : 'bg-transparent text-[#C97B5A] hover:bg-[#C97B5A]/08'
                    }`}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="font-heading text-sm font-normal text-[#C97B5A]">
                {filters.status === 'completed' ? 'Previous Events' : 'Upcoming Events'}
              </span>
              <div className="flex-1 h-px bg-[#C97B5A]/18" />
              {pagination.totalPages > 1 && (
                <span className="font-body text-xs text-[#2E2828]/45">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>
              )}
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => <GridCard key={event._id} event={event} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => <ListRow key={event._id} event={event} />)}
              </div>
            )}

            <Pagination page={pagination.currentPage} total={pagination.totalPages} onChange={handlePageChange} />
          </>
        )}
      </section>
    </div>
  );
};

export default Events;