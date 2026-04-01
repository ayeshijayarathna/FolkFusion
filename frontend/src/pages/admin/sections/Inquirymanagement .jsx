import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Trash2, Eye, AlertCircle, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle, Clock, XCircle, MapPin, Phone, Mail,
  Calendar, Send, MessageSquare, RefreshCw, Download, Loader2,
  PhoneCall, Users, Palette,
} from 'lucide-react';
import { inquiryAPI } from '../../../services/api';
import jsPDF from 'jspdf';

// status config
const STATUS_CFG = {
  new:     { cls: 'bg-blue-100 text-blue-700',    icon: <Clock size={13}/>,       label: 'New'      },
  read:    { cls: 'bg-yellow-100 text-yellow-700', icon: <Eye size={13}/>,         label: 'Read'     },
  replied: { cls: 'bg-green-100 text-green-700',   icon: <CheckCircle size={13}/>, label: 'Responded'},
  closed:  { cls: 'bg-gray-100 text-gray-500',     icon: <XCircle size={13}/>,     label: 'Closed'   },
};
const STATUS_OPTIONS = ['new', 'read', 'replied', 'closed'];

//user type 
const UserTypeBadge = ({ type }) =>
  type === 'artist' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
      <Palette size={11}/> Artist
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
      <Users size={11}/> Public
    </span>
  );

//inquiry management
const InquiryManagement = () => {
  const [inquiries, setInquiries]       = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType]     = useState('all'); 
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageSize, setPageSize]         = useState(25);
  const [stats, setStats]               = useState(null);
  const [notification, setNotification] = useState(null);

  // modals
  const [showViewModal, setShowViewModal]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal]   = useState(false);
  const [selectedItem, setSelectedItem]       = useState(null);

  // reply
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying]         = useState(false);

  // marking
  const [markingId, setMarkingId] = useState(null);

  //tetch
  useEffect(() => { fetchInquiries(); fetchStats(); }, []);

  useEffect(() => {
    let result = [...inquiries];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(i =>
        i.name?.toLowerCase().includes(t) ||
        i.email?.toLowerCase().includes(t) ||
        i.message?.toLowerCase().includes(t) ||
        i.contactNo?.toLowerCase().includes(t)
      );
    }
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (filterType   !== 'all') result = result.filter(i => (i.userType || 'public') === filterType);
    setFiltered(result);
    setCurrentPage(1);
  }, [inquiries, searchTerm, filterStatus, filterType]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiryAPI.getProvinceList();
      if (res.data.success) setInquiries(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await inquiryAPI.getProvinceStats();
      if (res.data.success) setStats(res.data.data);
    } catch (err) { console.error(err); }
  };

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  //pagination
  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
  const goToPage    = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));
  const pageNumbers = useMemo(() => {
    const delta = 2, left = Math.max(2, currentPage - delta), right = Math.min(totalPages - 1, currentPage + delta);
    const nums = [1];
    if (left > 2) nums.push('...');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('...');
    if (totalPages > 1) nums.push(totalPages);
    return nums;
  }, [currentPage, totalPages]);

  //open view & mark as read
  const openView = async (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
    if (item.status === 'new') {
      try {
        await inquiryAPI.update(item._id, { status: 'read' });
        const updated = { ...item, status: 'read' };
        setInquiries(prev => prev.map(i => i._id === item._id ? updated : i));
        setSelectedItem(updated);
      } catch {}
    }
  };

  const openReply = (item) => {
    setSelectedItem(item);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  // mark as responded
  const handleMarkResponded = async (item) => {
    if (item.status === 'replied') {
      showNotif('This inquiry is already marked as Responded.', 'error');
      return;
    }
    setMarkingId(item._id);
    try {
      await inquiryAPI.update(item._id, { status: 'replied' });
      const updated = { ...item, status: 'replied', repliedAt: new Date() };
      setInquiries(prev => prev.map(i => i._id === item._id ? updated : i));
      if (selectedItem?._id === item._id) setSelectedItem(updated);
      fetchStats();
      showNotif('Inquiry marked as Responded ✓');
    } catch {
      showNotif('Failed to update status.', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  //status changed
  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiryAPI.update(id, { status: newStatus });
      setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
      if (selectedItem?._id === id) setSelectedItem(prev => ({ ...prev, status: newStatus }));
      fetchStats();
      showNotif('Status updated');
    } catch { showNotif('Failed to update status', 'error'); }
  };

  //reply to inquiry
  const handleReplySubmit = async () => {
    if (!replyMessage.trim()) { showNotif('Please enter a reply message.', 'error'); return; }
    setReplying(true);
    try {
      const res = await inquiryAPI.reply(selectedItem._id, { replyMessage });
      if (res.data.success) {
        const updated = { ...selectedItem, status: 'replied', adminNote: replyMessage, repliedAt: new Date() };
        setInquiries(prev => prev.map(i => i._id === selectedItem._id ? updated : i));
        if (showViewModal) setSelectedItem(updated);
        fetchStats();
        showNotif(`Reply sent to ${selectedItem.email} ✉️`);
        setShowReplyModal(false);
        setReplyMessage('');
      }
    } catch (err) {
      showNotif(err.response?.data?.message || 'Failed to send reply.', 'error');
    } finally {
      setReplying(false);
    }
  };

  // delete
  const handleDelete = async () => {
    try {
      await inquiryAPI.delete(selectedItem._id);
      setInquiries(prev => prev.filter(i => i._id !== selectedItem._id));
      setShowDeleteModal(false);
      setShowViewModal(false);
      setSelectedItem(null);
      fetchStats();
      showNotif('Inquiry deleted');
    } catch (err) {
      showNotif(err.response?.data?.message || 'Error deleting inquiry', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const c = STATUS_CFG[status] || STATUS_CFG['new'];
    return (
      <span className={`px-3 py-1 ${c.cls} rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        {c.icon}{c.label}
      </span>
    );
  };

  //pdf export
  const downloadPDF = () => {
    if (!filtered.length) { showNotif('No inquiries to export.', 'error'); return; }
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(141, 170, 145);
      doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
      doc.text('Inquiry Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, 14, 22);
      if (stats) doc.text(`Total: ${stats.total||0}  New: ${stats.new||0}  Replied: ${stats.replied||0}  Closed: ${stats.closed||0}  Public: ${stats.public||0}  Artist: ${stats.artist||0}`, 14, 29);
      const cols = [
        { h: 'Name', w: 40 }, { h: 'Email', w: 52 }, { h: 'Contact', w: 32 },
        { h: 'Type', w: 22 }, { h: 'Province', w: 30 }, { h: 'Date', w: 26 }, { h: 'Status', w: 24 },
      ];
      const rowH = 8, startX = 10; let y = 40;
      const drawHeader = () => {
        doc.setFillColor(141, 170, 145);
        doc.rect(startX, y, pageW - 20, rowH, 'F');
        doc.setFontSize(8); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
        let x = startX + 2;
        cols.forEach(c => { doc.text(c.h, x, y + 5.5); x += c.w; });
        y += rowH; doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
      };
      drawHeader();
      filtered.forEach((item, idx) => {
        if (y + rowH > pageH - 12) { doc.addPage(); y = 15; drawHeader(); }
        doc.setFillColor(idx%2===0?240:255, idx%2===0?248:255, idx%2===0?241:255);
        doc.rect(startX, y, pageW-20, rowH, 'F');
        const row = [
          item.name||'N/A', item.email||'N/A', item.contactNo||'N/A',
          item.userType === 'artist' ? 'Artist' : 'Public',
          item.province||'N/A',
          item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A',
          STATUS_CFG[item.status]?.label || 'New',
        ];
        let rx = startX + 2;
        row.forEach((val, i) => {
          doc.setTextColor(50,50,50);
          const mc = Math.floor(cols[i].w / 1.8);
          doc.text(String(val).length > mc ? String(val).substring(0,mc)+'…' : String(val), rx, y+5.5);
          rx += cols[i].w;
        });
        y += rowH;
      });
      doc.save(`inquiries-${new Date().toISOString().split('T')[0]}.pdf`);
      showNotif('PDF exported');
    } catch (err) { showNotif('PDF error: ' + err.message, 'error'); }
  };

  //render
  return (
    <div className="space-y-6">

      {/* notification message */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transition-all ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Inquiry Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage and respond to public & artist inquiries for your province</p>
        </div>
        <button onClick={() => { fetchInquiries(); fetchStats(); }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <RefreshCw size={18}/> Refresh
        </button>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total',      value: stats.total||0,   icon: <MessageSquare size={22}/>, bg: 'bg-[#8DAA91]/10', ic: 'text-[#8DAA91]',  val: 'text-[#4A3F35]' },
            { label: 'New',        value: stats.new||0,     icon: <Clock size={22}/>,         bg: 'bg-blue-100',     ic: 'text-blue-600',   val: 'text-blue-600'  },
            { label: 'Responded',  value: stats.replied||0, icon: <CheckCircle size={22}/>,   bg: 'bg-green-100',    ic: 'text-green-600',  val: 'text-green-600' },
            { label: 'Closed',     value: stats.closed||0,  icon: <XCircle size={22}/>,       bg: 'bg-gray-100',     ic: 'text-gray-500',   val: 'text-gray-600'  },
            { label: 'Public',     value: stats.public||0,  icon: <Users size={22}/>,         bg: 'bg-sky-100',      ic: 'text-sky-600',    val: 'text-sky-600'   },
            { label: 'Artists',    value: stats.artist||0,  icon: <Palette size={22}/>,       bg: 'bg-purple-100',   ic: 'text-purple-600', val: 'text-purple-600'},
          ].map(({ label, value, icon, bg, ic, val }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2E2E2E]/60 text-xs">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${val}`}>{(value||0).toLocaleString()}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20}/>
            <input type="text" placeholder="Search by name, email, message..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]"/>
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Types</option>
            <option value="public">Public Users</option>
            <option value="artist">Artists</option>
          </select>
          <button onClick={downloadPDF} disabled={!filtered.length}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#8a6440] transition-all disabled:opacity-50">
            <Download size={18}/> Export PDF
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Sender</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DAA91]/10">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent"/>
                  </div>
                </td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center">
                  <MessageSquare size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto"/>
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Inquiries Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? 'Try adjusting your filters' : 'No inquiries for your province yet'}
                  </p>
                </td></tr>
              ) : paginated.map(item => (
                <tr key={item._id}
                  className={`hover:bg-[#F0F8F1]/60 transition-colors ${item.status === 'new' ? 'bg-blue-50/40' : ''}`}>

                  {/* sender */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.userType === 'artist'
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                          : 'bg-gradient-to-br from-[#8DAA91] to-[#7A9980]'
                      }`}>
                        <span className="text-white font-bold text-sm">{item.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#4A3F35] text-sm">{item.name}</p>
                          {item.status === 'new' && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="New"/>}
                        </div>
                        <p className="text-xs text-[#2E2E2E]/50 truncate max-w-[150px]">{item.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* type */}
                  <td className="px-6 py-4">
                    <UserTypeBadge type={item.userType || 'public'}/>
                  </td>

                  {/* contact */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/70">
                      <Phone size={12} className="text-[#8DAA91]"/>{item.contactNo}
                    </div>
                  </td>

                  {/* date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/70">
                      <Calendar size={12} className="text-[#8DAA91]"/>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </td>

                  {/* status */}
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                  {/* actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => openView(item)} title="View details"
                        className="p-2 bg-[#8DAA91]/10 text-[#4A6B4A] rounded-lg hover:bg-[#8DAA91]/30 transition-colors">
                        <Eye size={15}/>
                      </button>
                      <button onClick={() => openReply(item)} title="Send message reply"
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        <Send size={15}/>
                      </button>
                      {item.status !== 'replied' ? (
                        <button onClick={() => handleMarkResponded(item)} disabled={markingId === item._id}
                          title="Mark as Responded (e.g. after phone call)"
                          className="flex items-center gap-1 px-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-semibold disabled:opacity-50 whitespace-nowrap">
                          {markingId === item._id ? <Loader2 size={13} className="animate-spin"/> : <PhoneCall size={13}/>}
                          Mark Responded
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border border-green-200">
                          <CheckCircle size={13}/> Responded
                        </span>
                      )}
                      <button onClick={() => { setSelectedItem(item); setShowDeleteModal(true); }} title="Delete"
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{(currentPage-1)*pageSize+1}</span>
              {' – '}
              <span className="font-semibold text-[#4A3F35]">{Math.min(currentPage*pageSize, filtered.length)}</span>
              {' of '}
              <span className="font-semibold text-[#4A3F35]">{filtered.length}</span> inquiries
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows:</label>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#8DAA91]/30 rounded-lg px-2 py-1 focus:outline-none focus:border-[#8DAA91]">
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: <ChevronsLeft size={16}/>,  fn: () => goToPage(1),             dis: currentPage===1 },
              { icon: <ChevronLeft  size={16}/>,  fn: () => goToPage(currentPage-1), dis: currentPage===1 },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} disabled={b.dis}
                className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed">
                {b.icon}
              </button>
            ))}
            {pageNumbers.map((p, idx) =>
              p === '...'
                ? <span key={`e${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm">…</span>
                : <button key={`pg${p}`} onClick={() => goToPage(p)}
                    className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      currentPage===p ? 'bg-[#8DAA91] text-white border-[#8DAA91]' : 'border-[#8DAA91]/30 text-[#4A3F35] hover:bg-[#8DAA91]/10'
                    }`}>{p}</button>
            )}
            {[
              { icon: <ChevronRight  size={16}/>, fn: () => goToPage(currentPage+1), dis: currentPage===totalPages },
              { icon: <ChevronsRight size={16}/>, fn: () => goToPage(totalPages),     dis: currentPage===totalPages },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} disabled={b.dis}
                className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed">
                {b.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91] p-6 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <MessageSquare size={22} className="text-white"/>
                <h3 className="text-xl font-bold text-white">Inquiry Details</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white">
                <X size={22}/>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  selectedItem.userType === 'artist'
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : 'bg-gradient-to-br from-[#8DAA91] to-[#7A9980]'
                }`}>
                  <span className="text-white font-bold text-2xl">{selectedItem.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-[#4A3F35]">{selectedItem.name}</h2>
                    <UserTypeBadge type={selectedItem.userType || 'public'}/>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#2E2E2E]/60">
                    <Mail size={13} className="text-[#8DAA91]"/>{selectedItem.email}
                  </div>
                </div>
                {getStatusBadge(selectedItem.status)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: <Phone size={14}/>,    label: 'Contact',  value: selectedItem.contactNo },
                  { icon: <MapPin size={14}/>,   label: 'Province', value: selectedItem.province  },
                  { icon: <Calendar size={14}/>, label: 'Date',     value: selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString('en-GB') : 'N/A' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-[#F0F8F1] rounded-xl p-3">
                    <div className="flex items-center gap-1 text-[#8DAA91] mb-1">{icon}
                      <span className="text-xs text-[#2E2E2E]/50 uppercase tracking-wide font-medium">{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35]">{value}</p>
                  </div>
                ))}
              </div>
              {selectedItem.address && (
                <div className="bg-[#F0F8F1] rounded-xl p-3">
                  <p className="text-xs text-[#2E2E2E]/50 uppercase tracking-wide font-medium mb-1">Address</p>
                  <p className="text-sm text-[#4A3F35]">{selectedItem.address}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-[#4A3F35] mb-2 uppercase tracking-wide">Message</h4>
                <div className="bg-[#F0F8F1]/70 rounded-xl p-4 text-sm text-[#2E2E2E]/80 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.message}
                </div>
              </div>
              {selectedItem.adminNote && (
                <div>
                  <h4 className="text-sm font-bold text-[#4A3F35] mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Send size={14} className="text-green-600"/> Previous Reply Sent
                    {selectedItem.repliedAt && (
                      <span className="text-xs font-normal text-[#2E2E2E]/50 normal-case">
                        — {new Date(selectedItem.repliedAt).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </h4>
                  <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-4 text-sm text-[#2E2E2E]/80 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.adminNote}
                  </div>
                </div>
              )}
              {selectedItem.status === 'replied' && !selectedItem.adminNote && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-600 flex-shrink-0"/>
                  <p className="text-sm text-emerald-700">
                    This inquiry has been marked as <strong>Responded</strong>
                    {selectedItem.repliedAt ? ` on ${new Date(selectedItem.repliedAt).toLocaleDateString('en-GB')}` : ''}.
                    (responded via phone call — no message reply stored)
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#8DAA91]/20">
                <button onClick={() => openReply(selectedItem)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                  <Send size={15}/> {selectedItem.adminNote ? 'Send Another Reply' : 'Reply via Message'}
                </button>
                {selectedItem.status !== 'replied' ? (
                  <button onClick={() => handleMarkResponded(selectedItem)} disabled={markingId === selectedItem._id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-medium disabled:opacity-50">
                    {markingId === selectedItem._id
                      ? <><Loader2 size={15} className="animate-spin"/> Marking...</>
                      : <><PhoneCall size={15}/> Mark as Responded</>}
                  </button>
                ) : (
                  <span className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl font-medium border border-green-200 text-sm">
                    <CheckCircle size={15}/> Already Responded
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#4A3F35]">Status:</span>
                  <select value={selectedItem.status || 'new'}
                    onChange={e => handleStatusChange(selectedItem._id, e.target.value)}
                    className="text-sm border-2 border-[#8DAA91]/30 rounded-lg px-3 py-2 focus:outline-none focus:border-[#8DAA91] text-[#4A3F35]">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label}</option>)}
                  </select>
                </div>
                <button onClick={() => { setShowViewModal(false); setShowDeleteModal(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-medium ml-auto">
                  <Trash2 size={15}/> Delete
                </button>
                <button onClick={() => setShowViewModal(false)}
                  className="px-5 py-2.5 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="bg-blue-500 p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <MessageSquare size={22} className="text-white"/>
                <div>
                  <h3 className="text-xl font-bold text-white">Send Response</h3>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {selectedItem.userType === 'artist'
                      ? "Artist will see this in their dashboard"
                      : "Reply will be sent to the sender's email"}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white">
                <X size={22}/>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* recipient */}
              <div className="bg-[#F0F8F1] rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedItem.userType === 'artist'
                    ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                    : 'bg-gradient-to-br from-[#8DAA91] to-[#7A9980]'
                }`}>
                  <span className="text-white font-bold text-sm">{selectedItem.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#4A3F35] text-sm">{selectedItem.name}</p>
                    <UserTypeBadge type={selectedItem.userType || 'public'}/>
                  </div>
                  <p className="text-xs text-[#2E2E2E]/60 flex items-center gap-1 mt-0.5">
                    <Mail size={11} className="text-[#8DAA91]"/>{selectedItem.email}
                  </p>
                </div>
              </div>

              {/* original message */}
              <div>
                <p className="text-xs font-semibold text-[#4A3F35] uppercase tracking-wide mb-2">Original Message</p>
                <div className="bg-[#FFF8E7] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#2E2E2E]/70 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedItem.message}
                </div>
              </div>

              {/* reply textarea */}
              <div>
                <label className="block text-sm font-semibold text-[#4A3F35] mb-2">
                  Your Response <span className="text-red-500">*</span>
                </label>
                <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)}
                  rows={6} placeholder={
                    selectedItem.userType === 'artist'
                      ? "Type your response here. The artist will see this in their dashboard..."
                      : "Type your response here. This message will be sent to the sender's email..."
                  }
                  className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-blue-400 resize-none text-sm text-[#4A3F35]"/>
                <p className="text-right text-xs text-[#2E2E2E]/40 mt-1">{replyMessage.length} characters</p>
              </div>

              {/* info note */}
              {selectedItem.userType === 'artist' ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
                  <MessageSquare size={15} className="text-purple-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-purple-700 leading-relaxed">
                    This response will be saved and <strong>displayed in the artist's dashboard</strong> under their inquiry. <strong>No email will be sent</strong> to the artist. The inquiry will be automatically marked as <strong>Responded</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <Mail size={15} className="text-blue-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This response will be sent to <strong>{selectedItem.email}</strong> via email. The inquiry will be automatically marked as <strong>Responded</strong>.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowReplyModal(false)}
                  className="flex-1 px-5 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all font-medium">
                  Cancel
                </button>
                <button onClick={handleReplySubmit} disabled={replying || !replyMessage.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                  {replying
                    ? <><Loader2 size={16} className="animate-spin"/> Sending...</>
                    : <><Send size={16}/> Send Response</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* delete model */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={32}/>
              </div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Inquiry?</h2>
              <p className="text-[#2E2E2E]/70">
                Are you sure you want to delete the inquiry from <strong>{selectedItem.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)}
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

export default InquiryManagement;