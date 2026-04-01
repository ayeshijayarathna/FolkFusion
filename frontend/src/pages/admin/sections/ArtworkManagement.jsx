import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye, Search, Star, Save,
  AlertCircle, CheckCircle, Loader2, XCircle, X, Sparkles,
  Trash2, Image as ImageIcon,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Palette, ShoppingBag, Heart, BarChart2
} from 'lucide-react';
import { artworkAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ART_CATEGORIES } from '../../../utils/constants';

const ArtworkManagement = () => {
  const [artworks, setArtworks]                 = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [searchQuery, setSearchQuery]           = useState('');
  const [filterCategory, setFilterCategory]     = useState('all');
  const [filterSale, setFilterSale]             = useState('all');
  const [currentPage, setCurrentPage]           = useState(1);
  const [pageSize, setPageSize]                 = useState(25);
  const [showModal, setShowModal]               = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [selectedArtwork, setSelectedArtwork]   = useState(null);
  const [notification, setNotification]         = useState(null);
  const [togglingId, setTogglingId]             = useState(null);

  const { user } = useAuth();
  const userProvince = user?.province;

  const stats = useMemo(() => ({
    total:    artworks.length,
    forSale:  artworks.filter(a => a.isForSale).length,
    featured: artworks.filter(a => a.isFeatured).length,
    views:    artworks.reduce((sum, a) => sum + (a.views || 0), 0),
  }), [artworks]);

  useEffect(() => { fetchArtworks(); }, [userProvince]);
  useEffect(() => { applyFilters(); setCurrentPage(1); }, [searchQuery, filterCategory, filterSale, artworks]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await artworkAPI.getAll({ province: userProvince, limit: 500 });
      setArtworks(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch artworks');
      console.error(err);
    } finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...artworks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.artist?.fullName?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'all') filtered = filtered.filter(a => a.category === filterCategory);
    if (filterSale === 'forSale')    filtered = filtered.filter(a => a.isForSale);
    if (filterSale === 'notForSale') filtered = filtered.filter(a => !a.isForSale);
    setFilteredArtworks(filtered);
  };

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / pageSize));
  const paginatedArtworks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtworks.slice(start, start + pageSize);
  }, [filteredArtworks, currentPage, pageSize]);

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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleView = (artwork) => { setSelectedArtwork(artwork); setShowModal(true); };
  const handleDeleteConfirm = (artwork) => { setSelectedArtwork(artwork); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await artworkAPI.delete(selectedArtwork._id);
      showNotification('Artwork deleted successfully');
      setShowDeleteModal(false); setSelectedArtwork(null);
      fetchArtworks();
    } catch (err) { showNotification('Failed to delete artwork', 'error'); }
  };

  const handleToggleFeatured = async (artwork) => {
    setTogglingId(artwork._id);
    try {
      await artworkAPI.toggleFeatured(artwork._id);
      showNotification(artwork.isFeatured ? 'Removed from featured' : 'Marked as featured');
      fetchArtworks();
    } catch (err) { showNotification('Failed to update featured status', 'error');
    } finally { setTogglingId(null); }
  };

  const getPrimaryImage = (artwork) =>
    artwork.images?.find(i => i.isPrimary)?.url || artwork.images?.[0]?.url || null;

  const formatPrice = (price) => {
    if (!price?.amount) return 'N/A';
    return `${price.currency || 'LKR'} ${price.amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">

      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transition-all ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Artwork Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Browse and manage artworks from {userProvince} Province</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-red-600 text-sm">{error}</p></div>}

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Artworks', value: stats.total,    icon: <Palette size={24} />,   bg: 'bg-[#A67C52]/10', ic: 'text-[#A67C52]',   val: 'text-[#4A3F35]' },
          { label: 'For Sale',       value: stats.forSale,  icon: <ShoppingBag size={24}/>, bg: 'bg-green-100',    ic: 'text-green-600',   val: 'text-green-600' },
          { label: 'Featured',       value: stats.featured, icon: <Sparkles size={24}/>,   bg: 'bg-yellow-100',   ic: 'text-yellow-500',  val: 'text-yellow-500' },
          { label: 'Total Views',    value: stats.views.toLocaleString(), icon: <BarChart2 size={24}/>, bg: 'bg-blue-100', ic: 'text-blue-600', val: 'text-blue-600' },
        ].map(({ label, value, icon, bg, ic, val }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-[#2E2E2E]/60 text-sm">{label}</p><p className={`text-3xl font-bold mt-2 ${val}`}>{value}</p></div>
              <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center ${ic}`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/*filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search by title, artist, or category..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]">
            <option value="all">All Categories</option>
            {ART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterSale} onChange={(e) => setFilterSale(e.target.value)}
            className="px-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]">
            <option value="all">All Artworks</option>
            <option value="forSale">For Sale</option>
            <option value="notForSale">Not For Sale</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Artwork</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Artist</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Featured</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A67C52]/10">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A67C52] border-t-transparent" /></div>
                </td></tr>
              ) : filteredArtworks.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Palette size={48} className="text-[#2E2E2E]/30 mb-4" />
                    <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Artworks Found</p>
                    <p className="text-[#2E2E2E]/40 text-sm">{searchQuery || filterCategory !== 'all' || filterSale !== 'all' ? 'Try adjusting your filters' : `No artworks uploaded yet in ${userProvince} Province`}</p>
                  </div>
                </td></tr>
              ) : (
                paginatedArtworks.map((artwork) => {
                  const img = getPrimaryImage(artwork);
                  return (
                    <tr key={artwork._id} className="hover:bg-[#F4EDE4]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={artwork.title} className="w-12 h-12 rounded-lg object-cover border-2 border-[#A67C52]/20 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#A67C52] to-[#C48A6A] rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon size={20} className="text-white" /></div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-[#4A3F35] text-sm">{artwork.title}</p>
                              {artwork.isFeatured && <Sparkles size={12} className="text-yellow-500" fill="currentColor" />}
                            </div>
                            <p className="text-xs text-[#2E2E2E]/50">{artwork.availability || 'available'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#4A3F35] font-medium">{artwork.artist?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-[#2E2E2E]/50">{artwork.artist?.province || userProvince}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#A67C52]/10 text-[#A67C52] rounded text-xs font-medium">{artwork.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        {artwork.isForSale ? (
                          <div>
                            <p className="text-sm font-semibold text-green-600">{formatPrice(artwork.price)}</p>
                            <span className="text-xs text-green-500">For Sale</span>
                          </div>
                        ) : <span className="text-xs text-[#2E2E2E]/40">Not for sale</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/60"><Eye size={12} /> {artwork.views || 0} views</div>
                          <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/60"><Heart size={12} /> {artwork.likes || 0} likes</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleFeatured(artwork)} disabled={togglingId === artwork._id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${artwork.isFeatured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'} disabled:opacity-50`}>
                          {togglingId === artwork._id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} fill={artwork.isFeatured ? 'currentColor' : 'none'} />}
                          {artwork.isFeatured ? 'Featured' : 'Set Featured'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(artwork)} className="p-2 bg-[#A67C52]/10 text-[#A67C52] rounded-lg hover:bg-[#A67C52]/20 transition-colors"><Eye size={16} /></button>
                          <button onClick={() => handleDeleteConfirm(artwork)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><Trash2 size={16} /></button>
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
      {filteredArtworks.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing <span className="font-semibold text-[#4A3F35]">{(currentPage - 1) * pageSize + 1}</span>
              {' – '}
              <span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredArtworks.length)}</span>
              {' of '}
              <span className="font-semibold text-[#4A3F35]">{filteredArtworks.length.toLocaleString()}</span> artworks
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows per page:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#A67C52]/20 rounded-lg px-2 py-1 focus:outline-none focus:border-[#A67C52]">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft size={16} /></button>
            <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
            {pageNumbers.map((p, idx) =>
              p === '...' ? <span key={`e-${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm select-none">…</span> : (
                <button key={`p-${p}`} type="button" onClick={() => goToPage(p)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${currentPage === p ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'border-[#A67C52]/20 text-[#4A3F35] hover:bg-[#A67C52]/10'}`}>{p}</button>
              )
            )}
            <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
            <button type="button" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight size={16} /></button>
          </div>
        </div>
      )}

      {/* view modal */}
      {showModal && selectedArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35] flex items-center gap-2"><Eye size={24} className="text-[#A67C52]" />Artwork Details</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              {selectedArtwork.images?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4A3F35] mb-3 flex items-center gap-2"><ImageIcon size={16} className="text-[#A67C52]" /> Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedArtwork.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-[#A67C52]/20" />
                        {img.isPrimary && <span className="absolute top-1 left-1 bg-[#A67C52] text-white text-xs px-2 py-0.5 rounded">Primary</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Title',         value: selectedArtwork.title },
                  { label: 'Artist',        value: selectedArtwork.artist?.fullName },
                  { label: 'Category',      value: selectedArtwork.category },
                  { label: 'Province',      value: selectedArtwork.province },
                  { label: 'Availability',  value: selectedArtwork.availability },
                  { label: 'Creation Year', value: selectedArtwork.creationYear },
                  { label: 'For Sale',      value: selectedArtwork.isForSale ? 'Yes' : 'No' },
                  { label: 'Price',         value: selectedArtwork.isForSale ? formatPrice(selectedArtwork.price) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F4EDE4]/40 rounded-xl p-4">
                    <p className="text-xs text-[#2E2E2E]/50 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-[#4A3F35]">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {selectedArtwork.description && (
                <div className="bg-[#F4EDE4]/40 rounded-xl p-4">
                  <p className="text-xs text-[#2E2E2E]/50 mb-2">Description</p>
                  <p className="text-sm text-[#4A3F35]">{selectedArtwork.description}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center"><Eye size={20} className="text-blue-500 mx-auto mb-1" /><p className="text-2xl font-bold text-blue-600">{selectedArtwork.views || 0}</p><p className="text-xs text-blue-400">Views</p></div>
                <div className="bg-red-50 rounded-xl p-4 text-center"><Heart size={20} className="text-red-400 mx-auto mb-1" /><p className="text-2xl font-bold text-red-500">{selectedArtwork.likes || 0}</p><p className="text-xs text-red-300">Likes</p></div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center"><Sparkles size={20} className="text-yellow-500 mx-auto mb-1" /><p className="text-2xl font-bold text-yellow-600">{selectedArtwork.isFeatured ? 'Yes' : 'No'}</p><p className="text-xs text-yellow-400">Featured</p></div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t-2 border-[#A67C52]/20">
                <button onClick={() => { setShowModal(false); handleToggleFeatured(selectedArtwork); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${selectedArtwork.isFeatured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>
                  <Sparkles size={16} />{selectedArtwork.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
                </button>
                <button onClick={() => { setShowModal(false); handleDeleteConfirm(selectedArtwork); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">
                  <Trash2 size={16} />Delete
                </button>
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && selectedArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="text-red-600" size={32} /></div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Artwork?</h2>
              <p className="text-[#2E2E2E]/70">Are you sure you want to delete <strong>{selectedArtwork.title}</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setSelectedArtwork(null); }} className="flex-1 px-6 py-3 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtworkManagement;