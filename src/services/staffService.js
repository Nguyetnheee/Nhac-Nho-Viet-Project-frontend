import api from './api';

export const staffService = {
  // Lấy danh sách tất cả khách hàng (dành cho staff)
  getCustomers: async () => {
    try {
      console.log('Đang tải danh sách khách hàng...');
      const response = await api.get('/api/staff/customer');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả shipper (dành cho staff)
  getAllShippers: async () => {
    try {
      console.log('Đang tải danh sách người giao hàng...');
      const response = await api.get('/api/staff/shippers');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách người giao hàng:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả đơn hàng (dành cho staff)
  getAllOrders: async () => {
    try {
      console.log('Đang tải danh sách đơn hàng...');
      const response = await api.get('/api/staff/orders');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      throw error;
    }
  },

  // Xác nhận đơn hàng (staff)
  confirmOrder: async (orderId) => {
    try {
      console.log('Đang xác nhận đơn hàng:', orderId);
      const response = await api.put(`/api/staff/orders/${orderId}/confirm`);
      console.log('Xác nhận thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác nhận đơn hàng:', error);
      throw error;
    }
  },

  // Hủy đơn hàng (staff)
  cancelOrder: async (orderId) => {
    try {
      console.log('Đang hủy đơn hàng:', orderId);
      const response = await api.put(`/api/staff/orders/${orderId}/cancel`);
      console.log('Hủy đơn hàng thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      throw error;
    }
  },

  // Gán đơn hàng cho shipper (staff)
  assignOrderToShipper: async (orderId, shipperId) => {
    try {
      console.log('Đang gán đơn hàng cho shipper:', { orderId, shipperId });
      const response = await api.put(`/api/staff/orders/${orderId}/assign/${shipperId}`);
      console.log('Gán shipper thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gán shipper:', error);
      throw error;
    }
  }
};

export default staffService;
