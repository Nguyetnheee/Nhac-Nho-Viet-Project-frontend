

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
    
    // ✅ Danh sách các endpoint KHÔNG CẦN token (public endpoints)
    const publicEndpoints = [
      '/api/customer/register',
      '/api/customer/login',
      '/api/staff/login',
      '/api/customer/verify-email',
      '/api/customer/resend-otp',
      '/api/customer/forgot-password',
      '/api/customer/verify-reset-otp',
      '/api/customer/reset-password',
      '/csrf',
      '/'
    ];
    
    // Kiểm tra xem endpoint có phải là public không
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Nếu là public endpoint, không gắn token
    if (isPublicEndpoint) {
      console.log('🌐 Public endpoint - No token required:', config.url);
      return config;
    }
    
    const token = localStorage.getItem('token');
    
    // ✅ DEBUG: Log token để kiểm tra
    console.log('🔐 API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
      fullTokenLength: token ? token.length : 0
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Authorization Header:', `Bearer ${token.substring(0, 30)}...`);
    } else {
      console.warn('⚠️ No token found for authenticated request!');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // ✅ DEBUG: Log chi tiết lỗi với FULL response
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
      fullError: error
    });
    
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized - Removing token');
      localStorage.removeItem('token');
    } else if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Access denied!', {
        url: error.config?.url,
        hasToken: !!error.config?.headers?.Authorization,
        backendMessage: error.response?.data?.message || error.response?.data,
        requestHeaders: error.config?.headers,
        responseHeaders: error.response?.headers
      });
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

/**
 * API Checkout - Tạo đơn hàng mới
 * @param {Object} checkoutData - Dữ liệu checkout
 * @param {string} checkoutData.fullName - Tên đầy đủ
 * @param {string} checkoutData.email - Email
 * @param {string} checkoutData.phone - Số điện thoại
 * @param {string} checkoutData.address - Địa chỉ giao hàng
 * @param {string} checkoutData.paymentMethod - Phương thức thanh toán (mặc định: ONLINE)
 * @param {string} checkoutData.note - Ghi chú đơn hàng
 * @param {string} checkoutData.voucherCode - Mã voucher (nullable)
 * @returns {Promise} Response chứa orderId và thông tin đơn hàng
 */
export const checkout = async (checkoutData) => {
  try {
    console.log('📤 CHECKOUT REQUEST:', {
      url: '/api/checkout',
      method: 'POST',
      data: checkoutData,
      hasVoucher: !!checkoutData.voucherCode
    });
    
    // ⚠️ TRY BOTH ENDPOINTS
    let response;
    let usedEndpoint = '';
    
    try {
      // Try new endpoint first
      response = await api.post('/api/checkout', checkoutData);
      usedEndpoint = '/api/checkout';
    } catch (firstError) {
      if (firstError.response?.status === 403 || firstError.response?.status === 404) {
        console.warn('⚠️ /api/checkout failed, trying /api/cart/checkout...');
        // Fallback to old endpoint
        response = await api.post('/api/cart/checkout', checkoutData);
        usedEndpoint = '/api/cart/checkout';
      } else {
        throw firstError;
      }
    }
    
    console.log('✅ CHECKOUT RESPONSE:', {
      endpoint: usedEndpoint,
      status: response.status,
      data: response.data
    });
    
    // ⚠️ CRITICAL: Kiểm tra backend có xử lý voucher không
    if (checkoutData.voucherCode && response.data) {
      const hasVoucherInfo = response.data.voucherCode || 
                            response.data.discountAmount !== undefined ||
                            response.data.totalAmount !== undefined;
      
      if (!hasVoucherInfo) {
        console.warn('⚠️ WARNING: Frontend gửi voucherCode nhưng backend KHÔNG trả về thông tin voucher!');
        console.warn('Backend cần trả về: voucherCode, discountAmount, totalAmount');
      } else {
        console.log('✅ Backend đã xử lý voucher:', {
          voucherCode: response.data.voucherCode,
          subTotal: response.data.subTotal,
          discountAmount: response.data.discountAmount,
          totalAmount: response.data.totalAmount
        });
      }
    }
    
    // Xử lý response từ backend
    // Backend có thể trả về: { orderId, fullName, email, ... } hoặc { data: { orderId, ... } }
    const data = response.data;
    
    return data;
  } catch (error) {
    // ✅ XỬ LÝ LỖI 403 CỤ THỂ
    if (error.response?.status === 403) {
      const backendMsg = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Bạn không có quyền thực hiện thao tác này';
      
      console.error('🚫 403 Forbidden Details:', {
        message: backendMsg,
        url: '/api/checkout',
        data: error.response?.data,
        possibleReasons: [
          '1. Token hết hạn hoặc không hợp lệ',
          '2. User không có quyền CUSTOMER',
          '3. Backend yêu cầu CSRF token',
          '4. Endpoint không tồn tại - thử /api/cart/checkout'
        ]
      });
      
      throw new Error(backendMsg);
    }
    
    const msg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi không xác định.';
    console.error('❌ Checkout API error:', msg);
    console.error('Error details:', error.response?.data);
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
