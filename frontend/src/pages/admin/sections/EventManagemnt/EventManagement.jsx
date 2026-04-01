import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Calendar,
  Users, MapPin, Clock, DollarSign, Award,
  CheckCircle, XCircle, AlertCircle, Upload, Save,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download,
  Phone, Mail, Layers, Eye, UserCheck, UserX, UserMinus
} from 'lucide-react';
import { eventAPI } from '../../../../services/api';
import jsPDF from 'jspdf';
import EventCalendar from './EventCalendar';

const STATUS_OPTIONS = [
  { value: 'upcoming',  label: 'Upcoming',  bg: 'bg-blue-100',   text: 'text-blue-700',   icon: <Calendar size={14} /> },
  { value: 'ongoing',   label: 'Ongoing',   bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={14} /> },
  { value: 'completed', label: 'Completed', bg: 'bg-purple-100', text: 'text-purple-700', icon: <CheckCircle size={14} /> },
  { value: 'cancelled', label: 'Cancelled', bg: 'bg-red-100',    text: 'text-red-700',    icon: <XCircle size={14} /> },
];

const getStatusConfig = (status) =>
  STATUS_OPTIONS.find(s => s.value === status) || { bg: 'bg-gray-100', text: 'text-gray-600', icon: <AlertCircle size={14} />, label: status || 'Unknown' };

const EventManagement = () => {
  /* tab state */
  const [activeTab, setActiveTab] = useState('list'); 

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEventType, setFilterEventType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewEventDetail, setViewEventDetail] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const eventTypes = ['Workshop', 'Exhibition', 'Festival', 'Competition', 'Training', 'Other'];

  const participantStatusColors = {
    registered: { bg: 'bg-blue-100',  text: 'text-blue-700' },
    attended:   { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled:  { bg: 'bg-red-100',   text: 'text-red-700' },
  };

  const emptyForm = {
    title: '',
    description: '',
    eventType: '',
    status: 'upcoming',
    location: { venue: '', address: '', district: '' },
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    categories: '',
    capacity: '',
    registrationDeadline: '',
    fees: { amount: 0, currency: 'LKR' },
    contactInfo: { email: '', phone: '' },
    isPublished: true,
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchEvents(); fetchStats(); }, []);

  useEffect(() => {
    let result = [...events];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(t) ||
        e.description?.toLowerCase().includes(t) ||
        e.location?.venue?.toLowerCase().includes(t)
      );
    }
    if (filterStatus !== 'all') result = result.filter(e => e.status === filterStatus);
    if (filterEventType !== 'all') result = result.filter(e => e.eventType === filterEventType);
    setFilteredEvents(result);
    setCurrentPage(1);
  }, [events, searchTerm, filterStatus, filterEventType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getProvinceEvents({ limit: 100000 });
      if (response.data.success) setEvents(response.data.data || []);
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventAPI.getEventStats();
      if (response.data.success) setStats(response.data.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

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

  const resetForm = () => { setFormData(emptyForm); setImageFile(null); setImagePreview(null); };

  const openModal = (mode, event = null) => {
    setModalMode(mode);
    setSelectedEvent(event);
    if (mode === 'edit' && event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || '',
        status: event.status || 'upcoming',
        location: event.location || { venue: '', address: '', district: '' },
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        categories: Array.isArray(event.categories) ? event.categories.join(', ') : '',
        capacity: event.capacity || '',
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
        fees: event.fees || { amount: 0, currency: 'LKR' },
        contactInfo: event.contactInfo || { email: '', phone: '' },
        isPublished: event.isPublished !== false,
      });
      setImagePreview(event.coverImage?.url || null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  /* called from EventCalendar's Edit button */
  const handleCalendarEdit = (event) => {
    setActiveTab('list');
    openModal('edit', event);
  };

  const openViewModal = async (event) => {
    setViewLoading(true);
    setShowViewModal(true);
    setViewEventDetail(null);
    try {
      const response = await eventAPI.getEvent(event._id);
      if (response.data.success) setViewEventDetail(response.data.data);
    } catch (err) {
      console.error('Fetch event detail error:', err);
      setViewEventDetail(event);
    } finally {
      setViewLoading(false);
    }
  };

  const handleParticipantStatusUpdate = async (eventId, participantIndex, newStatus) => {
    try {
      const updated = [...viewEventDetail.participants];
      updated[participantIndex] = { ...updated[participantIndex], status: newStatus };
      await eventAPI.updateEvent(eventId, {
        participants: updated.map(p => ({
          _id: p._id,
          artist: p.artist?._id || p.artist,
          registeredAt: p.registeredAt,
          status: p.status === updated[participantIndex].status && p._id === updated[participantIndex]._id
            ? newStatus : p.status
        }))
      });
      setViewEventDetail(prev => ({
        ...prev,
        participants: prev.participants.map((p, i) =>
          i === participantIndex ? { ...p, status: newStatus } : p
        )
      }));
      setEvents(prev =>
        prev.map(ev => ev._id === eventId
          ? { ...ev, participants: ev.participants?.map((p, i) => i === participantIndex ? { ...p, status: newStatus } : p) }
          : ev
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating participant status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null)
          submitData.append(key, JSON.stringify(formData[key]));
        else
          submitData.append(key, formData[key]);
      });
      if (imageFile) submitData.append('coverImage', imageFile);

      let response;
      if (modalMode === 'create') {
        response = await eventAPI.createEvent(submitData);
      } else {
        response = await eventAPI.updateEvent(selectedEvent._id, formData);
      }
      if (response.data.success) {
        setShowModal(false);
        resetForm();
        fetchEvents();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting event. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await eventAPI.deleteEvent(selectedEvent._id);
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting event');
    }
  };

  const handleTogglePublish = async (eventId, currentState) => {
    try {
      await eventAPI.updateEvent(eventId, { isPublished: !currentState });
      setEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, isPublished: !currentState } : ev));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const getStatusBadge = (status) => {
    const s = getStatusConfig(status);
    return (
      <span className={`px-3 py-1 ${s.bg} ${s.text} rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        {s.icon}{s.label}
      </span>
    );
  };

  const downloadPDF = () => {
    if (filteredEvents.length === 0) { alert('No events to download!'); return; }
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(141, 170, 145);
      doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('Event Details Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);
      if (stats) {
        doc.text(
          `Total: ${stats.total||0}  Upcoming: ${stats.byStatus?.upcoming||0}  Ongoing: ${stats.byStatus?.ongoing||0}  Completed: ${stats.byStatus?.completed||0}  Participants: ${stats.totalParticipants||0}`,
          14, 29
        );
      }
      const cols = [
        { h: 'Title', w: 52 }, { h: 'Type', w: 28 }, { h: 'Venue', w: 40 },
        { h: 'Start Date', w: 24 }, { h: 'End Date', w: 24 },
        { h: 'Participants', w: 24 }, { h: 'Fee (LKR)', w: 22 }, { h: 'Status', w: 22 },
      ];
      const rowH = 8; const startX = 10; let y = 40;
      const drawHeader = () => {
        doc.setFillColor(141, 170, 145);
        doc.rect(startX, y, pageW - 20, rowH, 'F');
        doc.setFontSize(8); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        let x = startX + 2;
        cols.forEach(col => { doc.text(col.h, x, y + 5.5); x += col.w; });
        y += rowH; doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      };
      drawHeader();
      filteredEvents.forEach((ev, idx) => {
        if (y + rowH > pageH - 12) { doc.addPage(); y = 15; drawHeader(); }
        doc.setFillColor(idx % 2 === 0 ? 240 : 255, idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 241 : 255);
        doc.rect(startX, y, pageW - 20, rowH, 'F');
        const pc = Array.isArray(ev.participants) ? ev.participants.filter(p => p.status === 'registered').length : 0;
        const rowData = [
          ev.title||'N/A', ev.eventType||'N/A', ev.location?.venue||'N/A',
          ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-GB') : 'N/A',
          ev.endDate   ? new Date(ev.endDate).toLocaleDateString('en-GB')   : 'N/A',
          ev.capacity > 0 ? `${pc}/${ev.capacity}` : `${pc}/∞`,
          ev.fees?.amount > 0 ? ev.fees.amount.toLocaleString() : 'Free',
          ev.status ? ev.status.charAt(0).toUpperCase() + ev.status.slice(1) : 'N/A',
        ];
        const statusColors = { upcoming:[59,130,246], ongoing:[217,119,6], completed:[147,51,234], cancelled:[220,38,38] };
        let rx = startX + 2;
        rowData.forEach((val, i) => {
          if (i === 7) { const sc = statusColors[ev.status]||[50,50,50]; doc.setTextColor(sc[0],sc[1],sc[2]); }
          else doc.setTextColor(50, 50, 50);
          const mc = Math.floor(cols[i].w / 1.8);
          doc.text(String(val).length > mc ? String(val).substring(0,mc)+'…' : String(val), rx, y+5.5);
          rx += cols[i].w;
        });
        doc.setTextColor(50,50,50); y += rowH;
      });
      doc.setDrawColor(141,170,145); doc.setLineWidth(0.3);
      doc.line(startX, y, pageW-10, y);
      doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text(`FolkFusion Event Management Report · ${filteredEvents.length} records`, startX, y+5);
      doc.save(`events-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { alert('PDF error: ' + err.message); }
  };

  return (
    <div className="space-y-6">

      {/* header*/}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Event Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage cultural events in your province</p>
        </div>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} /> Add New Event
        </button>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Events',       value: stats.total,                  icon: <Layers size={24}/>,       bg:'bg-[#8DAA91]/10', ic:'text-[#8DAA91]',   val:'text-[#4A3F35]' },
            { label: 'Upcoming',           value: stats.byStatus?.upcoming||0,  icon: <Calendar size={24}/>,     bg:'bg-blue-100',     ic:'text-blue-600',    val:'text-blue-600' },
            { label: 'Ongoing',            value: stats.byStatus?.ongoing||0,   icon: <Clock size={24}/>,        bg:'bg-yellow-100',   ic:'text-yellow-600',  val:'text-yellow-600' },
            { label: 'Completed',          value: stats.byStatus?.completed||0, icon: <CheckCircle size={24}/>,  bg:'bg-purple-100',   ic:'text-purple-600',  val:'text-purple-600' },
            { label: 'Total Participants', value: stats.totalParticipants||0,   icon: <Users size={24}/>,        bg:'bg-green-100',    ic:'text-green-600',   val:'text-green-600' },
          ].map(({ label, value, icon, bg, ic, val }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2E2E2E]/60 text-sm">{label}</p>
                  <p className={`text-3xl font-bold mt-2 ${val}`}>{(value||0).toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* tab switcher */}
      <div className="flex items-center gap-1 bg-white rounded-xl shadow-md p-1.5 w-fit">
        {[
          { key: 'list',     label: 'Event List', icon: <Layers size={16}/> },
          { key: 'calendar', label: 'Calendar',   icon: <Calendar size={16}/> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#8DAA91] text-white shadow-sm'
                : 'text-[#4A3F35]/70 hover:bg-[#8DAA91]/10'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/*conditional content*/}
      {activeTab === 'calendar' ? (
        <EventCalendar onEditEvent={handleCalendarEdit} />
      ) : (
        <>
          {/*filters */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20}/>
                <input type="text" placeholder="Search events..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]"/>
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={filterEventType} onChange={e => setFilterEventType(e.target.value)}
                className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
                <option value="all">All Event Types</option>
                {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={downloadPDF} disabled={filteredEvents.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#8a6440] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Download size={20}/> Download PDF Report
              </button>
            </div>
          </div>

          {/* table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#8DAA91] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Event</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Participants / Fee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8DAA91]/10">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent"></div>
                      </div>
                    </td></tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center">
                      <Calendar size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto"/>
                      <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Events Found</p>
                      <p className="text-[#2E2E2E]/40 text-sm mb-4">
                        {searchTerm || filterStatus !== 'all' || filterEventType !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Get started by adding your first event'}
                      </p>
                      {!searchTerm && filterStatus === 'all' && filterEventType === 'all' && (
                        <button onClick={() => openModal('create')}
                          className="px-6 py-2 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-lg hover:shadow-lg transition-all">
                          Add First Event
                        </button>
                      )}
                    </td></tr>
                  ) : (
                    paginatedEvents.map(event => {
                      const registeredCount = Array.isArray(event.participants)
                        ? event.participants.filter(p => p.status === 'registered').length : 0;
                      return (
                        <tr key={event._id} className="hover:bg-[#F0F8F1]/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {event.coverImage?.url ? (
                                <img src={event.coverImage.url} alt={event.title}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-[#8DAA91]/20 flex-shrink-0"/>
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                  {event.title?.charAt(0) || 'E'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-[#4A3F35]">{event.title || 'Unknown'}</p>
                                  {!event.isPublished && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Draft</span>
                                  )}
                                </div>
                                <p className="text-xs text-[#2E2E2E]/50 line-clamp-1">{event.description || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-[#8DAA91]/10 text-[#4A6B4A] rounded text-xs block w-fit">
                              {event.eventType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-1 text-sm text-[#2E2E2E]/80">
                              <MapPin size={14} className="text-[#8DAA91] mt-0.5 flex-shrink-0"/>
                              <div>
                                <p className="line-clamp-1">{event.location?.venue || 'N/A'}</p>
                                {event.location?.district && (
                                  <p className="text-xs text-[#2E2E2E]/40">{event.location.district}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-[#2E2E2E]/70 space-y-1">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-[#8DAA91]"/>
                                {event.startDate ? new Date(event.startDate).toLocaleDateString('en-GB') : 'N/A'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-[#8DAA91]"/>
                                {event.endDate ? new Date(event.endDate).toLocaleDateString('en-GB') : 'N/A'}
                              </div>
                              {event.startTime && (
                                <div className="text-[#2E2E2E]/40">
                                  {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-[#2E2E2E]/70 space-y-1">
                              <div className="flex items-center gap-1">
                                <Users size={12} className="text-[#8DAA91]"/>
                                {registeredCount}/{event.capacity > 0 ? event.capacity : '∞'}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign size={12} className="text-[#8DAA91]"/>
                                {event.fees?.amount > 0 ? `LKR ${event.fees.amount.toLocaleString()}` : 'Free'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openViewModal(event)}
                                className="p-2 bg-[#8DAA91]/10 text-[#4A6B4A] rounded-lg hover:bg-[#8DAA91]/30 transition-colors"
                                title="View Details & Participants">
                                <Eye size={15}/>
                              </button>
                              <button onClick={() => openModal('edit', event)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit Event">
                                <Edit2 size={15}/>
                              </button>
                              <button onClick={() => { setSelectedEvent(event); setShowDeleteModal(true); }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete Event">
                                <Trash2 size={15}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* pagination */}
          {filteredEvents.length > 0 && (
            <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-[#2E2E2E]/60">
                  Showing{' '}
                  <span className="font-semibold text-[#4A3F35]">{(currentPage - 1) * pageSize + 1}</span>
                  {' – '}
                  <span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredEvents.length)}</span>
                  {' of '}
                  <span className="font-semibold text-[#4A3F35]">{filteredEvents.length.toLocaleString()}</span>
                  {' events'}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#2E2E2E]/50">Rows per page:</label>
                  <select value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="text-sm border-2 border-[#8DAA91]/30 rounded-lg px-2 py-1 focus:outline-none focus:border-[#8DAA91] cursor-pointer">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => goToPage(1)} disabled={currentPage === 1}
                  className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronsLeft size={16}/>
                </button>
                <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16}/>
                </button>
                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`el-${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm select-none">…</span>
                  ) : (
                    <button key={`pg-${p}`} type="button" onClick={() => goToPage(p)}
                      className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        currentPage === p
                          ? 'bg-[#8DAA91] text-white border-[#8DAA91]'
                          : 'border-[#8DAA91]/30 text-[#4A3F35] hover:bg-[#8DAA91]/10'
                      }`}>
                      {p}
                    </button>
                  )
                )}
                <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16}/>
                </button>
                <button type="button" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronsRight size={16}/>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/*view modal*/}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91] p-6 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <Eye size={22} className="text-white"/>
                <h3 className="text-xl font-bold text-white">Event Details</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white">
                <X size={22}/>
              </button>
            </div>
            {viewLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent"></div>
              </div>
            ) : viewEventDetail ? (
              <div className="p-6 space-y-6">
                <div className="flex gap-6 flex-col md:flex-row">
                  {viewEventDetail.coverImage?.url ? (
                    <img src={viewEventDetail.coverImage.url} alt={viewEventDetail.title}
                      className="w-full md:w-56 h-40 object-cover rounded-xl border-2 border-[#8DAA91]/20 flex-shrink-0"/>
                  ) : (
                    <div className="w-full md:w-56 h-40 bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                      {viewEventDetail.title?.charAt(0) || 'E'}
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="text-2xl font-bold text-[#4A3F35]">{viewEventDetail.title}</h2>
                        <span className="px-3 py-1 bg-[#8DAA91]/10 text-[#4A6B4A] rounded-full text-sm font-medium mt-1 inline-block">
                          {viewEventDetail.eventType}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {getStatusBadge(viewEventDetail.status)}
                        {!viewEventDetail.isPublished && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">Draft</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[#2E2E2E]/70 text-sm leading-relaxed">{viewEventDetail.description}</p>
                    {viewEventDetail.categories?.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {viewEventDetail.categories.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-[#C48A6A]/10 text-[#C48A6A] rounded text-xs">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#F0F8F1] rounded-xl p-4">
                    <p className="text-xs text-[#2E2E2E]/50 font-medium mb-1 uppercase tracking-wide">Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-[#8DAA91] mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="font-semibold text-[#4A3F35] text-sm">{viewEventDetail.location?.venue}</p>
                        {viewEventDetail.location?.address && <p className="text-xs text-[#2E2E2E]/50">{viewEventDetail.location.address}</p>}
                        {viewEventDetail.location?.district && <p className="text-xs text-[#2E2E2E]/50">{viewEventDetail.location.district}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#F0F8F1] rounded-xl p-4">
                    <p className="text-xs text-[#2E2E2E]/50 font-medium mb-1 uppercase tracking-wide">Dates & Time</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={13} className="text-[#8DAA91]"/>
                        <span className="text-[#4A3F35] font-medium">
                          {viewEventDetail.startDate ? new Date(viewEventDetail.startDate).toLocaleDateString('en-GB') : 'N/A'}
                          {' → '}
                          {viewEventDetail.endDate ? new Date(viewEventDetail.endDate).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                      {viewEventDetail.startTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={13} className="text-[#8DAA91]"/>
                          <span className="text-[#4A3F35]">{viewEventDetail.startTime}{viewEventDetail.endTime ? ` – ${viewEventDetail.endTime}` : ''}</span>
                        </div>
                      )}
                      {viewEventDetail.registrationDeadline && (
                        <div className="text-xs text-[#C48A6A] mt-1">
                          Reg. deadline: {new Date(viewEventDetail.registrationDeadline).toLocaleDateString('en-GB')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#F0F8F1] rounded-xl p-4">
                    <p className="text-xs text-[#2E2E2E]/50 font-medium mb-1 uppercase tracking-wide">Capacity & Fee</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={13} className="text-[#8DAA91]"/>
                        <span className="text-[#4A3F35] font-medium">
                          {viewEventDetail.participants?.filter(p => p.status === 'registered').length || 0}
                          /{viewEventDetail.capacity > 0 ? viewEventDetail.capacity : '∞'} registered
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={13} className="text-[#8DAA91]"/>
                        <span className="text-[#4A3F35]">
                          {viewEventDetail.fees?.amount > 0 ? `LKR ${viewEventDetail.fees.amount.toLocaleString()}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(viewEventDetail.contactInfo?.email || viewEventDetail.contactInfo?.phone) && (
                    <div className="bg-[#F0F8F1] rounded-xl p-4">
                      <p className="text-xs text-[#2E2E2E]/50 font-medium mb-1 uppercase tracking-wide">Contact</p>
                      <div className="space-y-1">
                        {viewEventDetail.contactInfo.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={13} className="text-[#8DAA91]"/>
                            <span className="text-[#4A3F35]">{viewEventDetail.contactInfo.email}</span>
                          </div>
                        )}
                        {viewEventDetail.contactInfo.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={13} className="text-[#8DAA91]"/>
                            <span className="text-[#4A3F35]">{viewEventDetail.contactInfo.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* participants */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#4A3F35] flex items-center gap-2">
                      <Users size={18} className="text-[#8DAA91]"/>
                      Participants
                      <span className="text-sm font-normal text-[#2E2E2E]/50">
                        ({viewEventDetail.participants?.length || 0} total)
                      </span>
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {['registered','attended','cancelled'].map(s => {
                        const count = viewEventDetail.participants?.filter(p => p.status === s).length || 0;
                        const col = participantStatusColors[s];
                        return (
                          <span key={s} className={`px-2 py-1 ${col.bg} ${col.text} rounded-full text-xs font-semibold`}>
                            {count} {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {!viewEventDetail.participants || viewEventDetail.participants.length === 0 ? (
                    <div className="text-center py-10 bg-[#F0F8F1] rounded-xl">
                      <Users size={36} className="text-[#8DAA91]/40 mx-auto mb-2"/>
                      <p className="text-[#2E2E2E]/50 text-sm">No participants yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#8DAA91]/20">
                      <table className="w-full text-sm">
                        <thead className="bg-[#8DAA91]/10 text-[#4A3F35]">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">#</th>
                            <th className="px-4 py-3 text-left font-semibold">Artist</th>
                            <th className="px-4 py-3 text-left font-semibold">Specialization</th>
                            <th className="px-4 py-3 text-left font-semibold">Registered At</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Update Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8DAA91]/10">
                          {viewEventDetail.participants.map((participant, index) => {
                            const artist = participant.artist;
                            const col = participantStatusColors[participant.status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                            return (
                              <tr key={participant._id || index} className="hover:bg-[#F0F8F1]/60">
                                <td className="px-4 py-3 text-[#2E2E2E]/50">{index + 1}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {artist?.profileImage?.url ? (
                                      <img src={artist.profileImage.url} alt={artist.fullName}
                                        className="w-8 h-8 rounded-full object-cover border border-[#8DAA91]/30"/>
                                    ) : (
                                      <div className="w-8 h-8 bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {artist?.fullName?.charAt(0) || '?'}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-[#4A3F35]">{artist?.fullName || 'Unknown Artist'}</p>
                                      {artist?.province && <p className="text-xs text-[#2E2E2E]/40">{artist.province}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-[#2E2E2E]/60 text-xs">{artist?.specialization || '—'}</td>
                                <td className="px-4 py-3 text-[#2E2E2E]/60 text-xs">
                                  {participant.registeredAt ? new Date(participant.registeredAt).toLocaleDateString('en-GB') : '—'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 ${col.bg} ${col.text} rounded-full text-xs font-semibold capitalize`}>
                                    {participant.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {participant.status !== 'registered' && (
                                      <button onClick={() => handleParticipantStatusUpdate(viewEventDetail._id, index, 'registered')}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Mark as Registered">
                                        <UserCheck size={14}/>
                                      </button>
                                    )}
                                    {participant.status !== 'attended' && (
                                      <button onClick={() => handleParticipantStatusUpdate(viewEventDetail._id, index, 'attended')}
                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Mark as Attended">
                                        <CheckCircle size={14}/>
                                      </button>
                                    )}
                                    {participant.status !== 'cancelled' && (
                                      <button onClick={() => handleParticipantStatusUpdate(viewEventDetail._id, index, 'cancelled')}
                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Mark as Cancelled">
                                        <UserMinus size={14}/>
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
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#8DAA91]/20">
                  <button onClick={() => { setShowViewModal(false); openModal('edit', viewEventDetail); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all font-medium">
                    <Edit2 size={16}/> Edit Event
                  </button>
                  <button onClick={() => setShowViewModal(false)}
                    className="px-5 py-2.5 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all font-medium">
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/*create/edit modal*/}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35]">
                {modalMode === 'create' ? 'Create New Event' : 'Edit Event'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-black/10 rounded-lg"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Basic Information</h4>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Event Title *</label>
                  <input type="text" required value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"
                    placeholder="e.g., Annual Batik Festival 2025"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Description *</label>
                  <textarea required rows={4} value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none"
                    placeholder="Detailed event description..."/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Event Type *</label>
                    <select required value={formData.eventType}
                      onChange={e => setFormData({...formData, eventType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="">Select Event Type</option>
                      {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Status field */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Status *</label>
                    <div className="relative">
                      <select
                        required
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none appearance-none cursor-pointer font-semibold transition-all"
                        style={{
                          borderColor: formData.status === 'upcoming'  ? '#3b82f6'
                                     : formData.status === 'ongoing'   ? '#d97706'
                                     : formData.status === 'completed' ? '#9333ea'
                                     : formData.status === 'cancelled' ? '#ef4444'
                                     : '#8DAA91',
                          color:       formData.status === 'upcoming'  ? '#1d4ed8'
                                     : formData.status === 'ongoing'   ? '#92400e'
                                     : formData.status === 'completed' ? '#6b21a8'
                                     : formData.status === 'cancelled' ? '#b91c1c'
                                     : '#4A3F35',
                          background:  formData.status === 'upcoming'  ? '#eff6ff'
                                     : formData.status === 'ongoing'   ? '#fffbeb'
                                     : formData.status === 'completed' ? '#faf5ff'
                                     : formData.status === 'cancelled' ? '#fef2f2'
                                     : '#fff',
                        }}>
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full"
                          style={{
                            background: formData.status === 'upcoming'  ? '#3b82f6'
                                      : formData.status === 'ongoing'   ? '#d97706'
                                      : formData.status === 'completed' ? '#9333ea'
                                      : formData.status === 'cancelled' ? '#ef4444'
                                      : '#8DAA91'
                          }}/>
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs"
                      style={{
                        color: formData.status === 'upcoming'  ? '#2563eb'
                             : formData.status === 'ongoing'   ? '#b45309'
                             : formData.status === 'completed' ? '#7e22ce'
                             : formData.status === 'cancelled' ? '#dc2626'
                             : '#6b7280'
                      }}>
                      {formData.status === 'upcoming'  && ' Event is scheduled and accepting registrations'}
                      {formData.status === 'ongoing'   && ' Event is currently in progress'}
                      {formData.status === 'completed' && 'Event has ended successfully'}
                      {formData.status === 'cancelled' && 'Event has been cancelled'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Categories</label>
                    <input type="text" value={formData.categories}
                      onChange={e => setFormData({...formData, categories: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"
                      placeholder="e.g., Traditional, Cultural"/>
                  </div>
                </div>
              </div>

              {/* location */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Venue Name *</label>
                    <input type="text" required value={formData.location.venue}
                      onChange={e => setFormData({...formData, location: {...formData.location, venue: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"
                      placeholder="e.g., Cultural Centre Kandy"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">District</label>
                    <input type="text" value={formData.location.district}
                      onChange={e => setFormData({...formData, location: {...formData.location, district: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Address</label>
                    <input type="text" value={formData.location.address}
                      onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                </div>
              </div>

              {/* dates */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Dates & Times</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Start Date *</label>
                    <input type="date" required value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">End Date *</label>
                    <input type="date" required value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Start Time</label>
                    <input type="time" value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">End Time</label>
                    <input type="time" value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Registration Deadline</label>
                    <input type="date" value={formData.registrationDeadline}
                      onChange={e => setFormData({...formData, registrationDeadline: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Capacity (0 = unlimited)</label>
                    <input type="number" min="0" value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                </div>
              </div>

              {/* fees */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Event Fees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Fee Amount (0 = Free)</label>
                    <input type="number" min="0" value={formData.fees.amount}
                      onChange={e => setFormData({...formData, fees: {...formData.fees, amount: parseInt(e.target.value)||0}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Currency</label>
                    <select value={formData.fees.currency}
                      onChange={e => setFormData({...formData, fees: {...formData.fees, currency: e.target.value}})}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* contact */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Contact Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="email" value={formData.contactInfo.email}
                        onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Contact Phone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]"/>
                      <input type="tel" value={formData.contactInfo.phone}
                        onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* publishing */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Publishing</h4>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPublished" checked={formData.isPublished}
                    onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                    className="w-5 h-5 text-[#8DAA91]"/>
                  <label htmlFor="isPublished" className="text-sm font-semibold text-[#4A3F35]">
                    Publish Event (visible to public)
                  </label>
                </div>
              </div>

              {/* cover Image */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Cover Image</h4>
                <div className="border-2 border-dashed border-[#8DAA91]/30 rounded-xl p-6 text-center hover:border-[#8DAA91] transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="event-image-upload"/>
                  <label htmlFor="event-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#8DAA91]/10 flex items-center justify-center">
                      <Upload size={24} className="text-[#8DAA91]"/>
                    </div>
                    <p className="text-[#4A3F35] font-semibold text-sm">Click to upload cover image</p>
                    <p className="text-xs text-[#2E2E2E]/50">PNG, JPG up to 10MB</p>
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative w-40">
                    <img src={imagePreview} alt="Cover preview"
                      className="w-40 h-24 object-cover rounded-xl border-2 border-[#8DAA91]/20"/>
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                      <X size={12}/>
                    </button>
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#8DAA91]/20">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-xl hover:shadow-lg transition-all">
                  <Save size={18}/>{modalMode === 'create' ? 'Create Event' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*delete modal*/}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={32}/>
              </div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Event?</h2>
              <p className="text-[#2E2E2E]/70">
                Are you sure you want to delete <strong>{selectedEvent.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setSelectedEvent(null); }}
                className="flex-1 px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;