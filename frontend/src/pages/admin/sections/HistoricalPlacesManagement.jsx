import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Eye, Search, MapPin, Save,
  AlertCircle, CheckCircle, Loader2, XCircle, X, Building2,
  Upload, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { historicalPlacesAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ART_CATEGORIES } from '../../../utils/constants';

const HistoricalPlacesManagement = () => {
  const [places, setPlaces]                   = useState([]);
  const [filteredPlaces, setFilteredPlaces]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [filterStatus, setFilterStatus]       = useState('all');
  const [currentPage, setCurrentPage]         = useState(1);
  const [pageSize, setPageSize]               = useState(25);
  const [showModal, setShowModal]             = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode]             = useState('create');
  const [selectedPlace, setSelectedPlace]     = useState(null);
  const [notification, setNotification]       = useState(null);
  const [formErrors, setFormErrors]           = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews]     = useState([]);
  const [selectedFiles, setSelectedFiles]     = useState([]);

  const { user } = useAuth();
  const userProvince = user?.province;

  const emptyForm = {
    name: '',
    province: userProvince || 'Central',
    district: '',
    city: '',
    location: '',
    artType: '',
    description: '',
    culturalImportance: '',
    history: '',
    images: [],
    facilities: [],
    nearbyAttractions: [],
    status: 'active',
  };

  const [formData, setFormData] = useState(emptyForm);

  const stats = {
    total:    places.length,
    active:   places.filter(p => p.status === 'active').length,
    inactive: places.filter(p => p.status === 'inactive').length,
    draft:    places.filter(p => p.status === 'draft').length,
  };

  useEffect(() => { fetchPlaces(); }, [userProvince]);
  useEffect(() => { applyFilters(); setCurrentPage(1); }, [searchQuery, filterStatus, places]);

  const totalPages     = Math.max(1, Math.ceil(filteredPlaces.length / pageSize));
  const paginatedPlaces = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlaces.slice(start, start + pageSize);
  }, [filteredPlaces, currentPage, pageSize]);

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

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await historicalPlacesAPI.getAll({ province: userProvince });
      setPlaces(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch historical places');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...places];
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus);
    setFilteredPlaces(filtered);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    setImagePreviews([]);
    setSelectedFiles([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) { showNotification('Only image files are allowed', 'error'); return false; }
      if (file.size > 5 * 1024 * 1024) { showNotification(`${file.name} is too large. Max 5MB`, 'error'); return false; }
      return true;
    });
    if (!validFiles.length) return;
    setImagePreviews(prev => [...prev, ...validFiles.map(f => ({ file: f, preview: URL.createObjectURL(f), name: f.name }))]);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeImagePreview = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imagePath, placeId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await historicalPlacesAPI.deleteImage(placeId, imagePath);
      showNotification('Image deleted');
      setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== imagePath) }));
      fetchPlaces();
    } catch { showNotification('Failed to delete image', 'error'); }
  };

  const uploadImages = async (placeId) => {
    if (!selectedFiles.length) return;
    setUploadingImages(true);
    const fd = new FormData();
    selectedFiles.forEach(f => fd.append('images', f));
    try {
      await historicalPlacesAPI.uploadImages(placeId, fd);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreate = () => { setModalMode('create'); resetForm(); setShowModal(true); };

  const handleEdit = (place) => {
    setModalMode('edit');
    setSelectedPlace(place);
    setFormData({
      name:               place.name || '',
      province:           place.province || userProvince,
      district:           place.district || '',
      city:               place.city || '',
      location:           place.location || '',
      artType:            place.artType || '',
      description:        place.description || '',
      culturalImportance: place.culturalImportance || '',
      history:            place.history || '',
      images:             place.images || [],
      facilities:         place.facilities || [],
      nearbyAttractions:  place.nearbyAttractions || [],
      status:             place.status || 'active',
    });
    setFormErrors({});
    setImagePreviews([]);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleView = (place) => {
    setModalMode('view');
    setSelectedPlace(place);
    setFormData({ ...emptyForm, ...place });
    setShowModal(true);
  };

  const handleDeleteConfirm = (place) => { setSelectedPlace(place); setShowDeleteModal(true); };

  const handleDelete = async () => {
    try {
      await historicalPlacesAPI.delete(selectedPlace._id);
      showNotification('Place deleted successfully');
      setShowDeleteModal(false);
      setSelectedPlace(null);
      fetchPlaces();
    } catch { showNotification('Failed to delete place', 'error'); }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim())               errors.name               = 'Place name is required';
    if (!formData.district.trim())           errors.district           = 'District is required';
    if (!formData.city.trim())               errors.city               = 'City is required';
    if (!formData.location.trim())           errors.location           = 'Location is required';
    if (!formData.artType)                   errors.artType            = 'Art type is required';
    if (!formData.description.trim())        errors.description        = 'Description is required';
    if (!formData.culturalImportance.trim()) errors.culturalImportance = 'Cultural importance is required';
    if (!formData.history.trim())            errors.history            = 'History is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { showNotification('Please fix the errors in the form', 'error'); return; }
    const dataToSubmit = { ...formData, province: userProvince };
    try {
      let placeId;
      if (modalMode === 'create') {
        const response = await historicalPlacesAPI.create(dataToSubmit);
        placeId = response.data.data._id;
        showNotification('Historical place created successfully');
      } else {
        await historicalPlacesAPI.update(selectedPlace._id, dataToSubmit);
        placeId = selectedPlace._id;
        showNotification('Historical place updated successfully');
      }
      if (selectedFiles.length > 0) {
        try { await uploadImages(placeId); showNotification('Images uploaded successfully'); }
        catch { showNotification('Place saved but image upload failed', 'error'); }
      }
      setShowModal(false);
      fetchPlaces();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleArrayInput = (field, value) => {
    setFormData({ ...formData, [field]: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
      formErrors[field] ? 'border-red-400' : 'border-[#A67C52]/20 focus:border-[#A67C52]'
    } ${modalMode === 'view' ? 'bg-[#F4EDE4]/40 cursor-not-allowed' : 'bg-white'}`;

  const getStatusBadge = (place) => {
    const cfg = {
      active:   { cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} />, label: 'Active' },
      draft:    { cls: 'bg-blue-100 text-blue-700',   icon: <AlertCircle size={14} />, label: 'Draft'  },
      inactive: { cls: 'bg-gray-100 text-gray-600',   icon: <XCircle size={14} />,     label: 'Inactive'},
    }[place.status] || { cls: 'bg-gray-100 text-gray-600', icon: <XCircle size={14} />, label: 'Unknown' };
    return (
      <span className={`px-3 py-1 ${cfg.cls} rounded-full text-xs font-semibold flex items-center gap-1`}>
        {cfg.icon}{cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#4A3F35]">Historical Places Management</h1>
          <p className="text-[#2E2E2E]/70 mt-1">Manage cultural heritage sites in {userProvince} Province</p>
        </div>
        <button onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8DAA91] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all">
          <Plus size={20} /> Add New Place
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Places', value: stats.total,    color: 'text-[#4A3F35]', bg: 'bg-[#A67C52]/10', icon: <Building2 className="text-[#A67C52]" size={24} /> },
          { label: 'Active',       value: stats.active,   color: 'text-green-600', bg: 'bg-green-100',    icon: <CheckCircle className="text-green-600" size={24} /> },
          { label: 'Draft',        value: stats.draft,    color: 'text-blue-600',  bg: 'bg-blue-100',     icon: <AlertCircle className="text-blue-600" size={24} /> },
          { label: 'Inactive',     value: stats.inactive, color: 'text-gray-500',  bg: 'bg-gray-100',     icon: <XCircle className="text-gray-500" size={24} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#2E2E2E]/60 text-sm">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color} mt-2`}>{s.value}</p>
              </div>
              <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E2E2E]/40" size={20} />
            <input type="text" placeholder="Search by name, city or district..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-[#A67C52]/20 rounded-lg focus:outline-none focus:border-[#A67C52]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8DAA91] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Place</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">District / City</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Art Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A67C52]/10">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A67C52] border-t-transparent" />
                  </div>
                </td></tr>
              ) : paginatedPlaces.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center">
                  <Building2 size={48} className="text-[#2E2E2E]/30 mb-4 mx-auto" />
                  <p className="text-[#2E2E2E]/60 text-lg font-semibold mb-2">No Historical Places Found</p>
                  <p className="text-[#2E2E2E]/40 text-sm">
                    {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : `Add your first place in ${userProvince} Province`}
                  </p>
                </td></tr>
              ) : (
                paginatedPlaces.map(place => (
                  <tr key={place._id} className="hover:bg-[#F4EDE4]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {place.images?.length > 0 ? (
                          <img src={place.images[0]} alt={place.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#A67C52]/20" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#A67C52] to-[#C48A6A] rounded-full flex items-center justify-center text-white font-semibold">
                            {place.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#4A3F35]">{place.name}</p>
                          <p className="text-xs text-[#2E2E2E]/60 line-clamp-1">{place.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-[#2E2E2E]/80">
                        <MapPin size={14} className="text-[#A67C52]" />
                        {[place.city, place.district].filter(Boolean).join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {place.artType ? (
                        <span className="px-2 py-1 bg-[#A67C52]/10 text-[#A67C52] rounded text-xs font-medium">{place.artType}</span>
                      ) : <span className="text-xs text-[#2E2E2E]/40">—</span>}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(place)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(place)} title="View"
                          className="p-2 bg-[#A67C52]/10 text-[#A67C52] rounded-lg hover:bg-[#A67C52]/20 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(place)} title="Edit"
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteConfirm(place)} title="Delete"
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                          <Trash2 size={16} />
                        </button>
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
      {filteredPlaces.length > 0 && (
        <div className="bg-white rounded-xl shadow-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-[#2E2E2E]/60">
              Showing{' '}
              <span className="font-semibold text-[#4A3F35]">{(currentPage - 1) * pageSize + 1}</span>
              {' – '}
              <span className="font-semibold text-[#4A3F35]">{Math.min(currentPage * pageSize, filteredPlaces.length)}</span>
              {' of '}
              <span className="font-semibold text-[#4A3F35]">{filteredPlaces.length}</span> places
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#2E2E2E]/50">Rows:</label>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-sm border-2 border-[#A67C52]/20 rounded-lg px-2 py-1 focus:outline-none focus:border-[#A67C52]">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: <ChevronsLeft size={16} />, fn: () => goToPage(1),               dis: currentPage === 1 },
              { icon: <ChevronLeft  size={16} />, fn: () => goToPage(currentPage - 1), dis: currentPage === 1 },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} disabled={b.dis}
                className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                {b.icon}
              </button>
            ))}
            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`e${idx}`} className="px-2 text-[#2E2E2E]/40 text-sm">…</span>
              ) : (
                <button key={`pg${p}`} onClick={() => goToPage(p)}
                  className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    currentPage === p ? 'bg-[#A67C52] text-white border-[#A67C52]' : 'border-[#A67C52]/20 text-[#4A3F35] hover:bg-[#A67C52]/10'
                  }`}>{p}
                </button>
              )
            )}
            {[
              { icon: <ChevronRight  size={16} />, fn: () => goToPage(currentPage + 1), dis: currentPage === totalPages },
              { icon: <ChevronsRight size={16} />, fn: () => goToPage(totalPages),       dis: currentPage === totalPages },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} disabled={b.dis}
                className="p-2 rounded-lg border-2 border-[#A67C52]/20 text-[#A67C52] hover:bg-[#A67C52]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                {b.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* create,edit,view modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

            {/* modal header */}
            <div className="sticky top-0 bg-[#8DAA91]/20 p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-2xl font-bold text-[#4A3F35] flex items-center gap-2">
                {modalMode === 'create' && <Plus size={24} className="text-[#A67C52]" />}
                {modalMode === 'edit'   && <Edit2 size={24} className="text-blue-600" />}
                {modalMode === 'view'   && <Eye size={24} className="text-[#A67C52]" />}
                {modalMode === 'create' ? 'Add New Place' : modalMode === 'edit' ? 'Edit Place' : 'View Place'}
              </h3>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* province banner */}
              <div className="bg-[#A67C52]/10 border-l-4 border-[#A67C52] rounded-r-xl p-4 flex items-center gap-3">
                <Building2 size={20} className="text-[#A67C52]" />
                <div>
                  <p className="text-sm font-semibold text-[#4A3F35]">Province</p>
                  <p className="text-lg font-bold text-[#A67C52]">{userProvince}</p>
                </div>
              </div>

              {/* image gallery */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2 flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#A67C52]" /> Image Gallery
                </h4>

                {formData.images?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[#4A3F35] mb-2">Existing Images ({formData.images.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img src={image} alt={`img ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-[#A67C52]/20" />
                          {modalMode !== 'view' && (
                            <button type="button" onClick={() => removeExistingImage(image, selectedPlace._id)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {modalMode !== 'view' && (
                  <div>
                    <div className="border-2 border-dashed border-[#A67C52]/30 rounded-xl p-6 text-center hover:border-[#A67C52] transition-colors">
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#A67C52]/10 flex items-center justify-center">
                          <Upload size={24} className="text-[#A67C52]" />
                        </div>
                        <p className="text-[#4A3F35] font-semibold text-sm">Click to upload images</p>
                        <p className="text-xs text-[#2E2E2E]/50">PNG, JPG, WEBP up to 5MB each</p>
                      </label>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-[#4A3F35] mb-2">New Images ({imagePreviews.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img src={preview.preview} alt={preview.name}
                                className="w-full h-24 object-cover rounded-lg border-2 border-[#A67C52]/40" />
                              <button type="button" onClick={() => removeImagePreview(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* basic information*/}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#A67C52]" /> Basic Information
                </h4>

                {/* place name */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Place Name *</label>
                  <input type="text" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    disabled={modalMode === 'view'} className={inputClass('name')} placeholder="Enter place name" />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* distric & city */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">District *</label>
                    <input type="text" value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      disabled={modalMode === 'view'} className={inputClass('district')} placeholder="e.g., Colombo" />
                    {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3F35] mb-2">City *</label>
                    <input type="text" value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      disabled={modalMode === 'view'} className={inputClass('city')} placeholder="e.g., Colombo 07" />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                {/* location */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Location *</label>
                  <input type="text" value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    disabled={modalMode === 'view'} className={inputClass('location')} placeholder="Specific address or landmark" />
                  {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                </div>

                {/* art type */}
                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Art Type *</label>
                  <select value={formData.artType}
                    onChange={e => setFormData({ ...formData, artType: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={inputClass('artType')}>
                    <option value="">Select art type...</option>
                    {ART_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {formErrors.artType && <p className="text-red-500 text-xs mt-1">{formErrors.artType}</p>}
                </div>
              </div>

              {/* descriptions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2">
                  Descriptions
                </h4>

                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Description *</label>
                  <textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    disabled={modalMode === 'view'} rows={3}
                    className={`${inputClass('description')} resize-none`}
                    placeholder="General description of the place" />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Cultural Importance *</label>
                  <textarea value={formData.culturalImportance}
                    onChange={e => setFormData({ ...formData, culturalImportance: e.target.value })}
                    disabled={modalMode === 'view'} rows={4}
                    className={`${inputClass('culturalImportance')} resize-none`}
                    placeholder="Why is this place culturally important?" />
                  {formErrors.culturalImportance && <p className="text-red-500 text-xs mt-1">{formErrors.culturalImportance}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">History *</label>
                  <textarea value={formData.history}
                    onChange={e => setFormData({ ...formData, history: e.target.value })}
                    disabled={modalMode === 'view'} rows={4}
                    className={`${inputClass('history')} resize-none`}
                    placeholder="Historical background and origins of this place" />
                  {formErrors.history && <p className="text-red-500 text-xs mt-1">{formErrors.history}</p>}
                </div>
              </div>

              {/* facilities */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#4A3F35] border-b-2 border-[#A67C52]/20 pb-2">
                  Facilities & Nearby Places
                </h4>

                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">
                    Facilities <span className="text-[#2E2E2E]/40 font-normal text-xs">(comma-separated)</span>
                  </label>
                  <input type="text" value={formData.facilities.join(', ')}
                    onChange={e => handleArrayInput('facilities', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52] disabled:bg-[#F4EDE4]/40"
                    placeholder="Parking, Guided Tours, Restrooms, Cafe" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4A3F35] mb-2">
                    Nearby Places <span className="text-[#2E2E2E]/40 font-normal text-xs">(comma-separated)</span>
                  </label>
                  <input type="text" value={formData.nearbyAttractions.join(', ')}
                    onChange={e => handleArrayInput('nearbyAttractions', e.target.value)}
                    disabled={modalMode === 'view'}
                    className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52] disabled:bg-[#F4EDE4]/40"
                    placeholder="Temple (5 min), Beach (15 min), Museum (10 min)" />
                </div>
              </div>

              {/* status */}
              <div>
                <label className="block text-sm font-semibold text-[#4A3F35] mb-2">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  disabled={modalMode === 'view'}
                  className="w-full px-4 py-3 border-2 border-[#A67C52]/20 rounded-xl focus:outline-none focus:border-[#A67C52] disabled:bg-[#F4EDE4]/40 disabled:cursor-not-allowed">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* form actions */}
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-4 pt-6 border-t-2 border-[#A67C52]/20">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploadingImages}
                    className="px-6 py-3 bg-gradient-to-r from-[#A67C52] to-[#C48A6A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    {uploadingImages
                      ? <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                      : <><Save size={18} /> {modalMode === 'create' ? 'Create Place' : 'Update Place'}</>
                    }
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* delete modal */}
      {showDeleteModal && selectedPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#4A3F35] mb-2">Delete Place?</h2>
              <p className="text-[#2E2E2E]/70">
                Are you sure you want to delete <strong>{selectedPlace.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowDeleteModal(false); setSelectedPlace(null); }}
                className="flex-1 px-6 py-3 border-2 border-[#A67C52] text-[#A67C52] rounded-xl hover:bg-[#A67C52]/10 transition-all">
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

export default HistoricalPlacesManagement;