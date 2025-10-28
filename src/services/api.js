

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // phần cần đăng nhập vẫn gửi cookie/phiên
  // Tránh treo vô hạn khi backend chậm/đứt
  timeout: 15000,
});

// Interceptor gắn token CHỈ cho `api`
api.interceptors.request.use(
  (config) => {
    // Cho phép bỏ qua auth nếu cần
    if (config.headers && config.headers['X-Skip-Auth'] === 'true') {
      delete config.headers['X-Skip-Auth'];
      return config; // không gắn Authorization
    }
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);


function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

const csrfApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
  timeout: 15000,
});


async function initCsrf() {
  // Nếu đã có cookie thì bỏ qua
  if (getCookie('XSRF-TOKEN')) return;

  try {
    await csrfApi.get('/csrf'); 
  } catch (_) {
    try {
      await csrfApi.get('/'); 
    } catch (__ ) {
    }
  }
}

csrfApi.interceptors.request.use(
  async (config) => {
    if (config.method?.toLowerCase() !== 'get' && !getCookie('XSRF-TOKEN')) {
      await initCsrf();
    }
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token;
    }
   
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
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
    const msg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi không xác định.';
    console.error('Checkout API error:', msg);
    throw new Error(msg);
  }
};


export const forgotPassword = async (email) => {
  // chuẩn hoá email
  const payload = { email: String(email || '').trim().toLowerCase() };
  const { data } = await csrfApi.post(`/api/customer/forgot-password?email=${email}`, payload);
  return data;
};

export const verifyResetOTP = async (email, otp) => {
  const payload = { email: String(email || '').trim().toLowerCase(), otp: String(otp || '').trim() };
  const { data } = await csrfApi.post('/api/customer/verify-reset-otp', payload);
  return data;
};

export const resetPassword = async (email, password) => {
  const payload = { email: String(email || '').trim().toLowerCase(), password };
  const { data } = await csrfApi.post(`/api/customer/reset-password?email=${email}&newPassword=${password}`, payload);
  return data;
};

export default api;
