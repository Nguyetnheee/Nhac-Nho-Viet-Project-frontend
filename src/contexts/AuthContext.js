import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  fetchCustomerProfile,
  fetchStaffProfile,
  loginShipper,
  loginStaff,
  loginCustomer
} from '../services/apiAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Chuẩn hóa role từ localStorage
  const rawRoleFromStorage = localStorage.getItem('role');
  const roleFromStorage = rawRoleFromStorage 
    ? rawRoleFromStorage.charAt(0).toUpperCase() + rawRoleFromStorage.slice(1).toLowerCase()
    : null;

  // Helper: wrap a promise with timeout to avoid hanging UI
  const withTimeout = (promise, ms = 8000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms))
    ]);

  const fetchUserProfile = async (role) => {
    try {
      let data;
      const normalizedRole = role?.toUpperCase();
      
      if (normalizedRole === 'STAFF' || normalizedRole === 'ADMIN' || normalizedRole === 'SHIPPER') {
        data = await fetchStaffProfile();
      } else {
        data = await fetchCustomerProfile();
      }

      if (!data.role) {
        data.role = role;
      }
      
      // Chuẩn hóa role về dạng chuẩn (Staff, Admin, Customer, Shipper)
      if (data.role) {
        const originalRole = data.role;
        data.role = data.role.charAt(0).toUpperCase() + data.role.slice(1).toLowerCase();
        console.log('🔄 Role normalization in fetchUserProfile:', originalRole, '=>', data.role);
      }
      
      setUser(data);
      console.log('👤 User profile set:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    if (api.defaults?.headers?.common['Authorization']) {
      delete api.defaults.headers.common['Authorization'];
    }
    // Navigate to login page on logout
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Avoid hanging forever if backend is slow
          await withTimeout(fetchUserProfile(roleFromStorage));
        } catch (err) {
          console.warn('Init auth failed or timed out:', err?.message);
          // Just clear the auth state without redirect on error/timeout
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          if (api.defaults?.headers?.common['Authorization']) {
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      let loginResponse;
      let userRole;
      let dashboardPath;

      try {
        loginResponse = await loginStaff(username, password);
        
        // SỬA LỖI: Xử lý cấu trúc response đúng cách
        // Kiểm tra xem role có trong data hay ở level root
        userRole = loginResponse.data?.role || loginResponse.role || 'Staff';

        // Chuẩn hóa role về dạng chuẩn
        const normalizedRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
        
        switch (normalizedRole) {
          case 'Staff':
            dashboardPath = '/staff-dashboard';
            break;
          case 'Admin':
            dashboardPath = '/admin-dashboard';
            break;
          case 'Shipper':
            dashboardPath = '/shipper-dashboard';
            break;
          default:
            dashboardPath = '/staff-dashboard';
            break;
        }
        
        // Lưu role đã chuẩn hóa
        userRole = normalizedRole;
        console.log('🎯 Staff login - will redirect to:', dashboardPath);

      } catch (staffError) {
        try {
          loginResponse = await loginCustomer(username, password);
          userRole = 'Customer';
          dashboardPath = '/';
        } catch (customerError) {
          try {
            loginResponse = await loginShipper(username, password);
            userRole = 'Shipper';
            dashboardPath = '/shipper-dashboard';
          } catch (shipperError) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không hợp lệ.');
          }
        }
      }
      
      if (!loginResponse?.token) {
        throw new Error('Đăng nhập thất bại, không nhận được token.');
      }
      
      localStorage.setItem('token', loginResponse.token);
      localStorage.setItem('role', userRole);

      setToken(loginResponse.token);
      
      // Set API header immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.token}`;
      
      // Fetch user profile to ensure user state is set before navigation
      try {
        await fetchUserProfile(userRole);
      } catch (profileError) {
        console.warn('Failed to fetch profile after login:', profileError);
        // Continue with navigation even if profile fetch fails
      }
      
      // Navigate after profile is fetched - use setTimeout to ensure it happens after state updates
      setTimeout(() => {
        console.log('🚀 Executing navigation to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
        
        // Additional fallback: force redirect if navigate doesn't work
        setTimeout(() => {
          if (window.location.pathname !== dashboardPath) {
            console.warn('⚠️ Navigate failed, using window.location redirect');
            window.location.replace(dashboardPath);
          } else {
            console.log('✅ Navigation successful to:', window.location.pathname);
          }
        }, 500);
      }, 0);

      return { success: true, role: userRole };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Đăng nhập thất bại.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/api/customer/register', userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại.',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
        const role = localStorage.getItem('role');
        const endpoint = role === 'STAFF' || role === 'SHIPPER' || role === 'ADMIN'
          ? '/api/staff/profile'
          : '/api/customer/profile';
  
        const payload = {
          ...profileData,
          birthday: profileData.birthDate || profileData.birthday || null,
        };
  
        const response = await api.put(endpoint, payload);
        setUser(response.data);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Cập nhật hồ sơ thất bại.',
        };
      }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    role: user?.role || roleFromStorage, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};