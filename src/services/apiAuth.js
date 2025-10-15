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

export default apiAuth;