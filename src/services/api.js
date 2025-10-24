// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Instance CÓ AUTH: dùng cho các endpoint yêu cầu đăng nhập (profile, checkout, v.v.)
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Gắn token CHỈ CHẠY trên instance `api`
api.interceptors.request.use(
  (config) => {
    // Cho phép bỏ qua auth khi cần 
    if (config.headers && config.headers['X-Skip-Auth'] === 'true') {
      delete config.headers['X-Skip-Auth'];
      return config; 
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Instance PUBLIC: dùng cho các endpoints KHÔNG yêu cầu đăng nhập
 * - Không gắn Authorization
 * - withCredentials: false để không gửi cookie/phiên → tránh Spring Security hiểu nhầm
 */
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});


export const verifyRegisterOTP = async (email, otp) => {
  const { data } = await api.post('/api/customer/verify-email', { email, otp });
  return data;
};

export const checkout = async (checkoutData) => {
  try {
    const { data } = await api.post('/api/checkout', checkoutData);
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi không xác định.';
    console.error('Checkout API error:', errorMessage);
    throw new Error(errorMessage);
  }
};

/* ===== Password Reset (PUBLIC) – dùng publicApi để tránh 403 ===== */

export const forgotPassword = async (email) => {
  const { data } = await publicApi.post('/api/customer/forgot-password', { email });
  return data;
};

export const verifyResetOTP = async (email, otp) => {
  const { data } = await publicApi.post('/api/customer/verify-reset-otp', { email, otp });
  return data;
};

export const resetPassword = async (email, password) => {
  const { data } = await publicApi.post('/api/customer/reset-password', { email, password });
  return data;
};

export default api;
