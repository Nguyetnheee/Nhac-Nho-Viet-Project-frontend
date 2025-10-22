// src/services/cartService.js
import api from "./api";

/** Chuẩn hoá lỗi trả về để hiển thị gọn gàng trên UI */
export const handleError = (error) => {
  const backendMsg =
    error?.response?.data?.message ||
    (typeof error?.response?.data === "string" ? error.response.data : null);

  if (error?.response?.status === 403) {
    return new Error(String(backendMsg || "Bạn không có quyền truy cập tài nguyên này."));
  }
  if (error?.response?.status === 401) {
    return new Error(String(backendMsg || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
  }
  return new Error(String(backendMsg || error?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau."));
};

/** LẤY GIỎ HÀNG (server là nguồn sự thật)
 *  GET /api/cart
 *  -> trả về: cartId, items[], totalItems, subTotal, currency, ...
 */
export const getCart = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui lòng đăng nhập để xem giỏ hàng.');
  }

  try {
    const res = await api.get("/api/cart", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

/** THÊM / CẬP NHẬT SỐ LƯỢNG 1 SẢN PHẨM TRONG GIỎ
 *  POST /api/cart/items
 *  body: { productId: number, quantity: number }
 */
export const addOrUpdateCartItem = async (productId, quantity) => {
  try {
    if (!productId && productId !== 0) {
      throw new Error("Thiếu productId.");
    }
    if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity < 1) {
      throw new Error("Số lượng không hợp lệ");
    }

    // Đảm bảo gửi lên một số nguyên dương
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const res = await api.post("/api/cart/items", {
      productId,
      quantity: safeQuantity
    });
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Alias tiện dụng cho FE:
export const addToCart = (productId, quantity = 1) =>
  addOrUpdateCartItem(productId, quantity);



export const updateCartItem = (productId, quantity) =>
  addOrUpdateCartItem(productId, quantity);

/** XOÁ 1 SẢN PHẨM KHỎI GIỎ
 *  POST /api/cart/items/remove?productId=...
 */
export const removeFromCart = async (productId) => {
  try {
    if (!productId && productId !== 0) {
      throw new Error("Thiếu productId.");
    }
    await api.post("/api/cart/items/remove", null, {
      params: { productId },
    });
    // Since API returns 204, no need to return data
    return true;
  } catch (error) {
    throw handleError(error);
  }
};

/** XOÁ TOÀN BỘ GIỎ HÀNG (nếu backend có)
 *  Tuỳ BE, có thể là POST /api/cart/clear
 *  Nếu không có endpoint -> hãy ẩn nút Clear trên UI.
 */
export const clearCart = async () => {
  try {
    const res = await api.post("/api/cart/clear");
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Checkout thanh toan
export const checkout = async () => {
  try {
    const res = await api.post("/api/cart/checkout");
    return res.data;
  } catch (error) {
    throw handleError(error);
  }
};
