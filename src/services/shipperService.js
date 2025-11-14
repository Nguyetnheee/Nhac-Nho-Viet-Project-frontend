import { api } from './api';

const shipperService = {
  // Lấy profile của shipper
  getProfile: async () => {
    try {
      console.log('Fetching shipper profile...');
      const response = await api.get('/api/shipper/profile');
      console.log('Shipper profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shipper profile:', error);
      throw error;
    }
  },

  // Cập nhật profile của shipper
  updateProfile: async (profileData) => {
    try {
      console.log('Updating shipper profile:', profileData);
      const response = await api.put('/api/shipper/profile', profileData);
      console.log('Shipper profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating shipper profile:', error);
      throw error;
    }
  },

  // Tạo tài khoản shipper mới (chỉ dành cho MANAGER và ADMIN)
  createShipper: async (shipperData) => {
    try {
      // Kiểm tra role trước khi gọi API
      const role = localStorage.getItem('role')?.toUpperCase();
      if (role !== 'MANAGER' && role !== 'ADMIN') {
        const error = new Error('Chỉ MANAGER và ADMIN mới có quyền tạo shipper');
        error.response = { status: 403, data: { message: error.message } };
        throw error;
      }

      console.log('Creating shipper account:', shipperData);
      const response = await api.post('/api/manager/shippers', shipperData);
      console.log('Shipper created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating shipper:', error);
      
      // Xử lý lỗi 403 (Forbidden) - Không có quyền
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Bạn không có quyền tạo shipper. Chỉ MANAGER và ADMIN mới có thể thực hiện thao tác này.';
        console.error('🚫 403 Forbidden:', errorMessage);
      }
      
      throw error;
    }
  },

  // Lấy danh sách shippers (nếu backend có API)
  getAllShippers: async () => {
    try {
      console.log('Fetching all shippers...');
      const response = await api.get('/api/manager/shippers');
      console.log('Shippers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shippers:', error);
      throw error;
    }
  },

  // Cập nhật thông tin shipper (nếu backend có API)
  updateShipper: async (shipperId, shipperData) => {
    try {
      console.log('Updating shipper:', shipperId, shipperData);
      const response = await api.put(`/api/manager/shippers/${shipperId}`, shipperData);
      console.log('Shipper updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating shipper:', error);
      throw error;
    }
  },

  // Xóa shipper (nếu backend có API)
  deleteShipper: async (shipperId) => {
    try {
      console.log('Deleting shipper:', shipperId);
      const response = await api.delete(`/api/manager/shippers/${shipperId}`);
      console.log('Shipper deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting shipper:', error);
      throw error;
    }
  },

  // ========== ORDER MANAGEMENT APIs ==========
  
  /**
   * Lấy danh sách đơn hàng đang chờ (pending - đã được gán cho shipper)
   */
  getPendingOrders: async () => {
    try {
      console.log('Fetching pending orders for shipper...');
      
      // Debug: Check token and headers
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      console.log('Token exists:', !!token);
      console.log('Current role:', role);
      console.log('Token (first 20 chars):', token?.substring(0, 20));
      
      const response = await api.get('/api/shipper/orders/pending');
      console.log('Pending orders response:', response.data);
      
      // Backend trả về array trực tiếp, không cần response.data.data
      const orders = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return orders;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Throw error với message rõ ràng hơn
      if (error.response?.status === 403) {
        const backendMessage = error.response?.data?.message || error.response?.data?.error || 'Không có quyền truy cập';
        throw new Error(`403 Forbidden: ${backendMessage}`);
      }
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng đang giao (active - shipper đã xác nhận đi giao)
   */
  getActiveOrders: async () => {
    try {
      console.log('Fetching active orders for shipper...');
      const response = await api.get('/api/shipper/orders/active');
      console.log('Active orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active orders:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng đã hoàn thành
   */
  getCompletedOrders: async () => {
    try {
      console.log('Fetching completed orders for shipper...');
      const response = await api.get('/api/shipper/orders/completed');
      console.log('Completed orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      throw error;
    }
  },

  /**
   * Shipper xác nhận nhận đơn hàng (sẽ đi giao)
   * @param {number} orderId - ID của đơn hàng
   */
  acceptOrder: async (orderId) => {
    try {
      console.log('Accepting order:', orderId);
      
      // Debug: Check token and headers
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token (first 20 chars):', token?.substring(0, 20));
      
      const response = await api.put(`/api/shipper/orders/${orderId}/accept`);
      console.log('Order accepted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error accepting order:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  /**
   * Shipper xác nhận đã giao hàng thành công (kèm ảnh bằng chứng)
   * @param {number} orderId - ID của đơn hàng
   * @param {File} proofImageFile - Ảnh bằng chứng giao hàng (bắt buộc)
   */
  completeOrder: async (orderId, proofImageFile) => {
    try {
      console.log('Completing order with proof image:', { orderId, hasFile: !!proofImageFile });

      const formData = new FormData();
      if (proofImageFile) {
        formData.append('proofImage', proofImageFile);
      }

      // Debug: Check token and headers
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token (first 20 chars):', token?.substring(0, 20));

      const response = await api.put(
        `/api/shipper/orders/${orderId}/complete`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Order completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing order:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },
};

export default shipperService;