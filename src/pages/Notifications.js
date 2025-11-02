import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useToast } from '../components/ToastContainer';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ShoppingOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  NotificationOutlined
} from '@ant-design/icons';

const Notifications = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchUnreadCount 
  } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

  // Fetch notifications
  const loadNotifications = async (page = 0) => {
    try {
      setLoading(true);
      const response = await fetchNotifications(page, pageSize);
      
      console.log('Notifications response:', response);
      
      // Handle different response structures
      const notificationData = response.content || response.notifications || [];
      const total = response.totalPages || Math.ceil((response.totalElements || notificationData.length) / pageSize);
      
      setNotifications(notificationData);
      setTotalPages(total);
      setTotalElements(response.totalElements || notificationData.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showError('Không thể tải thông báo');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(0);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'UNREAD') return !notification.isRead;
    if (filter === 'READ') return notification.isRead;
    return true;
  });

  // Handle mark as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const success = await markAsRead(notificationId);
      if (success) {
        // Cập nhật local state
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === notificationId ? { ...n, isRead: true } : n
          )
        );
        showSuccess('Đã đánh dấu là đã đọc');
      }
    } catch (error) {
      showError('Không thể đánh dấu đã đọc');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllAsRead();
      if (success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        showSuccess('Đã đánh dấu tất cả là đã đọc');
        await fetchUnreadCount();
      }
    } catch (error) {
      showError('Không thể đánh dấu tất cả đã đọc');
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId, isRead, e) => {
    e.stopPropagation();
    try {
      const success = await deleteNotification(notificationId, isRead);
      if (success) {
        setNotifications(prev =>
          prev.filter(n => n.notificationId !== notificationId)
        );
        showSuccess('Đã xóa thông báo');
        await fetchUnreadCount();
      }
    } catch (error) {
      showError('Không thể xóa thông báo');
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
        )
      );
    }

    // Navigate đến trang chi tiết đơn hàng nếu có
    if (notification.orderId) {
      navigate(`/order-success/${notification.orderId}`);
    }
  };

  // Pagination handlers
  const goToPage = (page) => {
    loadNotifications(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      loadNotifications(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadNotifications(currentPage + 1);
    }
  };

  // Format time
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
        return { IconComponent: CheckCircleOutlined, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'ORDER_SHIPPING':
        return { IconComponent: CarOutlined, color: 'text-purple-500', bg: 'bg-purple-100' };
      case 'ORDER_DELIVERED':
        return { IconComponent: ShoppingOutlined, color: 'text-green-500', bg: 'bg-green-100' };
      case 'ORDER_COMPLETED':
        return { IconComponent: GiftOutlined, color: 'text-emerald-500', bg: 'bg-emerald-100' };
      case 'ORDER_CANCELLED':
        return { IconComponent: CloseCircleOutlined, color: 'text-red-500', bg: 'bg-red-100' };
      default:
        return { IconComponent: NotificationOutlined, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-vietnam-green mb-2">
            <BellOutlined className="mr-3" />
            Thông báo
          </h1>
          <p className="text-gray-600">
            Theo dõi trạng thái đơn hàng và các thông báo quan trọng
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {['ALL', 'UNREAD', 'READ'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-colors
                    ${filter === filterType
                      ? 'bg-vietnam-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {filterType === 'ALL' && 'Tất cả'}
                  {filterType === 'UNREAD' && 'Chưa đọc'}
                  {filterType === 'READ' && 'Đã đọc'}
                </button>
              ))}
            </div>

            {/* Mark all as read button */}
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <CheckOutlined />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-green mx-auto"></div>
            <p className="mt-4 text-gray-500">Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <InboxOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'UNREAD' && 'Không có thông báo chưa đọc'}
              {filter === 'READ' && 'Không có thông báo đã đọc'}
              {filter === 'ALL' && 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const iconData = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden
                    ${!notification.isRead ? 'border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                  `}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full ${iconData.bg} flex items-center justify-center flex-shrink-0`}>
                        {iconData.IconComponent && <iconData.IconComponent className={`text-2xl ${iconData.color}`} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                                className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Đánh dấu đã đọc"
                              >
                                <CheckOutlined />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.notificationId, notification.isRead, e)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Xóa thông báo"
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{currentPage * pageSize + 1}</span> - <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong tổng số <span className="font-medium">{totalElements}</span> thông báo
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-vietnam-green border-vietnam-green hover:bg-vietnam-green hover:text-white'
                  }`}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Trước
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i).map((pageNumber) => {
                    const showPage = 
                      pageNumber === 0 || 
                      pageNumber === totalPages - 1 || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                    
                    const showEllipsis = 
                      (pageNumber === currentPage - 2 && currentPage > 2) ||
                      (pageNumber === currentPage + 2 && currentPage < totalPages - 3);

                    if (showEllipsis) {
                      return (
                        <span key={pageNumber} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-vietnam-green text-white font-semibold'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-vietnam-green border-vietnam-green hover:bg-vietnam-green hover:text-white'
                  }`}
                >
                  Sau
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
