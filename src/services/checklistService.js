import api from './api';

export const checklistService = {
  getChecklists: async () => {
    const response = await api.get('/api/checklists');
    return response.data;
  },

  createChecklist: async (checklist) => {
    const response = await api.post('/api/checklists', checklist);
    return response.data;
  },

  updateChecklist: async (id, checklist) => {
    const response = await api.put(`/api/checklists/${id}`, checklist);
    return response.data;
  },

  deleteChecklist: async (id) => {
    const response = await api.delete(`/api/checklists/${id}`);
    return response.data;
  },

  toggleChecklistItem: async (checklistId, itemId) => {
    const response = await api.put(`/api/checklists/${checklistId}/items/${itemId}/toggle`);
    return response.data;
  }
};