import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Calendar,
  AlertCircle, Upload, Save,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download,
  MapPin, Globe, Eye, Star,
  Newspaper, CheckCircle, XCircle, Image as ImageIcon
} from 'lucide-react';
import { newsAPI } from '../../../services/api';
import jsPDF from 'jspdf';
import { PROVINCES } from '../../../utils/constants';

const CATEGORIES = [
  'Training Program', 'Exhibition', 'Achievement', 'Technology',
  'Workshop', 'Festival', 'Announcement', 'Other'
];

const PROVINCE_OPTIONS = ['All Provinces', ...PROVINCES];

const CATEGORY_COLORS = {
  'Training Program': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'Exhibition':       { bg: 'bg-purple-100',  text: 'text-purple-700' },
  'Achievement':      { bg: 'bg-yellow-100',  text: 'text-yellow-700' },
  'Technology':       { bg: 'bg-cyan-100',    text: 'text-cyan-700'   },
  'Workshop':         { bg: 'bg-green-100',   text: 'text-green-700'  },
  'Festival':         { bg: 'bg-orange-100',  text: 'text-orange-700' },
  'Announcement':     { bg: 'bg-red-100',     text: 'text-red-700'    },
  'Other':            { bg: 'bg-gray-100',    text: 'text-gray-600'   },
};

const emptyForm = {
  title: '', excerpt: '', description: '', category: '',
  date: new Date().toISOString().split('T')[0],
  location: '', province: '', isPublished: true, isFeatured: false,
};

const NewsManagement = () => {
  const [news, setNews]                     = useState([]);
  const [filteredNews, setFilteredNews]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);
  const [pageSize, setPageSize]             = useState(25);
  const [stats, setStats]                   = useState(null);

  const [showModal, setShowModal]               = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [showViewModal, setShowViewModal]       = useState(false);
  const [modalMode, setModalMode]               = useState('create');
  const [selectedNews, setSelectedNews]         = useState(null);
  const [viewNews, setViewNews]                 = useState(null);
  const [viewLoading, setViewLoading]           = useState(false);

  const [formData, setFormData]           = useState(emptyForm);
  const [imageFiles, setImageFiles]       = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => { fetchNews(); fetchStats(); }, []);

  useEffect(() => {
    let result = [...news];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(t) ||
        n.excerpt?.toLowerCase().includes(t) ||
        n.location?.toLowerCase().includes(t)
      );
    }
    if (filterCategory !== 'all') result = result.filter(n => n.category === filterCategory);
    if (filterPublished === 'published')   result = result.filter(n => n.isPublished);
    if (filterPublished === 'unpublished') result = result.filter(n => !n.isPublished);
    setFilteredNews(result);
    setCurrentPage(1);
  }, [news, searchTerm, filterCategory, filterPublished]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await newsAPI.getProvinceNews();
      if (res.data.success) setNews(res.data.data || []);
    } catch (err) { console.error('Fetch news error:', err);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await newsAPI.getProvinceStats();
      if (res.data.success) setStats(res.data.data);
    } catch (err) { console.error('Fetch stats error:', err); }
  };

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, currentPage, pageSize]);

  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const left  = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    const nums  = [1];
    if (left > 2) nums.push('...');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('...');
    if (totalPages > 1) nums.push(totalPages);
    return nums;
  }, [currentPage, totalPages]);

  const resetForm = () => { setFormData(emptyForm); setImageFiles([]); setImagePreviews([]); setExistingImages([]); };

  const openModal = (mode, item = null) => {
    setModalMode(mode); setSelectedNews(item);
    if (mode === 'edit' && item) {
      setFormData({
        title: item.title || '', excerpt: item.excerpt || '', description: item.description || '',
        category: item.category || '',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
        location: item.location || '', province: item.province || '',
        isPublished: item.isPublished !== false, isFeatured: item.isFeatured || false,
      });
      setExistingImages(item.images || []);
      setImageFiles([]); setImagePreviews([]);
    } else { resetForm(); }
    setShowModal(true);
  };

  const openViewModal = async (item) => {
    setViewLoading(true); setShowViewModal(true); setViewNews(null);
    try {
      const res = await newsAPI.getById(item._id);
      if (res.data.success) setViewNews(res.data.data);
    } catch { setViewNews(item); } finally { setViewLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      imageFiles.forEach(f => fd.append('images', f));
      let res;
      if (modalMode === 'create') res = await newsAPI.create(fd);
      else res = await newsAPI.update(selectedNews._id, fd);
      if (res.data.success) {
        setShowModal(false); resetForm();
        await fetchNews(); await fetchStats();
        alert(modalMode === 'create' ? 'News article created successfully!' : 'News article updated successfully!');
      }
    } catch (err) { alert(err.response?.data?.message || 'Error submitting. Please try again.'); }
  };

  const handleDelete = async () => {
    try {
      await newsAPI.delete(selectedNews._id);
      setShowDeleteModal(false); setSelectedNews(null);
      fetchNews(); fetchStats();
    } catch (err) { alert(err.response?.data?.message || 'Error deleting news'); }
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await newsAPI.toggleFeatured(id);
      setNews(prev => prev.map(n => n._id === id ? { ...n, isFeatured: !current } : n));
    } catch (err) { console.error(err); }
  };

  const handleTogglePublish = async (id, current) => {
    try {
      const fd = new FormData();
      fd.append('isPublished', String(!current));
      await newsAPI.update(id, fd);
      setNews(prev => prev.map(n => n._id === id ? { ...n, isPublished: !current } : n));
    } catch (err) { console.error(err); }
  };

  const getCategoryBadge = (category) => {
    const c = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
    return <span className={`px-2 py-1 ${c.bg} ${c.text} rounded text-xs font-semibold`}>{category || 'N/A'}</span>;
  };

  const downloadPDF = () => {
    if (filteredNews.length === 0) { alert('No news to download!'); return; }
    try {
      const doc   = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(141, 170, 145); doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('News Articles Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);
      if (stats) doc.text(`Total: ${stats.totalNews || 0}  Published: ${stats.publishedNews || 0}  Featured: ${stats.featuredNews || 0}`, 14, 29);

      const cols = [
        { h: 'Title', w: 70 }, { h: 'Category', w: 36 }, { h: 'Province', w: 32 },
        { h: 'Date', w: 28 },  { h: 'Views', w: 20 },    { h: 'Featured', w: 22 }, { h: 'Status', w: 22 }
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

      filteredNews.forEach((item, idx) => {
        if (y + rowH > pageH - 12) { doc.addPage(); y = 15; drawHeader(); }
        doc.setFillColor(idx % 2 === 0 ? 240 : 255, idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 241 : 255);
        doc.rect(startX, y, pageW - 20, rowH, 'F');
        const row = [
          item.title || 'N/A', item.category || 'N/A', item.province || 'N/A',
          item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A',
          String(item.views || 0), item.isFeatured ? 'Yes' : 'No',
          item.isPublished ? 'Published' : 'Draft',
        ];
        let rx = startX + 2;
        row.forEach((val, i) => {
          if (i === 5) doc.setTextColor(...(item.isFeatured ? [212, 175, 55] : [150, 150, 150]));
          else if (i === 6) doc.setTextColor(...(item.isPublished ? [22, 163, 74] : [150, 150, 150]));
          else doc.setTextColor(50, 50, 50);
          const mc = Math.floor(cols[i].w / 1.8);
          doc.text(String(val).length > mc ? String(val).substring(0, mc) + '…' : String(val), rx, y + 5.5);
          rx += cols[i].w;
        });
        doc.setTextColor(50, 50, 50); y += rowH;
      });

      doc.setDrawColor(141, 170, 145); doc.setLineWidth(0.3);
      doc.line(startX, y, pageW - 10, y);
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text(`FolkFusion News Report · ${filteredNews.length} records`, startX, y + 5);
      doc.save(`news-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { alert('PDF error: ' + err.message); }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">News Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage news articles and announcements</p>
        </div>
        <button onClick={() => openModal('create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} /> Add News Article
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Articles', value: stats.totalNews || 0,     icon: <Newspaper size={24} />,    bg: 'bg-[#8DAA91]/10', ic: 'text-[#8DAA91]',   val: 'text-[#4A3F35]' },
            { label: 'Published',      value: stats.publishedNews || 0, icon: <CheckCircle size={24} />, bg: 'bg-green-100',    ic: 'text-green-600',   val: 'text-green-600' },
            { label: 'Featured',       value: stats.featuredNews || 0,  icon: <Star size={24} />,        bg: 'bg-yellow-100',   ic: 'text-yellow-600',  val: 'text-yellow-600' },
            { label: 'Drafts',         value: (stats.totalNews || 0) - (stats.publishedNews || 0), icon: <XCircle size={24} />, bg: 'bg-gray-100', ic: 'text-gray-500', val: 'text-gray-600' },
          ].map(({ label, value, icon, bg, ic, val }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div><p className="text-[#2E2E2E]/60 text-sm">{label}</p><p className={`text-3xl font-bold mt-2 ${val}`}>{(value || 0).toLocaleString()}</p></div>
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search articles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Draft</option>
            </select>
            <button onClick={downloadPDF} disabled={filteredNews.length === 0}
              className="px-4 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#8a6440] transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Download PDF">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Article</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Province</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Views</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DAA91]/10">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent" /></div>
                </td></tr>
              ) : filteredNews.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <Newspaper size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto" />
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Articles Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm mb-4">{searchTerm || filterCategory !== 'all' || filterPublished !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first article'}</p>
                  {!searchTerm && filterCategory === 'all' && filterPublished === 'all' && (
                    <button onClick={() => openModal('create')} className="px-6 py-2 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-lg hover:shadow-lg transition-all">Add First Article</button>
                  )}
                </td></tr>
              ) : paginatedNews.map(item => (
                <tr key={item._id} className="hover:bg-[#F0F8F1]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-12 h-10 rounded-lg object-cover border-2 border-[#8DAA91]/20 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-10 bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-lg flex items-center justify-center flex-shrink-0"><Newspaper size={18} className="text-white" /></div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#4A3F35] truncate max-w-[220px]">{item.title}</p>
                          {item.isFeatured && <Star size={13} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[#2E2E2E]/50 truncate max-w-[240px]">{item.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getCategoryBadge(item.category)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-[#2E2E2E]/70">
                      {item.province === 'All Provinces' ? <Globe size={13} className="text-[#8DAA91]" /> : <MapPin size={13} className="text-[#8DAA91]" />}
                      <span className="text-xs">{item.province || 'N/A'}</span>
                    </div>
                    {item.location && <p className="text-xs text-[#2E2E2E]/40 mt-0.5 truncate max-w-[120px]">{item.location}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/70">
                      <Calendar size={12} className="text-[#8DAA91]" />
                      {item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#4A3F35]">{(item.views || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold w-fit flex items-center gap-1 ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isPublished ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openViewModal(item)} className="p-2 bg-[#8DAA91]/10 text-[#4A6B4A] rounded-lg hover:bg-[#8DAA91]/30 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => handleToggleFeatured(item._id, item.isFeatured)}
                        className={`p-2 rounded-lg transition-colors ${item.isFeatured ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'}`}>
                        <Star size={15} />
                      </button>
                      <button onClick={() => openModal('edit', item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => { setSelectedNews(item); setShowDeleteModal(true); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {filteredNews.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{(currentPage - 1) * pageSize + 1}</span>
              {' – '}<span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredNews.length)}</span>
              {' of '}<span className="font-semibold text-[#4A3F35]">{filteredNews.length.toLocaleString()}</span> articles
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows per page:</label>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#8DAA91]/30 rounded-lg px-2 py-1 focus:outline-none focus:border-[#8DAA91]">
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft size={16} /></button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
            {pageNumbers.map((p, idx) =>
              p === '...' ? <span key={`el-${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm">…</span> : (
                <button key={`pg-${p}`} onClick={() => goToPage(p)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${currentPage === p ? 'bg-[#8DAA91] text-white border-[#8DAA91]' : 'border-[#8DAA91]/30 text-[#4A3F35] hover:bg-[#8DAA91]/10'}`}>{p}</button>
              )
            )}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#8DAA91]/30 text-[#8DAA91] hover:bg-[#8DAA91]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight size={16} /></button>
          </div>
        </div>
      )}

      {/* view modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91] p-6 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3"><Eye size={22} className="text-white" /><h3 className="text-xl font-bold text-white">Article Details</h3></div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white"><X size={22} /></button>
            </div>
            {viewLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent" />
              </div>
            ) : viewNews && (
              <div className="p-6 space-y-6">
                {viewNews.images?.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {viewNews.images.map((img, i) => (
                      <img key={i} src={img} alt={`Image ${i + 1}`} className="h-48 w-auto rounded-xl object-cover border-2 border-[#8DAA91]/20 flex-shrink-0" />
                    ))}
                  </div>
                )}
                <div>
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <h2 className="text-2xl font-bold text-[#4A3F35] flex-1">{viewNews.title}</h2>
                    <div className="flex gap-2 flex-wrap">
                      {getCategoryBadge(viewNews.category)}
                      {viewNews.isFeatured && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold flex items-center gap-1"><Star size={11} className="fill-yellow-500" /> Featured</span>}
                      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${viewNews.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {viewNews.isPublished ? <CheckCircle size={11} /> : <XCircle size={11} />}{viewNews.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#2E2E2E]/70 text-sm italic leading-relaxed border-l-4 border-[#8DAA91]/40 pl-3">{viewNews.excerpt}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Calendar size={14} />, label: 'Date',     value: viewNews.date ? new Date(viewNews.date).toLocaleDateString('en-GB') : 'N/A' },
                    { icon: <MapPin size={14} />,   label: 'Province', value: viewNews.province || 'N/A' },
                    { icon: <MapPin size={14} />,   label: 'Location', value: viewNews.location || '—' },
                    { icon: <Eye size={14} />,      label: 'Views',    value: (viewNews.views || 0).toLocaleString() },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-[#F0F8F1] rounded-xl p-3">
                      <div className="flex items-center gap-1 text-[#8DAA91] mb-1">{icon}<span className="text-xs text-[#2E2E2E]/50 uppercase tracking-wide font-medium">{label}</span></div>
                      <p className="text-sm font-semibold text-[#4A3F35]">{value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A3F35] mb-2 uppercase tracking-wide">Full Article</h4>
                  <div className="prose prose-sm max-w-none text-[#2E2E2E]/80 leading-relaxed whitespace-pre-wrap bg-[#F0F8F1]/50 rounded-xl p-4 text-sm">{viewNews.description}</div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#8DAA91]/20">
                  <button onClick={() => { setShowViewModal(false); openModal('edit', viewNews); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all font-medium">
                    <Edit2 size={16} /> Edit Article
                  </button>
                  <button onClick={() => setShowViewModal(false)}
                    className="px-5 py-2.5 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all font-medium">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* create,edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35]">{modalMode === 'create' ? 'Add News Article' : 'Edit News Article'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-black/10 rounded-lg"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* basic info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Basic Information</h4>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Title *</label>
                  <input type="text" required maxLength={200} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" placeholder="Article title..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Excerpt * <span className="text-[#2E2E2E]/40 font-normal">(short summary)</span></label>
                  <textarea required rows={2} maxLength={500} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none" placeholder="Brief summary shown in card view..." />
                  <p className="text-xs text-[#2E2E2E]/40 mt-1">{formData.excerpt.length}/500</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Full Description *</label>
                  <textarea required rows={7} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none" placeholder="Full article content..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Category *</label>
                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Province *</label>
                    <select required value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]">
                      <option value="">Select Province</option>
                      {PROVINCE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Date *</label>
                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8DAA91]" />
                      <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91]" placeholder="e.g., Colombo" />
                    </div>
                  </div>
                </div>
              </div>

              {/* images */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">
                  Images {modalMode === 'create' && <span className="text-red-500">*</span>}
                  <span className="text-sm font-normal text-[#2E2E2E]/50 ml-2">(up to 5 images)</span>
                </h4>
                {modalMode === 'edit' && existingImages.length > 0 && (
                  <div>
                    <p className="text-xs text-[#2E2E2E]/50 mb-2">Current images (uploading new images will replace these):</p>
                    <div className="flex gap-2 flex-wrap">
                      {existingImages.map((img, i) => <img key={i} src={img} alt={`Current ${i + 1}`} className="w-20 h-16 object-cover rounded-lg border-2 border-[#8DAA91]/20" />)}
                    </div>
                  </div>
                )}
                <div className="border-2 border-dashed border-[#8DAA91]/30 rounded-xl p-6 text-center hover:border-[#8DAA91] transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" id="news-image-upload" />
                  <label htmlFor="news-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[#8DAA91]/10 flex items-center justify-center"><ImageIcon size={24} className="text-[#8DAA91]" /></div>
                    <p className="text-[#4A3F35] font-semibold text-sm">{modalMode === 'edit' ? 'Upload new images (replaces existing)' : 'Click to upload images'}</p>
                    <p className="text-xs text-[#2E2E2E]/50">PNG, JPG up to 10MB each, max 5</p>
                  </label>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-20 h-16 object-cover rounded-lg border-2 border-[#8DAA91]/30" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8DAA91] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* publishing */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#8DAA91]/20 pb-2">Publishing Options</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} className="w-5 h-5 text-[#8DAA91]" />
                    <div>
                      <p className="text-sm font-semibold text-[#4A3F35]">Publish Article</p>
                      <p className="text-xs text-[#2E2E2E]/50">Make this article visible to the public</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-semibold text-[#4A3F35] flex items-center gap-1"><Star size={14} className="text-yellow-500" /> Feature Article</p>
                      <p className="text-xs text-[#2E2E2E]/50">Show this article in the featured section</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#8DAA91]/20">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">Cancel</button>
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#7A9980] text-white rounded-xl hover:shadow-lg transition-all">
                  <Save size={18} />{modalMode === 'create' ? 'Create Article' : 'Update Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*delete modal */}
      {showDeleteModal && selectedNews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-red-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Article?</h2>
              <p className="text-[#2E2E2E]/70">Are you sure you want to delete <strong>"{selectedNews.title}"</strong>? This will also delete all associated images. This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setSelectedNews(null); }}
                className="flex-1 px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;