import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../contexts/AuthContext';
import NewsletterStats from '../components/NewsletterStats';
import { orderService } from '../services/orderService';
import { LogoutOutlined, CheckCircleOutlined } from '@ant-design/icons';

const AdminPanel = () => {
  const { showSuccess, showError } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle logout
  const handleLogout = () => {
    logout(); // AuthContext sẽ tự động redirect về /admin-login cho ADMIN
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data);
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-50 text-vietnam-green';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
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
        {/* Header with Logout Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-vietnam-green mb-2">Admin Panel</h1>
            <p className="text-gray-600">Quản lý hệ thống và đơn hàng - Xin chào, {user?.username || 'Admin'}!</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
            <LogoutOutlined className="text-lg" />
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
                <CheckCircleOutlined className="text-6xl" />
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

export default AdminPanel;
