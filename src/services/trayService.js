import api from './api';

export const trayService = {
  getAllTrays: () => api.get('/api/trays'),
  
  getTrayById: (id) => api.get(`/api/trays/${id}`),
  
  getTraysByRitualId: (ritualId) => api.get(`/api/trays/ritual/${ritualId}`),
  
  getTraysByRegion: (region) => api.get(`/api/trays/region/${region}`),
  
  getTraysByCategory: (category) => api.get(`/api/trays/category/${category}`),
  
  getTraysByPriceRange: (minPrice, maxPrice) => 
    api.get(`/api/trays/price?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  
  createTray: (tray) => api.post('/api/trays', tray),
  
  updateTray: (id, tray) => api.put(`/api/trays/${id}`, tray),
  
  deleteTray: (id) => api.delete(`/api/trays/${id}`)
};
