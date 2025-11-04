// File này chứa các thông báo lỗi chuẩn hóa cho người dùng non-tech
// Tất cả thông báo đều bằng tiếng Việt, dễ hiểu, không dùng thuật ngữ kỹ thuật

/**
 * Dịch thông báo tiếng Anh từ backend sang tiếng Việt
 * @param {string} message - Thông báo gốc (có thể bằng tiếng Anh hoặc tiếng Việt)
 * @returns {string} - Thông báo đã được dịch sang tiếng Việt
 */
export const translateToVietnamese = (message) => {
  if (!message || typeof message !== 'string') {
    return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  }

  // Mapping các thông báo tiếng Anh phổ biến sang tiếng Việt
  const translations = {
    // Voucher errors
    'Minimum order amount is': 'Giá trị đơn hàng tối thiểu là',
    'minimum order amount': 'giá trị đơn hàng tối thiểu',
    'Maximum discount amount is': 'Số tiền giảm tối đa là',
    'Voucher not found': 'Không tìm thấy mã giảm giá',
    'Voucher has expired': 'Mã giảm giá đã hết hạn',
    'Voucher is not active': 'Mã giảm giá chưa được kích hoạt',
    'Voucher usage limit reached': 'Mã giảm giá đã hết lượt sử dụng',
    'Invalid voucher code': 'Mã giảm giá không hợp lệ',
    'Voucher cannot be applied': 'Không thể áp dụng mã giảm giá',
    
    // Order errors
    'Order not found': 'Không tìm thấy đơn hàng',
    'Invalid order': 'Đơn hàng không hợp lệ',
    'Order amount': 'Giá trị đơn hàng',
    
    // Auth errors
    'Unauthorized': 'Bạn cần đăng nhập để tiếp tục',
    'Forbidden': 'Bạn không có quyền thực hiện thao tác này',
    'Not found': 'Không tìm thấy',
    'Bad request': 'Yêu cầu không hợp lệ',
    'Internal server error': 'Lỗi hệ thống',
    
    // Network errors
    'Network error': 'Lỗi kết nối mạng',
    'Timeout': 'Hết thời gian chờ',
    'Connection refused': 'Không thể kết nối',
    
    // Validation errors
    'Required field': 'Trường bắt buộc',
    'Invalid email': 'Email không hợp lệ',
    'Invalid phone': 'Số điện thoại không hợp lệ',
    'Invalid format': 'Định dạng không hợp lệ',
    'Too short': 'Quá ngắn',
    'Too long': 'Quá dài'
  };

  let translatedMessage = message;

  // Dịch từng cụm từ
  Object.keys(translations).forEach(englishPhrase => {
    const vietnamesePhrase = translations[englishPhrase];
    // Case-insensitive replace
    const regex = new RegExp(englishPhrase, 'gi');
    translatedMessage = translatedMessage.replace(regex, vietnamesePhrase);
  });

  // Loại bỏ các thuật ngữ kỹ thuật còn sót
  translatedMessage = translatedMessage
    .replace(/token/gi, 'đăng nhập')
    .replace(/session/gi, 'thời gian đăng nhập')
    .replace(/OTP/g, 'mã xác nhận')
    .replace(/error/gi, 'lỗi')
    .replace(/failed/gi, 'thất bại')
    .replace(/success/gi, 'thành công')
    .trim();

  return translatedMessage || message;
};

/**
 * Chuyển đổi lỗi HTTP status code thành thông báo dễ hiểu cho người dùng
 * @param {number} status - HTTP status code
 * @returns {string} - Thông báo lỗi dễ hiểu
 */
export const getStatusMessage = (status) => {
  const messages = {
    400: 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
    401: 'Bạn cần đăng nhập lại để tiếp tục.',
    403: 'Bạn không có quyền thực hiện thao tác này.',
    404: 'Không tìm thấy thông tin yêu cầu.',
    409: 'Thông tin đã tồn tại. Vui lòng kiểm tra lại.',
    422: 'Dữ liệu nhập vào không đúng định dạng.',
    429: 'Bạn đã thực hiện quá nhiều lần. Vui lòng đợi một chút.',
    500: 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.',
    502: 'Không thể kết nối đến hệ thống. Vui lòng thử lại sau.',
    503: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
    504: 'Hệ thống phản hồi chậm. Vui lòng thử lại.'
  };
  
  return messages[status] || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
};

/**
 * Chuyển đổi thông báo lỗi kỹ thuật thành thông báo dễ hiểu
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Thông báo mặc định
 * @returns {string} - Thông báo lỗi dễ hiểu
 */
export const getUserFriendlyError = (error, defaultMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.') => {
  // Nếu có backend message, dịch sang tiếng Việt
  const backendMessage = error?.response?.data?.message || 
                        error?.response?.data?.error ||
                        (typeof error?.response?.data === 'string' ? error.response.data : null);
  
  if (backendMessage && typeof backendMessage === 'string') {
    // Dịch thông báo sang tiếng Việt
    return translateToVietnamese(backendMessage);
  }
  
  // Nếu có status code, dùng thông báo tương ứng
  if (error?.response?.status) {
    return getStatusMessage(error.response.status);
  }
  
  // Xử lý các lỗi network
  if (error?.message) {
    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      return 'Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối mạng.';
    }
    if (error.message.includes('timeout')) {
      return 'Hệ thống phản hồi quá lâu. Vui lòng thử lại.';
    }
  }
  
  return defaultMessage;
};

/**
 * Thông báo lỗi cho từng tính năng cụ thể
 */
export const ERROR_MESSAGES = {
  // Đăng nhập / Đăng ký
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.',
  LOGIN_REQUIRED: 'Bạn cần đăng nhập để tiếp tục.',
  SESSION_EXPIRED: 'Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại.',
  REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
  
  // Profile
  PROFILE_UPDATE_FAILED: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
  PROFILE_LOAD_FAILED: 'Không thể tải thông tin cá nhân. Vui lòng thử lại.',
  
  // Giỏ hàng
  CART_LOAD_FAILED: 'Không thể tải giỏ hàng. Vui lòng thử lại.',
  ADD_TO_CART_FAILED: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
  REMOVE_FROM_CART_FAILED: 'Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.',
  UPDATE_CART_FAILED: 'Không thể cập nhật giỏ hàng. Vui lòng thử lại.',
  
  // Voucher
  VOUCHER_APPLY_FAILED: 'Không thể áp dụng mã giảm giá. Vui lòng kiểm tra lại mã.',
  VOUCHER_INVALID: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
  VOUCHER_REMOVE_FAILED: 'Không thể xóa mã giảm giá. Vui lòng thử lại.',
  
  // Đơn hàng
  ORDER_LOAD_FAILED: 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.',
  ORDER_CREATE_FAILED: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  ORDER_CANCEL_FAILED: 'Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.',
  
  // Sản phẩm
  PRODUCT_LOAD_FAILED: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.',
  PRODUCT_SEARCH_FAILED: 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
  
  // OTP
  OTP_INVALID: 'Mã xác nhận không đúng hoặc đã hết hạn. Vui lòng thử lại.',
  OTP_SEND_FAILED: 'Không thể gửi mã xác nhận. Vui lòng thử lại sau.',
  
  // General
  NETWORK_ERROR: 'Không thể kết nối đến hệ thống. Vui lòng kiểm tra kết nối mạng.',
  TIMEOUT_ERROR: 'Hệ thống phản hồi quá lâu. Vui lòng thử lại.',
  SERVER_ERROR: 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.',
  UNKNOWN_ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
};

/**
 * Thông báo thành công cho từng tính năng
 */
export const SUCCESS_MESSAGES = {
  // Profile
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  
  // Giỏ hàng
  ADDED_TO_CART: 'Đã thêm vào giỏ hàng',
  REMOVED_FROM_CART: 'Đã xóa khỏi giỏ hàng',
  CART_UPDATED: 'Đã cập nhật giỏ hàng',
  
  // Voucher
  VOUCHER_APPLIED: 'Áp dụng mã giảm giá thành công!',
  VOUCHER_REMOVED: 'Đã xóa mã giảm giá',
  
  // Đơn hàng
  ORDER_CREATED: 'Đặt hàng thành công!',
  ORDER_CANCELLED: 'Đã hủy đơn hàng',
  
  // OTP
  OTP_VERIFIED: 'Xác nhận thành công!',
  OTP_SENT: 'Đã gửi mã xác nhận đến email/số điện thoại của bạn'
};
