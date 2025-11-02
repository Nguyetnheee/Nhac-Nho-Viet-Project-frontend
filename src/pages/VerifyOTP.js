import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MailOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import CustomAlert from '../components/CustomAlert';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const { resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    // Không có email thì quay về đăng ký
    if (!email) {
      navigate('/register');
      return;
    }
    // Focus ô đầu tiên
    setTimeout(() => inputRefs[0].current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs[lastIndex].current.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Xác thực OTP đăng ký
      const response = await api.post('/api/customer/verify-email', { email, otp: otpCode });

      const ok =
        String(response?.data?.status || '').toLowerCase() === 'success' ||
        response?.data?.verified === true ||
        response?.data?.email === email;

      if (ok) {
        // ✅ Thành công → chuyển thẳng về Login
        navigate('/login', {
          replace: true,
          state: {
            emailJustVerified: email,
            message: 'Xác thực tài khoản thành công. Vui lòng đăng nhập.',
          },
        });
      } else {
        setError(response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    const result = await resendOTP(email); // giữ nguyên hàm resend từ AuthContext

    if (result?.success) {
      setResendMessage('Mã OTP mới đã được gửi đến email của bạn');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } else {
      setError(result?.error || 'Không thể gửi lại mã OTP');
    }

    setResendLoading(false);
  };

  const handleCancel = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-vietnam-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#28a745] rounded-2xl flex items-center justify-center relative">
              <MailOutlined className="text-5xl text-white" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#218838] rounded-full flex items-center justify-center">
                <ArrowRightOutlined className="text-lg text-white font-bold" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
            Please check your email
          </h2>
          <p className="text-center text-gray-500 mb-8">
            We've sent a code to <span className="font-medium text-gray-700">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold text-[#28a745] border-2 border-[#28a745] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#218838] focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
            ))}
          </div>

          {/* Resend Link */}
          <p className="text-center text-gray-600 mb-6">
            Didn't get the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-[#28a745] hover:text-[#218838] font-medium underline disabled:opacity-50"
            >
              {resendLoading ? 'Đang gửi...' : 'Click to resend.'}
            </button>
          </p>

          {/* Error */}
          {error && (
            <CustomAlert 
              type="error"
              message="Lỗi xác thực OTP!"
              description={String(error)}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}

          {/* Success resend */}
          {resendMessage && (
            <div className="mb-4 bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-lg text-sm text-center">
              {resendMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || otp.some((d) => !d)}
              className="flex-1 px-6 py-3 bg-[#28a745] text-white rounded-lg font-medium hover:bg-[#218838] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
