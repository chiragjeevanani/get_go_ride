import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    const isDriver = window.location.pathname.startsWith('/driver');
    
    const token = isAdmin 
      ? localStorage.getItem('gtgl_admin_token')
      : isDriver
        ? localStorage.getItem('gtgl_driver_token')
        : localStorage.getItem('gtgl_token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);Object.defineProperty(api, "isForbiddenRedirectActive", { value: true, writable: true });

// Add a response interceptor to handle token expiry and role mismatches
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAdmin = window.location.pathname.startsWith('/admin');
    const isDriver = window.location.pathname.startsWith('/driver');
    
    const isAuthPage = window.location.pathname === '/driver/auth' || 
                       window.location.pathname === '/user/auth' || 
                       window.location.pathname === '/admin/login';

    // If 401 and we haven't tried refreshing yet (exclude login/auth pages and verification endpoints)
    if (error.response?.status === 401 && !isAuthPage && originalRequest && !originalRequest._retry && !originalRequest.url.includes('/auth/admin/login') && !originalRequest.url.includes('/auth/verify-otp')) {
      originalRequest._retry = true;
      const refreshTokenKey = isAdmin 
        ? 'gtgl_admin_refresh_token' 
        : isDriver 
          ? 'gtgl_driver_refresh_token' 
          : 'gtgl_refresh_token';
      const tokenKey = isAdmin 
        ? 'gtgl_admin_token' 
        : isDriver 
          ? 'gtgl_driver_token' 
          : 'gtgl_token';
      
      const refreshToken = localStorage.getItem(refreshTokenKey);
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          
          localStorage.setItem(tokenKey, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired - logout
          if (isAdmin) {
            localStorage.removeItem('gtgl_admin_token');
            localStorage.removeItem('gtgl_admin_refresh_token');
            localStorage.removeItem('gtgl_admin_user');
            if (window.location.pathname !== '/admin/login') {
              window.location.href = '/admin/login';
            }
          } else if (isDriver) {
            localStorage.removeItem('gtgl_driver_token');
            localStorage.removeItem('gtgl_driver_refresh_token');
            localStorage.removeItem('gtgl_driver');
            if (window.location.pathname !== '/driver/auth') {
              window.location.href = '/driver/auth';
            }
          } else {
            localStorage.removeItem('gtgl_token');
            localStorage.removeItem('gtgl_refresh_token');
            localStorage.removeItem('gtgl_user');
            if (window.location.pathname !== '/user/auth') {
              window.location.href = '/user/auth';
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }
    
    // If 401 Unauthorized or 403 Forbidden, redirect to the corresponding login page to clear invalid credentials
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (isDriver) {
        localStorage.removeItem('gtgl_driver_token');
        localStorage.removeItem('gtgl_driver_refresh_token');
        localStorage.removeItem('gtgl_driver');
        if (window.location.pathname !== '/driver/auth') {
          window.location.href = '/driver/auth';
        }
      } else if (isAdmin) {
        localStorage.removeItem('gtgl_admin_token');
        localStorage.removeItem('gtgl_admin_refresh_token');
        localStorage.removeItem('gtgl_admin_user');
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('gtgl_token');
        localStorage.removeItem('gtgl_refresh_token');
        localStorage.removeItem('gtgl_user');
        if (window.location.pathname !== '/user/auth') {
          window.location.href = '/user/auth';
        }
      }
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authApi = {
  sendOtp: (phone, role) => api.post('/auth/send-otp', { phone, role }),
  verifyOtp: (phone, otp, role) => api.post('/auth/verify-otp', { phone, otp, role }),
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getWallet: () => api.get('/users/me/wallet'),
  addMoney: (amount) => api.post('/users/me/wallet/add-money', { amount }),
  createWalletOrder: (amount) => api.post('/users/me/wallet/create-order', { amount }),
  verifyWalletPayment: (data) => api.post('/users/me/wallet/verify-payment', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data) => api.post('/users/me/addresses', data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
};

export const requirementApi = {
  create: (data) => api.post('/requirements', data),
  getMy: () => api.get('/requirements/my'),
  getDetails: (id) => api.get(`/requirements/${id}`),
  getBids: (id) => api.get(`/requirements/${id}/bids`),
};

export const leadApi = {
  getAvailable: () => api.get('/leads'),
  bid: (id, data) => api.post(`/leads/${id}/bid`, data),
};

export const bidApi = {
  accept: (id) => api.patch(`/bids/${id}/accept`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const uploadApi = {
  image: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload/image', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const settingsApi = {
  get: () => api.get('/settings'),
  getRazorpayKey: () => api.get('/settings/razorpay-key'),
  update: (data) => api.put('/settings', data),
};

export const vehicleApi = {
  getAll: (category) => api.get('/vehicles', { params: { category } }),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.patch(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const faqApi = {
  getAll: () => api.get('/faqs'),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.patch(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
};

export const vendorApi = {
  getProfile: () => api.get('/vendors/me'),
  updateProfile: (data) => api.patch('/vendors/me', data),
  submitOnboarding: (data) => api.post('/vendors/me/onboarding', data),
  uploadDocument: (data) => api.post('/vendors/me/documents', data),
  getAnalytics: () => api.get('/vendors/me/analytics'),
  uploadVehicleImage: (formData) => api.post('/vendors/me/vehicle-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteVehicleImage: (imageUrl) => api.delete('/vendors/me/vehicle-images', {
    data: { imageUrl }
  }),
};

export const chatApi = {
  getUserActiveChats: () => api.get('/chats/user/active'),
  getDriverActiveChats: () => api.get('/chats/driver/active'),
  
  // By Bid ID (Driver UI uses these)
  getMessages: (bidId) => api.get(`/chats/${bidId}/messages`),
  sendMessage: (bidId, data) => api.post(`/chats/${bidId}/messages`, data),
  sendOffer: (bidId, amount) => api.post(`/chats/${bidId}/offer`, { amount }),
  acceptDeal: (bidId) => api.post(`/chats/${bidId}/accept`),
  acceptDealWithWallet: (bidId) => api.post(`/chats/${bidId}/accept-wallet`),
  createAcceptDealOrder: (bidId) => api.post(`/chats/${bidId}/accept-order`),
  verifyAcceptDealPayment: (bidId, data) => api.post(`/chats/${bidId}/accept-verify`, data),

  // By Composite IDs (User UI uses these)
  getCompositeMessages: (requestId, vendorId) => api.get(`/chats/messages/${requestId}/${vendorId}`),
  sendCompositeMessage: (requestId, vendorId, data) => api.post(`/chats/messages/${requestId}/${vendorId}`, data),
  sendCompositeOffer: (requestId, vendorId, amount) => api.post(`/chats/offer/${requestId}/${vendorId}`, { amount }),
  acceptCompositeDeal: (requestId, vendorId) => api.post(`/chats/accept/${requestId}/${vendorId}`),
  acceptCompositeDealWithWallet: (requestId, vendorId) => api.post(`/chats/accept-wallet/${requestId}/${vendorId}`),
  createCompositeAcceptDealOrder: (requestId, vendorId) => api.post(`/chats/accept-order/${requestId}/${vendorId}`),
  verifyCompositeAcceptDealPayment: (requestId, vendorId, data) => api.post(`/chats/accept-verify/${requestId}/${vendorId}`, data),
  reopenCompositeDeal: (requestId, vendorId) => api.post(`/chats/reopen/${requestId}/${vendorId}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  getAllVendors: (params) => api.get('/vendors', { params }),
  verifyVendor: (id, status) => api.patch(`/vendors/${id}/verify`, { status }),
  getAllRequirements: (params) => api.get('/requirements', { params }),
  updateRequirementStatus: (id, status) => api.patch(`/requirements/${id}/status`, { status }),
  getRevenueStats: () => api.get('/admin/revenue'),
  getLeadsTrend: (params) => api.get('/admin/leads-trend', { params }),
};

export const planApi = {
  getAll: () => api.get('/plans'),
  getAllAdmin: () => api.get('/plans/admin/all'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.patch(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  subscribe: (planId) => api.post(`/plans/${planId}/subscribe`),
  createSubscriptionOrder: (planId) => api.post(`/plans/${planId}/subscribe-order`),
  verifySubscriptionPayment: (planId, data) => api.post(`/plans/${planId}/subscribe-verify`, data),
  checkQuota: () => api.get('/plans/me/quota'),
  incrementQuota: () => api.post('/plans/me/quota/increment'),
};

export default api;
