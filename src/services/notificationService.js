import api from './api';

const notificationService = {
  /**
   * Lấy danh sách thông báo của customer (có phân trang)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng thông báo mỗi trang
   */
  getNotifications: async (page = 0, size = 5) => {
    try {
      console.log('📬 Fetching notifications...', { page, size });
      const response = await api.get(`/api/customer/notifications?page=${page}&size=${size}`);
      console.log('📬 Notifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount: async () => {
    try {
      console.log('🔔 Fetching unread notification count...');
      const response = await api.get('/api/customer/notifications/unread-count');
      console.log('🔔 Unread count:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu thông báo là đã đọc
   * @param {number} notificationId - ID của thông báo
   */
  markAsRead: async (notificationId) => {
    try {
      console.log('✅ Marking notification as read:', notificationId);
      const response = await api.put(`/api/customer/notifications/${notificationId}/read`);
      console.log('✅ Marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    try {
      console.log('✅ Marking all notifications as read...');
      const response = await api.put('/api/customer/notifications/read-all');
      console.log('✅ All notifications marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Xóa thông báo
   * @param {number} notificationId - ID của thông báo
   */
  deleteNotification: async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await api.delete(`/api/customer/notifications/${notificationId}`);
      console.log('🗑️ Notification deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Xóa tất cả thông báo đã đọc
   */
  deleteAllRead: async () => {
    try {
      console.log('🗑️ Deleting all read notifications...');
      const response = await api.delete('/api/customer/notifications/read');
      console.log('🗑️ All read notifications deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting all read notifications:', error);
      throw error;
    }
  }
};

export default notificationService;
