// src/pages/VerifyResetOTP.js
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetOTP } from '../services/api';
import CustomAlert from '../components/CustomAlert';

const VerifyResetOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // 6 ô OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  // refs ổn định cho 6 input
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  // Bảo vệ route & focus
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    // focus ô đầu
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 0);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // chỉ nhận số 0-9
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length - 1, 5)]?.current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setResendMessage('');

    try {
      const res = await verifyResetOTP(email, code);

      const ok =
        res?.email === email ||
        res?.verified === true ||
        String(res?.status || '').toLowerCase() === 'success';

      if (ok) {
        // thành công thì chuyển sang trang đặt lại mật khẩu
        navigate('/reset-password', { replace: true, state: { email } });
      } else {
        setError(res?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError('Không thể xác thực OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setResendMessage('');

    try {
      const res = await forgotPassword(email);
      if (String(res?.status || '').toLowerCase() === 'success') {
        setResendMessage('Mã OTP mới đã được gửi đến email của bạn.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.current?.focus();
      } else {
        setError(res?.message || 'Không thể gửi lại mã OTP.');
      }
    } catch {
      setError('Không thể gửi lại mã OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancel = () => navigate('/forgot-password');

  return (
    <div className="min-h-screen bg-vietnam-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-vietnam-green rounded-2xl flex items-center justify-center relative">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0zm0 0l-3 3m3-3l-3-3" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-2">
            Xác thực OTP (Quên mật khẩu)
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Mã xác thực đã gửi tới <span className="font-medium text-gray-700">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs.current[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold
                           border-2 border-vietnam-green text-vietnam-green rounded-lg
                           focus:ring-2 focus:ring-vietnam-gold focus:border-transparent transition"
                disabled={loading}
              />
            ))}
          </div>

          {/* Messages */}
          {error && (
            <CustomAlert 
              type="error"
              message="Lỗi xác thực OTP!"
              description={String(error)}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}
          {resendMessage && (
            <CustomAlert 
              type="success"
              message="OTP đã được gửi lại!"
              description={resendMessage}
              onClose={() => setResendMessage('')}
              className="mb-4"
            />
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otp.some((d) => !d)}
              className="flex-1 px-6 py-3 bg-vietnam-green text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>
          </div>

          {/* Resend */}
          <p className="text-center text-gray-600 mt-6">
            Không nhận được mã?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-vietnam-green hover:text-green-700 font-medium underline disabled:opacity-50"
            >
              {resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOTP;
