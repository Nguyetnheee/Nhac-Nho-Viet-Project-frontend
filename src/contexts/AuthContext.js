// src/contexts/AuthContext.js
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
  
  const tokenFromStorage = localStorage.getItem('token');
  const roleFromStorage = localStorage.getItem('role');
  
  const [token, setToken] = useState(tokenFromStorage || null);

  // Fetch profile theo role
  const fetchUserProfile = async (role) => {
    setLoading(true);
    try {
      let data;
      console.log('Fetching profile for role:', role);
      // Normalize role check
      const normalizedRole = role?.toUpperCase();
      if (normalizedRole === 'STAFF' || normalizedRole === 'ADMIN' || normalizedRole === 'SHIPPER') {
        data = await fetchStaffProfile();
      } else {
        data = await fetchCustomerProfile();
      }
      
      if (!data.role) {
          data.role = role;
      }
      console.log('Profile data:', data);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Xóa header thủ công (nếu có)
    const apiInstance = api; 
    if (apiInstance && apiInstance.defaults && apiInstance.defaults.headers.common['Authorization']) {
        delete apiInstance.defaults.headers.common['Authorization'];
    }
    
    navigate('/login'); 
  };
  
  // -------- Auth Initialization (useEffect) --------
  useEffect(() => {
    const initializeAuth = async () => {
      if (tokenFromStorage) {
        // Thiết lập header tạm thời cho API instance (API CŨ của bạn)
        const apiInstance = api; 
        if (apiInstance.defaults && !apiInstance.defaults.headers.common['Authorization']) {
            apiInstance.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
        }
        
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          try {
            await fetchUserProfile(roleFromStorage);
          } catch (error) {
            console.error('Error during auth initialization:', error);
            // 🚨 TỰ ĐỘNG LOGOUT KHI GẶP 401/403
            if (error.response?.status === 401 || error.response?.status === 403) {
              logout();
            }
          }
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromStorage]); 


  // -------- Login Function (Thử lần lượt) --------
  const login = async (username, password) => {
    setLoading(true);
    let loginResponse = null;
    let finalRole = null;
    
    try {
      // 1. Thử login Customer
      try {
        const res = await loginCustomer(username, password); 
        if (res?.token) {
            loginResponse = res;
            finalRole = res.role || 'Customer';
        }
      } catch (_) {} 

      // 2. Thử login Shipper
      if (!loginResponse) {
          try {
              console.log('Attempting shipper login...');
              const res = await loginShipper(username, password); 
              console.log('Shipper login response:', res);
              if (res?.token) {
                  loginResponse = res;
                  finalRole = res.role || 'Shipper';
              }
          } catch (error) {
              console.error('Shipper login error:', error);
          }
      }

      // 3. Thử login Staff (bao gồm Admin)
      if (!loginResponse) {
          try {
              const res = await loginStaff(username, password); 
              if (res?.token) {
                  loginResponse = res;
                  finalRole = res.role || 'Staff'; 
              }
          } catch (err) {
              // Nếu cả 3 đều thất bại, ném lỗi cuối cùng
              throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
          }
      }
      
      // KIỂM TRA CUỐI CÙNG
      if (!loginResponse || !loginResponse.token) {
          throw new Error('Đăng nhập thất bại: Thiếu Token.');
      }
      
      const { token: jwtToken } = loginResponse; 
      
      // Lưu thông tin vào localStorage và state
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('role', finalRole);
      
      // Thiết lập header cho API instance chính (để fetchUserProfile hoạt động)
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      // Fetch profile tương ứng để lấy toàn bộ data user và xác nhận role
      const userData = await fetchUserProfile(finalRole);
      
      // LOGIC CHUYỂN HƯỚNG CUỐI CÙNG
      if (finalRole === 'Admin') {
        navigate('/admin');
      } else if (finalRole === 'Staff') {
        navigate('/staff');
      } else if (finalRole === 'Shipper') {
        navigate('/shipper'); 
      } else {
        navigate('/profile');
      }
      
      return { success: true, role: finalRole };
    } catch (error) {
      console.error('Login error:', error);
      // Xử lý lỗi
      if (error.response?.status === 401 || error.response?.status === 403) {
         logout(); 
      }
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Đăng nhập thất bại',
      };
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký (customer) - Giữ nguyên
  const register = async (userData) => {
    try {
      const response = await api.post('/api/customer/register', userData); 
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  // Cập nhật profile dựa vào role - Giữ nguyên
  const updateProfile = async (profileData) => {
    try {
      const role = localStorage.getItem('role');
      const endpoint =
        role === 'STAFF' || role === 'Shipper' || role === 'Admin' 
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
        error:
          error.response?.data?.message || 'Cập nhật thất bại',
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