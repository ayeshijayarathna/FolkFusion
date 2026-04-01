import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  LayoutGrid, List, Palette, ArrowRight, Clock, Star, AlertTriangle, SearchX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistoricalPlaces } from '../../../hooks/useHistoricalPlaces';
import { PROVINCE_OPTIONS, ART_CATEGORIES } from '../../../utils/constants';

const ITEMS_PER_PAGE = 12;
const ART_FORM_OPTIONS = ['All Art Forms', ...ART_CATEGORIES];

const HistoricalPlaces = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedProvince, setSelectedProvince] = useState(PROVINCE_OPTIONS[0]);
  const [selectedArtForm, setSelectedArtForm]   = useState(ART_FORM_OPTIONS[0]);
  const [currentPage, setCurrentPage]           = useState(1);
  const [viewMode, setViewMode]                 = useState('grid');
  const [jumpValue, setJumpValue]               = useState('1');
  const [headerLoaded, setHeaderLoaded]         = useState(false);

  const { places, loading, error, pagination } = useHistoricalPlaces({
    search:   searchQuery,
    province: selectedProvince === PROVINCE_OPTIONS[0] ? '' : selectedProvince,
    artType:  selectedArtForm  === ART_FORM_OPTIONS[0] ? '' : selectedArtForm,
    page:     currentPage,
    limit:    ITEMS_PER_PAGE,
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedProvince, selectedArtForm]);
  useEffect(() => { setJumpValue(String(currentPage)); }, [currentPage]);
  useEffect(() => { const t = setTimeout(() => setHeaderLoaded(true), 100); return () => clearTimeout(t); }, []);

  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || 0) / ITEMS_PER_PAGE) || 1;
  const totalItems = pagination?.total || places.length;
  const handlePlaceClick = (placeId) => navigate(`/historical-places/${placeId}`);

  const getPageNumbers = useCallback(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const delta = 2, range = [], rangeWithDots = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) range.push(i);
    if (currentPage - delta > 2) rangeWithDots.push(1, '...'); else rangeWithDots.push(1);
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1) rangeWithDots.push('...', totalPages);
    else if (totalPages > 1) rangeWithDots.push(totalPages);
    return rangeWithDots;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAll = () => {
    setSearchQuery('');
    setSelectedProvince(PROVINCE_OPTIONS[0]);
    setSelectedArtForm(ART_FORM_OPTIONS[0]);
  };

  const fade = (delay) => ({
    opacity: headerLoaded ? 1 : 0,
    transform: headerLoaded ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
  });

  const PaginationBar = () => (
    <div className="flex flex-col items-center gap-4 mt-10 pb-16">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {[
          { icon: <ChevronsLeft size={16}/>, action: () => goToPage(1),               disabled: currentPage === 1 },
          { icon: <ChevronLeft  size={16}/>, action: () => goToPage(currentPage - 1), disabled: currentPage === 1 },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} disabled={btn.disabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#C97B5A]">
            {btn.icon}
          </button>
        ))}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`d${idx}`} className="w-9 h-9 flex items-center justify-center font-body text-sm text-[#C97B5A]">···</span>
          ) : (
            <button key={page} onClick={() => goToPage(page)}
              className={`font-body min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-all ${
                currentPage === page 
                  ? 'bg-[#C97B5A] text-[#FDF6EE] shadow-[0_4px_12px_rgba(201,123,90,0.35)]'
                  : 'bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#6B5A50]'
              }`}>
              {Number(page).toLocaleString()}
            </button>
          )
        )}
        {[
          { icon: <ChevronRight  size={16}/>, action: () => goToPage(currentPage + 1), disabled: currentPage === totalPages },
          { icon: <ChevronsRight size={16}/>, action: () => goToPage(totalPages),       disabled: currentPage === totalPages },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action} disabled={btn.disabled}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#C97B5A]">
            {btn.icon}
          </button>
        ))}
      </div>
      {totalPages > 10 && (
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/20 shadow-[0_2px_8px_rgba(61,53,48,0.06)]">
          <span className="font-body text-xs text-[#9A8A80]">Go to page</span>
          <input type="number" min={1} max={totalPages} value={jumpValue}
            onChange={e => setJumpValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(jumpValue); if (!isNaN(v)) goToPage(v); } }}
            onBlur={() => { const v = parseInt(jumpValue); if (!isNaN(v) && v !== currentPage) goToPage(v); }}
            className="font-body w-20 text-center text-sm font-bold rounded-lg py-1.5 outline-none border-[1.5px] border-[#C97B5A]/30 text-[#3D3530] bg-[#FAF7F2]"
          />
          <span className="font-body text-xs text-[#9A8A80]">of {totalPages.toLocaleString()}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* header */}
      <section 
        className="relative py-28 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/history.png')" }}
      >

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center">

            {/* badge */}
            <div className="flex items-center justify-center gap-3 mb-6" style={fade(0.1)}>
              <div className="w-10 h-[1px] bg-[#C97B5A]/40"/>
              <span className="font-body text-[10px] tracking-[0.26em] uppercase text-[#C97B5A]">
                Sri Lankan Heritage
              </span>
              <div className="w-10 h-[1px] bg-[#C97B5A]/40"/>
            </div>

            {/* heading */}
            <h1 className="font-heading font-normal text-[clamp(2.2rem,5vw,3.8rem)] text-[#3D3530] leading-[1.15] mb-5" style={fade(0.25)}>
              Historical{' '}
              <span className="text-[#C97B5A] italic">Places</span>
            </h1>

            {/* Ornamental divider */}
            <div className="flex items-center justify-center gap-3 mb-6" style={fade(0.38)}>
              <div className="w-[50px] h-[1px] bg-[#C97B5A]/35"/>
              <div className="w-[5px] h-[5px] rounded-full bg-[#C97B5A]/55"/>
              <div className="w-4 h-[1px] bg-[#C97B5A]/20"/>
              <div className="w-[5px] h-[5px] rounded-full bg-[#C97B5A]/55"/>
              <div className="w-[50px] h-[1px] bg-[#C97B5A]/35"/>
            </div>

            <p className="font-body mx-auto mb-10 text-[0.9rem] leading-[1.85] text-[#3D3530]/65 max-w-[480px]" style={fade(0.45)}>
              Discover sacred locations and villages famous for traditional folk arts
              across Sri Lanka's nine provinces
            </p>

            {/* Filter Bar */}
            <div style={fade(0.55)}>
              <div className="rounded-2xl shadow-xl p-4 mx-auto bg-[#FDF6EE]/95 backdrop-blur-sm border border-[#C97B5A]/18 max-w-[860px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C97B5A]" size={15}/>
                    <input
                      type="text" placeholder="Search places…" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="font-body w-full pl-9 pr-4 py-2.5 text-sm outline-none transition-all bg-[#FAF7F2] border-[1.5px] border-[#C97B5A]/22 rounded-[10px] text-[#3D3530] focus:border-[#C97B5A]"
                    />
                  </div>

                  {/* Art form */}
                  <select value={selectedArtForm} onChange={e => setSelectedArtForm(e.target.value)}
                    className="font-body px-3 py-2.5 text-sm outline-none transition-all bg-[#FAF7F2] border-[1.5px] border-[#C97B5A]/22 rounded-[10px] text-[#3D3530] appearance-none focus:border-[#C97B5A]">
                    {ART_FORM_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>

                  {/* Province */}
                  <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}
                    className="font-body px-3 py-2.5 text-sm outline-none transition-all bg-[#FAF7F2] border-[1.5px] border-[#C97B5A]/22 rounded-[10px] text-[#3D3530] appearance-none focus:border-[#C97B5A]">
                    {PROVINCE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>

                  {/* View toggle */}
                  <div className="flex rounded-xl overflow-hidden border-[1.5px] border-[#C97B5A]/22">
                    {[
                      { mode: 'grid', icon: <LayoutGrid size={15}/>, label: 'Grid' },
                      { mode: 'list', icon: <List size={15}/>,        label: 'List' },
                    ].map(v => (
                      <button key={v.mode} onClick={() => setViewMode(v.mode)}
                        className={`font-body flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
                          viewMode === v.mode ? 'bg-[#C97B5A] text-[#FDF6EE]' : 'bg-[#FAF7F2] text-[#9A8A80]'
                        }`}>
                        {v.icon} <span className="hidden sm:inline">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Result count */}
      {!loading && !error && places.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-6 mb-2 flex items-center justify-between">
          <p className="font-body text-sm text-[#9A8A80]">
            Showing{' '}
            <span className="font-semibold text-[#3D3530]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span>
            {' '}of{' '}
            <span className="font-semibold text-[#3D3530]">{totalItems.toLocaleString()}</span> places
          </p>
          {totalPages > 1 && (
            <p className="font-body text-sm text-[#9A8A80]">
              Page <span className="font-semibold text-[#3D3530]">{currentPage}</span> / <span className="font-semibold text-[#3D3530]">{totalPages}</span>
            </p>
          )}
        </div>
      )}

      {/* loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#C97B5A]/12"/>
            <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-[#C97B5A]"/>
          </div>
          <p className="font-body mt-4 text-sm text-[#C4917A]">Loading historical places…</p>
        </div>
      )}

      {/* error */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="rounded-2xl p-10 text-center bg-red-50 border-[1.5px] border-red-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4 mx-auto">
              <AlertTriangle size={32} className="text-red-500"/>
            </div>
            <h3 className="font-heading text-xl mb-1 text-red-900">Could not load places</h3>
            <p className="font-body text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && viewMode === 'grid' && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-5">
            {places.map((place, index) => (
              <PlaceCard key={place._id} place={place} index={index} onClick={() => handlePlaceClick(place._id)}/>
            ))}
          </div>
          {places.length === 0 && <EmptyState onClear={clearAll}/>}
          {totalPages > 1 && <PaginationBar/>}
        </div>
      )}

      {/* list view */}
      {!loading && !error && viewMode === 'list' && (
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          {places.map(place => (
            <PlaceListRow key={place._id} place={place} onClick={() => handlePlaceClick(place._id)}/>
          ))}
          {places.length === 0 && <EmptyState onClear={clearAll}/>}
          {totalPages > 1 && <PaginationBar/>}
        </div>
      )}
    </div>
  );
};

/* grid card*/
const PlaceCard = ({ place, onClick, index = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const imageRight = index % 2 !== 0; 

  const ImageBlock = (
    <div className="relative overflow-hidden w-72 flex-shrink-0 h-52">
      <img
        src={place.images?.[0] || '/images/placeholder.jpg'}
        alt={place.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={e => { e.target.src = '/images/placeholder.jpg'; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3D3530]/50 via-transparent to-transparent" />
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C97B5A]/90 backdrop-blur-sm text-[#FDF6EE]">
          <MapPin size={11}/>
          <span className="font-body text-[10px] font-semibold">{place.province}</span>
        </div>
        {place.artType && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7A9E8E]/90 backdrop-blur-sm text-[#FDF6EE]">
            <Palette size={11}/>
            <span className="font-body text-[10px] font-semibold">{place.artType}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ContentBlock = (
    <div className="flex-1 px-8 py-6 flex flex-col justify-between bg-[#FDF6EE] min-w-0">
      <div>
        <h3 className="font-heading text-xl text-[#3D3530] mb-2 leading-tight group-hover:text-[#C97B5A] transition-colors duration-300 truncate">
          {place.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={13} className="text-[#C4917A] flex-shrink-0"/>
          <span className="font-body text-sm text-[#9A8A80]">
            {[place.city, place.district].filter(Boolean).join(', ') || place.location}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-[1px] bg-[#C97B5A]/30"/>
          <div className="w-1 h-1 rounded-full bg-[#C97B5A]/50"/>
          <div className="w-4 h-[1px] bg-[#C97B5A]/20"/>
        </div>
        <p className="font-body text-sm leading-relaxed text-[#3D3530]/70 line-clamp-2">
          {place.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#C97B5A]/10">
        <div className="flex flex-wrap gap-1.5">
          {place.facilities?.slice(0, 3).map((facility, idx) => (
            <span key={idx} className="font-body text-xs px-2.5 py-0.5 rounded-full bg-[#7A9E8E]/10 text-[#5F8B8C] border border-[#7A9E8E]/20">
              {facility}
            </span>
          ))}
          {place.facilities?.length > 3 && (
            <span className="font-body text-xs px-2 py-0.5 text-[#9A8A80]">+{place.facilities.length - 3}</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="font-body text-xs uppercase tracking-wider text-[#9A8A80] hidden sm:block">Explore</span>
          <div className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#C97B5A] text-[#FDF6EE] transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`}>
            <ArrowRight size={16}/>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-[#FDF6EE] shadow-[0_4px_24px_rgba(61,53,48,0.08)] hover:shadow-[0_12px_48px_rgba(61,53,48,0.15)] transition-all duration-500 hover:-translate-y-1 w-full"
    >
      <div className="flex flex-row">
        {imageRight ? <>{ContentBlock}{ImageBlock}</> : <>{ImageBlock}{ContentBlock}</>}
      </div>
    </article>
  );
};

/*list row*/
const PlaceListRow = ({ place, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer rounded-2xl overflow-hidden flex bg-[#FDF6EE] shadow-[0_2px_12px_rgba(61,53,48,0.05)] hover:shadow-[0_8px_32px_rgba(61,53,48,0.12)] border border-[#C97B5A]/10 hover:border-[#C97B5A]/28 transition-all duration-300 hover:translate-x-1"
    >
      <div className="relative w-44 flex-shrink-0 overflow-hidden">
        <img
          src={place.images?.[0] || '/images/placeholder.jpg'} alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { e.target.src = '/images/placeholder.jpg'; }}
        />
        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${hovered ? 'bg-gradient-to-b from-[#C97B5A] to-[#C4917A]' : 'bg-transparent'}`}/>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className={`font-heading font-normal text-base leading-tight truncate transition-colors duration-200 ${hovered ? 'text-[#C97B5A]' : 'text-[#3D3530]'}`}>
              {place.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {place.artType && (
                <span className="font-body text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-[#7A9E8E]/12 text-[#5F8B8C]">
                  <Palette size={9}/>{place.artType}
                </span>
              )}
              <span className="font-body text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C97B5A]/10 text-[#C97B5A]">
                {place.province}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <MapPin size={11} className="text-[#C4917A]"/>
            <span className="font-body text-xs text-[#9A8A80]">
              {[place.city, place.district].filter(Boolean).join(', ') || place.location}
            </span>
          </div>
          <p className="font-body text-sm leading-relaxed line-clamp-2 text-[#3D3530]/58">
            {place.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#C97B5A]/10">
          <div className="flex gap-1.5 flex-wrap">
            {place.facilities?.slice(0, 3).map(f => (
              <span key={f} className="font-body text-xs px-2 py-0.5 rounded-full bg-[#7A9E8E]/10 text-[#5F8B8C] border border-[#7A9E8E]/18">
                {f}
              </span>
            ))}
          </div>
          <ArrowRight size={14} className={`text-[#C97B5A] flex-shrink-0 transition-transform duration-200 ${hovered ? 'translate-x-1' : ''}`}/>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ onClear }) => (
  <div className="text-center py-24">
    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#C97B5A]/10 mb-5 mx-auto">
      <SearchX size={36} className="text-[#C97B5A]"/>
    </div>
    <h3 className="font-heading text-2xl mb-2 font-normal text-[#3D3530]">No places found</h3>
    <p className="font-body text-sm mb-6 text-[#9A8A80]">Try adjusting your search or filters</p>
    <button onClick={onClear}
      className="font-body px-7 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 bg-[#C97B5A] text-[#FDF6EE] shadow-[0_4px_14px_rgba(201,123,90,0.3)]">
      Clear All Filters
    </button>
  </div>
);

export default HistoricalPlaces;