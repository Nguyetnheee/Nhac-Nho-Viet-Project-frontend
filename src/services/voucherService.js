// src/services/voucherService.js
import api from "./api";

/**
 * Áp dụng mã giảm giá cho đơn hàng
 * @param {string} voucherCode - Mã voucher
 * @param {number} orderAmount - Tổng tiền đơn hàng
 * @returns {Promise} Response data từ backend
 */
export const applyVoucher = async (voucherCode, orderAmount) => {
  try {
    const response = await api.post('/api/vouchers/apply', {
      voucherCode: voucherCode.toUpperCase(),
      orderAmount: orderAmount
    });
    return response.data;
  } catch (error) {
    // Xử lý lỗi từ backend
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể áp dụng mã giảm giá. Vui lòng thử lại.";
    
    throw new Error(errorMessage);
  }
};

/**
 * Lấy danh sách voucher hợp lệ
 * @returns {Promise} Danh sách voucher
 */
export const getValidVouchers = async () => {
  try {
    const response = await api.get('/api/vouchers/valid');
    return response.data;
  } catch (error) {
    console.error("Error fetching valid vouchers:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết voucher theo mã
 * @param {string} code - Mã voucher
 * @returns {Promise} Thông tin voucher
 */
export const getVoucherByCode = async (code) => {
  try {
    const response = await api.get(`/api/vouchers/code/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching voucher by code:", error);
    throw error;
  }
};

/**
 * Xác nhận sử dụng voucher
 * @param {string} code - Mã voucher
 * @returns {Promise} Response từ backend
 */
export const confirmVoucher = async (code) => {
  try {
    const response = await api.post(`/api/vouchers/confirm/${code}`);
    return response.data;
  } catch (error) {
    console.error("Error confirming voucher:", error);
    throw error;
  }
};
