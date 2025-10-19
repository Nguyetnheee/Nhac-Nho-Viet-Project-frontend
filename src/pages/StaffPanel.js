import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const StaffPanel = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold text-green-600 mb-8">Staff Dashboard</h2>
                <div className="space-y-4">
                  <p>
                    <span className="font-bold">Tên nhân viên:</span> {user?.staffName || 'N/A'}
                  </p>
                  <p>
                    <span className="font-bold">Username:</span> {user?.username || 'N/A'}
                  </p>
                  <p>
                    <span className="font-bold">Email:</span> {user?.email || 'N/A'}
                  </p>
                  <p>
                    <span className="font-bold">Số điện thoại:</span> {user?.phone || 'N/A'}
                  </p>
                  {/* Thêm các thông tin khác của staff nếu cần */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPanel;