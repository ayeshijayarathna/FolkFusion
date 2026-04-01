import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiSearch, HiX, HiChevronLeft, HiChevronRight
} from 'react-icons/hi';
import { HiMapPin } from 'react-icons/hi2';
import { MdOutlineWorkspacePremium } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { HiEye } from 'react-icons/hi2';
import axios from 'axios';
import { PROVINCES, ART_CATEGORIES } from '../../../utils/constants';

/*constants */
const FALLBACK_AVATAR = '/images/avatar.jpg';

const Avatar = ({ artist, className = '', grayscale = false }) => {
  const src = artist.profileImage?.url || artist.profilePhoto || FALLBACK_AVATAR;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={artist.fullName}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
          grayscale ? 'grayscale group-hover:grayscale-0' : ''
        }`}
        onError={e => {
          if (e.currentTarget.src !== window.location.origin + FALLBACK_AVATAR)
            e.currentTarget.src = FALLBACK_AVATAR;
        }}
      />
    </div>
  );
};

/* Skeleton Card */
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-amber-100">
    <div className="h-56 bg-gradient-to-r from-[#F4EDE4] via-[#EDE4D9] to-[#F4EDE4] bg-[length:200%_100%] animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-4 rounded-lg w-3/4 bg-gradient-to-r from-[#F4EDE4] via-[#EDE4D9] to-[#F4EDE4] animate-pulse" />
      <div className="h-3 rounded-lg w-1/2 bg-gradient-to-r from-[#F4EDE4] via-[#EDE4D9] to-[#F4EDE4] animate-pulse" />
      <div className="h-8 rounded-full w-full bg-gradient-to-r from-[#F4EDE4] via-[#EDE4D9] to-[#F4EDE4] animate-pulse" />
    </div>
  </div>
);

/*featured section */
const CARDS_PER_PAGE = 4;

const FeaturedSection = ({ artists }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(artists.length / CARDS_PER_PAGE);
  const visible = artists.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  if (!artists.length) return null;

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-[#A67C52] text-sm italic tracking-widest mb-2"
            style={{ fontFamily: 'Libre Baskerville, serif' }}
          >
            ✦ Recognized Masters ✦
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#4A3F35] font-light tracking-wide"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            Featured Artists
          </h2>
        </div>

        {/* cards grid*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[380px]">
          {visible.map((artist, idx) => (
            <FeaturedCard
              key={artist._id}
              artist={artist}
              rank={page * CARDS_PER_PAGE + idx + 1}
            />
          ))}
          {visible.length < CARDS_PER_PAGE &&
            Array.from({ length: CARDS_PER_PAGE - visible.length }).map((_, i) => (
              <div key={`ghost-${i}`} />
            ))}
        </div>

        {/* navigation buttons */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-amber-100">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2
                border-[#A67C52]/40 text-[#A67C52] font-semibold text-sm tracking-wide
                hover:bg-[#4A3F35] hover:border-[#4A3F35] hover:text-[#F4EDE4]
                disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              <HiChevronLeft size={18} />
              Previous
            </button>

            <span
              className="text-sm text-[#A67C52] italic"
              style={{ fontFamily: 'Libre Baskerville, serif' }}
            >
              Showing {page * CARDS_PER_PAGE + 1}–
              {Math.min((page + 1) * CARDS_PER_PAGE, artists.length)} of {artists.length} artists
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2
                border-[#A67C52]/40 text-[#A67C52] font-semibold text-sm tracking-wide
                hover:bg-[#4A3F35] hover:border-[#4A3F35] hover:text-[#F4EDE4]
                disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next
              <HiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/*Single featured card */
const FeaturedCard = ({ artist, rank }) => (
  <Link
    to={`/artists/${artist._id}`}
    className="group flex flex-col items-center text-center bg-[#FDF8F3]
      rounded-3xl border border-amber-100 hover:border-[#A67C52]/50
      hover:-translate-y-2 hover:shadow-2xl transition-all duration-300
      overflow-hidden pb-7"
  >
    {/* ellipse portrait */}
    <div className="mt-7 mb-3 relative">
      <div
        className="w-36 h-44 overflow-hidden border-[3px] border-[#D4AF37] shadow-lg"
        style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
      >
        <Avatar artist={artist} className="w-full h-full" grayscale={false} />
      </div>

      {/* rank badge */}
      {artist.featuredRank && (
        <span
          className="absolute -top-1 -right-1 w-7 h-7 bg-[#D4AF37] text-[#4A3F35]
            rounded-full flex items-center justify-center text-[11px] font-bold
            border-2 border-white shadow"
        >
          #{artist.featuredRank}
        </span>
      )}

      {/* featured pill */}
      <span
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#4A3F35]
          text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase
          px-3 py-1 rounded-full whitespace-nowrap shadow"
      >
        Featured
      </span>
    </div>

    {/* info */}
    <div className="px-4 pt-5 flex flex-col items-center gap-1.5 flex-1 w-full">
      <h3
        className="text-base font-semibold text-[#4A3F35] leading-tight line-clamp-1
          group-hover:text-[#A67C52] transition-colors w-full"
        style={{ fontFamily: 'Libre Baskerville, serif' }}
      >
        {artist.fullName}
      </h3>

      {artist.specialization?.length > 0 && (
        <p className="text-[11px] text-[#5F8B8C] italic line-clamp-1">
          {artist.specialization.slice(0, 2).join(' · ')}
        </p>
      )}

      {artist.user?.province && (
        <div className="flex items-center gap-1 text-[11px] text-[#A67C52]">
          <HiMapPin size={11} className="text-[#5F8B8C]" />
          {artist.user.province}
        </div>
      )}

      {artist.yearsOfExperience > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-[#A67C52]">
          <MdOutlineWorkspacePremium size={12} className="text-[#5F8B8C]" />
          {artist.yearsOfExperience} yrs experience
        </div>
      )}

      {/* view Profile Button */}
      <div
        className="mt-3 flex items-center gap-1.5 bg-[#4A3F35]
          group-hover:bg-[#A67C52] text-[#F4EDE4] text-[11px] font-bold
          tracking-wider uppercase px-5 py-2.5 rounded-full transition-all duration-300"
      >
        View Profile
        <HiChevronRight size={13} />
      </div>
    </div>
  </Link>
);

/* Artist Card */
const ArtistCard = ({ artist, idx }) => (
  <Link
    to={`/artists/${artist._id}`}
    className="group bg-white rounded-3xl overflow-hidden border border-amber-100/80
      shadow-sm hover:border-[#A67C52]/40 hover:-translate-y-2 hover:shadow-xl
      flex flex-col transition-all duration-300"
    style={{ animationDelay: `${idx * 50}ms` }}
  >
    {/* Image — grayscale default, color on hover */}
    <div
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-[#F4EDE4]"
      style={{ height: 240 }}
    >
      <Avatar artist={artist} className="absolute inset-0" grayscale={true} />

      {/* Arch cutout */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 bg-white"
        style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#4A3F35]/0 group-hover:bg-[#4A3F35]/10 transition-all duration-300" />

      {/* Specialization tag */}
      {artist.specialization?.[0] && (
        <div className="absolute top-3 right-3">
          <span
            className="inline-block bg-white/90 backdrop-blur-sm text-[#4A3F35]
              text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#A67C52]/20"
          >
            {artist.specialization[0]}
          </span>
        </div>
      )}
    </div>

    {/* Card body */}
    <div className="px-5 pt-2 pb-5 flex-1 flex flex-col gap-1">
      <h3
        className="text-base font-semibold text-[#4A3F35] line-clamp-1
          group-hover:text-[#A67C52] transition-colors"
        style={{ fontFamily: 'Libre Baskerville, serif' }}
      >
        {artist.fullName}
      </h3>

      {artist.specialization?.length > 1 && (
        <p className="text-xs text-[#5F8B8C] line-clamp-1">
          {artist.specialization.slice(1, 3).join(' · ')}
          {artist.specialization.length > 3 ? ` +${artist.specialization.length - 3}` : ''}
        </p>
      )}

      {/* Meta */}
      <div
        className="flex items-center justify-between text-xs text-[#4A3F35]/50
          mt-1 pt-2 border-t border-amber-50"
      >
        {artist.user?.province && (
          <div className="flex items-center gap-1">
            <HiMapPin size={11} className="text-[#5F8B8C]" />
            <span>{artist.user.province}</span>
          </div>
        )}
        {artist.yearsOfExperience > 0 && (
          <div className="flex items-center gap-1">
            <MdOutlineWorkspacePremium size={11} className="text-[#5F8B8C]" />
            <span>{artist.yearsOfExperience}y exp</span>
          </div>
        )}
      </div>

      {artist.statistics?.totalArtworks > 0 && (
        <div className="flex items-center gap-1 text-[11px] text-[#A67C52]/70 pt-1">
          <HiEye size={11} className="text-[#5F8B8C]" />
          <span>{artist.statistics.totalArtworks} artworks</span>
        </div>
      )}

      {/* View Profile Button — always visible */}
      <div
        className="mt-auto pt-3 w-full flex items-center justify-center gap-2
          border-2 border-[#A67C52]/40 text-[#A67C52] group-hover:bg-[#4A3F35]
          group-hover:border-[#4A3F35] group-hover:text-[#F4EDE4]
          text-xs font-bold tracking-wider uppercase py-2.5 rounded-full
          transition-all duration-300"
      >
        View Profile
        <HiChevronRight size={13} />
      </div>
    </div>
  </Link>
);

/* ─────────────────────────────────────────
   Main Artists Page
   — All API calls / state / pagination logic
     identical to original — zero backend changes
───────────────────────────────────────── */
const Artists = () => {
  const [artists, setArtists]                 = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filters, setFilters]                 = useState({ province: '', specialization: '', search: '' });
  const [searchInput, setSearchInput]         = useState('');
  const [pagination, setPagination]           = useState({ currentPage: 1, totalPages: 1, total: 0 });

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage, limit: 12, sort: '-createdAt',
        ...(filters.province       && { province: filters.province }),
        ...(filters.specialization && { specialization: filters.specialization }),
        ...(filters.search         && { search: filters.search }),
      };
      const res = await axios.get('/api/artists', { params });
      if (res.data.success) {
        setArtists(res.data.data);
        setPagination(p => ({ ...p, totalPages: res.data.totalPages, total: res.data.total }));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [pagination.currentPage, filters]);

  const fetchFeaturedArtists = useCallback(async () => {
    try {
      const res = await axios.get('/api/artists', {
        params: { isFeatured: 'true', sort: 'featuredRank', limit: 10 },
      });
      if (res.data.success) setFeaturedArtists(res.data.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchArtists(); },         [fetchArtists]);
  useEffect(() => { fetchFeaturedArtists(); }, [fetchFeaturedArtists]);

  const handleFilterChange = (key, value) => {
    setFilters(p => ({ ...p, [key]: value }));
    setPagination(p => ({ ...p, currentPage: 1 }));
  };
  const handleSearch = e => { e?.preventDefault(); handleFilterChange('search', searchInput); };
  const clearFilters = () => {
    setFilters({ province: '', specialization: '', search: '' });
    setSearchInput('');
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const hasFilters = filters.province || filters.specialization || filters.search;
  const paginate   = p => setPagination(prev => ({ ...prev, currentPage: p }));

  const pageNumbers = () => {
    const { currentPage: cp, totalPages: tp } = pagination;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    const pages = [1];
    if (cp > 3) pages.push('…');
    const s = Math.max(2, cp - 1), e = Math.min(tp - 1, cp + 1);
    for (let i = s; i <= e; i++) pages.push(i);
    if (cp < tp - 2) pages.push('…');
    pages.push(tp);
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F4EDE4]">

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="bg-white relative overflow-hidden" style={{ minHeight: 520 }}>
        <div
          className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center"
          style={{ minHeight: 520 }}
        >
          <div className="py-20 pr-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-[#A67C52]/40" />
              <span
                className="text-[#A67C52] text-xs font-bold tracking-[0.25em] uppercase"
                style={{ fontFamily: 'Libre Baskerville, serif' }}
              >
                Sri Lankan Heritage
              </span>
            </div>

            <h1
              className="text-[#4A3F35] leading-[1.05] mb-5"
              style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Discover Sri Lankan<br />
              <span className="text-[#A67C52]">Folk Artists</span>
            </h1>

            <p
              className="text-[#4A3F35]/60 text-base leading-relaxed mb-8 max-w-sm"
              style={{ fontFamily: 'Libre Baskerville, serif' }}
            >
              Explore the rich cultural heritage of Sri Lankan folk artists and their
              traditional crafts passed down through generations.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex gap-0 bg-[#F4EDE4] rounded-2xl p-1.5 border border-[#A67C52]/20 max-w-sm"
            >
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search artists by name…"
                className="flex-1 bg-transparent border-none outline-none px-3 text-[#4A3F35]
                  placeholder:text-[#4A3F35]/40 text-sm"
                style={{ fontFamily: 'Libre Baskerville, serif' }}
              />
              <button
                type="submit"
                className="bg-[#4A3F35] hover:bg-[#A67C52] text-[#F4EDE4] rounded-xl
                  px-5 py-2 font-bold text-xs flex items-center gap-2 transition-all duration-300"
              >
                <HiSearch size={13} /> Search
              </button>
            </form>
          </div>
          <div className="hidden md:block" />
        </div>

        {/* Right image with arch mask */}
        <div className="hidden md:block absolute top-0 right-0 h-full w-1/2 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full w-24 bg-white z-10"
            style={{ clipPath: 'ellipse(100% 50% at 0% 50%)' }}
          />
          <img src="/images/arti.png" alt="Folk Artist" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#A67C52]/10 mix-blend-multiply" />
        </div>
      </section>

      {/* ════════════════════════════════
          STICKY FILTER BAR
      ════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <p className="text-[#4A3F35] text-sm" style={{ fontFamily: 'Libre Baskerville, serif' }}>
              {loading ? 'Loading…' : (
                <><span className="font-bold text-[#A67C52]">{pagination.total}</span> artists found</>
              )}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700
                  border border-red-200 rounded-full px-2.5 py-1 transition-colors"
              >
                <HiX size={11} /> Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.specialization}
              onChange={e => handleFilterChange('specialization', e.target.value)}
              className="text-sm border-2 border-[#A67C52]/25 rounded-xl px-3 py-2 outline-none
                bg-white text-[#4A3F35] cursor-pointer focus:border-[#5F8B8C] transition-colors"
              style={{ fontFamily: 'Libre Baskerville, serif' }}
            >
              <option value="">All Specializations</option>
              {ART_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filters.province}
              onChange={e => handleFilterChange('province', e.target.value)}
              className="text-sm border-2 border-[#A67C52]/25 rounded-xl px-3 py-2 outline-none
                bg-white text-[#4A3F35] cursor-pointer focus:border-[#5F8B8C] transition-colors"
              style={{ fontFamily: 'Libre Baskerville, serif' }}
            >
              <option value="">All Provinces</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="max-w-6xl mx-auto px-6 pb-2.5 flex gap-2 flex-wrap">
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 bg-[#5F8B8C]/10 text-[#5F8B8C]
                border border-[#5F8B8C]/25 px-3 py-1 rounded-full text-xs">
                <HiSearch size={10} /> "{filters.search}"
                <button
                  onClick={() => { handleFilterChange('search', ''); setSearchInput(''); }}
                  className="hover:text-red-500"
                >
                  <HiX size={10} />
                </button>
              </span>
            )}
            {filters.specialization && (
              <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 text-[#A67C52]
                border border-[#A67C52]/25 px-3 py-1 rounded-full text-xs">
                {filters.specialization}
                <button
                  onClick={() => handleFilterChange('specialization', '')}
                  className="hover:text-red-500"
                >
                  <HiX size={10} />
                </button>
              </span>
            )}
            {filters.province && (
              <span className="inline-flex items-center gap-1.5 bg-[#8DAA91]/15 text-[#4A3F35]
                border border-[#8DAA91]/35 px-3 py-1 rounded-full text-xs">
                <HiMapPin size={10} /> {filters.province}
                <button
                  onClick={() => handleFilterChange('province', '')}
                  className="hover:text-red-500"
                >
                  <HiX size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* featured artist */}
      {featuredArtists.length > 0 && <FeaturedSection artists={featuredArtists} />}

      {/* all registered artist */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">

          <div className="flex items-end gap-4 mb-10">
            <div>
              <p
                className="italic text-[#A67C52] text-base mb-1"
                style={{ fontFamily: 'Libre Baskerville, serif' }}
              >
                From across the island
              </p>
              <h2
                className="text-3xl text-[#4A3F35]"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                All Registered Artists
              </h2>
            </div>
            <div className="mb-1 h-px flex-1 bg-gradient-to-r from-[#A67C52]/30 to-transparent" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-24">
              <FiUsers size={64} className="mx-auto text-[#A67C52]/30 mb-6" />
              <h3
                className="text-2xl text-[#4A3F35] mb-2"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                No Artists Found
              </h3>
              <p
                className="text-[#A67C52] text-base italic mb-6"
                style={{ fontFamily: 'Libre Baskerville, serif' }}
              >
                Try adjusting your filters or search terms
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="bg-[#4A3F35] text-[#F4EDE4] px-6 py-3 rounded-xl font-bold
                    text-sm hover:bg-[#A67C52] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {artists.map((artist, idx) => (
                  <ArtistCard key={artist._id} artist={artist} idx={idx} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-14 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => paginate(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="w-10 h-10 rounded-xl border-2 border-[#A67C52]/25 flex items-center
                        justify-center text-[#A67C52] hover:bg-[#F4EDE4] hover:border-[#A67C52]
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <HiChevronLeft size={18} />
                    </button>

                    {pageNumbers().map((p, i) =>
                      p === '…' ? (
                        <span key={`e${i}`}
                          className="w-10 h-10 flex items-center justify-center text-[#A67C52]/50">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => paginate(p)}
                          className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${
                            pagination.currentPage === p
                              ? 'bg-[#A67C52] border-[#A67C52] text-white'
                              : 'border-[#A67C52]/25 text-[#A67C52] hover:bg-[#F4EDE4] hover:border-[#A67C52]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => paginate(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="w-10 h-10 rounded-xl border-2 border-[#A67C52]/25 flex items-center
                        justify-center text-[#A67C52] hover:bg-[#F4EDE4] hover:border-[#A67C52]
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <HiChevronRight size={18} />
                    </button>
                  </div>

                  <p className="text-sm text-[#A67C52]" style={{ fontFamily: 'Libre Baskerville, serif' }}>
                    Showing{' '}
                    <span className="font-bold">
                      {(pagination.currentPage - 1) * 12 + 1}–{Math.min(pagination.currentPage * 12, pagination.total)}
                    </span>
                    {' '}of <span className="font-bold">{pagination.total}</span> artists
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Artists;