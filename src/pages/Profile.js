import React, { useState, useEffect } from 'react';
import { fetchCustomerProfile } from '../services/apiAuth';
import { useAuth } from '../contexts/AuthContext';
import OrderHistory from '../components/OrderHistory';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' hoặc 'orders'
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

  // Tải dữ liệu profile từ API khi component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const data = await fetchCustomerProfile();
        setProfileData(data);
        
        // Cập nhật formData với dữ liệu từ API
        if (data) {
          setFormData({
            customerName: data.customerName || "",
            gender: data.gender || '',
            phone: data.phone || '',
            address: data.address || '',
            email: data.email || '',
            birthDate: data.birthDate || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Nếu API fail, fallback về user từ AuthContext
        if (user) {
          setFormData({
            customerName: user.customerName || "",
            gender: user.gender || '',
            phone: user.phone || user.phoneNumber || '',
            address: user.address || '',
            email: user.email || '',
            birthDate: user.birthDate || ''
          });
        }
      }
    };

    loadProfileData();
  }, []); // Chỉ chạy một lần khi component mount

  // Đồng bộ formData khi user thay đổi (sau khi update)
  useEffect(() => {
    if (user) {
      setFormData({
        customerName: user.customerName || "",
        gender: user.gender || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || '',
        email: user.email || '',
        birthDate: user.birthDate || ''
      });
    }
  }, [user]);

  const handleFetchProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchCustomerProfile();
      setProfileData(data);
      
      // Cập nhật formData với dữ liệu mới
      if (data) {
        setFormData({
          customerName: data.customerName || "",
          gender: data.gender || '',
          phone: data.phone || '',
          address: data.address || '',
          email: data.email || '',
          birthDate: data.birthDate || ''
        });
      }
      
      setMessage('Tải thông tin thành công!');
    } catch (error) {
      // Thông báo dễ hiểu cho người dùng
      const backendMsg = error?.response?.data?.message;
      if (backendMsg) {
        setMessage(`Không thể tải thông tin: ${backendMsg}`);
      } else {
        setMessage('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
      }
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
    
    console.log('📝 Submitting profile update:', formData);
    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Thông tin của bạn đã được cập nhật thành công!');
      setTimeout(() => setMessage(''), 5000);
    } else {
      // Hiển thị lỗi dễ hiểu
      const errorMsg = result.error || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setMessage(` ${errorMsg}`);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    const fade = document.querySelector('.fade-page');
    if (fade) {
      fade.classList.add('opacity-100', 'translate-y-0');
    }
  }, []);


  return (
    <div className="min-h-screen bg-[#fff8f2] py-8 fade-in-up">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        {/* Header (Hero Section) */}
        <div className="relative h-40 rounded-2xl shadow-md overflow-hidden">
          {/* Ảnh nền */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/hero-background.jpg')",
              filter: "brightness(0.9)", // 
            }}
          ></div>

          {/* Lớp phủ mờ */}
          <div className="absolute inset-0 bg-white opacity-10 backdrop-blur-sm"></div>
        </div>




        {/* Avatar + Info */}
        <div className="text-center mt-[-60px]">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-vietnam-gold flex items-center justify-center text-4xl font-bold text-vietnam-green">
              {user?.customerName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-vietnam-green">{formData.customerName || user?.name}</h2>
          <p className="text-gray-600">{user?.role || 'Thành viên'}</p>

        </div>

        {/* Main Card */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="bg-gradient-to-b from-vietnam-green to-vietnam-gold text-white p-6 space-y-2">
              <div className="bg-white rounded-2xl p-6 space-y-2 shadow-sm">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-gray-100 text-[#0b3d3c]' 
                      : 'text-[#0b3d3c] hover:bg-gray-50'
                  }`}
                >
                  <i className="fa-solid fa-user mr-3 text-[#0b3d3c]"></i>Thông tin cá nhân
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-gray-100 text-[#0b3d3c]' 
                      : 'text-[#0b3d3c] hover:bg-gray-50'
                  }`}
                >
                  <i className="fa-solid fa-shopping-bag mr-3 text-[#0b3d3c]"></i>Đơn hàng của tôi
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-[#0b3d3c]">
                  <i className="fa-solid fa-bell mr-3 text-[#0b3d3c]"></i>Thông báo
                </button>
              </div>

            </div>

            {/* Form */}
            <div className="lg:col-span-3 p-8">
              {/* Tab: Thông tin cá nhân */}
              {activeTab === 'profile' && (
                <>
                  <h3 className="text-xl font-semibold text-vietnam-green mb-6">Thông tin cá nhân</h3>
                  {message && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('thành công')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleChange}
                          type="text"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="input-field"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <input
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleChange}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <textarea
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className="input-field"
                      ></textarea>
                    </div>

                    <div className="text-right">
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Tab: Đơn hàng của tôi */}
              {activeTab === 'orders' && (
                <OrderHistory />
              )}

              {/* Recent Activity */}
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
