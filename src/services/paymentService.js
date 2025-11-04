import api from './api';

export const paymentService = {
  /**
   * Tạo payment link từ PayOS
   * @param {string} orderId - ID của đơn hàng đã checkout thành công
   * @returns {Promise} Response chứa URL thanh toán từ PayOS
   */
  createPayment: async (orderId) => {
    try {
      console.log('💳 CREATING PAYMENT:', {
        orderId: orderId,
        url: `/api/payments/create/${orderId}`,
        note: 'Backend phải lấy totalAmount (đã giảm voucher) từ Order table'
      });
      
      const response = await api.post(`/api/payments/create/${orderId}`);
      
      console.log('✅ PAYMENT CREATED:', {
        status: response.status,
        data: response.data
      });
      
      // ⚠️ CRITICAL: Kiểm tra amount trong payment response
      if (response.data?.amount !== undefined) {
        console.log('💰 Payment amount:', response.data.amount, 'VNĐ');
        console.log('⚠️ Backend phải đảm bảo amount này = Order.totalAmount (đã trừ voucher)');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ CREATE PAYMENT ERROR:', {
        orderId: orderId,
        error: error.message,
        response: error.response?.data
      });
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
