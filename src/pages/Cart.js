// src/pages/Cart.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { decreaseCartItem, increaseCartItem } from "../services/apiAuth";
import api from "../services/api";
import { useToast } from "../components/ToastContainer";

// Làm sạch baseURL tương tự api.js
const resolveApiBase = () => {
  let rawBase = (process.env.REACT_APP_API_URL || "").trim();
  if (rawBase.includes("swagger-ui")) {
    try {
      const url = new URL(rawBase);
      rawBase = `${url.origin}`;
    } catch {
      rawBase = rawBase.split("/swagger-ui")[0];
    }
  }
  return rawBase.replace(/\/+$/, "");
};

const API_BASE = resolveApiBase();

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    getTotalPrice,
    totals,
    fetchCart,
    loading
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // State cho mã giảm giá
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const currency = totals?.currency || "VNĐ";

  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString("vi-VN") + " " + currency;

  const buildImageSrc = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100";
    if (/^https?:\/\//i.test(img) || /^data:/i.test(img)) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return img;
  };

  // Hàm xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      // Gọi API áp dụng voucher
      const response = await api.post('/api/vouchers/apply', {
        voucherCode: couponCode.toUpperCase(),
        orderAmount: getTotalPrice()
      });

      console.log("🔍 API Response:", response);

      // Xử lý response từ backend
      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data;
        
        console.log("📦 API Data:", apiData);
        console.log("📦 voucherCode:", apiData.voucherCode);
        console.log("📦 discountAmount:", apiData.discountAmount);
        console.log("📦 finalAmount:", apiData.finalAmount);
        
        // ✅ MAPPING THEO RESPONSE THỰC TẾ TỪ BACKEND
        const mappedCoupon = {
          code: apiData.voucherCode || couponCode.toUpperCase(),
          originalAmount: apiData.originalAmount,
          discountAmount: apiData.discountAmount, // Backend đã tính sẵn số tiền giảm
          finalAmount: apiData.finalAmount, // Backend đã tính sẵn tổng sau giảm
          message: apiData.message,
          rawData: apiData
        };
        
        console.log("✅ Mapped coupon:", mappedCoupon);
        
        setAppliedCoupon(mappedCoupon);
        setCouponError("");
        showSuccess(`✅ Áp dụng mã giảm giá "${mappedCoupon.code}" thành công!`);
      } else {
        throw new Error("Không nhận được dữ liệu từ server");
      }
      
    } catch (error) {
      console.error("❌ Lỗi áp dụng voucher:", error);
      
      // Xử lý các loại lỗi
      let errorMessage = "Mã giảm giá không hợp lệ hoặc đã hết hạn";
      
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        if (msg.includes("not yet active")) {
          errorMessage = "Mã giảm giá chưa đến thời gian sử dụng";
        } else if (msg.includes("expired")) {
          errorMessage = "Mã giảm giá đã hết hạn";
        } else if (msg.includes("minimum")) {
          errorMessage = "Đơn hàng chưa đủ giá trị tối thiểu";
        } else {
          errorMessage = msg;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCouponError(errorMessage);
      setAppliedCoupon(null);
      showError(`❌ ${errorMessage}`);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Hàm phụ trợ: Xác định loại giảm giá từ response
  const determineDiscountType = (voucherData) => {
    // Kiểm tra các field phổ biến từ backend
    if (voucherData.discountType) {
      const type = voucherData.discountType.toLowerCase();
      if (type.includes('percent') || type.includes('percentage')) return "percent";
      if (type.includes('fixed') || type.includes('amount')) return "fixed";
      if (type.includes('ship') || type.includes('freeship')) return "freeship";
    }
    
    if (voucherData.isPercentage || voucherData.discountPercent || voucherData.discountPercentage) {
      return "percent";
    }
    
    if (voucherData.isFreeShip || voucherData.freeShipping) {
      return "freeship";
    }
    
    // Mặc định là fixed amount
    return "fixed";
  };

  // Hàm phụ trợ: Tạo mô tả giảm giá
  const formatDiscountDescription = (voucherData) => {
    if (voucherData.discountPercent || voucherData.discountPercentage) {
      const percent = voucherData.discountPercent || voucherData.discountPercentage;
      return `Giảm ${percent}%`;
    }
    
    if (voucherData.discountAmount || voucherData.discount) {
      const amount = voucherData.discountAmount || voucherData.discount;
      return `Giảm ${formatMoney(amount)}`;
    }
    
    if (voucherData.isFreeShip || voucherData.freeShipping) {
      return "Miễn phí vận chuyển";
    }
    
    return "Mã giảm giá";
  };

  // Hàm xóa mã giảm giá
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    showSuccess("Đã xóa mã giảm giá");
  };

  // ✅ Tính toán giảm giá - SỬ DỤNG GIÁ TRỊ TỪ BACKEND
  const calculateDiscount = () => {
    if (!appliedCoupon) {
      console.log("⚠️ No coupon applied");
      return 0;
    }
    
    // Backend đã tính sẵn discountAmount, chúng ta chỉ cần lấy ra
    const discount = appliedCoupon.discountAmount || 0;
    
    console.log('💰 Discount from backend:', discount);
    
    return discount;
  };

  // Tính tổng sau giảm giá - SỬ DỤNG GIÁ TRỊ TỪ BACKEND
  const getFinalTotal = () => {
    // Nếu có coupon và backend đã tính sẵn finalAmount, dùng luôn
    if (appliedCoupon?.finalAmount) {
      console.log('💵 Using finalAmount from backend:', appliedCoupon.finalAmount);
      return appliedCoupon.finalAmount;
    }
    
    // Nếu không có, tính thủ công
    const total = getTotalPrice() - calculateDiscount();
    console.log('💵 Calculated total:', {
      original: getTotalPrice(),
      discount: calculateDiscount(),
      final: total
    });
    return total;
  };

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
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
          <h1 className="text-3xl font-serif font-bold text-vietnam-green mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">Kiểm tra và chỉnh sửa giỏ hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-vietnam-green">
                  Sản phẩm ({cartItems.length})
                </h2>
                <button onClick={clearCart} className={`text-vietnam-green hover:opacity-80 text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                  {loading ? 'Đang xóa...' : 'Xóa tất cả'}
                </button>
              </div>

              <div className="space-y-4">
                {cartItems
                  .filter((item) => item && typeof item === "object" && (item.id || item.productId))
                  .map((item) => {
                    const keyId = item.id || item.productId; // key hiển thị
                    const productId = item.productId;        // dùng cho API
                    const name =
                      typeof item.name === "object"
                        ? item.name?.message || JSON.stringify(item.name)
                        : item.name || "Sản phẩm";
                    const description =
                      typeof item.description === "object"
                        ? item.description?.message || JSON.stringify(item.description)
                        : item.description || "";
                    const price = Number(item.price) || 0;
                    const quantity = Number(item.quantity) || 1;
                    const imageSrc = buildImageSrc(item.imageUrl);

                    return (
                      <div
                        key={keyId}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={imageSrc}
                          alt={typeof name === "string" ? name : "product"}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-vietnam-green">{name}</h3>
                          <p className="text-sm text-gray-600">{description}</p>
                          <p className="text-lg font-bold text-vietnam-green">
                            {formatMoney(price)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await decreaseCartItem(productId);
                              await fetchCart()
                            }}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{quantity}</span>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await increaseCartItem(productId);
                              await fetchCart()
                            }}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-vietnam-green">
                            {formatMoney(price * quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className={`text-vietnam-green hover:opacity-80 text-sm mt-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                          >
                            {loading ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold text-vietnam-green mb-6">Tóm tắt đơn hàng</h2>

              {/* Phần nhập mã giảm giá */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                
                {/* Form nhập mã giảm giá - LUÔN HIỂN THỊ */}
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && !appliedCoupon && handleApplyCoupon()}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vietnam-green focus:border-transparent disabled:bg-gray-100"
                      disabled={isApplyingCoupon || appliedCoupon}
                    />
                    {appliedCoupon ? (
                      // Nút xóa khi đã áp dụng
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Xóa
                      </button>
                    ) : (
                      // Nút áp dụng
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-vietnam-green text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isApplyingCoupon ? "..." : "Áp dụng"}
                      </button>
                    )}
                  </div>
                  
                  {/* Thông báo lỗi */}
                  {couponError && !appliedCoupon && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {couponError}
                    </p>
                  )}
                  
                  {/* Thông báo thành công - HIỂN THỊ Ở DƯỚI Ô NHẬP */}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Đã áp dụng mã giảm giá thành công</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatMoney(getTotalPrice())}</span>
                </div>
                
                {appliedCoupon && calculateDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Giảm giá ({appliedCoupon.code}):
                    </span>
                    <span className="font-semibold">-{formatMoney(calculateDiscount())}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Phí giao hàng:</span>
                  <span>{appliedCoupon?.discountType === 'FREE_SHIP' ? (
                    <span className="text-green-600 font-semibold">Miễn phí ✓</span>
                  ) : (
                    <span className="font-medium">Miễn phí</span>
                  )}</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold text-vietnam-green">
                    <span>Tổng cộng:</span>
                    <span>{formatMoney(getFinalTotal())}</span>
                  </div>
                  {appliedCoupon && calculateDiscount() > 0 && (
                    <div className="flex items-center justify-end gap-1 text-sm text-green-600 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Tiết kiệm được {formatMoney(calculateDiscount())}</span>
                    </div>
                  )}
                </div>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout" className="btn-primary w-full text-center block">
                  Thanh toán
                </Link>
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
                <Link to="/trays" className="text-vietnam-green hover:opacity-80 text-sm">
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
