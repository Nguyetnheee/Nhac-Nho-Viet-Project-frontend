// // services/api.js
// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// /**
//  * Instance CÓ AUTH: dùng cho các endpoint yêu cầu đăng nhập (profile, checkout, v.v.)
//  */
// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
//   withCredentials: true,
// });

// // Gắn token CHỈ CHẠY trên instance `api`
// api.interceptors.request.use(
//   (config) => {
//     // Cho phép bỏ qua auth khi cần 
//     if (config.headers && config.headers['X-Skip-Auth'] === 'true') {
//       delete config.headers['X-Skip-Auth'];
//       return config; 
//     }
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// /**
//  * Instance PUBLIC: dùng cho các endpoints KHÔNG yêu cầu đăng nhập
//  * - Không gắn Authorization
//  * - withCredentials: false để không gửi cookie/phiên → tránh Spring Security hiểu nhầm
//  */
// export const publicApi = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
//   withCredentials: false,
// });


// export const verifyRegisterOTP = async (email, otp) => {
//   const { data } = await api.post('/api/customer/verify-email', { email, otp });
//   return data;
// };

// export const checkout = async (checkoutData) => {
//   try {
//     const { data } = await api.post('/api/checkout', checkoutData);
//     return data;
//   } catch (error) {
//     const errorMessage =
//       error.response?.data?.message ||
//       error.message ||
//       'Đã xảy ra lỗi không xác định.';
//     console.error('Checkout API error:', errorMessage);
//     throw new Error(errorMessage);
//   }
// };

// /* ===== Password Reset (PUBLIC) – dùng publicApi để tránh 403 ===== */

// export const forgotPassword = async (email) => {
//   const { data } = await publicApi.post('/api/customer/forgot-password', { email });
//   return data;
// };

// export const verifyResetOTP = async (email, otp) => {
//   const { data } = await publicApi.post('/api/customer/verify-reset-otp', { email, otp });
//   return data;
// };

// export const resetPassword = async (email, password) => {
//   const { data } = await publicApi.post('/api/customer/reset-password', { email, password });
//   return data;
// };

// export default api;


// services/api.js
import axios from 'axios';

/** Base URL lấy từ .env */
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/** ─────────────────── Instance CÓ AUTH (giữ nguyên hành vi cũ) ─────────────────── **/
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // phần cần đăng nhập vẫn gửi cookie/phiên
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** ─────────────────── CSRF helpers cho endpoint PUBLIC POST ─────────────────── **/

/** Đọc cookie đơn giản */
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Instance dành cho flow có CSRF: phải gửi cookie + header X-XSRF-TOKEN */
const csrfApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // BẮT BUỘC để nhận/gửi cookie CSRF
});

/**
 * Gọi để chắc chắn đã có cookie CSRF (XSRF-TOKEN).
 * Thử GET /csrf (chuẩn Spring). Nếu thất bại, fallback GET /
 */
async function initCsrf() {
  // Nếu đã có cookie thì bỏ qua
  if (getCookie('XSRF-TOKEN')) return;

  try {
    await csrfApi.get('/csrf'); // chuẩn Spring
  } catch (_) {
    try {
      await csrfApi.get('/'); // fallback: bất kỳ endpoint public nào sinh cookie
    } catch (__ ) {
      // im lặng; để request sau báo lỗi nếu cần
    }
  }
}

/** Interceptor tự gắn X-XSRF-TOKEN cho csrfApi */
csrfApi.interceptors.request.use(
  async (config) => {
    // đảm bảo đã có cookie trước khi POST
    if (config.method?.toLowerCase() !== 'get' && !getCookie('XSRF-TOKEN')) {
      await initCsrf();
    }
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      // Tên header Spring đọc mặc định: X-XSRF-TOKEN
      config.headers['X-XSRF-TOKEN'] = token;
    }
    // Quan trọng: KHÔNG gắn Authorization ở đây
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** ─────────────────── Các instance không CSRF (nếu cần) ─────────────────── **/

// publicApi: không auth, không cookie (dùng khi backend tắt CSRF cho endpoint)
// Vẫn giữ lại nếu sau này backend disable CSRF
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/** ─────────────────── APIS (giữ nguyên chữ ký) ─────────────────── **/

// (GIỮ NGUYÊN) Verify OTP đăng ký tài khoản mới — yêu cầu đăng nhập? tuỳ backend
export const verifyRegisterOTP = async (email, otp) => {
  const { data } = await api.post('/api/customer/verify-email', { email, otp });
  return data;
};

// (GIỮ NGUYÊN) Checkout – cần đăng nhập
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

/* ===== Password Reset (PUBLIC) — DÙNG csrfApi để qua CSRF 403 ===== */

export const forgotPassword = async (email) => {
  // chuẩn hoá email
  const payload = { email: String(email || '').trim().toLowerCase() };
  const { data } = await csrfApi.post('/api/customer/forgot-password', payload);
  return data;
};

export const verifyResetOTP = async (email, otp) => {
  const payload = { email: String(email || '').trim().toLowerCase(), otp: String(otp || '').trim() };
  const { data } = await csrfApi.post('/api/customer/verify-reset-otp', payload);
  return data;
};

export const resetPassword = async (email, password) => {
  const payload = { email: String(email || '').trim().toLowerCase(), password };
  const { data } = await csrfApi.post('/api/customer/reset-password', payload);
  return data;
};

export default api;
