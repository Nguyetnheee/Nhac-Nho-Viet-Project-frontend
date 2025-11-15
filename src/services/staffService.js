import { api } from './api';

const staffService = {
  // Lấy profile của staff
  getProfile: async () => {
    try {
      console.log('Fetching staff profile...');
      const response = await api.get('/api/staff/profile');
      console.log('Staff profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff profile:', error);
      throw error;
    }
  },

  // Cập nhật profile của staff
  updateProfile: async (profileData) => {
    try {
      console.log('Updating staff profile:', profileData);
      const response = await api.put('/api/staff/profile', profileData);
      console.log('Staff profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating staff profile:', error);
      throw error;
    }
  },
};

export default staffService;

