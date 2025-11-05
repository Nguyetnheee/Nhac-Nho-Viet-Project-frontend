// src/pages/Cart.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCartOutlined, MinusOutlined, PlusOutlined, DeleteOutlined, CloseCircleOutlined, CheckCircleOutlined, TagOutlined } from '@ant-design/icons';
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { decreaseCartItem, increaseCartItem } from "../services/apiAuth";
import api from "../services/api";
import { useToast } from "../components/ToastContainer";
import { translateToVietnamese } from "../utils/errorMessages";
// ✅ UNCOMMENT DÒNG NÀY ĐỂ BẬT DEBUG PANEL
// import VoucherDebugPanel from "../components/VoucherDebugPanel";

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
    loading,
    increaseLocalItem,
    decreaseLocalItem,
    applyVoucher,
    removeVoucher,
    appliedVoucher,
    getFinalTotal,
    getDiscountAmount,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // State cho mã giảm giá - Local state cho UI
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // ✅ Sync local state với context khi component mount
  const appliedCoupon = appliedVoucher;

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
      const currentTotal = getTotalPrice();
      
      // ✅ Kiểm tra giỏ hàng có sản phẩm không
      if (currentTotal <= 0) {
        throw new Error("Giỏ hàng của bạn đang trống");
      }
      
      // ✅ BƯỚC 1: Validate voucher (kiểm tra hợp lệ)
      console.log("🔍 STEP 1: Validating voucher /api/vouchers/apply:", {
        code: couponCode.toUpperCase(),
        orderAmount: currentTotal
      });
      
      const validateResponse = await api.post('/api/vouchers/apply', {
        voucherCode: couponCode.toUpperCase(),
        orderAmount: currentTotal
      });
      
      console.log("✅ STEP 1 SUCCESS: Voucher is valid:", validateResponse.data);
      
      // ✅ BƯỚC 2: Áp dụng voucher vào cart (cập nhật database)
      const token = localStorage.getItem('token');
      console.log("📝 STEP 2: Applying voucher to cart /api/cart/apply-voucher:", {
        code: couponCode.toUpperCase(),
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
      });
      
      // Helper: Tính số tiền giảm từ dữ liệu validate với nhiều schema khác nhau
      const computeDiscountFromValidate = (data, orderAmount) => {
        if (!data || !orderAmount) return 0;
        const toNum = (v) => (v === undefined || v === null ? 0 : Number(v));
        let discount = 0;
        // Trường phổ biến
        if (toNum(data.discountAmount) > 0) discount = toNum(data.discountAmount);
        if (!discount && toNum(data.discount_value) > 0) discount = toNum(data.discount_value);
        if (!discount && toNum(data.amountOff) > 0) discount = toNum(data.amountOff);
        if (!discount && toNum(data.fixedAmount) > 0) discount = toNum(data.fixedAmount);

        // Theo type + value
        const type = (data.discountType || data.type || '').toString().toUpperCase();
        const value = toNum(data.discountValue ?? data.value ?? data.percentage ?? data.percentOff);
        const maxCap = toNum(data.maxDiscountAmount ?? data.maxDiscount ?? data.maxCap);
        if (!discount && type) {
          if (type.includes('PERCENT')) {
            discount = (orderAmount * value) / 100;
          } else if (type.includes('FIX') || type.includes('AMOUNT')) {
            discount = value;
          }
        }
        // Nếu chưa có type nhưng có percentage
        if (!discount && value > 0 && value <= 100 && (data.percentage !== undefined || data.percentOff !== undefined)) {
          discount = (orderAmount * value) / 100;
        }
        // Giới hạn theo max
        if (maxCap && discount > maxCap) discount = maxCap;
        if (discount > orderAmount) discount = orderAmount;
        return Math.max(0, Math.floor(discount));
      };

      let applyResponse;
      try {
        // ✅ Đảm bảo gửi đúng format body và headers
        const voucherParam = couponCode.toUpperCase();
        console.log("📤 Request to /api/cart/apply-voucher?voucherCode=", voucherParam);
        
        // Theo spec: voucherCode là query param
        applyResponse = await api.post('/api/cart/apply-voucher', null, {
          params: { voucherCode: voucherParam },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("✅ STEP 2 SUCCESS: Cart updated with voucher:", applyResponse.data);
      } catch (applyError) {
        console.error("❌ STEP 2 FAILED: API /api/cart/apply-voucher error:", {
          status: applyError.response?.status,
          statusText: applyError.response?.statusText,
          message: applyError.response?.data?.message || applyError.message,
          data: applyError.response?.data,
          requestSent: {
            url: '/api/cart/apply-voucher',
            params: { voucherCode: couponCode.toUpperCase() },
            hasToken: !!token
          }
        });
        
        // 🔄 FALLBACK: Nếu API chưa sẵn sàng, dùng response từ BƯỚC 1
        console.log("🔄 FALLBACK: Using validation response data");
        applyResponse = { data: validateResponse.data };
        
        // Tính toán discount amount từ validation response (đa dạng schema)
        const currentTotal = getTotalPrice();
        const discountAmount = computeDiscountFromValidate(validateResponse.data, currentTotal);
        
        // Tạo response giả lập theo format của /api/cart/apply-voucher
        applyResponse.data = {
          subTotal: currentTotal,
          voucherCode: validateResponse.data.code || couponCode.toUpperCase(),
          discountAmount: discountAmount,
          finalAmount: currentTotal - discountAmount
        };
        
        console.log("📦 Fallback response data:", applyResponse.data);
      }
      
      // ✅ Lấy data từ response của BƯỚC 2 (hoặc fallback)
      const responseData = applyResponse.data;
      
      console.log("📦 Cart response data:", responseData);
      
      // ✅ Kiểm tra response có hợp lệ không
      if (!responseData) {
        throw new Error("Không nhận được thông tin từ server");
      }
      
      // ✅ Parse thông tin từ response của /api/cart/apply-voucher
      // Response format:
      // {
      //   subTotal: number,        // Tổng tiền gốc
      //   voucherCode: string,     // Mã voucher
      //   discountAmount: number,  // Số tiền giảm
      //   finalAmount: number,     // Tổng tiền sau giảm
      //   ...
      // }
      
      // Lấy discount từ response
      let discountAmount = Number(responseData.discountAmount) || 0;
      const respSubTotal = Number(responseData.subTotal) || currentTotal;
      const respFinal = Number(responseData.finalAmount);
      // Nếu BE không trả discount nhưng có final nhỏ hơn subtotal, suy ra từ chênh lệch
      if (discountAmount === 0 && Number.isFinite(respFinal) && respFinal >= 0 && respSubTotal > respFinal) {
        discountAmount = respSubTotal - respFinal;
      }
      if (discountAmount === 0 && validateResponse?.data) {
        discountAmount = computeDiscountFromValidate(validateResponse.data, currentTotal);
      }
      const finalAmount = Number(responseData.finalAmount) || 0;
      const subTotal = Number(responseData.subTotal) || currentTotal;
      
      // ✅ KIỂM TRA LOGIC: finalAmount PHẢI BẰNG subTotal - discountAmount
      const calculatedFinalAmount = subTotal - discountAmount;
      if (Math.abs(finalAmount - calculatedFinalAmount) > 1) {
        console.warn("⚠️ WARNING: finalAmount mismatch!", {
          fromBackend: finalAmount,
          calculated: calculatedFinalAmount,
          subTotal: subTotal,
          discountAmount: discountAmount,
          difference: finalAmount - calculatedFinalAmount
        });
      }
      
      // ✅ Tạo voucherInfo từ cart response - SỬ DỤNG GIÁ TRỊ TÍNH TOÁN ĐỂ ĐẢM BẢO ĐÚNG
      const voucherInfo = {
        code: responseData.voucherCode || couponCode.toUpperCase(),
        discountAmount: Math.round(discountAmount),
        originalAmount: Math.round(subTotal),
        finalAmount: Math.round(calculatedFinalAmount), // ✅ Dùng giá trị tính toán thay vì từ backend
        validated: true,
        message: `Giảm ${Math.round(discountAmount).toLocaleString('vi-VN')} VNĐ`
      };
      
      console.log("💰 Voucher applied:", voucherInfo);
      console.log("📊 Calculation details:", {
        subTotal: Math.round(subTotal),
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.round(calculatedFinalAmount),
        verification: `${Math.round(subTotal)} - ${Math.round(discountAmount)} = ${Math.round(calculatedFinalAmount)}`
      });
      
      console.log("✅ Voucher info:", voucherInfo);
      
      // ✅ Lưu vào context
      applyVoucher(voucherInfo);
      setCouponError("");
      showSuccess(`Áp dụng mã giảm giá "${voucherInfo.code}" thành công! Giảm ${Math.round(discountAmount).toLocaleString('vi-VN')} VNĐ`);
      
      // ✅ QUAN TRỌNG: Refresh cart để đồng bộ với database
      console.log("🔄 Refreshing cart to sync with database...");
      await fetchCart();
      
    } catch (error) {
      console.error("❌ Lỗi áp dụng voucher:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        fullError: error
      });
      
      // ✅ Xử lý các loại lỗi rõ ràng cho customer
      let errorMessage = "Không thể áp dụng mã giảm giá";
      
      // Ưu tiên sử dụng message từ Error object nếu có
      if (error.message && !error.message.includes('Request failed') && !error.message.includes('AxiosError')) {
        errorMessage = translateToVietnamese(error.message);
      } 
      // Nếu không, check response từ backend
      else if (error.response) {
        const backendMsg = error.response.data?.message || 
                          error.response.data?.error || 
                          error.response.data;
        
        if (backendMsg && typeof backendMsg === 'string') {
          errorMessage = translateToVietnamese(backendMsg);
        } else {
          // Mapping theo HTTP status code
          switch (error.response.status) {
            case 400:
              errorMessage = "Mã giảm giá không hợp lệ hoặc không đủ điều kiện sử dụng";
              break;
            case 404:
              errorMessage = "Mã giảm giá không tồn tại";
              break;
            case 410:
              errorMessage = "Mã giảm giá đã hết hạn";
              break;
            case 403:
              errorMessage = "Mã giảm giá đã hết lượt sử dụng";
              break;
            default:
              errorMessage = "Không thể áp dụng mã giảm giá. Vui lòng thử lại";
          }
        }
      }
      
      setCouponError(errorMessage);
      removeVoucher();
      showError(errorMessage);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Hàm xóa mã giảm giá
  const handleRemoveCoupon = async () => {
    try {
      console.log("🗑️ Removing voucher from cart...");
      
      // ✅ TODO: GỌI API XÓA VOUCHER TỪ DATABASE
      // Cần backend cung cấp endpoint: DELETE /api/cart/remove-voucher hoặc POST /api/cart/remove-voucher
      const token = localStorage.getItem('token');
      
      try {
        await api.delete('/api/cart/remove-voucher', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("✅ Voucher removed from database");
      } catch (apiError) {
        console.warn("⚠️ API remove voucher not available, trying POST method:", apiError.message);
        
        // Fallback: thử POST method
        try {
          await api.post('/api/cart/remove-voucher', {}, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          console.log("✅ Voucher removed from database (POST method)");
        } catch (postError) {
          console.warn("⚠️ Backend API /api/cart/remove-voucher not available:", postError.message);
          console.log("📝 Please ask backend to implement: DELETE or POST /api/cart/remove-voucher");
        }
      }
      
      // ✅ Xóa voucher khỏi Context (UI sẽ update ngay)
      removeVoucher();
      setCouponCode("");
      setCouponError("");
      
      // ✅ Refresh cart để sync với database
      await fetchCart();
      
      showSuccess("Đã xóa mã giảm giá");
    } catch (error) {
      console.error("❌ Error removing voucher:", error);
      showError("Không thể xóa mã giảm giá. Vui lòng thử lại.");
    }
  };

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-vietnam-cream py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <ShoppingCartOutlined className="text-8xl mx-auto" />
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
                <button onClick={clearCart} className="text-vietnam-green hover:opacity-80 text-sm">
                  Xóa tất cả
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
                              try {
                                // ✅ Optimistic update - cập nhật UI trước
                                decreaseLocalItem(productId);
                                // ✅ Gọi API để cập nhật database
                                await decreaseCartItem(productId);
                                // ✅ QUAN TRỌNG: Fetch lại giỏ hàng để cập nhật giá và voucher
                                await fetchCart();
                              } catch (error) {
                                console.error('Error decreasing item:', error);
                                // ✅ Nếu lỗi, fetch lại để rollback về trạng thái đúng
                                await fetchCart();
                                showError('Không thể giảm số lượng. Vui lòng thử lại.');
                              }
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
                              try {
                                // ✅ Optimistic update - cập nhật UI trước
                                increaseLocalItem(productId);
                                // ✅ Gọi API để cập nhật database
                                await increaseCartItem(productId);
                                // ✅ QUAN TRỌNG: Fetch lại giỏ hàng để cập nhật giá và voucher
                                await fetchCart();
                              } catch (error) {
                                console.error('Error increasing item:', error);
                                // ✅ Nếu lỗi, fetch lại để rollback về trạng thái đúng
                                await fetchCart();
                                showError('Không thể tăng số lượng. Vui lòng thử lại.');
                              }
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
                            className="text-vietnam-green hover:opacity-80 text-sm mt-1"
                          >
                            Xóa
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
                      <CloseCircleOutlined className="text-base" />
                      {couponError}
                    </p>
                  )}
                  
                  {/* Thông báo thành công - HIỂN THỊ Ở DƯỚI Ô NHẬP */}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircleOutlined className="text-base" />
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
                
                {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <TagOutlined className="text-base" />
                      Giảm giá ({appliedCoupon.code}):
                    </span>
                    <span>-{formatMoney(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Phí giao hàng:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold text-vietnam-green">
                    <span>Tổng cộng:</span>
                    <span>
                      {formatMoney(getFinalTotal())}
                    </span>
                  </div>
                  {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                    <div className="flex items-center justify-end gap-1 text-sm text-green-600 mt-2">
                      <CheckCircleOutlined className="text-base" />
                      <span>Đã tiết kiệm {formatMoney(getDiscountAmount())}!</span>
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

      {/* ✅ UNCOMMENT ĐỂ BẬT DEBUG PANEL - Hiển thị chi tiết request/response */}
      {/* <VoucherDebugPanel /> */}
    </div>
  );
};

export default Cart;

