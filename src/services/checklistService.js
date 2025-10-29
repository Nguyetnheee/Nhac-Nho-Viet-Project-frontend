import axios from "axios";

const API_BASE_URL = "https://isp-7jpp.onrender.com";

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
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

  // Tạo checklist item mới
  createChecklistItem: async (data) => {
    try {
      const response = await publicApi.post('/api/checklists', data);
      console.log("Created checklist item:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating checklist item:', error);
      throw error;
    }
  },

  // Cập nhật checklist item
  updateChecklistItem: async (id, data) => {
    try {
      const response = await publicApi.put(`/api/checklists/${id}`, data);
      console.log(`Updated checklist item ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating checklist item ${id}:`, error);
      throw error;
    }
  },

  // Xóa checklist item
  deleteChecklistItem: async (id) => {
    try {
      const response = await publicApi.delete(`/api/checklists/${id}`);
      console.log(`Deleted checklist item ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting checklist item ${id}:`, error);
      throw error;
    }
  }
};

// Export default để có thể import theo cả 2 cách
export default checklistService;