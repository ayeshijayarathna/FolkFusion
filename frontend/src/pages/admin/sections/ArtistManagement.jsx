import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Plus, Search, Edit2, Trash2, Check, X,
  Eye, Download, Phone, Copy, CheckCircle,
  XCircle, AlertCircle, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { artistAPI } from '../../../services/api';
import jsPDF from 'jspdf';
import { ART_CATEGORIES, DONATION_PURPOSES } from '../../../utils/constants';

const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, active: 0 });
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '',
    bio: '', yearsOfExperience: 0, specialization: [],
    address: { street: '', city: '', district: '', postalCode: '' },
    certification: { hasCertification: false, certificationDetails: '' },
    socialMedia: { facebook: '', instagram: '', twitter: '', website: '' }
  });

  useEffect(() => { fetchArtists(); fetchStats(); }, []);
  useEffect(() => { filterArtists(); }, [searchTerm, filterStatus, artists]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const fetchArtists = async () => {
    try {
      setLoading(true); setError(null);
      const response = await artistAPI.getProvinceArtists();
      if (response.data.success) setArtists(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching artists');
      setArtists([]);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await artistAPI.getStats();
      if (response.data.success) setStats(response.data.data);
    } catch (err) { console.error(err); }
  };

  const filterArtists = () => {
    let filtered = [...artists];
    if (searchTerm) filtered = filtered.filter(a =>
      a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phoneNumber?.includes(searchTerm)
    );
    if (filterStatus === 'approved') filtered = filtered.filter(a => a.user?.isApproved === true);
    else if (filterStatus === 'pending') filtered = filtered.filter(a => a.user?.isApproved === false);
    else if (filterStatus === 'active') filtered = filtered.filter(a => a.user?.isActive === true);
    setFilteredArtists(filtered);
  };

  const totalPages = Math.max(1, Math.ceil(filteredArtists.length / pageSize));

  const paginatedArtists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtists.slice(start, start + pageSize);
  }, [filteredArtists, currentPage, pageSize]);

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

  const resetForm = () => setFormData({
    fullName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', bio: '', yearsOfExperience: 0,
    specialization: [],
    address: { street: '', city: '', district: '', postalCode: '' },
    certification: { hasCertification: false, certificationDetails: '' },
    socialMedia: { facebook: '', instagram: '', twitter: '', website: '' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (showAddModal) {
        const response = await artistAPI.create(formData);
        if (response.data.success) {
          setNewCredentials(response.data.data.credentials);
          setShowCredentialsModal(true); setShowAddModal(false);
          fetchArtists(); fetchStats(); resetForm();
        }
      } else if (showEditModal) {
        alert('Update functionality will be implemented in the backend');
        setShowEditModal(false); setSelectedArtist(null); resetForm(); fetchArtists();
      }
    } catch (err) { alert(err.response?.data?.message || 'Error submitting artist');
    } finally { setLoading(false); }
  };

  const handleEditArtist = (artist) => {
    setSelectedArtist(artist);
    setFormData({
      fullName: artist.fullName || '', email: artist.user?.email || '',
      phoneNumber: artist.phoneNumber || '',
      dateOfBirth: artist.dateOfBirth ? new Date(artist.dateOfBirth).toISOString().split('T')[0] : '',
      gender: artist.gender || '', bio: artist.bio || '', yearsOfExperience: artist.yearsOfExperience || 0,
      specialization: artist.specialization || [],
      address: artist.address || { street: '', city: '', district: '', postalCode: '' },
      certification: artist.certification || { hasCertification: false, certificationDetails: '' },
      socialMedia: artist.socialMedia || { facebook: '', instagram: '', twitter: '', website: '' }
    });
    setShowEditModal(true);
  };

  const handleApprove = async (id) => {
    try { await artistAPI.approveArtist(id); fetchArtists(); fetchStats(); }
    catch (e) { alert(e.response?.data?.message || 'Error approving artist'); }
  };

  const handleReject = async (id) => {
    try { await artistAPI.rejectArtist(id); fetchArtists(); fetchStats(); }
    catch (e) { alert(e.response?.data?.message || 'Error rejecting artist'); }
  };

  const handleDelete = async () => {
    try {
      await artistAPI.deleteArtist(selectedArtist._id);
      setShowDeleteModal(false); setSelectedArtist(null);
      fetchArtists(); fetchStats();
    } catch (e) { alert(e.response?.data?.message || 'Error deleting artist'); }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const downloadPDF = () => {
    if (filteredArtists.length === 0) { alert('No artists to download!'); return; }
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(166, 124, 82);
      doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('Artist Details Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);
      doc.text(`Total: ${stats.total}   Approved: ${stats.approved}   Pending: ${stats.pending}   Active: ${stats.active}`, 14, 29);

      const cols = [
        { h: 'Name', w: 36 }, { h: 'Email', w: 46 }, { h: 'Phone', w: 28 },
        { h: 'Gender', w: 16 }, { h: 'Exp.', w: 13 }, { h: 'Specialization', w: 50 },
        { h: 'City', w: 22 }, { h: 'District', w: 22 }, { h: 'Status', w: 20 },
      ];
      const rowH = 8; const startX = 10; let y = 40;

      doc.setFillColor(166, 124, 82);
      doc.rect(startX, y, pageW - 20, rowH, 'F');
      doc.setFontSize(8); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      let x = startX + 2;
      cols.forEach(col => { doc.text(col.h, x, y + 5.5, { maxWidth: col.w - 2 }); x += col.w; });
      y += rowH;

      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      filteredArtists.forEach((a, idx) => {
        if (y + rowH > pageH - 10) {
          doc.addPage(); y = 15;
          doc.setFillColor(166, 124, 82);
          doc.rect(startX, y, pageW - 20, rowH, 'F');
          doc.setFontSize(8); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
          let hx = startX + 2;
          cols.forEach(col => { doc.text(col.h, hx, y + 5.5, { maxWidth: col.w - 2 }); hx += col.w; });
          y += rowH;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        }
        doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 245 : 255, idx % 2 === 0 ? 238 : 255);
        doc.rect(startX, y, pageW - 20, rowH, 'F');

        const isApproved = a.user?.isApproved;
        const rowData = [
          a.fullName || 'N/A', a.user?.email || 'N/A', a.phoneNumber || 'N/A',
          a.gender ? a.gender.charAt(0).toUpperCase() + a.gender.slice(1) : 'N/A',
          (a.yearsOfExperience || 0) + ' yrs',
          a.specialization?.slice(0, 2).join(', ') || 'N/A',
          a.address?.city || 'N/A', a.address?.district || 'N/A',
          isApproved ? 'Approved' : 'Pending',
        ];

        let rx = startX + 2;
        rowData.forEach((val, i) => {
          if (i === 8) doc.setTextColor(isApproved ? 34 : 200, isApproved ? 139 : 120, isApproved ? 34 : 0);
          else doc.setTextColor(50, 50, 50);
          const truncated = String(val).length > Math.floor(cols[i].w / 2)
            ? String(val).substring(0, Math.floor(cols[i].w / 2)) + '…'
            : String(val);
          doc.text(truncated, rx, y + 5.5);
          rx += cols[i].w;
        });
        doc.setTextColor(50, 50, 50);
        y += rowH;
      });

      doc.setDrawColor(166, 124, 82); doc.setLineWidth(0.3);
      doc.line(startX, y, pageW - 10, y);
      doc.setFontSize(7); doc.setTextColor(150, 150, 150);
      doc.text(`FolkFusion Artist Management Report · ${filteredArtists.length} records`, startX, y + 5);
      doc.save(`artists-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { alert('Error generating PDF: ' + err.message); }
  };

  const getStatusBadge = (artist) => artist.user?.isApproved ? (
    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
      <CheckCircle size={14} />Approved
    </span>
  ) : (
    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
      <AlertCircle size={14} />Pending
    </span>
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Artist Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage artists in your province</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} /> Add New Artist
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Artists', value: stats.total, icon: <Users className="text-[#A67C52]" size={24} />, bg: 'bg-[#A67C52]/10', val: 'text-[#4A3F35]' },
          { label: 'Approved', value: stats.approved, icon: <CheckCircle className="text-green-600" size={24} />, bg: 'bg-green-100', val: 'text-green-600' },
          { label: 'Pending', value: stats.pending, icon: <AlertCircle className="text-yellow-600" size={24} />, bg: 'bg-yellow-100', val: 'text-yellow-600' },
          { label: 'Active', value: stats.active, icon: <Eye className="text-blue-600" size={24} />, bg: 'bg-blue-100', val: 'text-blue-600' },
        ].map(({ label, value, icon, bg, val }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-[#2E2E2E]/60 text-sm">{label}</p><p className={`text-3xl font-bold mt-2 ${val}`}>{value}</p></div>
              <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search by name, email, or phone..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
          </select>
          <button onClick={downloadPDF} disabled={filteredArtists.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#7A9980] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
                <th className="px-6 py-4 text-left text-sm font-semibold">Artist</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Specialization</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Experience</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A67C52]/10">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A67C52] border-t-transparent" /></div>
                </td></tr>
              ) : filteredArtists.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center">
                  <Users size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto" />
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Artists Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm">{searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first artist'}</p>
                </td></tr>
              ) : (
                paginatedArtists.map(artist => (
                  <tr key={artist._id} className="hover:bg-[#F4EDE4]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A67C52] to-[#C48A6A] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {artist.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#4A3F35]">{artist.fullName || 'Unknown'}</p>
                          <p className="text-xs text-[#2E2E2E]/60">{artist.user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#2E2E2E]/80">
                        <Phone size={14} />{artist.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {artist.specialization?.length > 0 ? (
                          <>
                            {artist.specialization.slice(0, 2).map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-[#A67C52]/10 text-[#A67C52] rounded text-xs">{s}</span>
                            ))}
                            {artist.specialization.length > 2 && (
                              <span className="px-2 py-1 bg-[#A67C52]/10 text-[#A67C52] rounded text-xs">+{artist.specialization.length - 2}</span>
                            )}
                          </>
                        ) : <span className="text-xs text-[#2E2E2E]/40">No specialization</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#2E2E2E]/80">{artist.yearsOfExperience || 0} years</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(artist)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditArtist(artist)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"><Edit2 size={16} /></button>
                        {!artist.user?.isApproved && (
                          <button onClick={() => handleApprove(artist._id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><Check size={16} /></button>
                        )}
                        {artist.user?.isApproved && (
                          <button onClick={() => handleReject(artist._id)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"><X size={16} /></button>
                        )}
                        <button onClick={() => { setSelectedArtist(artist); setShowDeleteModal(true); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><Trash2 size={16} /></button>
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
      {filteredArtists.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{filteredArtists.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
              {' – '}
              <span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredArtists.length)}</span>
              {' of '}
              <span className="font-semibold text-[#4A3F35]">{filteredArtists.length.toLocaleString()}</span> artists
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows per page:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#A67C52]/20 rounded-lg px-2 py-1 focus:outline-none focus:border-[#A67C52] cursor-pointer">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsLeft size={16} /></button>
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm select-none">…</span>
              ) : (
                <button key={`page-${p}`} type="button" onClick={() => goToPage(p)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${currentPage === p ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'border-[#A67C52]/20 text-[#4A3F35] hover:bg-[#A67C52]/10'}`}>
                  {p}
                </button>
              )
            )}
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
            <button type="button" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronsRight size={16} /></button>
          </div>
        </div>
      )}

      {/* add,edit modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35]">{showAddModal ? 'Add New Artist' : 'Edit Artist'}</h3>
              <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); setSelectedArtist(null); }} className="p-2 hover:bg-black/10 rounded-lg"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Full Name *</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]" placeholder="Enter full name" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Email *</label>
                    <input type="email" required disabled={showEditModal} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52] disabled:bg-gray-100" placeholder="artist@example.com" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Phone Number *</label>
                    <input type="tel" required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]" placeholder="+94 77 123 4567" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Date of Birth</label>
                    <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]" /></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]">
                      <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select></div>
                  <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Years of Experience</label>
                    <input type="number" min="0" value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]" /></div>
                </div>
                <div><label className="block text-sm font-semibold text-[#4A3F35] mb-2">Bio</label>
                  <textarea rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52] resize-none" placeholder="Tell us about the artist..." /></div>
              </div>

              {/*specialization */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2">Specialization * (Select at least one)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ART_CATEGORIES.map(spec => (
                    <label key={spec} className="flex items-center gap-2 p-2 border-2 border-[#A67C52]/20 rounded-lg cursor-pointer hover:bg-[#F4EDE4]">
                      <input type="checkbox" checked={formData.specialization.includes(spec)}
                        onChange={e => setFormData({ ...formData, specialization: e.target.checked ? [...formData.specialization, spec] : formData.specialization.filter(s => s !== spec) })}
                        className="w-4 h-4 text-[#A67C52]" />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
                {formData.specialization.length === 0 && <p className="text-sm text-red-600">Please select at least one specialization</p>}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[['Street', 'street', 'Street address'], ['City', 'city', 'City'], ['District', 'district', 'District'], ['Postal Code', 'postalCode', 'Postal code']].map(([lbl, fld, ph]) => (
                    <div key={fld}><label className="block text-sm font-semibold text-[#4A3F35] mb-2">{lbl}</label>
                      <input type="text" value={formData.address[fld]} onChange={e => setFormData({ ...formData, address: { ...formData.address, [fld]: e.target.value } })}
                        className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52]" placeholder={ph} /></div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#A67C52]/20">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); setSelectedArtist(null); }}
                  className="px-6 py-3 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">Cancel</button>
                <button type="submit" disabled={formData.specialization.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {showAddModal ? 'Create Artist' : 'Update Artist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* credentials modal */}
      {showCredentialsModal && newCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-green-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Artist Created Successfully!</h2>
              <p className="text-[#2E2E2E]/70">Please save these credentials</p>
            </div>
            <div className="bg-[#F4EDE4] rounded-xl p-4 space-y-4">
              {[{ lbl: 'Email', val: newCredentials.email, mono: false }, { lbl: 'Password', val: newCredentials.password, mono: true }].map(({ lbl, val, mono }) => (
                <div key={lbl}><label className="text-xs text-[#2E2E2E]/60 block mb-1">{lbl}</label>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={val} className={`flex-1 px-3 py-2 bg-white rounded-lg text-sm ${mono ? 'font-mono' : ''}`} />
                    <button type="button" onClick={() => copyToClipboard(val)} className="p-2 bg-white rounded-lg hover:bg-[#A67C52]/10 transition-colors"><Copy size={16} className="text-[#A67C52]" /></button>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-xs text-yellow-800">{newCredentials.message}</p></div>
            </div>
            <button type="button" onClick={() => { setShowCredentialsModal(false); setNewCredentials(null); }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">Done</button>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && selectedArtist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-red-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Artist?</h2>
              <p className="text-[#2E2E2E]/70">Are you sure you want to delete <strong>{selectedArtist.fullName}</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => { setShowDeleteModal(false); setSelectedArtist(null); }}
                className="flex-1 px-6 py-3 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">Cancel</button>
              <button type="button" onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistManagement;