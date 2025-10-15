import React, { useState } from 'react';
import { fetchCustomerProfile } from '../services/apiAuth';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    customerName: user?.customerName || "",
    gender: user?.gender || '',
    phone: user?.phone || user?.phoneNumber || '',
    address: user?.address || '',
    email: user?.email || '',
    birthDate: user?.birthDate || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  // Hàm gọi API lấy thông tin profile
  const handleFetchProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchCustomerProfile();
      setProfileData(data);
      setMessage('Lấy thông tin thành công!');
    } catch (error) {
      setMessage('Lỗi khi lấy thông tin: ' + (error?.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage('Cập nhật thông tin thành công');
    } else {
      setMessage('Có lỗi xảy ra: ' + result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-vietnam-red mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                <div className="w-24 h-24 bg-vietnam-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-vietnam-red font-bold text-3xl">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-vietnam-red mb-2">{user?.name}</h2>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-vietnam-gold text-vietnam-red text-sm rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-vietnam-red mb-6">Chỉnh sửa thông tin</h2>

              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('thành công')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field mb-2"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>

                </div>


                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <textarea
                    id="email"
                    name="email"
                    rows={3}
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>



                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
                {/* <button
                  type="button"
                  onClick={handleFetchProfile}
                  disabled={loading}
                  className="btn-secondary ml-4"
                >
                  {loading ? 'Đang lấy...' : 'Lấy thông tin từ API'}
                </button> */}
                {/* Hiển thị dữ liệu trả về từ API */}
                {/* {profileData && (
                  <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h3 className="font-bold mb-2">Dữ liệu từ API:</h3>
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(profileData, null, 2)}</pre>
                  </div>
                )} */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
