import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://isp-7jpp.onrender.com';

console.log('API_BASE_URL:', API_BASE_URL); // For debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('isStaff');
      
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
