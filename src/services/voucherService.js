// src/services/voucherService.js
import { api } from "./api";

/**
 * 📋 QUẢN LÝ VOUCHER - Lấy danh sách tất cả vouchers
 * GET /api/vouchers (Requires STAFF authentication)
 * @param {Object} params - Query parameters (code, discountType, isActive, startDate, endDate, page, size, sortBy, direction)
 * @returns {Promise} Response data từ backend
 */
export const getAllVouchers = async (params = {}) => {
  try {
    console.log('📤 [STAFF AUTH REQUIRED] Fetching all vouchers with params:', params);
    
    // Đảm bảo sử dụng api instance (có gửi token)
    const response = await api.get('/api/vouchers', { params });
    
    console.log('✅ Vouchers fetched successfully:', response.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tải danh sách vouchers. Vui lòng thử lại.";
    
    console.error('❌ Fetch vouchers error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * ➕ TẠO VOUCHER MỚI - Tạo voucher mới (Requires STAFF authentication)
 * POST /api/vouchers
 * @param {Object} voucherData - Dữ liệu voucher
 * @param {string} voucherData.code - Mã voucher
 * @param {string} voucherData.description - Mô tả
 * @param {string} voucherData.discountType - Loại giảm giá (PERCENTAGE hoặc FIXED_AMOUNT)
 * @param {number} voucherData.discountValue - Giá trị giảm
 * @param {number} voucherData.minOrderAmount - Đơn tối thiểu (0 = không giới hạn)
 * @param {number} voucherData.maxDiscountAmount - Giảm tối đa (0 = không giới hạn)
 * @param {number} voucherData.usageLimit - Số lần sử dụng (0 = không giới hạn)
 * @param {string} voucherData.startDate - Ngày bắt đầu (ISO string)
 * @param {string} voucherData.endDate - Ngày kết thúc (ISO string)
 * @param {boolean} voucherData.isActive - Trạng thái hoạt động
 * @returns {Promise} Response data từ backend
 */
export const createVoucher = async (voucherData) => {
  try {
    console.log('📤 [STAFF AUTH REQUIRED] Creating voucher:', voucherData);
    
    const response = await api.post('/api/vouchers', voucherData);
    
    console.log('✅ Voucher created successfully:', response.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tạo voucher. Vui lòng thử lại.";
    
    console.error('❌ Create voucher error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * ✅ BƯỚC 1: Validate mã giảm giá (chỉ kiểm tra)
 * @param {string} voucherCode - Mã voucher
 * @param {number} orderAmount - Tổng tiền đơn hàng
 * @returns {Promise} Response data từ backend
 * 
 * Backend endpoint: POST /api/vouchers/apply
 * Request body: { voucherCode: string, orderAmount: number }
 */
export const validateVoucher = async (voucherCode, orderAmount) => {
  try {
    console.log('📤 Validating voucher /api/vouchers/apply:', { voucherCode, orderAmount });
    
    const response = await api.post('/api/vouchers/apply', {
      voucherCode: voucherCode.toUpperCase(),
      orderAmount: orderAmount
    });
    
    console.log('✅ Voucher validation response:', response.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể áp dụng mã giảm giá. Vui lòng thử lại.";
    
    console.error('❌ Voucher validation error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * ✅ BƯỚC 2: Áp dụng voucher vào cart (cập nhật database)
 * @param {string} voucherCode - Mã voucher
 * @returns {Promise} Cart đã cập nhật với voucher
 * 
 * Backend endpoint: POST /api/cart/apply-voucher
 * Request body: { voucherCode: string }
 * 
 * Response format:
 * {
 *   cartId: number,
 *   cartStatus: string,
 *   customerId: number,
 *   customerName: string,
 *   items: [...],
 *   totalItems: number,
 *   subTotal: number,        // Tổng tiền gốc
 *   voucherCode: string,     // Mã voucher đã áp dụng
 *   discountAmount: number,  // Số tiền giảm
 *   finalAmount: number,     // Tổng tiền sau giảm ✅
 *   currency: string
 * }
 */
export const applyVoucherToCart = async (voucherCode) => {
  try {
    console.log('📤 Applying voucher to cart /api/cart/apply-voucher:', { voucherCode });
    
    // Theo spec: voucherCode là query param
    const response = await api.post('/api/cart/apply-voucher', null, {
      params: { voucherCode: voucherCode.toUpperCase() }
    });
    
    console.log('✅ Cart updated with voucher:', response.data);
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể áp dụng voucher vào giỏ hàng. Vui lòng thử lại.";
    
    console.error('❌ Apply voucher to cart error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

// Giữ lại alias cho backward compatibility
export const applyVoucher = validateVoucher;
