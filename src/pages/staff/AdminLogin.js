import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

// Thêm CSS animations vào component
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.6s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }

  .animate-delay-100 {
    animation-delay: 0.1s;
    opacity: 0;
  }

  .animate-delay-200 {
    animation-delay: 0.2s;
    opacity: 0;
  }

  .animate-delay-300 {
    animation-delay: 0.3s;
    opacity: 0;
  }

  .animate-delay-400 {
    animation-delay: 0.4s;
    opacity: 0;
  }

  .animate-delay-500 {
    animation-delay: 0.5s;
    opacity: 0;
  }
`;

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const { login, logout } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Hiển thị thông báo từ trang xác thực OTP bằng toast
        if (location.state?.message) {
            showSuccess('Xác thực thành công!', location.state.message);
        }
    }, [location, showSuccess]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('🔐 AdminLogin: Starting login...');

            // Hiển thị thông báo đang kết nối (hữu ích khi backend cold start)
            showInfo('Đang kết nối...', 'Vui lòng đợi trong giây lát.');

            // Gọi hàm login từ AuthContext - nó sẽ tự động phân loại role và redirect
            const result = await login(formData.username, formData.password);

            console.log('🔐 AdminLogin: Login result:', result);

            if (result.success) {
                console.log('🔐 AdminLogin: Login successful, role:', result.role);
                console.log('🔐 AdminLogin: Full result:', JSON.stringify(result));

                // Kiểm tra role: Chỉ cho phép ADMIN, STAFF, và SHIPPER
                if (result.role === 'ADMIN') {
                    console.log('✅ Admin login success - redirecting to admin dashboard');
                    showSuccess('Đăng nhập thành công!', 'Chào mừng Admin!');
                    navigate('/admin-dashboard');
                } else if (result.role === 'STAFF') {
                    console.log('✅ Staff login success - redirecting to staff dashboard');
                    showSuccess('Đăng nhập thành công!', 'Chào mừng Staff!');
                    navigate('/staff-dashboard');
                } else if (result.role === 'SHIPPER') {
                    console.log('✅ Shipper login success - redirecting to shipper dashboard');
                    showSuccess('Đăng nhập thành công!', 'Chào mừng Shipper!');
                    navigate('/shipper-dashboard');
                } else {
                    // Nếu không phải 3 role trên → Không cho phép đăng nhập
                    console.log('⚠️ AdminLogin: Invalid role for admin login:', result.role);
                    showWarning('Không có quyền truy cập!', `Trang này chỉ dành cho Admin, Staff và Shipper.`);
                    // Logout ngay lập tức
                    await logout();
                    setLoading(false);
                    return;
                }
            } else {
                console.log('❌ AdminLogin: Login failed:', result.error);

                // Kiểm tra nếu lỗi là timeout
                if (result.error && result.error.includes('timeout')) {
                    showError('Không thể kết nối!', 'Backend đang khởi động lại. Vui lòng đợi 30 giây và thử lại.');
                } else {
                    showError('Đăng nhập thất bại!', result.error || 'Tên đăng nhập hoặc mật khẩu không đúng.');
                }
            }
        } catch (error) {
            console.error('💥 AdminLogin error:', error);

            // Kiểm tra nếu lỗi là timeout
            if (error.message && error.message.includes('timeout')) {
                showError('Không thể kết nối!', 'Backend đang khởi động lại. Vui lòng đợi 30 giây và thử lại.');
            } else {
                showError('Lỗi hệ thống!', 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{
                    backgroundImage: `url(${process.env.PUBLIC_URL}/login-background.jpg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'crisp-edges',
                    filter: 'contrast(1.1) brightness(1.05)'
                }}
            >
                {/* Overlay tối nhẹ để text dễ đọc nhưng giữ background sắc nét */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/35 to-black/40"></div>

                {/* Left side - Welcome text */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10">
                    <div className="max-w-md px-8 animate-fade-in-left">
                        <h1 className="text-5xl font-bold text-white mb-4">
                            Nhắc Nhớ Việt
                        </h1>
                        <p className="text-lg text-gray-200">
                            Nền tảng tra cứu lễ và đặt mâm cúng Việt Nam
                        </p>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
                    <div className="w-full max-w-md animate-fade-in-up">
                        {/* Card với nền trắng trong suốt */}
                        <div className="rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 p-8 sm:p-10 hover:shadow-3xl hover:ring-white/30 transition-all duration-500">

                            <h2 className="text-center text-3xl font-bold tracking-tight mb-2 animate-scale-in" style={{
                                background: 'linear-gradient(to right, #B8860B, #DAA520)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Đăng nhập Admin
                            </h2>
                            <p className="text-center text-sm text-gray-200 mb-6 animate-fade-in-up animate-delay-100">
                                Dành cho Staff và Shipper
                            </p>

                            <form className="space-y-6" onSubmit={handleSubmit}>

                                {/* Username */}
                                <div className="animate-slide-in-right animate-delay-200">
                                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-200">
                                        Tên đăng nhập
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-vietnam-gold bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-gray-50 focus:border-vietnam-gold focus:ring-2 focus:ring-vietnam-gold/30 shadow-sm hover:shadow-md"
                                        placeholder="Nhập tên đăng nhập"
                                    />
                                </div>

                                {/* Password */}
                                <div className="animate-slide-in-right animate-delay-300">
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border-2 border-vietnam-gold bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-gray-50 focus:border-vietnam-gold focus:ring-2 focus:ring-vietnam-gold/30 shadow-sm hover:shadow-md"
                                            placeholder="Nhập mật khẩu"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600 text-sm"
                                        >
                                            {showPw ? <EyeOutlined className="text-lg" /> : <EyeInvisibleOutlined className="text-lg" />}
                                        </button>

                                    </div>
                                </div>

                                {/* Remember me & Forgot password */}
                                <div className="flex items-center justify-between animate-slide-in-right animate-delay-400">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            style={{
                                                accentColor: '#B8860B'
                                            }}
                                            className="h-4 w-4 rounded cursor-pointer transition-transform hover:scale-110"
                                        />
                                        <span className="text-sm text-white group-hover:text-vietnam-gold-900 transition-colors">Ghi nhớ tài khoản</span>
                                    </label>
                                    {/* <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium hover:text-yellow-700 transition-all hover:scale-105"
                                        style={{ color: '#B8860B' }}
                                    >
                                        Quên mật khẩu?
                                    </Link> */}
                                </div>

                                {/* Submit */}
                                <div className="pt-4 animate-slide-in-right animate-delay-500">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(to right, #556B2F, #B8860B)'
                                        }}
                                        className="w-full text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl"
                                    >
                                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                    </button>
                                </div>

                                {/* Customer login link */}
                                {/* <div className="pt-4 border-t border-white/20 text-center animate-fade-in-up animate-delay-500">
                                    <p className="text-sm text-gray-200">
                                        Bạn là khách hàng?{' '}
                                        <Link
                                            to="/login"
                                            className="font-semibold hover:underline transition-all text-vietnam-gold hover:scale-105 inline-block"
                                        >
                                            Đăng nhập tại đây
                                        </Link>
                                    </p>
                                </div> */}

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;
