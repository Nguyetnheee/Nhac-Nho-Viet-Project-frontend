import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomAlert from '../components/CustomAlert';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    customerName: '',
    birthDate: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case 'customerName':
        if (!value.trim()) return 'Họ và tên là bắt buộc';
        if (value.trim().length < 2) return 'Họ và tên phải từ 2 ký tự trở lên';
        return '';
      case 'username':
        if (!value.trim()) return 'Username là bắt buộc';
        if (value.includes(' ')) return 'Username không được chứa khoảng trắng';
        if (value.length < 3) return 'Username phải từ 3 ký tự trở lên';
        return '';
      case 'email': {
        if (!value.trim()) return 'Email là bắt buộc';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!re.test(value)) return 'Email không hợp lệ';
        return '';
      }
      case 'password': {
        if (!value) return 'Mật khẩu là bắt buộc';
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(value)) return 'Mật khẩu phải ≥ 8 ký tự, gồm chữ, số và ký tự đặc biệt';
        // re-validate confirmPassword if exists
        if (allValues.confirmPassword && allValues.confirmPassword !== value) return fieldErrors.confirmPassword || '';
        return '';
      }
      case 'confirmPassword':
        if (!value) return 'Vui lòng nhập lại mật khẩu';
        if (value !== allValues.password) return 'Mật khẩu xác nhận không khớp';
        return '';
      case 'phone': {
        if (!value) return 'Số điện thoại là bắt buộc';
        if (!/^\d{10}$/.test(value)) return 'Số điện thoại phải gồm 10 chữ số';
        return '';
      }
      case 'birthDate':
        if (!value) return 'Ngày sinh là bắt buộc';
        return '';
      case 'gender':
        if (!value) return 'Giới tính là bắt buộc';
        return '';
      case 'address':
        if (!value.trim()) return 'Địa chỉ là bắt buộc';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Chỉ cho phép nhập số trong trường phone
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue });
      const msg = validateField(name, numericValue, { ...formData, [name]: numericValue });
      setFieldErrors((prev) => ({ ...prev, [name]: msg }));
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
    const msg = validateField(name, value, { ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields before submit
    const fields = Object.keys(formData);
    const newErrors = {};
    fields.forEach((f) => {
      const msg = validateField(f, formData[f]);
      if (msg) newErrors[f] = msg;
    });
    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError('Vui lòng sửa các lỗi trong biểu mẫu.');
      setLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      password: formData.password,
      email: formData.email,
      phone: formData.phone,
      customerName: formData.customerName,
      birthDate: formData.birthDate,
      gender: formData.gender,
      address: formData.address
    });

    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-vietnam-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-vietnam-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-vietnam-green">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-vietnam-green hover:opacity-80">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <CustomAlert
              type="error"
              message="Lỗi đăng ký!"
              description={String(error)}
              onClose={() => setError('')}
            />
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Nhập họ và tên"
              />
              {fieldErrors.customerName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Nhập username"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Nhập email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Chỉ nhập số điện thoại"
                pattern="[0-9]*"
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.birthDate && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.birthDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="input-field mt-1"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              {fieldErrors.gender && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.gender}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Nhập địa chỉ"
              />
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
