import api from './api';

export const ritualService = {
  getAllRituals: () => api.get('/api/rituals'),
  
  getRitualById: (id) => api.get(`/api/rituals/${id}`),
  
  searchRituals: (name) => api.get(`/api/rituals/search?name=${name}`),
  
  getRitualsByLunarDate: (dateLunar) => api.get(`/api/rituals/lunar/${dateLunar}`),
  
  getRitualsBySolarDate: (dateSolar) => api.get(`/api/rituals/solar/${dateSolar}`),
  
  createRitual: (ritual) => api.post('/api/rituals', ritual),
  
  updateRitual: (id, ritual) => api.put(`/api/rituals/${id}`, ritual),
  
  deleteRitual: (id) => api.delete(`/api/rituals/${id}`)
};
