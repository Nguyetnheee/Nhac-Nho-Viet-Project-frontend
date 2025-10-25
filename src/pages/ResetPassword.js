// src/pages/ResetPassword.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  //  Bảo vệ route: thiếu email thì quay lại forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  const pwTooShort = password.length > 0 && password.length < 6;
  const notMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit = useMemo(() => {
    return (
      !!email &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword &&
      !loading
    );
  }, [email, password, confirmPassword, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Thiếu email. Vui lòng thực hiện lại từ bước quên mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, password);
      if (String(res?.status || '').toLowerCase() === 'success') {
        setMessage(res?.message || 'Đặt lại mật khẩu thành công.');
        // Quay về trang đăng nhập sau khi đã reset xong 
        setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' },
          });
        }, 600);
      } else {
        setError(res?.message || 'Không thể đặt lại mật khẩu.');
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300 pr-12"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {pwTooShort && (
              <p className="mt-1 text-xs text-red-600">Mật khẩu phải có ít nhất 6 ký tự.</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPw ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300 pr-12"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {notMatch && (
              <p className="mt-1 text-xs text-red-600">Mật khẩu xác nhận chưa khớp.</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-vietnam-red to-vietnam-gold text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Quay về Quên mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
