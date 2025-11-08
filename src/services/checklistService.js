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
      const response = await publicApi.get('/api/units/enums');
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
  },

  // Tạo checklist mới
  createChecklist: async (data) => {
    try {
      console.log('➕ Creating new checklist...', data);
      const response = await publicApi.post('/api/checklists', data);
      console.log('✅ Checklist created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating checklist:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Cập nhật checklist
  updateChecklist: async (checklistId, data) => {
    try {
      console.log(`✏️ Updating checklist ${checklistId}...`, data);
      const response = await publicApi.put(`/api/checklists/${checklistId}`, data);
      console.log('✅ Checklist updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating checklist ${checklistId}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Xóa checklist
  deleteChecklist: async (checklistId) => {
    try {
      console.log(`🗑️ Deleting checklist ${checklistId}...`);
      const response = await publicApi.delete(`/api/checklists/${checklistId}`);
      console.log('✅ Checklist deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting checklist ${checklistId}:`, error);
      throw error;
    }
  },

  // ========== USER CHECKLIST APIs ==========
  
  // Tạo user checklist mới
  createUserChecklist: async (data) => {
    try {
      console.log('➕ Creating new user checklist...', data);
      const response = await publicApi.post('/api/user-checklists', data);
      console.log('✅ User checklist created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating user checklist:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Lấy tất cả user checklists của user hiện tại
  getUserChecklists: async (params = {}) => {
    try {
      console.log('🔍 Fetching user checklists with params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.ritualId) queryParams.append('ritualId', params.ritualId);
      if (params.title) queryParams.append('title', params.title);
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.deleted !== undefined) queryParams.append('deleted', params.deleted);
      if (params.sort) {
        // sort có thể là array hoặc string
        if (Array.isArray(params.sort)) {
          params.sort.forEach(s => queryParams.append('sort', s));
        } else {
          queryParams.append('sort', params.sort);
        }
      }
      
      const queryString = queryParams.toString();
      const url = `/api/user-checklists${queryString ? `?${queryString}` : ''}`;
      
      const response = await publicApi.get(url);
      console.log('✅ User checklists loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user checklists:', error);
      throw error;
    }
  },

  // Cập nhật user checklist
  updateUserChecklist: async (userChecklistId, data) => {
    try {
      console.log(`✏️ Updating user checklist ${userChecklistId}...`, data);
      const response = await publicApi.put(`/api/user-checklists/${userChecklistId}`, data);
      console.log('✅ User checklist updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating user checklist ${userChecklistId}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        requestData: data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Xóa user checklist
  deleteUserChecklist: async (userChecklistId) => {
    try {
      console.log(`🗑️ Deleting user checklist ${userChecklistId}...`);
      const response = await publicApi.delete(`/api/user-checklists/${userChecklistId}`);
      console.log('✅ User checklist deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting user checklist ${userChecklistId}:`, error);
      throw error;
    }
  },

  // Lấy chi tiết user checklist theo ID
  getUserChecklistById: async (userChecklistId) => {
    try {
      console.log(`🔍 Fetching user checklist ${userChecklistId}...`);
      const response = await publicApi.get(`/api/user-checklists/${userChecklistId}`);
      console.log('✅ User checklist detail loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting user checklist ${userChecklistId}:`, error);
      throw error;
    }
  },

  // ========== USER CHECKLIST ITEMS APIs ==========

  // Lấy user checklist items
  getUserChecklistItems: async (userChecklistId) => {
    try {
      console.log(`🔍 Fetching user checklist items for ${userChecklistId}...`);
      const response = await publicApi.get(`/api/user-checklist-items?userChecklistId=${userChecklistId}`);
      console.log('✅ User checklist items loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting user checklist items:`, error);
      throw error;
    }
  },

  // Tạo user checklist item mới
  createUserChecklistItem: async (data) => {
    try {
      console.log('➕ Creating new user checklist item...', data);
      const response = await publicApi.post('/api/user-checklist-items', data);
      console.log('✅ User checklist item created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating user checklist item:', error);
      throw error;
    }
  },

  // Cập nhật user checklist item
  updateUserChecklistItem: async (userChecklistItemId, data) => {
    try {
      console.log(`✏️ Updating user checklist item ${userChecklistItemId}...`, data);
      const response = await publicApi.put(`/api/user-checklist-items/${userChecklistItemId}`, data);
      console.log('✅ User checklist item updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating user checklist item ${userChecklistItemId}:`, error);
      throw error;
    }
  },

  // Cập nhật user checklist item bằng itemId (endpoint mới)
  updateUserChecklistItemByItemId: async (itemId, data) => {
    try {
      console.log(`✏️ Updating user checklist item by itemId ${itemId}...`, data);
      const response = await publicApi.put(`/api/user-checklists/items/${itemId}`, data);
      console.log('✅ User checklist item updated by itemId:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating user checklist item by itemId ${itemId}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Xóa user checklist item
  deleteUserChecklistItem: async (userChecklistItemId) => {
    try {
      console.log(`🗑️ Deleting user checklist item ${userChecklistItemId}...`);
      const response = await publicApi.delete(`/api/user-checklist-items/${userChecklistItemId}`);
      console.log('✅ User checklist item deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting user checklist item ${userChecklistItemId}:`, error);
      throw error;
    }
  },

  // Khôi phục user checklist đã xóa
  restoreUserChecklist: async (userChecklistId) => {
    try {
      console.log(`♻️ Restoring user checklist ${userChecklistId}...`);
      const response = await publicApi.put(`/api/user-checklists/${userChecklistId}/restore`);
      console.log('✅ User checklist restored:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error restoring user checklist ${userChecklistId}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  }
};

// Export default để có thể import theo cả 2 cách
export default checklistService;