import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Calendar,
  Users, MapPin, BookOpen, Clock, DollarSign, Award,
  CheckCircle, XCircle, AlertCircle, Star, Upload, Save,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download
} from 'lucide-react';
import { adminAPI } from '../../../services/api';
import jsPDF from 'jspdf';
import { ART_CATEGORIES, PROVINCES } from '../../../utils/constants';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArtForm, setFilterArtForm] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '', description: '', artForm: '', level: '', startDate: '',
    registrationDeadline: '', languageOfInstruction: 'Sinhala', status: 'draft',
    historicalPlace: { name: '', address: '', city: '' },
    duration: { weeks: '', hoursPerWeek: '' },
    schedule: { days: [], time: { start: '', end: '' } },
    capacity: { minimum: 5, maximum: '' },
    fee: { amount: '', currency: 'LKR', paymentSchedule: 'One-time' },
    instructor: { name: '', bio: '', qualifications: [], experience: '' },
    prerequisites: [], materials: [],
    certification: { provided: false, details: '' },
    contactPerson: { name: '', phone: '', email: '', whatsapp: '' },
    tags: []
  });

  useEffect(() => { fetchCourses(); fetchStats(); }, [filterStatus, filterArtForm, filterLevel, searchTerm]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterArtForm, filterLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterArtForm !== 'all') params.append('artForm', filterArtForm);
      if (filterLevel !== 'all') params.append('level', filterLevel);
      if (searchTerm) params.append('search', searchTerm);
      const response = await adminAPI.getCourses(params.toString());
      if (response.data.success) {
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getCourseStats();
      if (response.data.success) setStats(response.data.data);
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    const nums = [1];
    if (left > 2) nums.push('...');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('...');
    if (totalPages > 1) nums.push(totalPages);
    return nums;
  }, [currentPage, totalPages]);

  const resetForm = () => {
    setFormData({
      title: '', description: '', artForm: '', level: '', startDate: '', registrationDeadline: '',
      languageOfInstruction: 'Sinhala', status: 'draft',
      historicalPlace: { name: '', address: '', city: '' },
      duration: { weeks: '', hoursPerWeek: '' },
      schedule: { days: [], time: { start: '', end: '' } },
      capacity: { minimum: 5, maximum: '' },
      fee: { amount: '', currency: 'LKR', paymentSchedule: 'One-time' },
      instructor: { name: '', bio: '', qualifications: [], experience: '' },
      prerequisites: [], materials: [],
      certification: { provided: false, details: '' },
      contactPerson: { name: '', phone: '', email: '', whatsapp: '' },
      tags: []
    });
    setImageFiles([]); setImagePreviews([]);
  };

  const openModal = (mode, course = null) => {
    setModalMode(mode); setSelectedCourse(course);
    if (mode === 'edit' && course) {
      setFormData({
        title: course.title || '', description: course.description || '',
        artForm: course.artForm || '', level: course.level || '',
        startDate: course.startDate ? course.startDate.split('T')[0] : '',
        registrationDeadline: course.registrationDeadline ? course.registrationDeadline.split('T')[0] : '',
        languageOfInstruction: course.languageOfInstruction || 'Sinhala',
        status: course.status || 'draft',
        historicalPlace: course.historicalPlace || { name: '', address: '', city: '' },
        duration: course.duration || { weeks: '', hoursPerWeek: '' },
        schedule: course.schedule || { days: [], time: { start: '', end: '' } },
        capacity: course.capacity || { minimum: 5, maximum: '' },
        fee: course.fee || { amount: '', currency: 'LKR', paymentSchedule: 'One-time' },
        instructor: course.instructor || { name: '', bio: '', qualifications: [], experience: '' },
        prerequisites: course.prerequisites || [], materials: course.materials || [],
        certification: course.certification || { provided: false, details: '' },
        contactPerson: course.contactPerson || { name: '', phone: '', email: '', whatsapp: '' },
        tags: course.tags || []
      });
    } else if (mode === 'create') { resetForm(); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && !Array.isArray(formData[key]))
          submitData.append(key, JSON.stringify(formData[key]));
        else if (Array.isArray(formData[key]))
          submitData.append(key, JSON.stringify(formData[key]));
        else submitData.append(key, formData[key]);
      });
      imageFiles.forEach(file => submitData.append('images', file));
      let response;
      if (modalMode === 'create') response = await adminAPI.createCourse(submitData);
      else if (modalMode === 'edit') response = await adminAPI.updateCourse(selectedCourse._id, submitData);
      if (response.data.success) { setShowModal(false); resetForm(); fetchCourses(); fetchStats(); }
    } catch (err) { alert('Error submitting course. Please try again.'); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteCourse(selectedCourse._id);
      setShowDeleteModal(false); setSelectedCourse(null);
      fetchCourses(); fetchStats();
    } catch (err) { alert(err.response?.data?.message || 'Error deleting course'); }
  };

  const handleToggleFeatured = async (courseId) => {
    try { await adminAPI.toggleCourseFeatured(courseId); fetchCourses(); }
    catch (err) { console.error(err); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const getStatusBadge = (status) => {
    const map = {
      active:    { bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle size={14} /> },
      upcoming:  { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: <Calendar size={14} /> },
      ongoing:   { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={14} /> },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <CheckCircle size={14} /> },
      cancelled: { bg: 'bg-red-100',    text: 'text-red-700',    icon: <XCircle size={14} /> },
      draft:     { bg: 'bg-gray-100',   text: 'text-gray-600',   icon: <AlertCircle size={14} /> },
    };
    const s = map[status] || map.draft;
    return (
      <span className={`px-3 py-1 ${s.bg} ${s.text} rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        {s.icon}{status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const downloadPDF = () => {
    if (filteredCourses.length === 0) { alert('No courses to download!'); return; }
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(141, 170, 145); doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('Course Details Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);
      if (stats) doc.text(`Total: ${stats.total || 0}   Active: ${stats.active || 0}   Ongoing: ${stats.ongoing || 0}   Upcoming: ${stats.upcoming || 0}   Enrolled: ${stats.totalEnrolled || 0}`, 14, 29);

      const cols = [
        { h: 'Title', w: 48 }, { h: 'Art Form', w: 30 }, { h: 'Level', w: 22 },
        { h: 'Location', w: 36 }, { h: 'Start Date', w: 22 }, { h: 'Capacity', w: 18 },
        { h: 'Fee (LKR)', w: 22 }, { h: 'Instructor', w: 32 }, { h: 'Status', w: 20 },
      ];
      const rowH = 8; const startX = 10; let y = 40;

      const drawHeader = () => {
        doc.setFillColor(141, 170, 145); doc.rect(startX, y, pageW - 20, rowH, 'F');
        doc.setFontSize(8); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        let x = startX + 2;
        cols.forEach(col => { doc.text(col.h, x, y + 5.5); x += col.w; });
        y += rowH; doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      };
      drawHeader();

      filteredCourses.forEach((c, idx) => {
        if (y + rowH > pageH - 12) { doc.addPage(); y = 15; drawHeader(); }
        doc.setFillColor(idx % 2 === 0 ? 240 : 255, idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 241 : 255);
        doc.rect(startX, y, pageW - 20, rowH, 'F');

        const status = c.status || '';
        const rowData = [
          c.title || 'N/A', c.artForm || 'N/A', c.level || 'N/A',
          c.historicalPlace?.name || 'N/A',
          c.startDate ? new Date(c.startDate).toLocaleDateString('en-GB') : 'N/A',
          `${c.enrolledStudents || 0}/${c.capacity?.maximum || '∞'}`,
          c.fee?.amount ? c.fee.amount.toLocaleString() : 'N/A',
          c.instructor?.name || 'N/A',
          status.charAt(0).toUpperCase() + status.slice(1) || 'N/A',
        ];
        const statusColors = {
          active: [34, 139, 34], upcoming: [59, 130, 246], ongoing: [217, 119, 6],
          completed: [147, 51, 234], cancelled: [220, 38, 38], draft: [107, 114, 128]
        };

        let rx = startX + 2;
        rowData.forEach((val, i) => {
          if (i === 8) { const sc = statusColors[c.status] || [50, 50, 50]; doc.setTextColor(sc[0], sc[1], sc[2]); }
          else doc.setTextColor(50, 50, 50);
          const maxChars = Math.floor(cols[i].w / 1.8);
          doc.text(String(val).length > maxChars ? String(val).substring(0, maxChars) + '…' : String(val), rx, y + 5.5);
          rx += cols[i].w;
        });
        doc.setTextColor(50, 50, 50); y += rowH;
      });

      doc.setDrawColor(141, 170, 145); doc.setLineWidth(0.3);
      doc.line(startX, y, pageW - 10, y);
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text(`FolkFusion Course Management Report · ${filteredCourses.length} records`, startX, y + 5);
      doc.save(`courses-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { alert('Error generating PDF: ' + err.message); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Course Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage traditional art courses in your province</p>
        </div>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} /> Add New Course
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Courses',  value: stats.total,         icon: <BookOpen size={24} />,    bg: 'bg-[#8DAA91]/10', ic: 'text-[#8DAA91]',   val: 'text-[#4A3F35]' },
            { label: 'Active',         value: stats.active,        icon: <CheckCircle size={24} />, bg: 'bg-green-100',    ic: 'text-green-600',   val: 'text-green-600' },
            { label: 'Ongoing',        value: stats.ongoing,       icon: <Clock size={24} />,       bg: 'bg-yellow-100',   ic: 'text-yellow-600',  val: 'text-yellow-600' },
            { label: 'Upcoming',       value: stats.upcoming,      icon: <Calendar size={24} />,    bg: 'bg-blue-100',     ic: 'text-blue-600',    val: 'text-blue-600' },
            { label: 'Total Enrolled', value: stats.totalEnrolled, icon: <Users size={24} />,       bg: 'bg-purple-100',   ic: 'text-purple-600',  val: 'text-purple-600' },
          ].map(({ label, value, icon, bg, ic, val }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div><p className="text-[#2E2E2E]/60 text-sm">{label}</p><p className={`text-3xl font-bold mt-2 ${val}`}>{value}</p></div>
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* filters*/}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filterArtForm} onChange={e => setFilterArtForm(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Art Forms</option>
            {ART_CATEGORIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button onClick={downloadPDF} disabled={filteredCourses.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#8a6440] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={20} /> Download PDF Report
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Course</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Art Form / Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Schedule</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Capacity / Fee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DAA91]/10">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent" /></div>
                </td></tr>
              ) : filteredCourses.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <BookOpen size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto" />
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Courses Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm mb-4">
                    {searchTerm || filterStatus !== 'all' || filterArtForm !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first course'}
                  </p>
                  {!searchTerm && filterStatus === 'all' && filterArtForm === 'all' && (
                    <button onClick={() => openModal('create')} className="px-6 py-2 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-lg hover:shadow-lg transition-all">Add First Course</button>
                  )}
                </td></tr>
              ) : (
                paginatedCourses.map(course => (
                  <tr key={course._id} className="hover:bg-[#F0F8F1]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.images?.[0] ? (
                          <img src={course.images[0]} alt={course.title} className="w-10 h-10 rounded-full object-cover border-2 border-[#8DAA91]/20 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {course.title?.charAt(0) || 'C'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-[#4A3F35]">{course.title || 'Unknown'}</p>
                            {course.isFeatured && <Star size={13} className="text-yellow-500" fill="currentColor" />}
                          </div>
                          <p className="text-xs text-[#2E2E2E]/50 line-clamp-1">{course.description || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="px-2 py-1 bg-[#8DAA91]/10 text-[#4A6B4A] rounded text-xs block w-fit">{course.artForm || 'N/A'}</span>
                        <span className="px-2 py-1 bg-[#A67C52]/10 text-[#A67C52] rounded text-xs block w-fit">{course.level || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1 text-sm text-[#2E2E2E]/80">
                        <MapPin size={14} className="text-[#8DAA91] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{course.historicalPlace?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#2E2E2E]/70 space-y-1">
                        <div className="flex items-center gap-1"><Calendar size={12} className="text-[#8DAA91]" />
                          {course.startDate ? new Date(course.startDate).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1"><Clock size={12} className="text-[#8DAA91]" />
                          {course.duration?.weeks ? `${course.duration.weeks}w · ${course.duration.hoursPerWeek}h/wk` : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#2E2E2E]/70 space-y-1">
                        <div className="flex items-center gap-1"><Users size={12} className="text-[#8DAA91]" />{course.enrolledStudents || 0}/{course.capacity?.maximum || '∞'}</div>
                        <div className="flex items-center gap-1"><DollarSign size={12} className="text-[#8DAA91]" />LKR {course.fee?.amount?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(course.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleFeatured(course._id)}
                          className={`p-2 rounded-lg transition-colors ${course.isFeatured ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-400'}`}>
                          <Star size={15} className={course.isFeatured ? 'fill-current' : ''} />
                        </button>
                        <button onClick={() => openModal('edit', course)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {filteredCourses.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{filteredCourses.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
              {' – '}<span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredCourses.length)}</span>
              {' of '}<span className="font-semibold text-[#4A3F35]">{filteredCourses.length.toLocaleString()}</span> courses
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows per page:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#8DAA91]/30 rounded-lg px-2 py-1 focus:outline-none focus:border-[#8DAA91] cursor-pointer">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsLeft size={16} /></button>
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map((p, idx) =>
              p === '...' ? <span key={`e-${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm select-none">…</span> : (
                <button key={`p-${p}`} type="button" onClick={() => goToPage(p)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${currentPage === p ? 'bg-[#8DAA91] text-white border-[#8DAA91]' : 'border-[#8DAA91]/30 text-[#4A3F35] hover:bg-[#8DAA91]/10'}`}>{p}</button>
              )
            )}
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
            <button type="button" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsRight size={16} /></button>
          </div>
        </div>
      )}

      {/* create,edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35]">{modalMode === 'create' ? 'Create New Course' : 'Edit Course'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-black/10 rounded-lg"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* basic info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Basic Information</h4>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Course Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" placeholder="e.g., Traditional Mask Carving Workshop" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Description *</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none" placeholder="Detailed course description..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* art form */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Art Form *</label>
                    <select required value={formData.artForm} onChange={e => setFormData({ ...formData, artForm: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="">Select Art Form</option>
                      {ART_CATEGORIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Level *</label>
                    <select required value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* location */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Historical Place Name *</label>
                    <input type="text" required value={formData.historicalPlace.name} onChange={e => setFormData({ ...formData, historicalPlace: { ...formData.historicalPlace, name: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">City</label>
                    <input type="text" value={formData.historicalPlace.city} onChange={e => setFormData({ ...formData, historicalPlace: { ...formData.historicalPlace, city: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Address *</label>
                    <input type="text" required value={formData.historicalPlace.address} onChange={e => setFormData({ ...formData, historicalPlace: { ...formData.historicalPlace, address: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" />
                  </div>
                </div>
              </div>

              {/* duration & schedule */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Duration & Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Duration (Weeks) *</label>
                    <input type="number" required min="1" value={formData.duration.weeks} onChange={e => setFormData({ ...formData, duration: { ...formData.duration, weeks: parseInt(e.target.value) } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Hours per Week *</label>
                    <input type="number" required min="1" value={formData.duration.hoursPerWeek} onChange={e => setFormData({ ...formData, duration: { ...formData.duration, hoursPerWeek: parseInt(e.target.value) } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Start Date *</label>
                    <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Registration Deadline *</label>
                    <input type="date" required value={formData.registrationDeadline} onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Start Time</label>
                    <input type="time" value={formData.schedule.time.start} onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, time: { ...formData.schedule.time, start: e.target.value } } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">End Time</label>
                    <input type="time" value={formData.schedule.time.end} onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, time: { ...formData.schedule.time, end: e.target.value } } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Class Days</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center gap-2 p-2 border-2 border-[#8DAA91]/20 rounded-lg cursor-pointer hover:bg-[#F0F8F1]">
                        <input type="checkbox" checked={formData.schedule.days.includes(day)}
                          onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, days: e.target.checked ? [...formData.schedule.days, day] : formData.schedule.days.filter(d => d !== day) } })}
                          className="w-4 h-4 text-[#8DAA91]" />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/*capacity & fee */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Capacity & Fee</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Min Capacity</label>
                    <input type="number" min="1" value={formData.capacity.minimum} onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity, minimum: parseInt(e.target.value) } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Max Capacity *</label>
                    <input type="number" required min="1" value={formData.capacity.maximum} onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity, maximum: parseInt(e.target.value) } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Course Fee (LKR) *</label>
                    <input type="number" required min="0" value={formData.fee.amount} onChange={e => setFormData({ ...formData, fee: { ...formData.fee, amount: parseInt(e.target.value) } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                </div>
              </div>

              {/* instructor */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Instructor Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Instructor Name *</label>
                    <input type="text" required value={formData.instructor.name} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, name: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Experience</label>
                    <input type="text" value={formData.instructor.experience} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, experience: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" placeholder="e.g., 15 years" /></div>
                </div>
                <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Bio</label>
                  <textarea rows={3} value={formData.instructor.bio} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, bio: e.target.value } })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none" /></div>
              </div>

              {/* contact Person */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Contact Person</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[['Name', 'name', 'text'], ['Phone', 'phone', 'tel'], ['Email', 'email', 'email'], ['WhatsApp', 'whatsapp', 'tel']].map(([lbl, fld, tp]) => (
                    <div key={fld}><label className="block text-sm font-semibold text-[#4A3F35] mb-2">{lbl}</label>
                      <input type={tp} value={formData.contactPerson[fld]} onChange={e => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, [fld]: e.target.value } })}
                        className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                  ))}
                </div>
              </div>

              {/* additional */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Language of Instruction *</label>
                    <select required value={formData.languageOfInstruction} onChange={e => setFormData({ ...formData, languageOfInstruction: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="Sinhala">Sinhala</option><option value="Tamil">Tamil</option>
                      <option value="English">English</option><option value="Bilingual">Bilingual</option>
                    </select></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="draft">Draft</option><option value="active">Active</option><option value="upcoming">Upcoming</option>
                    </select></div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cert" checked={formData.certification.provided}
                    onChange={e => setFormData({ ...formData, certification: { ...formData.certification, provided: e.target.checked } })}
                    className="w-5 h-5 text-[#8DAA91]" />
                  <label htmlFor="cert" className="text-sm font-semibold text-[#4A3F35]">Certification Provided</label>
                </div>
                {formData.certification.provided && (
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Certification Details</label>
                    <input type="text" value={formData.certification.details} onChange={e => setFormData({ ...formData, certification: { ...formData.certification, details: e.target.value } })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" /></div>
                )}
              </div>

              {/* images */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Course Images</h4>
                <div className="border-2 border-dashed border-[#8DAA91]/30 rounded-xl p-6 text-center hover:border-[#8DAA91] transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="course-image-upload" />
                  <label htmlFor="course-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#8DAA91]/10 flex items-center justify-center"><Upload size={24} className="text-[#8DAA91]" /></div>
                    <p className="text-[#4A3F35] font-semibold text-sm">Click to upload images</p>
                    <p className="text-xs text-[#2E2E2E]/50">PNG, JPG up to 10MB</p>
                  </label>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((p, i) => <img key={i} src={p} alt="" className="w-full h-20 object-cover rounded-lg border-2 border-[#8DAA91]/20" />)}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#8DAA91]/20">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">Cancel</button>
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-xl hover:shadow-lg transition-all">
                  <Save size={18} />{modalMode === 'create' ? 'Create Course' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-red-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Course?</h2>
              <p className="text-[#2E2E2E]/70">Are you sure you want to delete <strong>{selectedCourse.title}</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setSelectedCourse(null); }}
                className="flex-1 px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;