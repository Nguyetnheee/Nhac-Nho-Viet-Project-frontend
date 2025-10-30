import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import CustomAlert from '../components/CustomAlert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await forgotPassword(email);
      if (String(res?.status).toLowerCase() === 'success') {
        setMessage(res.message || 'Đã gửi OTP tới email của bạn.');
        setTimeout(() => {
          navigate('/verify-reset', { state: { email } });
        }, 800);
      } else {
        setError(res.message || 'Không thể gửi OTP');
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
        <h2 className="text-center text-3xl font-serif font-bold text-vietnam-green">
          Quên mật khẩu
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <CustomAlert 
              type="success"
              message="Email đã được gửi!"
              description={message}
              onClose={() => setMessage('')}
            />
          )}
          {error && (
            <CustomAlert 
              type="error"
              message="Lỗi gửi email!"
              description={error}
              onClose={() => setError('')}
            />
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition-all duration-300"
              placeholder="Nhập email của bạn"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-vietnam-green to-vietnam-gold text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
