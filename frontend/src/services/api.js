import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const API_URL = process.env.REACT_APP_API_URL || `${BASE_URL}/api`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  },

  getGuides: async (filters = {}) => {
    const response = await axiosInstance.get('/users/guides', { params: filters });
    return response.data;
  },

  getGuideById: async (id) => {
    const response = await axiosInstance.get(`/users/guides/${id}`);
    return response.data;
  },

  addToWishlist: async (hotelId) => {
    const response = await axiosInstance.post(`/users/wishlist/${hotelId}`);
    return response.data;
  },

  removeFromWishlist: async (hotelId) => {
    const response = await axiosInstance.delete(`/users/wishlist/${hotelId}`);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await axiosInstance.put('/users/change-password', passwordData);
    return response.data;
  }
};

export default axiosInstance;
