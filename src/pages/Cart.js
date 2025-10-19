import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, loading, error, removeFromCart, addToCart, checkout, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-vietnam-cream py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-gray-600">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="min-h-screen bg-vietnam-cream py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-600">Có lỗi xảy ra: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị giỏ hàng trống
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-vietnam-cream py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/trays" className="btn-primary">
              Xem mâm cúng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-vietnam-red mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">Kiểm tra và chỉnh sửa giỏ hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-vietnam-red">
                  Sản phẩm ({cart?.items?.length || 0})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-vietnam-red hover:opacity-80 text-sm"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-vietnam-red">{item.productName}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-lg font-bold text-vietnam-red">
                        {item.price ? item.price.toLocaleString('vi-VN') : '0'} VNĐ
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        disabled={loading}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.productId, 1)}
                        disabled={loading}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-vietnam-red">
                        {item.price ? (item.price * item.quantity).toLocaleString('vi-VN') : '0'} VNĐ
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            await removeFromCart(item.productId);
                          } catch (err) {
                            console.error('Error in Cart component:', err);
                          }
                        }}
                        disabled={loading}
                        className="text-vietnam-red hover:opacity-80 text-sm mt-1 disabled:opacity-50"
                      >
                        {loading ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold text-vietnam-red mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{cart.totalPrice ? cart.totalPrice.toLocaleString('vi-VN') : '0'} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-vietnam-red">
                    <span>Tổng cộng:</span>
                    <span>{cart.totalPrice ? cart.totalPrice.toLocaleString('vi-VN') : '0'} VNĐ</span>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <button 
                  onClick={checkout}
                  disabled={loading}
                  className="btn-primary w-full text-center block disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Vui lòng đăng nhập để thanh toán
                  </p>
                  <Link to="/login" className="btn-primary w-full text-center block">
                    Đăng nhập
                  </Link>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link to="/trays" className="text-vietnam-red hover:opacity-80 text-sm">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
