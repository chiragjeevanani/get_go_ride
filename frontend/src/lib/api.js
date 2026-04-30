import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safar_token');
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
    
    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('safar_refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data;
          
          localStorage.setItem('safar_token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired - logout
          localStorage.removeItem('safar_token');
          localStorage.removeItem('safar_refresh_token');
          localStorage.removeItem('safar_user');
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

export default api;
