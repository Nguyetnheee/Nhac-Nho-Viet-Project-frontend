import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomAlert from '../components/CustomAlert';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isStaff: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Hiển thị thông báo từ trang xác thực OTP
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Xóa message khỏi state sau 5 giây
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password, formData.isStaff);
      
      if (result.success) {
        if (formData.isStaff) {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-vietnam-cream to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-vietnam-green to-vietnam-gold rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-3xl font-serif">N</span>
            </div>
          </div>
          <h2 className="mt-8 text-center text-3xl font-serif font-bold text-vietnam-green">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/register" className="font-medium text-vietnam-gold hover:text-vietnam-green transition-colors duration-300">
              tạo tài khoản mới
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <CustomAlert 
              type="success"
              message="Đăng nhập thành công!"
              description={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}
          
          {error && (
            <CustomAlert 
              type="error"
              message="Lỗi đăng nhập!"
              description={error}
              onClose={() => setError('')}
            />
          )}
          
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300"
                  placeholder="Nhập tên đăng nhập của bạn"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300"
                  placeholder="Nhập mật khẩu của bạn"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-vietnam-green to-vietnam-gold text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>

          <p className="mt-2 text-center text-sm text-gray-600">
            <Link to="/forgot-password" className="font-medium text-vietnam-gold hover:text-vietnam-green transition-colors duration-300">
              Quên mật khẩu?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
