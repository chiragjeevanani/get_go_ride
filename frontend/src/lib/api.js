import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gtgl_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't tried refreshing yet (exclude login and verification endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/admin/login') && !originalRequest.url.includes('/auth/verify-otp')) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('gtgl_refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          
          localStorage.setItem('gtgl_token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired - logout
          localStorage.removeItem('gtgl_token');
          localStorage.removeItem('gtgl_refresh_token');
          localStorage.removeItem('gtgl_user');
          window.location.href = '/user/login';
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

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const faqApi = {
  getAll: () => api.get('/faqs'),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.patch(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  getAllVendors: (params) => api.get('/vendors', { params }),
  verifyVendor: (id, status) => api.patch(`/vendors/${id}/verify`, { status }),
  getAllRequirements: (params) => api.get('/requirements', { params }),
  updateRequirementStatus: (id, status) => api.patch(`/requirements/${id}/status`, { status }),
  getRevenueStats: () => api.get('/admin/revenue'),
};

export const planApi = {
  getAll: () => api.get('/plans'),
  getAllAdmin: () => api.get('/plans/admin/all'),
  getById: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.patch(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
  subscribe: (planId) => api.post(`/plans/${planId}/subscribe`),
  checkQuota: () => api.get('/plans/me/quota'),
  incrementQuota: () => api.post('/plans/me/quota/increment'),
};

export default api;
