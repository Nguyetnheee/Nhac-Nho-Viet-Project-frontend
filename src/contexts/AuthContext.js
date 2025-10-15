import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { fetchCustomerProfile } from '../services/apiAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenFromStorage = localStorage.getItem('token');
  const [token, setToken] = useState(tokenFromStorage || null);

  useEffect(() => {
    if (tokenFromStorage) {
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
      // Chỉ fetch profile nếu không ở trang login
      if (window.location.pathname !== '/login') {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [tokenFromStorage]);

  // Sử dụng API mới lấy profile
  const fetchUserProfile = async () => {
    try {
      const data = await fetchCustomerProfile();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (window.location.pathname !== '/login') {
        logout();
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập dùng username và password, endpoint mới
  const login = async (username, password) => {
    try {
      const response = await api.post('/api/customer/login', { username, password });
      const { token: tokenFromStorage, ...userData } = response.data;
      setToken(tokenFromStorage);
      setUser(userData);
      localStorage.setItem('token', tokenFromStorage);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  };

  // Đăng ký dùng endpoint mới
  const register = async (userData) => {
    try {
      await api.post('/api/auth/register', userData);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  };

  const logout = () => {
    setUser(null);
    // setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  // Cập nhật profile dùng endpoint mới
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/customer/profile', profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Cập nhật thông tin thất bại'
      };
    }
  };

  const value = {
    user,
    tokenFromStorage,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isShipper: user?.role === 'Shipper'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
