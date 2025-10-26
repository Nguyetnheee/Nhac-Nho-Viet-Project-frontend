import apiAuth from './apiAuth';

export const checklistService = {
  getChecklists: async () => {
    const response = await apiAuth.get('/api/checklists');
    return response.data;
  },

  // createChecklist: async (checklist) => {
  //   const response = await apiAuth.post('/api/checklists', checklist);
  //   return response.data;
  // },

  // updateChecklist: async (id, checklist) => {
  //   const response = await apiAuth.put(`/api/checklists/${id}`, checklist);
  //   return response.data;
  // },

  // deleteChecklist: async (id) => {
  //   const response = await apiAuth.delete(`/api/checklists/${id}`);
  //   return response.data;
  // },

  // toggleChecklistItem: async (checklistId, itemId) => {
  //   const response = await apiAuth.put(`/api/checklists/${checklistId}/items/${itemId}/toggle`);
  //   return response.data;
  // }
};