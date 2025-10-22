import api from './api';

export const trayService = {
  // Get all products
  getAllTrays: () => api.get('/api/products'),
  
  // Get product by ID
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
  
  // Get product details by product ID
  getTrayDetails: (productId) => api.get(`/api/product-details/by-product/${productId}`),
  
  // Create new product
  createTray: (tray) => api.post('/api/products', tray),
  
  // Update product
  updateTray: (id, tray) => api.put(`/api/products/${id}`, tray),
  
  // Delete product
  deleteTray: (id) => api.delete(`/api/products/${id}`),
  
  // Create product detail
  createTrayDetail: (detail) => api.post('/api/product-details', detail),
  
  // Update product detail
  updateTrayDetail: (id, detail) => api.put(`/api/product-details/${id}`, detail),
  
  // Delete product detail
  deleteTrayDetail: (id) => api.delete(`/api/product-details/${id}`)
};
