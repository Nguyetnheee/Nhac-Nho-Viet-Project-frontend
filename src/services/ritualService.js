import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Tạo axios instance với interceptor để tự động thêm token
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Interceptor để tự động thêm Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // hoặc sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const ritualService = {
  // Lấy danh sách tất cả lễ hội
  getAllRituals: async () => {
    try {
      const response = await axiosInstance.get('/api/rituals');
      return response.data;
    } catch (error) {
      console.error('Error fetching rituals:', error);
      throw error;
    }
  },

  // Lấy chi tiết một lễ hội
  getRitualById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/rituals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ritual details:', error);
      throw error;
    }
  },

  // Thêm lễ hội mới (cho staff)
  createRitual: async (ritualData) => {
    try {
      // Format dữ liệu theo đúng cấu trúc backend yêu cầu
      const formattedData = {
        ritualName: ritualData.ritualName,
        dateLunar: ritualData.dateLunar || null,
        regionId: ritualData.regionId,
        dateSolar: ritualData.dateSolar || null,
        description: ritualData.description || null,
        meaning: ritualData.meaning || null,
        imageUrl: ritualData.imageUrl || null
      };

      const response = await axiosInstance.post('/api/rituals', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating ritual:', error);
      throw error;
    }
  },

  // Cập nhật lễ hội (cho staff)
  updateRitual: async (id, ritualData) => {
    try {
      const formattedData = {
        ritualName: ritualData.ritualName,
        dateLunar: ritualData.dateLunar || null,
        regionId: ritualData.regionId,
        dateSolar: ritualData.dateSolar || null,
        description: ritualData.description || null,
        meaning: ritualData.meaning || null,
        imageUrl: ritualData.imageUrl || null
      };

      const response = await axiosInstance.put(`/api/rituals/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating ritual:', error);
      throw error;
    }
  },

  // Xóa lễ hội (cho staff)
  deleteRitual: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/rituals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting ritual:', error);
      throw error;
    }
  },

  // Tìm kiếm lễ hội theo từ khóa
  searchRituals: async (searchQuery) => {
    try {
      const response = await axiosInstance.get('/api/rituals/search', {
        params: { q: searchQuery }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching rituals:', error);
      throw error;
    }
  },

  // Lọc lễ hội theo vùng miền
  filterRitualsByRegions: async (regionNames = [], page = 0, size = 100) => {
    try {
      const response = await axiosInstance.get('/api/rituals/filter', {
        params: {
          regions: regionNames.join(','),
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error filtering rituals by regions:', error);
      throw error;
    }
  },
};