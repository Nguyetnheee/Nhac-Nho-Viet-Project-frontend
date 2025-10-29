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
  }
};

export default regionService;