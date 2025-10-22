import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token
apiAuth.interceptors.request.use(
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

// Response interceptor to handle auth errors
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
    const response = await apiAuth.post('/api/customer', { username, password });
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

// STAFF API (mới thêm)
export const fetchStaffProfile = async () => {
  try {
    const response = await apiAuth.get('/api/staff/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    throw error;
  }
};

export const loginStaff = async (username, password) => {
  try {
    const response = await apiAuth.post('/api/staff/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error during staff login:', error);
    throw error;
  }
};

export const updateStaffProfile = async (profileData) => {
  try {
    const response = await apiAuth.put('/api/staff/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating staff profile:', error);
    throw error;
  }
};

export const increaseCartItem = async (productId) => {
  try {
    const response = await apiAuth.post(`/api/cart/items/increase`, { productId });
    return response.data;
  } catch (error) {
    console.error('Error increasing cart item:', error);
    throw error;
  }
};

export const decreaseCartItem = async (productId) => {
  try {
    const response = await apiAuth.post(`/api/cart/items/decrease`, { productId });
    return response.data;
  } catch (error) {
    console.error('Error decreasing cart item:', error);
    throw error;
  }
};

export default apiAuth;