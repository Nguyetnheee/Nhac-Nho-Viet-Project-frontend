import api from './api';

export const orderService = {
  // Lấy tất cả đơn hàng của user
  getUserOrders: () => api.get('/api/orders'),
  
  // Lấy danh sách đơn hàng của khách hàng đã đăng nhập
  getCustomerOrders: async () => {
    try {
      // Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      console.log('📦 Fetching customer orders from /api/customer/orders...');
      console.log('📦 Cache-busting timestamp:', timestamp);
      
      const response = await api.get(`/api/customer/orders?_t=${timestamp}`);
      console.log('📦 Customer orders response:', response.data);
      console.log('📦 Total orders:', response.data?.length || 0);
      
      // Debug: Kiểm tra status của từng đơn chi tiết
      if (Array.isArray(response.data)) {
        const statusCount = response.data.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Orders by status:', statusCount);
        
        // In chi tiết từng đơn
        console.log('📋 Detailed order list:');
        response.data.forEach(order => {
          console.log(`  - Order #${order.orderId}: ${order.status} | Date: ${order.orderDate}`);
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching customer orders:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },
  
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
  getOrdersByStatus: (status) => api.get(`/api/orders/admin/status/${status}`)
};

export default orderService;