import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  DollarSign, Users, MapPin, Calendar, Download, FileText,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Check
} from 'lucide-react';
import { donationAPI } from '../../../services/api';
import jsPDF from 'jspdf';
import { PROVINCES, DONATION_PURPOSES } from '../../../utils/constants';

const PROVINCE_OPTIONS_WITH_ALL = ['All Provinces', ...PROVINCES];

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState('');

  useEffect(() => { fetchDonations(); fetchStats(); }, []);
  useEffect(() => { applyFilters(); }, [donations, searchTerm, filterStatus, filterProvince, filterPurpose]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus, filterProvince, filterPurpose]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      const response = await donationAPI.getAll(params.toString());
      if (response.data.success) setDonations(response.data.data);
    } catch (err) { console.error('Error fetching donations:', err);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await donationAPI.getStats();
      if (response.data.success) setStats(response.data.data);
    } catch (err) { console.error('Error fetching stats:', err); }
  };

  const applyFilters = () => {
    let filtered = [...donations];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.donor?.fullName?.toLowerCase().includes(search) ||
        d.donor?.email?.toLowerCase().includes(search) ||
        d.transactionId?.toLowerCase().includes(search) ||
        d.receiptNumber?.toLowerCase().includes(search)
      );
    }
    if (filterStatus !== 'all')   filtered = filtered.filter(d => d.paymentStatus === filterStatus);
    if (filterProvince !== 'all') filtered = filtered.filter(d => d.allocatedProvince === filterProvince);
    if (filterPurpose !== 'all')  filtered = filtered.filter(d => d.purpose === filterPurpose);
    setFilteredDonations(filtered);
  };

  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize));
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDonations.slice(start, start + pageSize);
  }, [filteredDonations, currentPage, pageSize]);

  const goToPage = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  const pageNumbers = useMemo(() => {
    const delta = 2, left = Math.max(2, currentPage - delta), right = Math.min(totalPages - 1, currentPage + delta);
    const nums = [1];
    if (left > 2) nums.push('...');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('...');
    if (totalPages > 1) nums.push(totalPages);
    return nums;
  }, [currentPage, totalPages]);

  const handleAcknowledge = async () => {
    if (!selectedDonation) return;
    try {
      const response = await donationAPI.acknowledge(selectedDonation._id, { notes: acknowledgeNotes });
      if (response.data.success) {
        setShowAcknowledgeModal(false); setSelectedDonation(null); setAcknowledgeNotes('');
        fetchDonations(); fetchStats();
      }
    } catch (err) { alert(err.response?.data?.message || 'Error acknowledging donation'); }
  };

  const getStatusBadge = (status) => {
    const map = {
      completed: { bg: 'bg-green-100', text: 'text-green-700',   icon: <CheckCircle size={14} /> },
      pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock size={14} /> },
      failed:    { bg: 'bg-red-100', text: 'text-red-700',       icon: <XCircle size={14} /> },
      refunded:  { bg: 'bg-purple-100', text: 'text-purple-700', icon: <AlertCircle size={14} /> },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`px-3 py-1 ${s.bg} ${s.text} rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        {s.icon}{status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPurposeLabel = (purpose) => {
    const p = DONATION_PURPOSES.find(item => item.value === purpose);
    return p ? p.label : purpose;
  };

  const downloadPDF = () => {
    if (filteredDonations.length === 0) { alert('No donations to download!'); return; }
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      doc.setFillColor(141, 170, 145); doc.rect(0, 0, pageW, 32, 'F');
      doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('Donation Report', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 22);
      if (stats) doc.text(`Total Donations: ${stats.total || 0}   Total Amount: LKR ${(stats.amount || 0).toLocaleString()}   This Month: ${stats.thisMonth || 0}`, 14, 29);

      const cols = [
        { h: 'Receipt #', w: 28 }, { h: 'Donor', w: 40 }, { h: 'Amount (LKR)', w: 25 },
        { h: 'Purpose', w: 35 }, { h: 'Province', w: 30 }, { h: 'Payment Method', w: 28 },
        { h: 'Date', w: 24 }, { h: 'Status', w: 20 },
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

      filteredDonations.forEach((d, idx) => {
        if (y + rowH > pageH - 12) { doc.addPage(); y = 15; drawHeader(); }
        doc.setFillColor(idx % 2 === 0 ? 240 : 255, idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 241 : 255);
        doc.rect(startX, y, pageW - 20, rowH, 'F');

        const rowData = [
          d.receiptNumber || 'Pending',
          d.donor?.isAnonymous ? 'Anonymous' : (d.donor?.fullName || 'N/A'),
          d.amount ? d.amount.toLocaleString() : 'N/A',
          getPurposeLabel(d.purpose),
          d.allocatedProvince || 'N/A',
          d.paymentMethod || 'N/A',
          d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB') : 'N/A',
          (d.paymentStatus || '').charAt(0).toUpperCase() + (d.paymentStatus || '').slice(1),
        ];
        const statusColors = { completed: [34, 139, 34], pending: [217, 119, 6], failed: [220, 38, 38], refunded: [147, 51, 234] };

        let rx = startX + 2;
        rowData.forEach((val, i) => {
          if (i === 7) { const sc = statusColors[d.paymentStatus] || [50, 50, 50]; doc.setTextColor(sc[0], sc[1], sc[2]); }
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
      doc.text(`FolkFusion Donation Report · ${filteredDonations.length} records · Total: LKR ${filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`, startX, y + 5);
      doc.save(`donations-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) { alert('Error generating PDF: ' + err.message); }
  };

  const provinceStats = useMemo(() => {
    if (!stats || !donations) return null;
    const userProvince = 'Western';
    const provinceData = donations.filter(d => d.allocatedProvince === userProvince && d.paymentStatus === 'completed');
    return { province: userProvince, count: provinceData.length, amount: provinceData.reduce((sum, d) => sum + (d.amount || 0), 0) };
  }, [stats, donations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Donation Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Track and manage donations for traditional arts</p>
        </div>
      </div>

      {/* stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Donations', value: stats.total || 0,               ic: <DollarSign size={24}/>, bg: 'bg-[#8DAA91]/10', tc: 'text-[#8DAA91]',  vc: 'text-[#4A3F35]' },
            { label: 'Total Amount',    value: `LKR ${(stats.amount||0).toLocaleString()}`, ic: <DollarSign size={24}/>, bg: 'bg-green-100', tc: 'text-green-600', vc: 'text-green-600' },
            { label: 'This Month',      value: stats.thisMonth || 0,           ic: <Calendar size={24}/>,  bg: 'bg-blue-100',     tc: 'text-blue-600',  vc: 'text-blue-600' },
            { label: 'Completed',       value: stats.breakdown?.completed || 0, ic: <CheckCircle size={24}/>, bg: 'bg-green-100', tc: 'text-green-600', vc: 'text-green-600' },
          ].map(({ label, value, ic, bg, tc, vc }) => (
            <div key={label} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div><p className="text-[#2E2E2E]/60 text-sm">{label}</p><p className={`text-2xl font-bold mt-2 ${vc}`}>{value}</p></div>
                <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${tc}`}>{ic}</div>
              </div>
            </div>
          ))}
          {provinceStats && (
            <div className="bg-gradient-to-br from-[#8DAA91] to-[#7A9980] rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm flex items-center gap-1"><MapPin size={14} /> {provinceStats.province}</p>
                  <p className="text-2xl font-bold mt-1">{provinceStats.count}</p>
                  <p className="text-xs text-white/70 mt-1">LKR {provinceStats.amount.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Users size={24} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/*filters*/}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search donations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Provinces</option>
            {PROVINCE_OPTIONS_WITH_ALL.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select value={filterPurpose} onChange={e => setFilterPurpose(e.target.value)}
            className="px-4 py-3 border-2 border-[#8DAA91]/20 rounded-lg focus:outline-none focus:border-[#8DAA91]">
            <option value="all">All Purposes</option>
            {DONATION_PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button onClick={downloadPDF} disabled={filteredDonations.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#A67C52] text-white rounded-lg hover:bg-[#8a6440] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={20} /> Download PDF
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Receipt / Donor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Purpose</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Province</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Payment Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8DAA91]/10">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8DAA91] border-t-transparent" /></div>
                </td></tr>
              ) : filteredDonations.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center">
                  <DollarSign size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto" />
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Donations Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm">{searchTerm || filterStatus !== 'all' || filterProvince !== 'all' || filterPurpose !== 'all' ? 'Try adjusting your filters' : 'Donations will appear here once received'}</p>
                </td></tr>
              ) : (
                paginatedDonations.map(donation => (
                  <tr key={donation._id} className="hover:bg-[#F0F8F1]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[#8DAA91]" />
                          <span className="font-semibold text-[#4A3F35] text-sm">{donation.receiptNumber || 'Pending'}</span>
                        </div>
                        <p className="text-xs text-[#2E2E2E]/70">{donation.donor?.isAnonymous ? 'Anonymous' : donation.donor?.fullName || 'N/A'}</p>
                        {!donation.donor?.isAnonymous && <p className="text-xs text-[#2E2E2E]/50">{donation.donor?.email}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-green-600" />
                        <span className="font-bold text-green-600">LKR {donation.amount?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#8DAA91]/10 text-[#4A6B4A] rounded text-xs">{getPurposeLabel(donation.purpose)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-[#2E2E2E]/80">
                        <MapPin size={14} className="text-[#8DAA91]" /><span>{donation.allocatedProvince || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#2E2E2E]/70 space-y-1">
                        <p className="capitalize">{donation.paymentMethod?.replace('-', ' ') || 'N/A'}</p>
                        {donation.transactionId && <p className="text-[#2E2E2E]/50 font-mono">{donation.transactionId}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#2E2E2E]/70">{donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-GB') : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(donation.paymentStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedDonation(donation); setShowDetailModal(true); }} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"><Eye size={15} /></button>
                        {donation.paymentStatus === 'pending' && (
                          <button onClick={() => { setSelectedDonation(donation); setShowAcknowledgeModal(true); }} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"><Check size={15} /></button>
                        )}
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
      {filteredDonations.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{filteredDonations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>
              {' – '}<span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredDonations.length)}</span>
              {' of '}<span className="font-semibold text-[#4A3F35]">{filteredDonations.length.toLocaleString()}</span> donations
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

      {/* detail modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35]">Donation Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-black/10 rounded-lg"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-[#F0F8F1] rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Receipt Number</p><p className="font-bold text-[#4A3F35]">{selectedDonation.receiptNumber || 'Pending'}</p></div>
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Status</p>{getStatusBadge(selectedDonation.paymentStatus)}</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#4A3F35] mb-3">Donor Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Name</p><p className="text-sm font-medium">{selectedDonation.donor?.isAnonymous ? 'Anonymous' : selectedDonation.donor?.fullName}</p></div>
                  {!selectedDonation.donor?.isAnonymous && (
                    <>
                      <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Email</p><p className="text-sm font-medium">{selectedDonation.donor?.email}</p></div>
                      <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Phone</p><p className="text-sm font-medium">{selectedDonation.donor?.phone || 'N/A'}</p></div>
                      <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Country</p><p className="text-sm font-medium">{selectedDonation.donor?.country || 'N/A'}</p></div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-[#4A3F35] mb-3">Donation Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Amount</p><p className="text-xl font-bold text-green-600">LKR {selectedDonation.amount?.toLocaleString()}</p></div>
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Purpose</p><p className="text-sm font-medium">{getPurposeLabel(selectedDonation.purpose)}</p></div>
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Province</p><p className="text-sm font-medium">{selectedDonation.allocatedProvince}</p></div>
                  <div><p className="text-xs text-[#2E2E2E]/50 mb-1">Date</p><p className="text-sm font-medium">{new Date(selectedDonation.createdAt).toLocaleString('en-GB')}</p></div>
                </div>
              </div>
              {selectedDonation.message && (
                <div><h4 className="text-lg font-semibold text-[#4A3F35] mb-3">Message</h4><p className="text-sm text-[#2E2E2E]/70 bg-[#F0F8F1] p-4 rounded-lg">{selectedDonation.message}</p></div>
              )}
              {selectedDonation.notes && (
                <div><h4 className="text-lg font-semibold text-[#4A3F35] mb-3">Admin Notes</h4><p className="text-sm text-[#2E2E2E]/70 bg-yellow-50 p-4 rounded-lg">{selectedDonation.notes}</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* acknowledge modal */}
      {showAcknowledgeModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-green-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Acknowledge Donation</h2>
              <p className="text-[#2E2E2E]/70">Mark this donation as completed and send confirmation email to <strong>{selectedDonation.donor?.isAnonymous ? 'anonymous donor' : selectedDonation.donor?.fullName}</strong></p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Admin Notes (Optional)</label>
                <textarea rows={3} value={acknowledgeNotes} onChange={e => setAcknowledgeNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#8DAA91]/20 rounded-xl focus:outline-none focus:border-[#8DAA91] resize-none" placeholder="Add any notes about this donation..." />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowAcknowledgeModal(false); setSelectedDonation(null); setAcknowledgeNotes(''); }}
                className="flex-1 px-6 py-3 border-2 border-[#8DAA91] text-[#8DAA91] rounded-xl hover:bg-[#8DAA91]/10 transition-all">Cancel</button>
              <button onClick={handleAcknowledge} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all">Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;