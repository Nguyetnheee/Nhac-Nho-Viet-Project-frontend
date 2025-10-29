import api from './api';

const shipperService = {
  // Tạo tài khoản shipper mới
  createShipper: async (shipperData) => {
    try {
      console.log('Creating shipper account:', shipperData);
      const response = await api.post('/api/staff/shippers', shipperData);
      console.log('Shipper created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating shipper:', error);
      throw error;
    }
  },

  // Lấy danh sách shippers (nếu backend có API)
  getAllShippers: async () => {
    try {
      console.log('Fetching all shippers...');
      const response = await api.get('/api/staff/shippers');
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
      const response = await api.put(`/api/staff/shippers/${shipperId}`, shipperData);
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
      const response = await api.delete(`/api/staff/shippers/${shipperId}`);
      console.log('Shipper deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting shipper:', error);
      throw error;
    }
  }
};

export default shipperService;