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
 * 👁️ XEM CHI TIẾT VOUCHER - Lấy thông tin chi tiết voucher theo ID (Requires STAFF authentication)
 * GET /api/vouchers/{id}
 * @param {number} voucherId - ID của voucher
 * @returns {Promise} Response data từ backend
 */
export const getVoucherById = async (voucherId) => {
  try {
    console.log('📤 [STAFF AUTH REQUIRED] Fetching voucher by ID:', voucherId);
    
    const response = await api.get(`/api/vouchers/${voucherId}`);
    
    console.log('✅ Raw API response:', response.data);
    
    // Xử lý response có thể có nhiều format:
    // Format 1: { data: {...}, success: true }
    // Format 2: {...} (direct data)
    let voucherData = response.data;
    
    if (response.data && response.data.data && typeof response.data.data === 'object') {
      // Response được wrap trong { data: {...}, success: true }
      voucherData = response.data.data;
      console.log('✅ Extracted voucher data from wrapped response:', voucherData);
    } else if (response.data && response.data.success !== undefined) {
      // Có thể response.data là { data: {...}, success: true }
      voucherData = response.data.data || response.data;
    }
    
    console.log('✅ Final voucher data:', voucherData);
    
    return voucherData;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tải thông tin voucher. Vui lòng thử lại.";
    
    console.error('❌ Fetch voucher by ID error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * 🗑️ XÓA VOUCHER - Xóa voucher (Requires STAFF authentication)
 * DELETE /api/vouchers/{id}
 * @param {number} voucherId - ID của voucher cần xóa
 * @returns {Promise} Response data từ backend
 */
export const deleteVoucher = async (voucherId) => {
  try {
    console.log('📤 [STAFF AUTH REQUIRED] Deleting voucher:', voucherId);
    
    const response = await api.delete(`/api/vouchers/${voucherId}`);
    
    console.log('✅ Voucher deleted successfully:', response.data);
    
    // Xử lý response có thể có nhiều format
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể xóa voucher. Vui lòng thử lại.";
    
    console.error('❌ Delete voucher error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(errorMessage);
  }
};

/**
 * ✏️ CẬP NHẬT VOUCHER - Cập nhật thông tin voucher (Requires STAFF authentication)
 * PUT /api/vouchers/{id}
 * @param {number} voucherId - ID của voucher cần cập nhật
 * @param {Object} voucherData - Dữ liệu voucher cần cập nhật
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
export const updateVoucher = async (voucherId, voucherData) => {
  try {
    console.log('📤 [STAFF AUTH REQUIRED] Updating voucher:', voucherId, voucherData);
    
    const response = await api.put(`/api/vouchers/${voucherId}`, voucherData);
    
    console.log('✅ Voucher updated successfully:', response.data);
    
    // Xử lý response có thể có nhiều format
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể cập nhật voucher. Vui lòng thử lại.";
    
    console.error('❌ Update voucher error:', {
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

/**
 * 📋 LẤY DANH SÁCH VOUCHER CÒN SỬ DỤNG ĐƯỢC (PUBLIC - CHO CUSTOMER)
 * GET /api/vouchers
 * Chỉ lấy mã giảm và description của voucher còn sử dụng được
 * @returns {Promise} Array of vouchers với { code, description }
 */
export const getAvailableVouchers = async () => {
  try {
    console.log('📤 Fetching available vouchers for customer...');
    
    // Gọi API GET /api/vouchers - có thể cần filter isActive=true
    const response = await api.get('/api/vouchers', {
      params: {
        isActive: true,
        // Có thể thêm filter khác nếu cần
      }
    });
    
    console.log('✅ Available vouchers response:', response.data);
    
    // Xử lý response - có thể là array hoặc object với content
    let vouchers = [];
    if (Array.isArray(response.data)) {
      vouchers = response.data;
    } else if (response.data?.content) {
      vouchers = response.data.content || [];
    } else if (response.data?.data) {
      vouchers = Array.isArray(response.data.data) ? response.data.data : [];
    }
    
    // Lọc chỉ lấy voucher còn sử dụng được (có thể check thêm điều kiện)
    const now = new Date();
    const availableVouchers = vouchers
      .filter(v => {
        // Chỉ lấy voucher active
        if (v.isActive === false) return false;
        
        // Check ngày hết hạn
        if (v.endDate) {
          const endDate = new Date(v.endDate);
          if (endDate < now) return false;
        }
        
        // Check ngày bắt đầu
        if (v.startDate) {
          const startDate = new Date(v.startDate);
          if (startDate > now) return false;
        }
        
        return true;
      })
      .map(v => ({
        code: v.code || v.voucherCode,
        description: v.description || '',
        discountType: v.discountType || v.type,
        discountValue: v.discountValue || v.value,
        minOrderAmount: v.minOrderAmount || v.minimumOrderAmount || 0,
        maxDiscountAmount: v.maxDiscountAmount || v.maxDiscount || 0,
        // Giữ thêm thông tin để validate sau
        _fullData: v
      }));
    
    console.log('✅ Filtered available vouchers:', availableVouchers);
    
    return availableVouchers;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tải danh sách mã giảm giá. Vui lòng thử lại.";
    
    console.error('❌ Get available vouchers error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Trả về array rỗng thay vì throw error để không làm crash UI
    return [];
  }
};
