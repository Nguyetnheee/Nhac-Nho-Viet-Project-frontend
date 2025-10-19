import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    // Nếu không có email, chuyển về trang đăng ký
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Xử lý phím Backspace
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
    
    // Focus vào ô cuối cùng
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

    const result = await verifyOTP(email, otpCode);
    
    if (result.success) {
      // Chuyển đến trang đăng nhập sau khi xác thực thành công
      navigate('/login', { 
        state: { message: 'Xác thực thành công! Vui lòng đăng nhập.' }
      });
    } else {
      setError(result.error || 'Mã OTP không chính xác');
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    const result = await resendOTP(email);
    
    if (result.success) {
      setResendMessage('Mã OTP mới đã được gửi đến email của bạn');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current.focus();
    } else {
      setError(result.error || 'Không thể gửi lại mã OTP');
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
              <svg 
                className="w-12 h-12 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#218838] rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-600 border border-red-700 text-white font-bold px-4 py-3 rounded-lg text-sm text-center shadow-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
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
              disabled={loading || otp.some(d => !d)}
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
