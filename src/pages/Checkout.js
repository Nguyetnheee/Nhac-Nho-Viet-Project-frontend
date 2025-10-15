import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import { orderService } from '../services/orderService';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerAddress: user?.address || '',
    paymentMethod: 'COD',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        trayIds: cartItems.map(item => item.id),
        totalPrice: getTotalPrice(),
        ...formData
      };

      await orderService.createOrder(orderData);
      clearCart();
      showSuccess('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      showError('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
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
          <h1 className="text-3xl font-serif font-bold text-vietnam-red mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-vietnam-red mb-6">Thông tin đơn hàng</h2>
            
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="E_WALLET">Ví điện tử</option>
                </select>
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
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ghi chú thêm cho đơn hàng..."
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-vietnam-red mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-vietnam-cream rounded-lg">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=60'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-vietnam-red">{item.name}</h3>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-vietnam-red">
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
                <div className="flex justify-between text-lg font-bold text-vietnam-red">
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
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="text-vietnam-red hover:opacity-80 text-sm"
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
