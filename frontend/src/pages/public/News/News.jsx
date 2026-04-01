import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { newsAPI } from '../../../services/api';
import { PROVINCE_OPTIONS } from '../../../utils/constants';

const NEWS_CATEGORIES = ['All', 'Training Program', 'Exhibition', 'Achievement', 'Technology', 'Workshop', 'Festival', 'Announcement', 'Other'];

const CATEGORY_CLASSES = {
  'Training Program': { bg: 'bg-[#5F8B8C]/12', text: 'text-[#2e6566]', border: 'border-[#5F8B8C]/30' },
  'Exhibition':       { bg: 'bg-[#A67C52]/12', text: 'text-[#7a5230]', border: 'border-[#A67C52]/30' },
  'Achievement':      { bg: 'bg-[#D4AF37]/15', text: 'text-[#7a6010]', border: 'border-[#D4AF37]/35' },
  'Technology':       { bg: 'bg-[#4A3F35]/10', text: 'text-[#4A3F35]', border: 'border-[#4A3F35]/25' },
  'Workshop':         { bg: 'bg-[#8DAA91]/15', text: 'text-[#4a7a55]', border: 'border-[#8DAA91]/30'  },
  'Festival':         { bg: 'bg-[#C48A6A]/15', text: 'text-[#8b4a1e]', border: 'border-[#C48A6A]/30' },
  'Announcement':     { bg: 'bg-[#5F8B8C]/10', text: 'text-[#2e6566]', border: 'border-[#5F8B8C]/25' },
  'Other':            { bg: 'bg-[#4A3F35]/08', text: 'text-[#6b5a4e]', border: 'border-[#4A3F35]/20'  },
};

const getCatClasses = (cat) => CATEGORY_CLASSES[cat] || CATEGORY_CLASSES['Other'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── News Card ── */
const NewsCard = ({ item, index }) => {
  const cs = getCatClasses(item.category);
  const isFeature = index === 0;

  return (
    <Link
      to={`/news/${item._id}`}
      className={`group relative bg-white overflow-hidden flex flex-col rounded-[18px] shadow-[0_2px_14px_rgba(74,63,53,0.07)] border border-[#A67C52]/11 hover:-translate-y-1.5 hover:shadow-[0_22px_52px_rgba(74,63,53,0.15)] transition-all duration-300 ${isFeature ? 'md:col-span-2 md:flex-row' : ''}`}
    >
      {/* image */}
      <div className={`relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#A67C52] to-[#C48A6A] ${isFeature ? 'md:w-[52%] h-60 md:h-auto' : 'h-48'}`}>
        <img
          src={item.images?.[0] || '/images/placeholder.jpg'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140a04]/65 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/88 ${cs.text} ${cs.border}`}>
            {item.category}
          </span>
          {item.isFeatured && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] text-[#78350F] border border-[#D4AF37]/40 shadow-[0_2px_8px_rgba(212,175,55,0.3)] backdrop-blur-sm">
              ⭐ Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <Clock size={11} className="text-white/70" />
          <span className="text-[11px] font-medium text-white/75 drop-shadow-md">
            {formatDate(item.date)}
          </span>
        </div>
      </div>

      {/* body */}
      <div className={`flex flex-col flex-1 ${isFeature ? 'p-7' : 'p-5'}`}>
        <div className="w-10 h-0.5 mb-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#A67C52]" />

        <h3 className={`font-bold text-[#4A3F35] leading-snug mb-2.5 line-clamp-2 group-hover:text-[#A67C52] transition-colors duration-200 ${isFeature ? 'text-[18px]' : 'text-[14px]'}`}>
          {item.title}
        </h3>

        <p className={`text-[#2E2E2E]/58 leading-relaxed flex-1 ${isFeature ? 'text-sm line-clamp-4' : 'text-xs line-clamp-3'}`}>
          {item.excerpt}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-dashed border-[#A67C52]/18">
          <div className="flex items-center gap-3">
            {item.location && (
              <div className="flex items-center gap-1 text-xs text-[#A67C52]">
                <MapPin size={11} />
                <span className="font-medium">{item.location}</span>
              </div>
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all text-[#5F8B8C]">
            Read More <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

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
        className="w-9 h-9 rounded-[10px] flex items-center justify-center border-[1.5px] border-[#A67C52]/22 bg-white text-[#A67C52] text-sm font-bold hover:bg-[#A67C52]/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`d${i}`} className="text-[#A67C52] px-1">···</span>
          : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold transition-all ${
                p === page
                  ? 'bg-gradient-to-br from-[#A67C52] to-[#8b5e38] text-white scale-105 border-0'
                  : 'border-[1.5px] border-[#A67C52]/22 bg-white text-[#A67C52] hover:bg-[#A67C52]/10'
              }`}
            >
              {p}
            </button>
          )
      )}
      <button
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 rounded-[10px] flex items-center justify-center border-[1.5px] border-[#A67C52]/22 bg-white text-[#A67C52] text-sm font-bold hover:bg-[#A67C52]/10 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ── Main ── */
const News = () => {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', province: '', search: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { fetchNews(); }, [filters, pagination.currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage, limit: 9,
        ...(filters.category && filters.category !== 'All'           && { category: filters.category }),
        ...(filters.province && filters.province !== 'All Provinces' && { province: filters.province }),
        ...(filters.search   && { search: filters.search }),
      };
      const res = await newsAPI.getAll(params);
      if (res.data.success) {
        setNews(res.data.data);
        setPagination({ currentPage: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    handleFilter('category', cat === 'All' ? '' : cat);
  };

  const goToPage = (p) => {
    setPagination(prev => ({ ...prev, currentPage: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EDE4] to-[#ede2d5]">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 400 }}>
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.04]"
          style={{ backgroundImage: "url('/images/news.png')" }}
        />

        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#5F8B8C] via-[#D4AF37] to-[#A67C52]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-0.5 rounded-full bg-[#2E2E2E]" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#2E2E2E]">
                Folk Art Chronicle
              </span>
            </div>
            <h1
              className="font-bold text-white mb-4 leading-none"
              style={{ fontSize: 'clamp(2.4rem,7vw,4.5rem)', letterSpacing: '-0.025em' }}
            >
              Latest News<br />
              <span className="text-[#78350F]">&amp; Updates</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-[#2E2E2E] max-w-[440px]">
              Stay informed about achievements, workshops, exhibitions and cultural milestones in Sri Lankan folk art
            </p>
          </div>
        </div>
      </section>

      {/* ── Category + Filter bar ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-7 relative z-20">
        <div className="rounded-2xl p-4 bg-white/[0.97] backdrop-blur-md shadow-[0_16px_48px_rgba(74,63,53,0.13)] border border-[#A67C52]/15">

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* category pills */}
            <div className="flex flex-wrap gap-1.5">
              {NEWS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-gradient-to-br from-[#A67C52] to-[#8b5e38] text-white shadow-[0_3px_10px_rgba(166,124,82,0.32)] scale-[1.04]'
                      : 'bg-[#F4EDE4] text-[#7a6054] border-[1.5px] border-[#A67C52]/20 hover:bg-[#A67C52]/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={filters.search}
                  onChange={e => handleFilter('search', e.target.value)}
                  className="pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none w-44 bg-[#F4EDE4] border-[1.5px] border-[#8DAA91]/25 text-[#4A3F35] focus:border-[#A67C52] transition-colors"
                />
              </div>

              {/* province filter */}
              <div className="relative">
                <select
                  value={filters.province}
                  onChange={e => handleFilter('province', e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2.5 rounded-xl text-xs font-medium outline-none cursor-pointer bg-[#F4EDE4] border-[1.5px] border-[#8DAA91]/25 text-[#4A3F35] focus:border-[#A67C52] transition-colors"
                >
                  {PROVINCE_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8DAA91] text-[10px]">▾</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-10 pb-20">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-[#A67C52]/12" />
              <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-[#A67C52]" />
            </div>
            <p className="text-sm font-medium text-[#A67C52]">Loading news…</p>
          </div>

        ) : news.length === 0 ? (
          <div className="text-center py-28">
            <div className="text-7xl mb-5"></div>
            <h3 className="text-xl font-bold mb-2 text-[#4A3F35]">No News Found</h3>
            <p className="text-sm text-[#2E2E2E]/55">Try adjusting your filters or search terms</p>
            <button
              onClick={() => { setActiveCategory('All'); setFilters({ category: '', province: '', search: '' }); }}
              className="mt-5 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-[#A67C52] to-[#8b5e38] shadow-[0_4px_14px_rgba(166,124,82,0.3)] hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>

        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#A67C52]">
                Showing{' '}
                <span className="font-bold text-[#4A3F35]">{news.length}</span>
                {' '}of{' '}
                <span className="font-bold text-[#4A3F35]">{pagination.total.toLocaleString()}</span>
                {' '}articles
              </p>
              {pagination.totalPages > 1 && (
                <p className="text-sm text-[#A67C52]">
                  Page{' '}
                  <span className="font-bold text-[#4A3F35]">{pagination.currentPage}</span>
                  {' '}/ <span className="font-bold text-[#4A3F35]">{pagination.totalPages}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map((item, idx) => (
                <NewsCard key={item._id} item={item} index={idx} />
              ))}
            </div>

            <Pagination page={pagination.currentPage} total={pagination.totalPages} onChange={goToPage} />
          </>
        )}
      </section>
    </div>
  );
};

export default News;