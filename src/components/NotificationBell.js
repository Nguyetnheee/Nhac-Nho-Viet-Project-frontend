import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { BellOutlined } from '@ant-design/icons';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount, fetchNotifications, markAsRead } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Fetch 5 thông báo gần nhất khi mở dropdown
  const handleToggleDropdown = async () => {
    if (!showDropdown) {
      setLoading(true);
      try {
        const response = await fetchNotifications(0, 5);
        setRecentNotifications(response.content || response.notifications || []);
      } catch (error) {
        console.error('Error fetching recent notifications:', error);
        setRecentNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    setShowDropdown(!showDropdown);
  };

  // Xử lý click vào thông báo
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

    // Đóng dropdown
    setShowDropdown(false);

    // Navigate đến trang chi tiết đơn hàng nếu có orderId
    if (notification.orderId) {
      navigate(`/order-success/${notification.orderId}`);
    }
  };

  // Xem tất cả thông báo
  const handleViewAll = () => {
    setShowDropdown(false);
    navigate('/notifications');
  };

  // Format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Icon theo loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return '✅';
      case 'ORDER_SHIPPING':
        return '🚚';
      case 'ORDER_DELIVERED':
        return '📦';
      case 'ORDER_COMPLETED':
        return '🎉';
      case 'ORDER_CANCELLED':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-vietnam-green transition-colors rounded-full hover:bg-gray-100"
        aria-label="Thông báo"
      >
        <BellOutlined className="text-xl" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-vietnam-green text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-white text-vietnam-green px-2 py-1 rounded-full font-semibold">
                  {unreadCount} mới
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vietnam-green mx-auto"></div>
                <p className="mt-2 text-sm">Đang tải...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellOutlined className="text-4xl mb-2 opacity-30" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors
                    ${!notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-vietnam-green hover:text-vietnam-gold font-medium text-sm transition-colors"
              >
                Xem tất cả thông báo →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
