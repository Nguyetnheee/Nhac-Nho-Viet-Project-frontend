import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import { checkout } from '../services/api';
import paymentService from '../services/paymentService';
import { translateToVietnamese } from '../utils/errorMessages';

const Checkout = () => {
  const { 
    cartItems, 
    getTotalPrice, 
    clearCart,
    appliedVoucher,
    getFinalTotal,
    getDiscountAmount,
  } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'ONLINE', // Mặc định là thanh toán online trước
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkoutResponse, setCheckoutResponse] = useState(null); // ✅ Lưu response từ backend

  // Hiển thị thông báo khi redirect từ payment-result
  useEffect(() => {
    if (location.state?.message) {
      showWarning(location.state.message);
      // Clear state sau khi hiển thị
      window.history.replaceState({}, document.title);
    }
  }, [location, showWarning]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Cho phép số điện thoại Việt Nam: 10 chữ số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'customerName':
        if (!value.trim()) {
          error = 'Vui lòng nhập họ và tên';
        } else if (value.trim().length < 2) {
          error = 'Họ và tên phải có ít nhất 2 ký tự';
        }
        break;
        
      case 'customerEmail':
        if (!value.trim()) {
          error = 'Vui lòng nhập email';
        } else if (!validateEmail(value)) {
          error = 'Email không hợp lệ (ví dụ: example@gmail.com)';
        }
        break;
        
      case 'customerPhone':
        if (!value.trim()) {
          error = 'Vui lòng nhập số điện thoại';
        } else if (!validatePhone(value)) {
          error = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0';
        }
        break;
        
      case 'customerAddress':
        if (!value.trim()) {
          error = 'Vui lòng nhập địa chỉ giao hàng';
        } else if (value.trim().length < 10) {
          error = 'Địa chỉ phải có ít nhất 10 ký tự';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({ ...formData, [name]: value });
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.customerName = validateField('customerName', formData.customerName);
    newErrors.customerEmail = validateField('customerEmail', formData.customerEmail);
    newErrors.customerPhone = validateField('customerPhone', formData.customerPhone);
    newErrors.customerAddress = validateField('customerAddress', formData.customerAddress);
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submit
    if (!validateForm()) {
      showError('Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }
    
    setLoading(true);

    try {
      // ✅ Bước 1: Gọi API checkout để tạo đơn hàng
      const checkoutData = {
        fullName: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.customerAddress,
        paymentMethod: formData.paymentMethod,
        note: formData.notes,
        // ✅ GỬI VOUCHER CODE - Backend sẽ tự validate và tính discount
        voucherCode: appliedVoucher?.code || null,
      };

      console.log('📤 CHECKOUT REQUEST:', checkoutData);
      
      const checkoutResponse = await checkout(checkoutData);
      console.log('✅ CHECKOUT RESPONSE:', checkoutResponse);
      
      // ✅ CẬP NHẬT VOUCHER TỪ BACKEND RESPONSE
      // Backend đã tính toán chính xác, frontend phải dùng số liệu của backend
      if (checkoutResponse?.voucherCode && checkoutResponse?.discountAmount) {
        const backendVoucher = {
          code: checkoutResponse.voucherCode,
          originalAmount: checkoutResponse.subTotal,
          discountAmount: checkoutResponse.discountAmount,
          finalAmount: checkoutResponse.totalAmount,
          validated: true,
          fromBackend: true, // Đánh dấu đã được backend confirm
          message: `Backend confirmed: Giảm ${checkoutResponse.discountAmount.toLocaleString('vi-VN')} VNĐ`
        };
        
        console.log('🎫 BACKEND CALCULATED VOUCHER:', {
          code: backendVoucher.code,
          subTotal: checkoutResponse.subTotal,
          discountAmount: checkoutResponse.discountAmount,
          totalAmount: checkoutResponse.totalAmount
        });
        
        // Không cần update context vì đang redirect
        // Nhưng log để verify
      }
      
      // Kiểm tra response và lấy orderId
      const orderId = checkoutResponse?.orderId || checkoutResponse?.data?.orderId;
      
      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ server');
      }

      console.log('✅ ORDER CREATED:', {
        orderId: orderId,
        subTotal: checkoutResponse.subTotal,
        discountAmount: checkoutResponse.discountAmount,
        totalAmount: checkoutResponse.totalAmount,
        voucherCode: checkoutResponse.voucherCode
      });

      showSuccess(`Tạo đơn hàng thành công!`);
      
      // ✅ Bước 2: Gọi API tạo payment link với orderId
      // Backend sẽ tự động lấy totalAmount (đã trừ voucher) từ Order table
      console.log('  CREATING PAYMENT for Order:', orderId);
      
      const paymentResponse = await paymentService.createPayment(orderId);
      console.log('✅ PAYMENT RESPONSE:', paymentResponse);
      
      // ⚠️ VERIFY: Amount trong payment response phải = totalAmount
      if (paymentResponse?.amount !== undefined && checkoutResponse?.totalAmount !== undefined) {
        if (paymentResponse.amount === checkoutResponse.totalAmount) {
          console.log('✅ VERIFIED: Payment amount matches order totalAmount:', paymentResponse.amount);
        } else {
          console.error('⚠️ WARNING: Payment amount mismatch!', {
            paymentAmount: paymentResponse.amount,
            orderTotalAmount: checkoutResponse.totalAmount,
            difference: paymentResponse.amount - checkoutResponse.totalAmount
          });
        }
      }
      
      // Lấy URL thanh toán từ response
      const paymentUrl = paymentResponse?.paymentUrl || 
                        paymentResponse?.data?.paymentUrl || 
                        paymentResponse?.checkoutUrl ||
                        paymentResponse?.url;
      
      if (!paymentUrl) {
        throw new Error('Không nhận được link thanh toán từ PayOS');
      }

      console.log('🔗 REDIRECTING TO PAYMENT:', paymentUrl);
      console.log('💰 Expected amount in PayOS:', checkoutResponse.totalAmount, 'VNĐ');
      
      // ⚠️ KHÔNG xóa giỏ hàng ở đây! 
      // Giỏ hàng chỉ được xóa KHI THANH TOÁN THÀNH CÔNG (trong OrderSuccess.js)
      
      // Chuyển hướng đến trang thanh toán PayOS
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('❌ CHECKOUT ERROR:', error);
      
      // Tạo thông báo lỗi dễ hiểu cho người dùng
      let errorMessage = 'Không thể thanh toán. Vui lòng thử lại sau.';
      
      if (error.response?.status === 400) {
        errorMessage = translateToVietnamese(error.response?.data?.message || 'Thông tin thanh toán không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 401) {
        errorMessage = 'Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại.';
      } else if (error.response?.data?.message) {
        errorMessage = translateToVietnamese(error.response.data.message);
      } else if (error.message) {
        errorMessage = translateToVietnamese(error.message);
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-vietnam-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-8">Bạn cần có sản phẩm trong giỏ hàng để thanh toán</p>
          <button
            onClick={() => navigate('/trays')}
            className="btn-primary"
          >
            Xem mâm cúng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-vietnam-green mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <WarningOutlined className="text-xl text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800">Lưu ý quan trọng</h3>
              <p className="mt-1 text-sm text-red-700">
                <strong>Nếu bạn hủy thanh toán hoặc đóng trang thanh toán,</strong> bạn sẽ phải quay lại trang chủ và chọn lại sản phẩm từ đầu. 
                Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi tiếp tục.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-vietnam-green mb-6">Thông tin đơn hàng</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerEmail ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  required
                  placeholder="0123456789"
                  maxLength="10"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerPhone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  id="customerAddress"
                  name="customerAddress"
                  rows={3}
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  className={`input-field ${errors.customerAddress ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
                {errors.customerAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerAddress}</p>
                )}
              </div>

              {/* Phương thức thanh toán - Ẩn vì chỉ có 1 phương thức */}
              <div className="hidden">
                <input
                  type="hidden"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                />
              </div>

              {/* Thông báo phương thức thanh toán */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <InfoCircleOutlined className="text-xl text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Phương thức thanh toán
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Thanh toán online qua PayOS (Thanh toán trước)</p>
                      <p className="text-xs mt-1 text-blue-600">Bạn sẽ được chuyển đến trang thanh toán để hoàn tất đơn hàng</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ghi chú thêm cho đơn hàng (nếu có)..."
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-vietnam-green mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-vietnam-cream rounded-lg">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-vietnam-green">{item.name}</h3>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-vietnam-green">
                    {(item.price).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{getTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              
              {/* ✅ Hiển thị discount ngay */}
              {appliedVoucher && appliedVoucher.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="text-sm">🎫</span>
                    Giảm giá ({appliedVoucher.code}):
                  </span>
                  <span>-{appliedVoucher.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-vietnam-green">
                  <span>Tổng cộng:</span>
                  <span>
                    {getFinalTotal().toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                
                {/* ✅ Thông báo đã tiết kiệm */}
                {appliedVoucher && appliedVoucher.discountAmount > 0 && (
                  <div className="text-sm text-green-600 text-right mt-1">
                    ✓ Đã tiết kiệm {getDiscountAmount().toLocaleString('vi-VN')} VNĐ
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="text-vietnam-green hover:opacity-80 text-sm"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
