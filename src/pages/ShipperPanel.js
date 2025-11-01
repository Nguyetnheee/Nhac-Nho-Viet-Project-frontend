// src/pages/ShipperPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import { orderService } from '../services/orderService';
// ⚠️ Import useAuth
import { useAuth } from '../contexts/AuthContext'; 

const ShipperPanel = () => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth(); // ⚠️ Lấy thông tin user
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  console.log('🚚 ShipperPanel mounted, user:', user);
  console.log('🚚 User role:', user?.role);
  
  const shipperUsername = user?.username || "Shipper"; // Lấy username để chào mừng

  const handleLogout = () => {
    // Xóa token và role
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // Redirect về trang shipper login
    window.location.href = '/shipper-login';
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ... (Giữ nguyên các hàm fetchOrders, updateOrderStatus, getStatusColor, getStatusText)

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      // Filter orders that are ready for shipping
      const shippingOrders = response.data.filter(order => 
        order.status === 'confirmed' || order.status === 'shipping'
      );
      setOrders(shippingOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      fetchOrders();
      showSuccess('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'success': return 'Thành công';
      case 'failed': return 'Thất bại';
      default: return status;
    }
  };


  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            {/* ⚠️ Thêm header chào mừng */}
            <h1 className="text-3xl font-serif font-bold text-vietnam-green mb-2">
               Chào mừng, {shipperUsername}!
            </h1>
            <p className="text-gray-600">Quản lý đơn hàng giao</p>
          </div>
          
          {/* Nút Logout */}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            Đăng xuất
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-vietnam-green mb-2">
              {orders.filter(o => o.status === 'confirmed').length}
            </div>
            <div className="text-gray-600">Đơn chờ giao</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-vietnam-green mb-2">
              {orders.filter(o => o.status === 'shipping').length}
            </div>
            <div className="text-gray-600">Đang giao</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-vietnam-green mb-2">
              {orders.filter(o => o.status === 'success').length}
            </div>
            <div className="text-gray-600">Đã giao thành công</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-vietnam-green">Danh sách đơn hàng</h2>
            <button onClick={fetchOrders} className="btn-secondary">
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vietnam-green"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa chỉ giao
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-gray-500">{order.customerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate">{order.customerAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'shipping')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Nhận giao
                            </button>
                          )}
                          {order.status === 'shipping' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateOrderStatus(order.id, 'success')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Giao thành công
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'failed')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Giao thất bại
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Không có đơn hàng nào
              </h3>
              <p className="text-gray-500">
                Hiện tại không có đơn hàng nào cần giao
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipperPanel;