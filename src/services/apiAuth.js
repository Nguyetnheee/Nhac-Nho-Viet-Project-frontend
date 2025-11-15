// src/services/apiAuth.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  // Tăng timeout lên 30s để hỗ trợ cold start của Render.com free tier
  timeout: 30000,
});

// Request interceptor to add auth token
apiAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Current token in interceptor:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Setting Authorization header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Tránh reload cứng; để route guard xử lý điều hướng
    }
    return Promise.reject(error);
  }
);

// Call customer profile API
export const fetchCustomerProfile = async () => {
  try {
    const response = await apiAuth.get('/api/customer/profile');
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching profile: ${error.response.status} - ${error.response.data}`);
    } else {
      console.error(`Error fetching profile: ${error.message}`);
    }
    throw error;
  }
};

export const loginCustomer = async (username, password) => {
  try {
    const response = await apiAuth.post('/api/customer/login', { username, password });
    console.log('🔍 loginCustomer FULL response:', response);
    console.log('🔍 loginCustomer response.data:', JSON.stringify(response.data, null, 2));
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`Error during login: ${error.response.status} - ${error.response.data}`);
    } else {
      console.error(`Error during login: ${error.message}`);
    }
    throw error;
  }
};

// MANAGER API
export const fetchManagerProfile = async () => {
  try {
    const response = await apiAuth.get('/api/manager/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    throw error;
  }
};

// Alias để tương thích với code cũ
export const fetchStaffProfile = fetchManagerProfile;

export const loginManager = async (username, password) => {
  try {
    const response = await apiAuth.post('/api/manager/login', { username, password });
    console.log('🔍 loginManager FULL response:', response);
    console.log('🔍 loginManager response.data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error during manager login:', error);
    throw error;
  }
};

// Note: loginStaff đã được định nghĩa riêng ở dưới cho API /api/staff/login

export const updateManagerProfile = async (profileData) => {
  try {
    const response = await apiAuth.put('/api/manager/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating manager profile:', error);
    throw error;
  }
};

// Alias để tương thích với code cũ
export const updateStaffProfile = updateManagerProfile;

// ⚠️ API MỚI: Login cho Shipper
export const loginShipper = async (username, password) => {
  try {
    // Endpoint: POST: /api/shipper/login
    const response = await apiAuth.post('/api/shipper/login', { username, password });
    console.log('🔍 loginShipper FULL response:', response);
    console.log('🔍 loginShipper response.data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error during shipper login:', error);
    throw error;
  }
};

// ⚠️ API MỚI: Login cho Staff
export const loginStaff = async (username, password) => {
  try {
    // Endpoint: POST: /api/staff/login
    const response = await apiAuth.post('/api/staff/login', { username, password });
    console.log('🔍 loginStaff FULL response:', response);
    console.log('🔍 loginStaff response.data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error during staff login:', error);
    throw error;
  }
};

// Loại bỏ cú pháp headers lỗi, chỉ gọi POST rỗng.
export const increaseCartItem = async (productId) => {
  try {
    const response = await apiAuth.post(
      `/api/cart/items/increase?productId=${productId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error increasing cart item:', error);
    throw error;
  }
};

//  Loại bỏ cú pháp headers lỗi, chỉ gọi POST rỗng.
export const decreaseCartItem = async (productId) => {
  try {
    const response = await apiAuth.post(
      `/api/cart/items/decrease?productId=${productId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error decreasing cart item:', error);
    throw error;
  }
};

export default apiAuth;