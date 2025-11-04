import api from './api';

export const staffService = {
  // Lấy danh sách tất cả khách hàng (dành cho staff)
  getCustomers: () => api.get('/api/staff/customer')
};

export default staffService;
