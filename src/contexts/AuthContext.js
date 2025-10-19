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
    const initializeAuth = async () => {
      if (tokenFromStorage) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
          
          // Chỉ fetch profile nếu không ở trang login
          if (window.location.pathname !== '/login') {
            await fetchUserProfile();
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          handleLogout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [tokenFromStorage]);

  // Fetch user profile based on role
  const fetchUserProfile = async () => {
    try {
      const isStaff = localStorage.getItem('isStaff') === 'true';
      const endpoint = isStaff ? '/api/staff/profile' : '/api/customer/profile';
      const response = await api.get(endpoint);
      
      if (response.data) {
        setUser({ ...response.data, isStaff });
        return true;
      } else {
        throw new Error('No profile data received');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
      return false;
    }
  };

  // Đăng nhập dùng username và password
  const login = async (username, password, isStaff = false) => {
    try {
      setLoading(true);
      const endpoint = isStaff ? '/api/staff/login' : '/api/customer/login';
      
      // Thử login
      const response = await api.post(endpoint, { username, password });
      
      if (!response.data?.token) {
        throw new Error('Token không hợp lệ');
      }

      // Lưu token và thông tin user
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('isStaff', isStaff.toString());
      
      // Cập nhật header cho các request tiếp theo
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch profile sau khi login thành công
      const profileSuccess = await fetchUserProfile();
      
      if (!profileSuccess) {
        throw new Error('Không thể lấy thông tin người dùng');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Cleanup nếu có lỗi
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isStaff');
      delete api.defaults.headers.common['Authorization'];
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      };
    }
  };

  // Đăng ký dùng endpoint mới
  const register = async (userData) => {
    try {
      await api.post('/api/customer/register', userData);
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

  // Xác thực OTP
  const verifyOTP = async (email, otp) => {
    try {
      await api.post('/api/customer/verify-email', { email, otp });
      return { success: true };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Xác thực OTP thất bại'
      };
    }
  };

  // Gửi lại OTP
  const resendOTP = async (email) => {
    try {
      await api.post('/api/customer/resend-otp', { email });
      return { success: true };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Gửi lại OTP thất bại'
      };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('isStaff');
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
    loading,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout: handleLogout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isShipper: user?.role === 'Shipper',
    isStaff: user?.isStaff || user?.role === 'Staff',
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
