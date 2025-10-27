// src/services/trayService.js
import api from './api';

export const trayService = {
  // Get all products
  getAllTrays: () => api.get('/api/products'),
  
  // ⚠️ API CHI TIẾT SẢN PHẨM ĐÃ ĐƯỢC XÁC NHẬN
  getTrayById: (id) => api.get(`/api/products/${id}`),
  
  // Search products
  searchTrays: (searchQuery) => api.get('/api/products/search', { 
    params: { q: searchQuery } 
  }),
  
  // Filter products
  filterTrays: (params) => api.get('/api/products/filter', { 
    params: {
      regionId: params.regionId || '',
      categoryId: params.categoryId || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || ''
    }
  }),
  
  // Get regions
  getRegions: () => api.get('/api/regions'),
  
  // Get categories 
  getCategories: () => api.get('/api/categories'),
  
  // ... (Giữ nguyên các hàm khác)
  createTray: (tray) => api.post('/api/products', tray),
  updateTray: (id, tray) => api.put(`/api/products/${id}`, tray),
  deleteTray: (id) => api.delete(`/api/products/${id}`),
  createTrayDetail: (detail) => api.post('/api/product-details', detail),
  updateTrayDetail: (id, detail) => api.put(`/api/product-details/${id}`, detail),
  deleteTrayDetail: (id) => api.delete(`/api/product-details/${id}`)
};