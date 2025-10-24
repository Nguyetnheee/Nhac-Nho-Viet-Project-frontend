import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StaffProfileForm from '../components/StaffProfileForm';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [showProfileForm, setShowProfileForm] = useState(false);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-vietnam-red mb-2">Trang quản lý nhân viên</h1>
            <p className="text-gray-600">Xin chào, <strong>{user?.staffName || user?.username}</strong>!</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowProfileForm(!showProfileForm)}
              className="px-4 py-2 bg-vietnam-gold text-white rounded hover:opacity-90"
            >
              {showProfileForm ? 'Đóng chỉnh sửa' : 'Chỉnh sửa thông tin'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-vietnam-red text-white rounded hover:opacity-90"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {showProfileForm && (
          <div className="mt-6">
            <StaffProfileForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
