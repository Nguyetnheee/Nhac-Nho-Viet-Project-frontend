import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';

const ShipperDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Mock data for demonstration
  const [stats, setStats] = useState({
    totalOrders: 24,
    completedOrders: 18,
    pendingOrders: 6,
    successRate: 85,
    todayDeliveries: 8
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      const shippingOrders = response.data.filter(order => 
        order.status === 'confirmed' || order.status === 'shipping' || order.status === 'success'
      );
      setOrders(shippingOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'orders', label: 'Đơn hàng', icon: '📦' },
    { id: 'deliveries', label: 'Giao hàng', icon: '🚚' },
    { id: 'tracking', label: 'Theo dõi', icon: '📍' },
    { id: 'reports', label: 'Báo cáo', icon: '📈' },
    { id: 'messages', label: 'Tin nhắn', icon: '💬', badge: 3 },
    { id: 'profile', label: 'Hồ sơ', icon: '👤' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Nguyễn Văn A', address: '123 Đường ABC, Q1, TP.HCM', status: 'shipping', amount: '450,000' },
    { id: 'ORD-002', customer: 'Trần Thị B', address: '456 Đường XYZ, Q2, TP.HCM', status: 'pending', amount: '320,000' },
    { id: 'ORD-003', customer: 'Lê Văn C', address: '789 Đường DEF, Q3, TP.HCM', status: 'completed', amount: '680,000' },
    { id: 'ORD-004', customer: 'Phạm Thị D', address: '321 Đường GHI, Q4, TP.HCM', status: 'shipping', amount: '250,000' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'shipping': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'shipping': return 'Đang giao';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-vietnam-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🚚</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Nhắc Nhớ Việt Shipper</h1>
              <p className="text-xs text-gray-500">Hệ thống giao hàng</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                activeMenu === item.id
                  ? 'bg-vietnam-red text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">Tổng quan</h2>
              <p className="text-gray-600">Chào mừng trở lại, {user?.username || 'Shipper'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-vietnam-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user?.username || 'Shipper'}</p>
                  <p className="text-xs text-gray-500">Tài xế giao hàng</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tỷ lệ thành công</p>
                  <p className="text-3xl font-bold text-vietnam-red">{stats.successRate}%</p>
                </div>
                <div className="w-12 h-12 bg-vietnam-red bg-opacity-10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
                  <button className="text-vietnam-red hover:text-red-700 text-sm font-medium">
                    Xem tất cả
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">{order.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{order.amount} VNĐ</p>
                        <button className="text-vietnam-red hover:text-red-700 text-xs font-medium">
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 bg-vietnam-red text-white rounded-lg hover:bg-opacity-90 transition-colors">
                    <span>📦</span>
                    <span>Nhận đơn mới</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <span>📍</span>
                    <span>Xem bản đồ</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <span>📱</span>
                    <span>Báo cáo sự cố</span>
                  </button>
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hôm nay</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giao hàng</span>
                    <span className="font-semibold text-gray-900">{stats.todayDeliveries} đơn</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Khoảng cách</span>
                    <span className="font-semibold text-gray-900">45 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="font-semibold text-gray-900">6h 30m</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-vietnam-red h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">75% hoàn thành</p>
                </div>
              </div>

              {/* Weather/Status */}
              <div className="bg-gradient-to-r from-vietnam-red to-red-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Trạng thái</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">☀️</span>
                  <div>
                    <p className="font-medium">Trời nắng</p>
                    <p className="text-sm opacity-90">Tốt cho giao hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;