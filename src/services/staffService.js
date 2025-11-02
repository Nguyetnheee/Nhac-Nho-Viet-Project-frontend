import { api } from './api';

/**
 * Service để xử lý các API liên quan đến Staff
 */
const staffService = {
  /**
   * Lấy danh sách tất cả đơn hàng
   */
  getAllOrders: async () => {
    try {
      const response = await api.get('/api/staff/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Xác nhận đơn hàng
   * @param {string} orderId - ID của đơn hàng
   */
  confirmOrder: async (orderId) => {
    try {
      const response = await api.put(`/api/staff/orders/${orderId}/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  },

  /**
   * Gán đơn hàng cho shipper
   * @param {string} orderId - ID của đơn hàng
   * @param {string} shipperId - ID của shipper
   */
  assignOrderToShipper: async (orderId, shipperId) => {
    try {
      const response = await api.put(`/api/staff/orders/${orderId}/assign/${shipperId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning order to shipper:', error);
      throw error;
    }
  },

  /**
   * Hủy đơn hàng
   * @param {string} orderId - ID của đơn hàng
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/api/staff/orders/${orderId}/cancle`);
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả shipper
   */
  getAllShippers: async () => {
    try {
      const response = await api.get('/api/staff/shippers');
      return response.data;
    } catch (error) {
      console.error('Error fetching shippers:', error);
      throw error;
    }
  },
};

export default staffService;
