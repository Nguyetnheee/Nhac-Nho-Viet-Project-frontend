import api from './api';

export const managerService = {
  // Lấy danh sách tất cả khách hàng (dành cho manager)
  getCustomers: async () => {
    try {
      console.log('Đang tải danh sách khách hàng...');
      const response = await api.get('/api/manager/customer');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả shipper (dành cho manager)
  getAllShippers: async () => {
    try {
      console.log('Đang tải danh sách người giao hàng...');
      const response = await api.get('/api/manager/shippers');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách người giao hàng:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả đơn hàng (dành cho manager)
  getAllOrders: async () => {
    try {
      console.log('Đang tải danh sách đơn hàng...');
      const response = await api.get('/api/manager/orders');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      throw error;
    }
  },

  // Xác nhận đơn hàng (manager)
  confirmOrder: async (orderId) => {
    try {
      console.log('Đang xác nhận đơn hàng:', orderId);
      const response = await api.put(`/api/manager/orders/${orderId}/confirm`);
      console.log('Xác nhận thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác nhận đơn hàng:', error);
      throw error;
    }
  },

  // Hủy đơn hàng (manager)
  cancelOrder: async (orderId) => {
    try {
      console.log('Đang hủy đơn hàng:', orderId);
      const response = await api.put(`/api/manager/orders/${orderId}/cancel`);
      console.log('Hủy đơn hàng thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      throw error;
    }
  },

  // Gán đơn hàng cho shipper (manager)
  assignOrderToShipper: async (orderId, shipperId) => {
    try {
      console.log('Đang gán đơn hàng cho shipper:', { orderId, shipperId });
      const response = await api.put(`/api/manager/orders/${orderId}/assign/${shipperId}`);
      console.log('Gán shipper thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gán shipper:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả staff (dành cho manager)
  getAllStaffs: async () => {
    try {
      console.log('Đang tải danh sách staff...');
      const response = await api.get('/api/manager/staff');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách staff:', error);
      throw error;
    }
  },

  // Tạo tài khoản staff mới (dành cho manager)
  createStaff: async (staffData) => {
    try {
      console.log('Đang tạo tài khoản staff mới...', staffData);
      const response = await api.post('/api/manager/staff', staffData);
      console.log('Tạo staff thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo staff:', error);
      throw error;
    }
  }
};

// Alias để tương thích với code cũ
export const staffService = managerService;

export default managerService;

