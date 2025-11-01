import api from './api';

export const paymentService = {
  /**
   * Tạo payment link từ PayOS
   * @param {string} orderId - ID của đơn hàng đã checkout thành công
   * @returns {Promise} Response chứa URL thanh toán từ PayOS
   */
  createPayment: async (orderId) => {
    try {
      const response = await api.post(`/api/payments/create/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Create payment error:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {string} orderId - ID của đơn hàng
   * @returns {Promise} Trạng thái thanh toán
   */
  checkPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/api/payments/status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Check payment status error:', error);
      throw error;
    }
  },

  /**
   * Hủy thanh toán (khi khách hàng thoát khỏi trang PayOS)
   * @param {string} orderId - ID của đơn hàng
   * @returns {Promise} Response
   */
  cancelPayment: async (orderId) => {
    try {
      const response = await api.post(`/api/payments/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel payment error:', error);
      throw error;
    }
  }
};

export default paymentService;
