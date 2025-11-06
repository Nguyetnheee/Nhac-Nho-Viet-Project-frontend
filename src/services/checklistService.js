import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://isp-7jpp.onrender.com";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Gắn token
publicApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Export named export để consistent với cách import
export const checklistService = {
  // Lấy tất cả checklists
  getAllChecklists: async () => {
    try {
      const response = await publicApi.get('/api/checklists');
      console.log("Get all checklists:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting all checklists:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Alias cho getAllChecklists (để tương thích với code cũ)
  getChecklists: async () => {
    try {
      console.log('🔍 Fetching all checklists...');
      const response = await publicApi.get('/api/checklists');
      console.log('✅ All checklists loaded:', response.data);
      console.log('📊 Total items:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting checklists:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      throw error;
    }
  },

  // Lấy tất cả checklist items (sản phẩm trong kho)
  getChecklistItems: async () => {
    try {
      console.log('🔍 Fetching all checklist items...');
      const response = await publicApi.get('/api/checklist-items');
      console.log('✅ Checklist items loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting checklist items:', error);
      throw error;
    }
  },

  // Lấy chi tiết một checklist item
  getChecklistItemById: async (itemId) => {
    try {
      console.log(`🔍 Fetching checklist item ${itemId}...`);
      const response = await publicApi.get(`/api/checklist-items/${itemId}`);
      console.log('✅ Checklist item loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting checklist item ${itemId}:`, error);
      throw error;
    }
  },

  // Xóa một checklist item
  deleteChecklistItem: async (itemId) => {
    try {
      console.log(`🗑️ Deleting checklist item ${itemId}...`);
      const response = await publicApi.delete(`/api/checklist-items/${itemId}`);
      console.log('✅ Checklist item deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting checklist item ${itemId}:`, error);
      throw error;
    }
  },

  // Cập nhật checklist item
  updateChecklistItem: async (itemId, data) => {
    try {
      console.log(`✏️ Updating checklist item ${itemId}...`, data);
      const response = await publicApi.put(`/api/checklist-items/${itemId}`, data);
      console.log('✅ Checklist item updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating checklist item ${itemId}:`, error);
      throw error;
    }
  },

  // Tạo checklist item mới
  createChecklistItem: async (data) => {
    try {
      console.log('➕ Creating new checklist item...', data);
      const response = await publicApi.post('/api/checklist-items', data);
      console.log('✅ Checklist item created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating checklist item:', error);
      throw error;
    }
  },

  // Lấy danh sách units
  getUnits: async () => {
    try {
      console.log('Fetching all units...');
      const response = await publicApi.get('/api/units');
      console.log('Units loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting units:', error);
      throw error;
    }
  },

  // Lấy checklist theo ritualId
  getChecklistByRitual: async (ritualId) => {
    try {
      const response = await publicApi.get(`/api/checklists/ritual/${ritualId}`);
      console.log(`Checklist for ritual ${ritualId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting checklist for ritual ${ritualId}:`, error);
      throw error;
    }
  },

  // Alias cho getChecklistByRitual (để tương thích với code cũ)
  getByRitual: async (ritualId) => {
    try {
      const response = await publicApi.get(`/api/checklists/ritual/${ritualId}`);
      console.log(`Checklist for ritual ${ritualId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting checklist for ritual ${ritualId}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Lọc checklist với các filter (CUSTOMER auth required)
  filterChecklists: async (filters = {}) => {
    try {
      console.log('🔍 Filtering checklists with params:', filters);
      
      // Chuẩn bị query params
      const params = new URLSearchParams();
      if (filters.ritualName) params.append('ritualName', filters.ritualName);
      if (filters.itemName) params.append('itemName', filters.itemName);
      if (filters.unit) params.append('unit', filters.unit);
      if (filters.page !== undefined) params.append('page', filters.page);
      if (filters.size !== undefined) params.append('size', filters.size);
      if (filters.sort) params.append('sort', filters.sort);
      
      const queryString = params.toString();
      const url = `/api/checklists/filter${queryString ? `?${queryString}` : ''}`;
      
      const response = await publicApi.get(url);
      console.log('Filtered checklists:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error filtering checklists:', error);
      throw error;
    }
  },

  // Lấy checklists đã group theo ritual name
  getGroupedChecklists: async () => {
    try {
      console.log('🔍 Fetching grouped checklists...');
      const response = await publicApi.get('/api/checklists/grouped');
      console.log('Grouped checklists:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting grouped checklists:', error);
      throw error;
    }
  }
};

// Export default để có thể import theo cả 2 cách
export default checklistService;