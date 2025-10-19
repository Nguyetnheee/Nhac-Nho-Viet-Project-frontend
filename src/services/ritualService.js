import api from './api';

export const ritualService = {
  getAllRituals: () => api.get('/api/region'),
  
  // getRitualById: (id) => api.get(`/api/ritual/${id}`),
  
  searchRituals: (name) => api.get(`/api/region?search=${name}`),
  
  // getRitualsByLunarDate: (dateLunar) => api.get(`/api/rituals/lunar/${dateLunar}`),
  
  // getRitualsBySolarDate: (dateSolar) => api.get(`/api/rituals/solar/${dateSolar}`),
  
  // createRitual: (ritual) => api.post('/api/rituals', ritual),
  
  // updateRitual: (id, ritual) => api.put(`/api/rituals/${id}`, ritual),
  
  // deleteRitual: (id) => api.delete(`/api/rituals/${id}`)
};
