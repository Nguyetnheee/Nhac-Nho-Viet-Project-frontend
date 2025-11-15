import api from './api';

const feedbackService = {
  // Lấy danh sách feedbacks
  getAllFeedbacks: async () => {
    try {
      console.log('📋 Fetching all feedbacks...');
      const response = await api.get('/api/feedbacks');
      console.log('✅ Feedbacks response:', response.data);
      
      // API trả về pagination object với content array
      const data = response.data;
      
      // Nếu có content array (pagination), trả về content
      if (data?.content && Array.isArray(data.content)) {
        console.log(`✅ Found ${data.content.length} feedbacks in content array`);
        return data.content;
      }
      
      // Nếu là array trực tiếp, trả về luôn
      if (Array.isArray(data)) {
        console.log(`✅ Found ${data.length} feedbacks (direct array)`);
        return data;
      }
      
      // Fallback: trả về data như cũ
      console.log('⚠️ Unexpected response format, returning data as is');
      return data;
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      throw error;
    }
  },

  // Lấy feedback theo ID
  getFeedbackById: async (feedbackId) => {
    try {
      console.log(`📋 Fetching feedback ${feedbackId}...`);
      const response = await api.get(`/api/feedbacks/${feedbackId}`);
      console.log('✅ Feedback loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching feedback ${feedbackId}:`, error);
      throw error;
    }
  },

  // Tạo feedback mới
  createFeedback: async (feedbackData) => {
    try {
      console.log('📝 Creating feedback:', feedbackData);
      const response = await api.post('/api/feedbacks', feedbackData);
      console.log('✅ Feedback created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating feedback:', error);
      throw error;
    }
  },

  // Cập nhật feedback
  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      console.log(`✏️ Updating feedback ${feedbackId}:`, feedbackData);
      const response = await api.put(`/api/feedbacks/${feedbackId}`, feedbackData);
      console.log('✅ Feedback updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating feedback ${feedbackId}:`, error);
      throw error;
    }
  },

  // Xóa feedback
  deleteFeedback: async (feedbackId) => {
    try {
      console.log(`🗑️ Deleting feedback ${feedbackId}...`);
      const response = await api.delete(`/api/feedbacks/${feedbackId}`);
      console.log('✅ Feedback deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting feedback ${feedbackId}:`, error);
      throw error;
    }
  },
};

export default feedbackService;

