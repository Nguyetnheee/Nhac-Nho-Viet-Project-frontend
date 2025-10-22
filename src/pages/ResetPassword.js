import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/customer/reset-password', { email, password });
      if (response.data.status === 'success') {
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-vietnam-cream to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h2 className="text-center text-3xl font-serif font-bold text-vietnam-red">
          Đặt lại mật khẩu
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300"
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-vietnam-red to-vietnam-gold text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;