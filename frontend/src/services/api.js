import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Main API instance (artists / admins / public) 
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('change-password') || requestUrl.includes('change_password'))
        return Promise.reject(error);

      const userStr = localStorage.getItem('user');
      let userRole = null;
      try { const user = JSON.parse(userStr); userRole = user?.role; } catch (e) {}

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const currentPath = window.location.pathname;
      if (userRole === 'admin' || currentPath.startsWith('/admin')) {
        window.location.href = '/system/admin-portal';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

//Super Admin API instance 
const superAdminAxios = axios.create({
  baseURL: `${API_URL}/super-admin`,
  headers: { 'Content-Type': 'application/json' },
});

superAdminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superAdminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

superAdminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      window.location.href = '/system/super-admin';
    }
    return Promise.reject(error);
  }
);

// learning Super Admin helper 
const learningAdminAxios = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

learningAdminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superAdminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

learningAdminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      window.location.href = '/system/super-admin';
    }
    return Promise.reject(error);
  }
);

//auth
export const authAPI = {
  login:          (credentials) => api.post('/auth/login', credentials),
  getMe:          ()             => api.get('/auth/me'),
  changePassword: (data)         => api.put('/auth/change-password', data),
  logout:         ()             => api.post('/auth/logout'),
};

//Admin API 
export const adminAPI = {
  getAllAdmins:        ()       => api.get('/admin/all-admins'),
  getMyProfile:       ()       => api.get('/admin/profile'),
  updateProfile: (data) => {
    if (data instanceof FormData) return api.put('/admin/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return api.put('/admin/profile', data);
  },
  changePassword:       (data)     => api.put('/admin/change-password', data),
  getCourses:           (params)   => api.get(`/admin/courses?${params}`),
  getCourseById:        (id)       => api.get(`/admin/courses/${id}`),
  createCourse:         (data)     => api.post('/admin/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCourse:         (id, data) => api.put(`/admin/courses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCourse:         (id)       => api.delete(`/admin/courses/${id}`),
  updateCourseStatus:   (id, data) => api.patch(`/admin/courses/${id}/status`, data),
  toggleCourseFeatured: (id)       => api.patch(`/admin/courses/${id}/featured`),
  getCourseStats:       ()         => api.get('/admin/courses/stats'),
  getAiInsights:        ()         => api.get('/admin/ai-insights'),
  getFeaturedCourses:   ()         => api.get('/admin/courses/featured'),
};

//Artist APIs
export const artistAPI = {
  getAll:          (params) => api.get('/artists', { params }),
  getById:         (id)     => api.get(`/artists/${id}`),
  getMyProfile:    ()       => api.get('/artists/me/profile'),
  updateProfile: (data) => {
    if (data instanceof FormData) return api.put('/artists/me/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return api.put('/artists/me/profile', data);
  },
  changePassword:         (data)     => api.put('/artists/me/change-password', data),
  updateProfileImage:     (formData) => api.put('/artists/me/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  create:                 (data)     => api.post('/artists', data),
  getStats:               ()         => api.get('/artists/admin/stats'),
  getSpecializationStats: ()         => api.get('/artists/admin/specialization-stats'),
  getProvinceArtists:     (params)   => api.get('/artists/admin/province', { params }),
  getTopArtists:          (params)   => api.get('/artists/admin/top', { params }),
  approveArtist:          (id)       => api.put(`/artists/${id}/approve`),
  rejectArtist:           (id)       => api.put(`/artists/${id}/reject`),
  deleteArtist:           (id)       => api.delete(`/artists/${id}`),
  getTopArtistsByRevenue: ()         => api.get('/artists/admin/top-by-revenue'),
  setFeaturedBulk:        (data)     => api.put('/artists/admin/set-featured-bulk', data),
  toggleFeatured:         (id, data) => api.put(`/artists/${id}/toggle-featured`, data),
  clearAllFeatured:       ()         => api.put('/artists/admin/clear-featured'),
  getDashboardOverview:   ()         => api.get('/artists/me/dashboard-overview'),
  getAiInsights:          ()         => api.get('/artists/me/ai-insights'),
};

//Artwork APIs
export const artworkAPI = {
  getAll:             (params)   => api.get('/artworks', { params }),
  getById:            (id)       => api.get(`/artworks/${id}`),
  getFeatured:        ()         => api.get('/artworks/featured'),
  getStatsByCategory: (params)   => api.get('/artworks/stats/by-category', { params }),
  getMyArtworks:      (params)   => api.get('/artworks/me/my-artworks', { params }),
  create:             (formData) => api.post('/artworks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:             (id, data) => api.put(`/artworks/${id}`, data),
  delete:             (id)       => api.delete(`/artworks/${id}`),
  getStats:           (params)   => api.get('/artworks/stats', { params }),
  toggleFeatured:     (id)       => api.put(`/artworks/admin/${id}/toggle-featured`),
};

//Event APIs 
export const eventAPI = {
  getAll:             (params)   => api.get('/events', { params }),
  getAllEvents:        (params)   => api.get('/events', { params }),
  getEvent:           (id)       => api.get(`/events/${id}`),
  getMyEvents:        ()         => api.get('/events/me/registered'),
  registerForEvent:   (id)       => api.post(`/events/${id}/register`),
  cancelRegistration: (id)       => api.delete(`/events/${id}/register`),
  createEvent:        (formData) => api.post('/events', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateEvent: (id, data) => {
    if (data instanceof FormData) return api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return api.put(`/events/${id}`, data);
  },
  deleteEvent:       (id)     => api.delete(`/events/${id}`),
  getProvinceEvents: (params) => api.get('/events/admin/province-events', { params }),
  getEventStats:     ()       => api.get('/events/stats'),
};

// Course APIs
export const courseAPI = {
  getCourses:     (params)      => api.get(`/courses?${params}`),
  getCourseById:  (id)          => api.get(`/courses/${id}`),
  createCourse:   (data)        => api.post('/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCourse:   (id, data)    => api.put(`/courses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteCourse:   (id)          => api.delete(`/courses/${id}`),
  updateStatus:   (id, status)  => api.patch(`/courses/${id}/status`, { status }),
  toggleFeatured: (id)          => api.patch(`/courses/${id}/featured`),
  getStats:       ()            => api.get('/courses/stats'),
  getFeatured:    ()            => api.get('/courses/featured'),
};

//Donation APIs
export const donationAPI = {
  create:              (data)        => api.post('/donations', data),
  getById:             (id)          => api.get(`/donations/${id}`),
  updatePaymentStatus: (id, data)    => api.put(`/donations/${id}/payment-status`, data),
  getAll:              (params = '') => api.get(`/donations${params ? `?${params}` : ''}`),
  getStats:            ()            => api.get('/donations/stats'),
  acknowledge:         (id, data)    => api.put(`/donations/${id}/acknowledge`, data),
};

//Marketplace APIs 
export const marketplaceAPI = {
  getAll:               (params)           => api.get('/marketplace', { params }),
  getById:              (id)               => api.get(`/marketplace/${id}`),
  getMyListings:        (params)           => api.get('/marketplace/me/listings', { params }),
  create:               (data)             => api.post('/marketplace', data),
  update:               (id, data)         => api.put(`/marketplace/${id}`, data),
  delete:               (id)               => api.delete(`/marketplace/${id}`),
  recordSale:           (id, data)         => api.post(`/marketplace/${id}/record-sale`, data),
  toggleFeatured:       (id)               => api.put(`/marketplace/${id}/toggle-featured`),
  deleteItem:           (id)               => api.delete(`/marketplace/${id}`),
  getMySales:           (params)           => api.get('/marketplace/me/sales', { params }),
  getProvinceItems:     (params)           => api.get('/marketplace/province-items', { params }),
  getProvinceSalesStats:(params)           => api.get('/marketplace/province-sales-stats', { params }),
  getArtistRevenue:     (artistId, params) => api.get(`/marketplace/artist-revenue/${artistId}`, { params }),
  getMyOrders:          (params)           => api.get('/marketplace/me/orders', { params }),
  updateOrderStatus:    (saleId, data)     => api.patch(`/marketplace/orders/${saleId}/status`, data),
  confirmPayment:       (saleId)           => api.patch(`/marketplace/orders/${saleId}/confirm-payment`),
  trackOrder:           (orderId)          => api.get(`/marketplace/track/${orderId}`),
};

//News APIs 
export const newsAPI = {
  getAll:           (params)       => api.get('/news', { params }),
  getById:          (id)           => api.get(`/news/${id}`),
  getFeatured:      (params)       => api.get('/news/featured', { params }),
  getLatest:        (params)       => api.get('/news/latest', { params }),
  getStats:         ()             => api.get('/news/stats'),
  getProvinceNews:  (params)       => api.get('/news/admin/province-news', { params }),
  getProvinceStats: ()             => api.get('/news/admin/province-stats'),
  create:           (formData)     => api.post('/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:           (id, formData) => api.put(`/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:           (id)           => api.delete(`/news/${id}`),
  toggleFeatured:   (id)           => api.put(`/news/${id}/toggle-featured`),
};

//Historical Places APIs
export const historicalPlacesAPI = {
  getAll:         (params)       => api.get('/historical-places', { params }),
  getById:        (id)           => api.get(`/historical-places/${id}`),
  create:         (data)         => api.post('/historical-places', data),
  update:         (id, data)     => api.put(`/historical-places/${id}`, data),
  delete:         (id)           => api.delete(`/historical-places/${id}`),
  uploadImages:   (id, formData) => api.post(`/historical-places/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage:    (id, imageUrl) => api.delete(`/historical-places/${id}/images`, { data: { imageUrl } }),
  getStats:       ()             => api.get('/historical-places/admin/stats'),
  toggleFeatured: (id)           => api.patch(`/historical-places/${id}/featured`),
};

//Payment APIs
export const paymentAPI = {
  createIntent:  (data)   => api.post('/payments/create-intent', data),
  createOrder:   (data)   => api.post('/payments/create-order', data),
  getMyOrders:   (email)  => api.get('/payments/my-orders', { params: { email } }),
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
  getStats:      ()       => api.get('/payments/admin/stats'),
};

//Inquiry APIs 
export const inquiryAPI = {
  create:              (data)     => api.post('/inquiries', data),
  getProvinceList:     ()         => api.get('/inquiries/province'),
  getProvinceStats:    ()         => api.get('/inquiries/province/stats'),
  update:              (id, data) => api.put(`/inquiries/${id}`, data),
  reply:               (id, data) => api.post(`/inquiries/${id}/reply`, data),
  delete:              (id)       => api.delete(`/inquiries/${id}`),
  createArtistInquiry: (data)     => api.post('/inquiries/artist', data),
  getMyInquiries:      ()         => api.get('/inquiries/my'),
  updateMyInquiry:     (id, data) => api.put(`/inquiries/my/${id}`, data),
  deleteMyInquiry:     (id)       => api.delete(`/inquiries/my/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markAsRead:     (id)     => api.patch(`/notifications/${id}/read`),
  markAllAsRead:  ()       => api.patch('/notifications/read-all'),
  deleteOne:      (id)     => api.delete(`/notifications/${id}`),
  clearAll:       ()       => api.delete('/notifications'),
};

//Super Admin APIs
export const superAdminAPI = {
  login:              (credentials) => superAdminAxios.post('/auth/login', credentials),
  getMe:              ()             => superAdminAxios.get('/auth/me'),
  changeOwnPassword:  (data)         => superAdminAxios.put('/auth/change-password', data),
  getOverview:        ()             => superAdminAxios.get('/overview'),
  getAllAdmins:        ()             => superAdminAxios.get('/admins'),
  getAdminById:       (id)           => superAdminAxios.get(`/admins/${id}`),
  createAdmin:        (data)         => superAdminAxios.post('/admins', data),
  toggleAdminActive:  (id)           => superAdminAxios.patch(`/admins/${id}/toggle-active`),
  resetAdminPassword: (id, data)     => superAdminAxios.put(`/admins/${id}/reset-password`, data),
  deleteAdmin:        (id)           => superAdminAxios.delete(`/admins/${id}`),
};

export const learningAPI = {
  // Public
  getPublishedCategories: ()           => api.get('/learning/categories'),
  getCategoryContent:     (category)   => api.get(`/learning/categories/${encodeURIComponent(category)}`),
  getPublishedPatterns:   ()           => api.get('/learning/patterns'),
  registerUser:           (data)       => api.post('/learning/users/register', data),
  getUserByEmail:         (email)      => api.get(`/learning/users/${encodeURIComponent(email)}`),
  completeChapter:        (data)       => api.post('/learning/users/progress', data),
  submitReview:           (data)       => api.post('/learning/reviews', data),
  getApprovedReviews:     (category)   => api.get(`/learning/reviews/approved${category ? `?category=${encodeURIComponent(category)}` : ''}`),
 
  // Super Admin
  adminGetAll:        ()           => learningAdminAxios.get('/learning/admin/all'),
  adminCreateContent: (data)       => learningAdminAxios.post('/learning/admin/create', data),
  adminUpdate:        (id, data)   => learningAdminAxios.put(`/learning/admin/${id}`, data),
  adminUpdateMeta:    (id, data)   => learningAdminAxios.patch(`/learning/admin/${id}/meta`, data),  // NEW
  adminUpdateChapter: (id, idx, d) => learningAdminAxios.put(`/learning/admin/${id}/chapters/${idx}`, d),
  adminTogglePublish: (id)         => learningAdminAxios.patch(`/learning/admin/${id}/publish`),
  adminDeleteContent: (id)         => learningAdminAxios.delete(`/learning/admin/${id}`),
  adminGetPatterns:   ()           => learningAdminAxios.get('/learning/admin/patterns'),
  adminCreatePattern: (data)       => learningAdminAxios.post('/learning/admin/patterns', data),
  adminUpdatePattern: (id, data)   => learningAdminAxios.put(`/learning/admin/patterns/${id}`, data),
  adminDeletePattern: (id)         => learningAdminAxios.delete(`/learning/admin/patterns/${id}`),
  adminGetUsers:      ()           => learningAdminAxios.get('/learning/admin/users'),
  adminGetReviews:    (status)     => learningAdminAxios.get(`/learning/admin/reviews${status ? `?status=${status}` : ''}`),
  adminUpdateReview:  (id, status) => learningAdminAxios.patch(`/learning/admin/reviews/${id}`, { status }),
};
 


export default api;