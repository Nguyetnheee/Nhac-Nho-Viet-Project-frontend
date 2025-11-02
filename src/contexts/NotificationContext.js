import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch số lượng thông báo chưa đọc
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      // Chỉ fetch cho customer
      if (!token || role !== 'ROLE_CUSTOMER') {
        setUnreadCount(0);
        return;
      }

      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count || response || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Không hiển thị lỗi cho user, chỉ reset về 0
      setUnreadCount(0);
    }
  }, []);

  // Fetch danh sách thông báo
  const fetchNotifications = useCallback(async (page = 0, size = 5) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page, size);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đánh dấu đã đọc
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Giảm unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }, []);

  // Xóa thông báo
  const deleteNotification = useCallback(async (notificationId, isRead) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Nếu thông báo chưa đọc, giảm count
      if (!isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, []);

  // Auto refresh unread count mỗi 30 giây
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role === 'ROLE_CUSTOMER') {
      // Fetch ngay lần đầu
      fetchUnreadCount();

      // Auto refresh mỗi 30 giây
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount]);

  const value = {
    unreadCount,
    notifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
