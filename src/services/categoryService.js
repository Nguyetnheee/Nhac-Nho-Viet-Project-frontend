import api from './api';

const categoryService = {
  // Lấy danh sách categories
  getAllCategories: async () => {
    try {
      const response = await api.get('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Tạo category mới
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Cập nhật category
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/api/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Xóa category
  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default categoryService;
