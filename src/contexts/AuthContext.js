import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { translateToVietnamese } from '../utils/errorMessages';
import {
  fetchCustomerProfile,
  fetchStaffProfile,
  loginShipper,
  loginStaff,
  loginCustomer
} from '../services/apiAuth';
import shipperService from '../services/shipperService';

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
  
  // Lấy role từ localStorage (giữ nguyên UPPERCASE như database)
  const rawRoleFromStorage = localStorage.getItem('role');
  const roleFromStorage = rawRoleFromStorage; // Không normalize, giữ nguyên UPPERCASE

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
      
      if (normalizedRole === 'STAFF' || normalizedRole === 'ADMIN') {
        data = await fetchStaffProfile();
      } else if (normalizedRole === 'SHIPPER') {
        data = await shipperService.getProfile();
      } else {
        data = await fetchCustomerProfile();
      }

      if (!data.role) {
        data.role = role;
      }
      
      // Giữ role ở dạng UPPERCASE như database (STAFF, ADMIN, CUSTOMER, SHIPPER)
      if (data.role) {
        const originalRole = data.role;
        data.role = data.role.toUpperCase(); // Đảm bảo luôn là UPPERCASE
        console.log('🔄 Role keeping in UPPERCASE:', originalRole, '=>', data.role);
      }
      
      setUser(data);
      console.log('👤 User profile set:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // ⚠️ KHÔNG logout ngay nếu fetch profile fail
      // Vì có thể là lỗi tạm thời hoặc endpoint không tồn tại
      // Chỉ logout nếu là lỗi 401 (Unauthorized - token hết hạn/invalid)
      if (error.response?.status === 401) {
        console.warn('Token invalid or expired, logging out...');
        logout();
      } else {
        // Với lỗi khác (403, 404, 500...), tạo user object tạm thời
        console.warn('Profile fetch failed but keeping user logged in with basic info');
        const basicUser = {
          username: localStorage.getItem('username') || 'User',
          role: role?.toUpperCase() || 'CUSTOMER'
        };
        setUser(basicUser);
      }
    }
  };
  
  const logout = () => {
    // Lấy role trước khi xóa để biết redirect về đâu
    const currentRole = localStorage.getItem('role');
    
    // ✅ CẬP NHẬT STATE NGAY LẬP TỨC trước khi redirect
    setUser(null);
    setToken(null);
    
    // ✅ XÓA TẤT CẢ DỮ LIỆU LIÊN QUAN ĐẾN AUTH từ localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    if (api.defaults?.headers?.common['Authorization']) {
      delete api.defaults.headers.common['Authorization'];
    }
    
    // Redirect dựa trên role
    // Admin/Staff/Shipper → /admin-login
    // Customer → /login
    if (currentRole === 'ADMIN' || currentRole === 'STAFF' || currentRole === 'SHIPPER') {
      console.log('Logout from', currentRole, '→ redirecting to /admin-login');
      navigate('/admin-login', { replace: true });
    } else {
      console.log('Logout from CUSTOMER → redirecting to /login');
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Kiểm tra xem có phải là lần đầu khởi động không
      // Nếu đang ở homepage và có token, xóa token để không tự động đăng nhập
      const currentPath = window.location.pathname;
      const isHomePage = currentPath === '/' || currentPath === '';
      
      if (token && isHomePage) {
        // ✅ Nếu đang ở homepage khi khởi động, xóa token để hiển thị trang chủ chưa đăng nhập
        console.log('🏠 Homepage detected on startup - clearing auth to show unauthenticated state');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
        if (api.defaults?.headers?.common['Authorization']) {
          delete api.defaults.headers.common['Authorization'];
        }
        setLoading(false);
        return;
      }
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Avoid hanging forever if backend is slow
          await withTimeout(fetchUserProfile(roleFromStorage));
          // ✅ KHÔNG tự động redirect khi khởi động
          // Chỉ set user state, giữ nguyên route hiện tại
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
        
        // Lấy role từ response (giữ nguyên UPPERCASE như database)
        userRole = loginResponse.data?.role || loginResponse.role || 'STAFF';
        userRole = userRole.toUpperCase();
        
        switch (userRole) {
          case 'STAFF':
            dashboardPath = '/staff-dashboard';
            break;
          case 'ADMIN':
            dashboardPath = '/admin-dashboard';
            break;
          case 'SHIPPER':
            dashboardPath = '/shipper-dashboard';
            break;
          default:
            dashboardPath = '/staff-dashboard';
            break;
        }
        
        console.log('Staff login - role:', userRole, 'will redirect to:', dashboardPath);

      } catch (staffError) {
        try {
          loginResponse = await loginCustomer(username, password);
          
          // ⚠️ FIX: Lấy role từ response thay vì gán cứng
          userRole = loginResponse.data?.role || loginResponse.role || 'CUSTOMER';
          userRole = userRole.toUpperCase();
          
          console.log('Customer login - extracted role:', userRole);
          
          // Xác định dashboard path dựa trên role thực tế
          switch (userRole) {
            case 'CUSTOMER':
              dashboardPath = '/';
              break;
            case 'SHIPPER':
              dashboardPath = '/shipper-dashboard';
              break;
            case 'STAFF':
              dashboardPath = '/staff-dashboard';
              break;
            case 'ADMIN':
              dashboardPath = '/admin-dashboard';
              break;
            default:
              dashboardPath = '/';
          }
          
        } catch (customerError) {
          try {
            loginResponse = await loginShipper(username, password);
            
            // ⚠️ FIX: Lấy role từ response thay vì gán cứng
            userRole = loginResponse.data?.role || loginResponse.role || 'SHIPPER';
            userRole = userRole.toUpperCase();
            
            console.log('Shipper login - extracted role:', userRole);
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
        console.log('Executing navigation to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
        
        // Additional fallback: force redirect if navigate doesn't work
        setTimeout(() => {
          if (window.location.pathname !== dashboardPath) {
            console.warn('Navigate failed, using window.location redirect');
            window.location.replace(dashboardPath);
          } else {
            console.log('Navigation successful to:', window.location.pathname);
          }
        }, 500);
      }, 0);

      return { success: true, role: userRole };

    } catch (error) {
      console.error('Login error:', error);
      
      // Tạo thông báo lỗi dễ hiểu
      let userMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
      if (error.response?.status === 401) {
        userMessage = 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.';
      } else if (error.response?.status === 403) {
        userMessage = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.';
      } else if (error.response?.data?.message) {
        userMessage = translateToVietnamese(error.response.data.message);
      } else if (error.message?.includes('Network')) {
        userMessage = 'Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối mạng.';
      }
      
      return {
        success: false,
        error: userMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user with data:', userData);
      
      // Thử gọi API với publicApi (không có token/auth)
      const response = await api.post('/api/customer/register', userData, {
        headers: {
          'Content-Type': 'application/json',
          // Đảm bảo không có Authorization header
        }
      });
      
      console.log('✅ Registration successful:', response.data);
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Tạo thông báo lỗi dễ hiểu
      let userMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (error.response?.status === 409) {
        userMessage = 'Tên đăng nhập hoặc email đã được sử dụng. Vui lòng chọn tên khác.';
      } else if (error.response?.status === 400) {
        userMessage = translateToVietnamese(error.response?.data?.message || 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 403) {
        userMessage = 'Không có quyền đăng ký. Vui lòng liên hệ quản trị viên.';
      } else if (error.response?.data?.message) {
        userMessage = translateToVietnamese(error.response.data.message);
      }
      
      return {
        success: false,
        error: userMessage,
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      console.log('📧 Resending OTP to email:', email);
      
      const response = await api.post('/api/customer/resend-otp', { email });
      
      console.log('✅ Resend OTP response:', response);
      
      if (response.status === 200 || response.data?.status === 'success') {
        return { 
          success: true,
          message: 'Mã xác nhận mới đã được gửi đến email của bạn'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Không thể gửi lại mã xác nhận'
        };
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      
      let userMessage = 'Không thể gửi lại mã xác nhận. Vui lòng thử lại sau.';
      
      if (error.response?.status === 404) {
        userMessage = 'Không tìm thấy yêu cầu xác thực. Vui lòng đăng ký lại.';
      } else if (error.response?.status === 429) {
        userMessage = 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng đợi một chút.';
      } else if (error.response?.data?.message) {
        userMessage = translateToVietnamese(error.response.data.message);
      }
      
      return {
        success: false,
        error: userMessage,
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const role = localStorage.getItem('role');
      const endpoint = role === 'STAFF' || role === 'ADMIN'
        ? '/api/staff/profile'
        : role === 'SHIPPER'
          ? '/api/shipper/profile'
          : '/api/customer/profile';

      // Chuẩn bị payload theo đúng format API yêu cầu
      const payload = {
        customerName: profileData.customerName,
        gender: profileData.gender,
        address: profileData.address,
        phoneNumber: profileData.phone || profileData.phoneNumber, // API dùng phoneNumber
        email: profileData.email,
        birthDate: profileData.birthDate || null
      };

      console.log('📤 Updating profile with payload:', payload);
      const response = await api.put(endpoint, payload);
      console.log('✅ Profile updated successfully:', response.data);
      
      // Cập nhật user state với dữ liệu mới từ response
      // Map response fields về user object
      const updatedUser = {
        ...user,
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        phone: response.data.phone,
        phoneNumber: response.data.phone, // Đồng bộ cả hai field
        customerName: response.data.customerName,
        gender: response.data.gender,
        address: response.data.address,
        birthDate: response.data.birthDate || profileData.birthDate // Backend sẽ bổ sung field này
      };
      
      setUser(updatedUser);
      console.log('👤 User state updated:', updatedUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      
      // Tạo thông báo lỗi dễ hiểu cho người dùng
      let userMessage = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      
      if (error.response?.status === 401) {
        userMessage = 'Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        userMessage = 'Bạn không có quyền cập nhật thông tin này.';
      } else if (error.response?.status === 400) {
        userMessage = translateToVietnamese(error.response?.data?.message || 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.data?.message) {
        // Dịch message từ backend sang tiếng Việt
        userMessage = translateToVietnamese(error.response.data.message);
      }
      
      return {
        success: false,
        error: userMessage,
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    resendOTP,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    role: user?.role || roleFromStorage, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};