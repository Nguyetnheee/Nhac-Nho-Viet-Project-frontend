import api from './api';

export const orderService = {
  getUserOrders: () => api.get('/api/orders'),
  
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  
  createOrder: (orderData) => api.post('/api/orders', orderData),
  
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status?status=${status}`),
  
  getAllOrders: () => api.get('/api/orders/admin/all'),
  
  getOrdersByStatus: (status) => api.get(`/api/orders/admin/status/${status}`)
};
