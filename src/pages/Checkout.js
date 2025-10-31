import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import { checkout } from '../services/api';
import paymentService from '../services/paymentService';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerAddress: user?.address || '',
    paymentMethod: 'ONLINE', // Mặc định là thanh toán online trước
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Hiển thị thông báo khi redirect từ payment-result
  useEffect(() => {
    if (location.state?.message) {
      showWarning(location.state.message);
      // Clear state sau khi hiển thị
      window.history.replaceState({}, document.title);
    }
  }, [location, showWarning]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Bước 1: Gọi API checkout để tạo đơn hàng
      const checkoutData = {
        fullName: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.customerAddress,
        paymentMethod: formData.paymentMethod,
        note: formData.notes,
      };

      console.log('📤 Sending checkout data:', checkoutData);
      
      const checkoutResponse = await checkout(checkoutData);
      console.log('✅ Checkout response:', checkoutResponse);
      
      // Kiểm tra response và lấy orderId
      const orderId = checkoutResponse?.orderId || checkoutResponse?.data?.orderId;
      
      if (!orderId) {
        throw new Error('Không nhận được mã đơn hàng từ server');
      }

      showSuccess(`✅ Checkout thành công! Mã đơn hàng: ${orderId}`);
      
      // Bước 2: Gọi API tạo payment link với orderId
      console.log('📤 Creating payment for orderId:', orderId);
      
      const paymentResponse = await paymentService.createPayment(orderId);
      console.log('✅ Payment response:', paymentResponse);
      
      // Lấy URL thanh toán từ response
      const paymentUrl = paymentResponse?.paymentUrl || 
                        paymentResponse?.data?.paymentUrl || 
                        paymentResponse?.checkoutUrl ||
                        paymentResponse?.url;
      
      if (!paymentUrl) {
        throw new Error('Không nhận được link thanh toán từ PayOS');
      }

      console.log('🔗 Redirecting to payment URL:', paymentUrl);
      
      // ⚠️ KHÔNG xóa giỏ hàng ở đây! 
      // Giỏ hàng chỉ được xóa KHI THANH TOÁN THÀNH CÔNG (trong OrderSuccess.js)
      // Lý do: Nếu user hủy thanh toán, họ cần giỏ hàng để quay lại sửa đổi
      
      // Chuyển hướng đến trang thanh toán PayOS
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.';
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
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="input-field"
                />
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
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="input-field"
                />
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
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="input-field"
                />
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
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="input-field"
                />
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
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
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
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  placeholder="Ghi chú thêm cho đơn hàng..."
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
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{getTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng:</span>
                <span className="text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-vietnam-green">
                  <span>Tổng cộng:</span>
                  <span>{getTotalPrice().toLocaleString('vi-VN')} VNĐ</span>
                </div>
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
