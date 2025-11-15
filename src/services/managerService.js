import api from './api';

export const managerService = {
  // Lấy danh sách tất cả khách hàng (dành cho MANAGER và ADMIN)
  getCustomers: async () => {
    try {
      // Kiểm tra role trước khi gọi API
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'ADMIN') {
        const error = new Error('Chỉ MANAGER và ADMIN mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang tải danh sách khách hàng...');
      const response = await api.get('/api/manager/customer');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và ADMIN mới có thể xem danh sách khách hàng.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Lấy danh sách tất cả shipper (dành cho MANAGER, ADMIN và STAFF)
  getAllShippers: async () => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER, ADMIN và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'ADMIN' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER, ADMIN và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang tải danh sách người giao hàng...');
      const response = await api.get('/api/manager/shippers');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách người giao hàng:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER, ADMIN và STAFF mới có thể xem danh sách shipper.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Lấy danh sách tất cả đơn hàng (dành cho MANAGER và STAFF)
  getAllOrders: async () => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang tải danh sách đơn hàng...');
      const response = await api.get('/api/manager/orders');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và STAFF mới có thể xem danh sách đơn hàng.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Xác nhận đơn hàng (dành cho MANAGER và STAFF)
  confirmOrder: async (orderId) => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang xác nhận đơn hàng:', orderId);
      const response = await api.put(`/api/manager/orders/${orderId}/confirm`);
      console.log('Xác nhận thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác nhận đơn hàng:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và STAFF mới có thể xác nhận đơn hàng.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Hủy đơn hàng (dành cho MANAGER và STAFF)
  cancelOrder: async (orderId) => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang hủy đơn hàng:', orderId);
      // Lưu ý: Backend dùng /cancle (sai chính tả) thay vì /cancel
      const response = await api.put(`/api/manager/orders/${orderId}/cancle`);
      console.log('Hủy đơn hàng thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và STAFF mới có thể hủy đơn hàng.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Gán đơn hàng cho shipper (dành cho MANAGER và STAFF)
  assignOrderToShipper: async (orderId, shipperId) => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang gán đơn hàng cho shipper:', { orderId, shipperId });
      const response = await api.put(`/api/manager/orders/${orderId}/assign/${shipperId}`);
      console.log('Gán shipper thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gán shipper:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và STAFF mới có thể gán đơn hàng cho shipper.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Lấy danh sách sản phẩm bán chạy (dành cho MANAGER và STAFF)
  getTopSellingOrders: async () => {
    try {
      // Kiểm tra role trước khi gọi API - cho phép MANAGER và STAFF
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'STAFF') {
        const error = new Error('Chỉ MANAGER và STAFF mới có quyền truy cập API này');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Đang tải danh sách sản phẩm bán chạy...');
      const response = await api.get('/api/manager/orders/top-selling');
      console.log('Đã tải thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm bán chạy:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền truy cập API này. Chỉ MANAGER và STAFF mới có thể xem danh sách sản phẩm bán chạy.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
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

