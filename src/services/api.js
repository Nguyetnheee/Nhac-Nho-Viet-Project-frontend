import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Enable CORS credentials
axios.defaults.withCredentials = true;

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

//verify new account 

export const verifyRegisterOTP = async (email, otp) => {
  const { data } = await api.post('/api/customer/verify-email', { email, otp });
  return data; 
};

// checkout function
export const checkout = async (checkoutData) => {
  try {
    const response = await api.post('/api/checkout', checkoutData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi không xác định.';
    console.error('Checkout API error:', errorMessage);
    throw new Error(errorMessage);
  }
};


//forgot password 

//send reset otp
export const forgotPassword = async (email) => {
  const {data} = await api.post('/api/customer/forgot-password', {email});
  return data;
}

// verify otp
export const verifyResetOTP = async (email, otp) => {
  const {data} = await api.post('/api/customer/verify-reset-otp', {email,otp});
  return data;
} 

// reset password
export const resetPassword = async(email, password) => {
  const {data} = await api.post('/api/customer/reset-password', {email, password});
  return data;
}

export default api;
