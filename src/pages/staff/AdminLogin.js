import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';

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
        <div
            className="min-h-screen flex items-center justify-center relative"
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/login-background.jpg), url(${process.env.PUBLIC_URL}/login-background.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay tối để text dễ đọc hơn */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Left side - Welcome text */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative z-10">
                <div className="max-w-md px-8">
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
                <div className="w-full max-w-md">
                    {/* Card với nền trong suốt tối */}
                    <div className="rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 p-8 sm:p-10">

                        <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2">
                            Đăng nhập Admin
                        </h2>
                        <p className="text-center text-sm text-gray-200 mb-8">
                            Dành cho Admin, Staff và Shipper
                        </p>

                        <form className="space-y-6" onSubmit={handleSubmit}>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white">
                                    Username                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-gray-300 outline-none transition-all focus:bg-white/30 focus:ring-2 focus:ring-white/50"
                                    placeholder="Nhập username"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPw ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-gray-300 outline-none transition-all focus:bg-white/30 focus:ring-2 focus:ring-white/50"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
                                    />
                                    <span className="text-sm text-white">Ghi nhớ tài khoản</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-white hover:underline"
                                >
                                    Quên mật khẩu? 
                                </Link>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                            </div>

                            {/* Customer login link */}
                            <div className="pt-4 border-t border-white/20 text-center">
                                <p className="text-sm text-gray-200">
                                    Bạn là khách hàng?{' '}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-white hover:underline transition-colors"
                                    >
                                        Đăng nhập tại đây
                                    </Link>
                                </p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
