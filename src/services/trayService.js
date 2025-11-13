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
  
  // Filter products - Chỉ gửi các tham số có giá trị
  filterTrays: (params) => {
    const queryParams = {};
    
    // Chỉ thêm các tham số nếu chúng có giá trị thực sự
    if (params.regionId) queryParams.regionId = params.regionId;
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.ritualId) queryParams.ritualId = params.ritualId;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    
    return api.get('/api/products/filter', { params: queryParams });
  },
  
  // Get trays by ritual ID
  getTraysByRitual: (ritualId) => api.get(`/api/products/ritual/${ritualId}`),
  
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