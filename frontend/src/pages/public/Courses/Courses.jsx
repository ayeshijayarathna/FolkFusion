import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Search, MapPin, Users, Clock,
  Calendar, Star, ChevronRight, ArrowRight,
  GraduationCap, Layers, Filter
} from 'lucide-react';
import { courseAPI } from '../../../services/api';
import { PROVINCES, ART_CATEGORIES } from '../../../utils/constants';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [headerLoaded, setHeaderLoaded] = useState(false);
  const [filters, setFilters] = useState({ province: '', artForm: '', level: '', search: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  const provinces = ['All Provinces', ...PROVINCES];
  const artForms  = ['All Art Forms', ...ART_CATEGORIES];
  const levels    = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => { const t = setTimeout(() => setHeaderLoaded(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => { fetchCourses(); }, [filters, pagination.currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.currentPage, limit: 12 });
      if (filters.province && filters.province !== 'All Provinces') params.append('province', filters.province);
      if (filters.artForm  && filters.artForm  !== 'All Art Forms')  params.append('artForm',  filters.artForm);
      if (filters.level    && filters.level    !== 'All Levels')     params.append('level',    filters.level);
      if (filters.search) params.append('search', filters.search);
      const response = await courseAPI.getCourses(params.toString());
      if (response.data.success) {
        setCourses(response.data.data);
        setPagination({
          currentPage: response.data.page   || 1,
          totalPages:  response.data.pages  || 1,
          total:       response.data.total  || response.data.count || 0,
        });
      }
    } catch (error) { console.error('Error fetching courses:', error); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusCls = (status) => ({
    active:    'bg-[#7A9E8E]/80 text-[#FDF6EE]',
    upcoming:  'bg-[#5F8B8C]/80 text-[#FDF6EE]',
    ongoing:   'bg-[#C97B5A]/80 text-[#FDF6EE]',
    completed: 'bg-[#3D3530]/60 text-[#FDF6EE]',
  }[status] || 'bg-[#9A8A80]/60 text-[#FDF6EE]');

  const fade = (delay) => ({
    opacity:   headerLoaded ? 1 : 0,
    transform: headerLoaded ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* header */}
      <section
        className="relative py-36 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/courses.png')" }}
      >
        {/* left accent bar */}
        <div className="absolute left-0 top-16 bottom-16 w-[3px] bg-gradient-to-b from-transparent via-[#C97B5A] to-transparent opacity-70" />

        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <div className="max-w-lg">

            {/* eyebrow */}
            <div className="flex items-center gap-3 mb-7" style={fade(0.1)}>
              <div className="w-8 h-px bg-[#C97B5A]" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[#C97B5A]">
                Learning &amp; Craft
              </span>
            </div>

            {/* headline */}
            <h1
              className="font-heading font-normal text-[clamp(2.4rem,5.5vw,4.2rem)] text-[#FDF6EE] leading-[1.08] mb-6"
              style={fade(0.25)}
            >
              Traditional Art<br/>
              <span className="text-[#C97B5A] italic">Courses</span>
            </h1>

            {/* divider */}
            <div className="flex items-center gap-3 mb-7" style={fade(0.38)}>
              <div className="w-12 h-px bg-[#C97B5A]/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C97B5A]/70" />
              <div className="w-5 h-px bg-[#C97B5A]/30" />
            </div>

            <p className="font-body text-[0.92rem] leading-[1.9] text-[#3D3530]/65 mb-10 max-w-md" style={fade(0.45)}>
              Learn from master craftsmen and preserve Sri Lanka's rich cultural
              heritage through hands-on training programs.
            </p>

            {/* mini stat strip */}
            <div className="flex items-center gap-8" style={fade(0.55)}>
              {[
                { icon: <GraduationCap size={15}/>, label: 'Expert Instructors' },
                { icon: <Layers size={15}/>,        label: 'Multiple Art Forms' },
                { icon: <MapPin size={15}/>,        label: '9 Provinces'        },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-[#3D3530]/65">
                  <span className="text-[#C97B5A]">{s.icon}</span>
                  <span className="font-body text-xs tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 34C1200 36 1320 34 1380 33L1440 32V60H0Z" fill="#FAF7F2"/>
          </svg>
        </div>
      </section>

      {/* filter bar */}
      <div className="max-w-6xl mx-auto px-6 -mt-5 relative z-20 mb-10">
        <div className="bg-[#FDF6EE]/96 backdrop-blur-sm border border-[#C97B5A]/15 rounded-2xl shadow-[0_8px_40px_rgba(61,53,48,0.10)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            {/* search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C97B5A]" size={14}/>
              <input
                type="text" placeholder="Search courses…" value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                className="font-body w-full pl-9 pr-4 py-2.5 text-sm outline-none bg-[#FAF7F2] border-[1.5px] border-[#C97B5A]/20 rounded-xl text-[#3D3530] focus:border-[#C97B5A] transition-colors"
              />
            </div>

            {[
              { key: 'artForm',  options: artForms  },
              { key: 'province', options: provinces  },
              { key: 'level',    options: levels     },
            ].map(f => (
              <select
                key={f.key}
                value={filters[f.key]}
                onChange={e => handleFilterChange(f.key, e.target.value)}
                className="font-body px-3 py-2.5 text-sm outline-none bg-[#FAF7F2] border-[1.5px] border-[#C97B5A]/20 rounded-xl text-[#3D3530] appearance-none focus:border-[#C97B5A] transition-colors"
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-[#C97B5A]/12"/>
                <div className="absolute inset-0 rounded-full animate-spin border-2 border-transparent border-t-[#C97B5A]"/>
              </div>
              <p className="font-body mt-4 text-sm text-[#C4917A]">Loading courses…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-24">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#C97B5A]/10 mb-5 mx-auto">
                <BookOpen size={36} className="text-[#C97B5A]"/>
              </div>
              <h3 className="font-heading text-2xl mb-2 font-normal text-[#3D3530]">No Courses Found</h3>
              <p className="font-body text-sm text-[#9A8A80]">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Cards */}
          {!loading && courses.length > 0 && (
            <>
              <div className="mb-8 flex items-center justify-between">
                <p className="font-body text-sm text-[#9A8A80]">
                  Showing <span className="font-semibold text-[#3D3530]">{courses.length}</span> of{' '}
                  <span className="font-semibold text-[#3D3530]">{pagination.total}</span> courses
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    navigate={navigate}
                    statusCls={statusCls}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="font-body px-5 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#6B5A50] hover:scale-105">
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button key={i + 1}
                      onClick={() => setPagination(p => ({ ...p, currentPage: i + 1 }))}
                      className={`font-body w-9 h-9 rounded-full text-sm font-semibold transition-all hover:scale-105 ${
                        pagination.currentPage === i + 1
                          ? 'bg-[#C97B5A] text-[#FDF6EE] shadow-[0_4px_12px_rgba(201,123,90,0.35)]'
                          : 'bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#6B5A50]'
                      }`}>{i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="font-body px-5 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#FDF6EE] border-[1.5px] border-[#C97B5A]/30 text-[#6B5A50] hover:scale-105">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

/* course card */
const CourseCard = ({ course, navigate, statusCls, formatDate }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onClick={() => navigate(`/courses/${course._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer rounded-2xl overflow-hidden bg-[#FDF6EE] border border-[#C97B5A]/10 hover:border-[#C97B5A]/30 shadow-[0_4px_20px_rgba(61,53,48,0.07)] hover:shadow-[0_16px_48px_rgba(61,53,48,0.14)] transition-all duration-[400ms] hover:-translate-y-2 group"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        {course.images?.[0] ? (
          <img
            src={course.images[0]} alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-[#C97B5A]/15', 'to-[#7A9E8E]/15');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C97B5A]/10 to-[#7A9E8E]/10">
            <BookOpen size={48} className="text-[#C97B5A]/30"/>
          </div>
        )}

        {/* gradient */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#3D3530]/80 via-[#3D3530]/10 to-transparent transition-opacity duration-400 ${hovered ? 'opacity-100' : 'opacity-85'}`}/>

        {/* top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-[#C97B5A] transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}/>

        {/* Status and Art Form badges */}
        <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
          {course.status && (
            <span className={`font-body text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusCls(course.status)}`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </span>
          )}
          {course.artForm && (
            <span className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm bg-[#7A9E8E]/80 text-[#FDF6EE]">
              {course.artForm}
            </span>
          )}
        </div>

        {course.isFeatured && (
          <div className="absolute top-4 right-4 flex items-center gap-1 font-body text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-[#C97B5A]/90 text-[#FDF6EE]">
            <Star size={9} className="fill-[#FDF6EE]"/> Featured
          </div>
        )}

        {/* title on image bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <h3 className="font-heading text-[#FDF6EE] font-normal text-[1rem] leading-snug line-clamp-2">
            {course.title}
          </h3>
        </div>

        {/* hover CTA */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div
            className="flex items-center gap-2 font-body font-semibold text-sm px-5 py-2.5 rounded-full bg-[#FDF6EE]/95 text-[#C97B5A] shadow-lg"
            style={{ transform: hovered ? 'translateY(0)' : 'translateY(6px)', transition: 'transform 0.3s ease' }}
          >
            View Course <ArrowRight size={14}/>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-5">

        {/* Level + Duration */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {course.level && (
            <span className="font-body text-xs px-2.5 py-0.5 rounded-full bg-[#7A9E8E]/10 text-[#5F8B8C] border border-[#7A9E8E]/20">
              {course.level}
            </span>
          )}
          {course.duration?.weeks && (
            <span className="font-body flex items-center gap-1 text-xs text-[#9A8A80]">
              <Clock size={11} className="text-[#C97B5A]"/> {course.duration.weeks} weeks
            </span>
          )}
        </div>

        {/* Micro divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-px bg-[#C97B5A]/30"/>
          <div className="w-1 h-1 rounded-full bg-[#C97B5A]/45"/>
          <div className="w-3 h-px bg-[#C97B5A]/20"/>
        </div>

        <p className="font-body text-sm leading-relaxed text-[#3D3530]/60 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {course.startDate && (
            <div className="font-body flex items-center gap-1.5 text-xs text-[#9A8A80]">
              <Calendar size={12} className="text-[#C97B5A]"/> {formatDate(course.startDate)}
            </div>
          )}
          {course.historicalPlace?.name && (
            <div className="font-body flex items-center gap-1.5 text-xs text-[#9A8A80]">
              <MapPin size={12} className="text-[#C97B5A]"/> {course.historicalPlace.name}, {course.province}
            </div>
          )}
          {course.instructor?.name && (
            <div className="font-body flex items-center gap-1.5 text-xs text-[#9A8A80]">
              <Users size={12} className="text-[#C97B5A]"/> {course.instructor.name}
            </div>
          )}
          {course.capacity?.maximum && (
            <div className="font-body flex items-center gap-1.5 text-xs text-[#9A8A80]">
              <Users size={12} className="text-[#C97B5A]"/> {course.enrolledStudents || 0} / {course.capacity.maximum} enrolled
            </div>
          )}
        </div>

        {/* Price + link */}
        <div className="flex items-center justify-between pt-4 border-t border-[#C97B5A]/10">
          <div>
            <div className="font-heading text-xl font-normal text-[#3D3530]">
              LKR {course.fee?.amount?.toLocaleString() || 0}
            </div>
            {course.fee?.paymentSchedule && (
              <div className="font-body text-xs text-[#9A8A80] mt-0.5">{course.fee.paymentSchedule}</div>
            )}
          </div>
          <div className={`font-body flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${hovered ? 'text-[#3D3530]' : 'text-[#C97B5A]'}`}>
            Details
            <ChevronRight size={15} className={`transition-transform duration-200 ${hovered ? 'translate-x-1' : ''}`}/>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Courses;