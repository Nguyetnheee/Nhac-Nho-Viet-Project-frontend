import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { fetchCustomerProfile, fetchStaffProfile } from '../services/apiAuth';

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
  const roleFromStorage = localStorage.getItem('role');
  const [token, setToken] = useState(tokenFromStorage || null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (tokenFromStorage) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          try {
            await fetchUserProfile(roleFromStorage);
          } catch (error) {
            console.error('Error during auth initialization:', error);
            // Only logout if it's a true auth error
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
  }, [tokenFromStorage]);

  // Fetch profile theo role
  const fetchUserProfile = async (role) => {
    try {
      const data =
        role === 'STAFF'
          ? await fetchStaffProfile()
          : await fetchCustomerProfile();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Gộp login (tự phân biệt STAFF / CUSTOMER)
  const login = async (username, password) => {
    try {
      // Thử login Customer trước
      let response;
      try {
        response = await api.post('/api/customer/login', { username, password });
      } catch (err) {
        // Nếu thất bại, thử login Staff
        response = await api.post('/api/staff/login', { username, password });
      }

      const { token: jwtToken, role, username: name, email } = response.data;

      // Lưu thông tin vào localStorage
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('role', role);
      api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

      // Fetch profile tương ứng
      await fetchUserProfile(role);

      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  };

  // Đăng ký (customer)
  const register = async (userData) => {
    try {
      await api.post('/api/customer/register', userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  // Cập nhật profile dựa vào role
  const updateProfile = async (profileData) => {
  try {
    const role = localStorage.getItem('role');
    const endpoint =
      role === 'STAFF' ? '/api/staff/profile' : '/api/customer/profile';

    // fix: map đúng key backend
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


  // Đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login, // chỉ 1 hàm login duy nhất
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    role: roleFromStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
