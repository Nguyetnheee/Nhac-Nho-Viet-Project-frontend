import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ToastContainer';

const StaffLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        isStaff: false
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
            console.log('👔 StaffLogin: Starting login...');
            
            // Gọi hàm login từ AuthContext - nó sẽ tự động phân loại role và redirect
            const result = await login(formData.username, formData.password);
            
            console.log('👔 StaffLogin: Login result:', result);
            
            if (result.success) {
                console.log('👔 StaffLogin: Login successful, role:', result.role);
                
                // Chỉ hiển thị message, KHÔNG can thiệp vào navigation
                // AuthContext sẽ tự động redirect dựa vào role
                if (result.role === 'MANAGER' || result.role === 'ADMIN') {
                    console.log('✅ StaffLogin: Role is MANAGER/ADMIN, AuthContext will navigate');
                    showSuccess('Đăng nhập thành công!', 'Chào mừng bạn trở lại.');
                } else {
                    console.log('⚠️ StaffLogin: Role is not MANAGER/ADMIN:', result.role);
                    showWarning('Thông báo', `Bạn đã đăng nhập với role: ${result.role}`);
                    // Không logout, để AuthContext navigate đến dashboard phù hợp
                }
            } else {
                console.log('❌ StaffLogin: Login failed:', result.error);
                showError('Đăng nhập thất bại!', result.error || 'Tên đăng nhập hoặc mật khẩu không đúng.');
            }
        } catch (error) {
            console.error('💥 StaffLogin error:', error);
            showError('Lỗi hệ thống!', 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-vietnam-cream to-white">
            {/* Left brand panel */}
            <div className="relative hidden lg:flex items-center justify-center p-12">
                {/* Dùng hình ảnh nền thay cho màu gradient */}
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${process.env.PUBLIC_URL}/login-background.jpg)`, // Đặt đúng tên file hình nền bạn muốn
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                {/* <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_20%_20%,#312e81_0,transparent_40%),radial-gradient(circle_at_80%_30%,#be185d_0,transparent_40%),radial-gradient(circle_at_30%_80%,#ca8a04_0,transparent_45%)]" /> */}
                <div className="relative z-10 max-w-xl">
                    {/* <div className="flex items-center justify-center">
                        <span className="">
                            <img
                                src={`${process.env.PUBLIC_URL}/ms-icon-310x310.png`}
                                alt="Nhắc Nhớ Việt"
                                className="w-60 h-60 rounded-full object-cover border-2 border-vietnam-gold shadow-sm mb-10"
                            />
                        </span>
                    </div> */}
                    <h1 className="text-4xl font-bold text-center text-white">
                        Chào mừng trở lại
                        <span className="block text-white bg-clip-text bg-gradient-to-r from-vietnam-green to-vietnam-gold">
                            đăng nhập để tiếp tục
                        </span>
                    </h1>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-8">
                        {/* Mobile logo */}
                        <div className="lg:hidden mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-white/70 mb-4">
                            <span className="text-white font-black text-2xl font-serif tracking-wider">S</span>
                        </div>

                        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
                            Đăng nhập
                        </h2>
                        <p className="mt-1 text-center text-sm text-slate-600">
                            Hoặc{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-vietnam-gold hover:text-vietnam-green underline-offset-4 hover:underline transition-colors"
                            >
                                tạo tài khoản mới
                            </Link>
                        </p>

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-800">
                                    Tên đăng nhập
                                </label>
                                <div className="relative group">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/40"
                                        placeholder="Nhập tên đăng nhập của bạn"
                                    />
                                    {/* <span className="pointer-events-none absolute inset-y-0 right-3 my-auto text-slate-300 group-focus-within:opacity-0">@</span> */}
                                </div>
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
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-300/40"
                                        placeholder="Nhập mật khẩu của bạn"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((s) => !s)}
                                        className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600 text-sm"
                                        aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showPw ? 'Ẩn' : 'Hiện'}
                                    </button>
                                </div>
                            </div>

                            {/* Staff toggle */}
                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center gap-3 select-none cursor-pointer">
                                    {/* <input
                    type="checkbox"
                    checked={formData.isStaff}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isStaff: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                  />
                  <span className="text-sm text-slate-700">Đăng nhập nhân viên</span> */}
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="font-medium text-vietnam-gold hover:text-vietnam-green transition-colors duration-300"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-vietnam-green to-vietnam-gold text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vietnam-gold focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                            </div>

                            {/* Demo Toast Buttons - Remove this in production */}
                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 text-center mb-3">Demo Toast Notifications:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => showSuccess('Thành công!', 'Thao tác hoàn thành.')}
                                        className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                    >
                                        Success
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => showError('Lỗi!', 'Đã xảy ra lỗi.')}
                                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                    >
                                        Error
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => showWarning('Cảnh báo!', 'Kiểm tra lại thông tin.')}
                                        className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                                    >
                                        Warning
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => showInfo('Thông tin!', 'Đây là thông tin bổ sung.')}
                                        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                    >
                                        Info
                                    </button>
                                </div>
                            </div>


                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StaffLogin;
