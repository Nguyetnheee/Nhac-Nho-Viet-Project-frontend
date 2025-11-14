import api from './api';

export const orderService = {
  // Lấy tất cả đơn hàng của user
  getUserOrders: () => api.get('/api/orders'),
  
  // Lấy danh sách đơn hàng của khách hàng đã đăng nhập
  getCustomerOrders: () => api.get('/api/customer/orders'),
  
  // Lấy chi tiết đơn hàng theo ID (dành cho customer)
  getOrderById: (id) => api.get(`/api/customer/orders/${id}`),
  
  // Tạo đơn hàng mới
  createOrder: (orderData) => api.post('/api/orders', orderData),
  
  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status?status=${status}`),
  
  // Hủy đơn hàng (customer)
  cancelOrder: (id) => api.put(`/api/customer/orders/${id}/cancle`),
  
  // Admin: Lấy tất cả đơn hàng
  getAllOrders: () => api.get('/api/orders/admin/all'),
  
  // Admin: Lấy đơn hàng theo trạng thái
  getOrdersByStatus: (status) => api.get(`/api/orders/admin/status/${status}`),
  
  // Manager: Lấy tất cả đơn hàng cho manager
  getManagerOrders: () => api.get('/api/manager/orders'),
  
  // Alias để tương thích với code cũ
  getStaffOrders: () => api.get('/api/manager/orders'),

  // Manager: Top 10 sản phẩm bán chạy
  getTopSellingProducts: () => api.get('/api/manager/orders/top-selling')
};

export default orderService;