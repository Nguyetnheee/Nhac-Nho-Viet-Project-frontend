import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';
import { loginShipper } from '../../services/apiAuth';
import api from '../../services/api';

const ShipperLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        isStaff: false
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
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
            console.log('🚚 ShipperLogin: Starting login with /api/shipper/login...');
            
            // Gọi TRỰC TIẾP API /api/shipper/login
            const loginResponse = await loginShipper(formData.username, formData.password);
            
            console.log('🚚 ShipperLogin: API response:', JSON.stringify(loginResponse, null, 2));
            
            if (!loginResponse?.token) {
                throw new Error('Không nhận được token từ server');
            }
            
            // Lấy role từ response
            const userRole = loginResponse.role || 'SHIPPER';
            console.log('🚚 ShipperLogin: Role from API:', userRole);
            
            // Kiểm tra role có đúng SHIPPER không
            if (userRole !== 'SHIPPER') {
                showError('Sai loại tài khoản!', `Tài khoản này có role: ${userRole}`);
                return;
            }
            
            // Lưu token và role vào localStorage
            localStorage.setItem('token', loginResponse.token);
            localStorage.setItem('role', userRole);
            localStorage.setItem('username', loginResponse.username || formData.username);
            
            // Set Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.token}`;
            
            console.log('✅ ShipperLogin: Login successful, navigating to /shipper-dashboard');
            showSuccess('Đăng nhập thành công!', 'Chào mừng Shipper.');
            
            // Force redirect bằng window.location để reload page và AuthContext pick up token
            setTimeout(() => {
                window.location.href = '/shipper-dashboard';
            }, 500);
            
        } catch (error) {
            console.error('💥 ShipperLogin error:', error);
            console.error('💥 Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            
            const errorMsg = error.response?.data?.message || error.message || 'Tên đăng nhập hoặc mật khẩu không đúng.';
            showError('Đăng nhập thất bại!', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-blue-50 to-white">
            {/* Left brand panel */}
            <div className="relative hidden lg:flex items-center justify-center p-12">
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500"
                />
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-4xl font-bold text-center text-white">
                        Shipper Portal
                        <span className="block text-white mt-2">
                            Đăng nhập để quản lý đơn hàng
                        </span>
                    </h1>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-8">
                        {/* Mobile logo */}
                        <div className="lg:hidden mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg ring-4 ring-white/70 mb-4">
                            <span className="text-white font-black text-2xl font-serif">🚚</span>
                        </div>

                        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
                            Đăng nhập Shipper
                        </h2>
                        <p className="mt-1 text-center text-sm text-slate-600">
                            Dành cho nhân viên giao hàng
                        </p>

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-800">
                                    Tên đăng nhập
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-300/40"
                                    placeholder="Nhập tên đăng nhập"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">
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
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-300/40"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPw ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Đang đăng nhập...
                                    </span>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center text-sm text-slate-600">
                            Quay lại{' '}
                            <Link
                                to="/"
                                className="font-semibold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline"
                            >
                                trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperLogin;
