import api from './api';

const regionService = {
  // Lấy danh sách regions
  getAllRegions: async () => {
    try {
      const response = await api.get('/api/regions');
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Tạo vùng miền mới
  createRegion: async (regionData) => {
    try {
      const response = await api.post('/api/regions', regionData);
      return response.data;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  },

  // Cập nhật vùng miền
  updateRegion: async (regionId, regionData) => {
    try {
      const response = await api.put(`/api/regions/${regionId}`, regionData);
      return response.data;
    } catch (error) {
      console.error('Error updating region:', error);
      throw error;
    }
  },

  // Xóa vùng miền
  deleteRegion: async (regionId) => {
    try {
      const response = await api.delete(`/api/regions/${regionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting region:', error);
      throw error;
    }
  }
};

export default regionService;