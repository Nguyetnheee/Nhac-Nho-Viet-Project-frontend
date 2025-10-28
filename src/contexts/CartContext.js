// src/contexts/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ⚠️ Đảm bảo useAuth được import đúng đường dẫn
import { useAuth } from "./AuthContext"; 
import * as cartService from "../services/cartService";
import { useToast } from '../components/ToastContainer';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

export const CartProvider = ({ children }) => {
  // ⚠️ Đã lấy user và token từ useAuth
  const { isAuthenticated, token, user } = useAuth(); 
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  // Server state only
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ totalItems: 0, subTotal: 0, currency: "" });
  const [serverSynced, setServerSynced] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ⚠️ Helper xác định xem User có phải là Customer hay không
  // Dùng `!user?.role` để cho phép người dùng chưa đăng nhập (guest) vẫn có thể xem các trang giỏ hàng/mua sắm nếu cần.
  const isCustomer = user?.role === 'Customer' || (!user?.role && isAuthenticated);
  // Thêm isAuthenticated vào điều kiện để Guest không được coi là Customer nếu chưa đăng nhập

  // -------- Adapter theo schema GET /api/cart --------
  const adaptCartFromApi = (apiCart) => {
    const items = Array.isArray(apiCart?.items) ? apiCart.items : [];
    const mapped = items.map((i) => ({
      id: i.cartItemId ?? i.productId,
      cartItemId: i.cartItemId,
      productId: i.productId,
      name: i.productName,
      productName: i.productName,
      imageUrl: i.productImage,
      price: Number(i.unitPrice) || 0,
      quantity: Number(i.quantity) || 0,
      lineTotal: Number(i.lineTotal) || 0,
      selected: i.selected ?? true
    }));

    return {
      items: mapped,
      totals: {
        totalItems: Number(apiCart?.totalItems) || 0,
        subTotal: Number(apiCart?.subTotal) || 0,
        currency: apiCart?.currency || "VND",
      },
    };
  };

  // -------- Helpers --------
  const requireAuth = () => {
    setError({ type: "auth", message: "Bạn cần đăng nhập để tiếp tục mua hàng" });
    setTimeout(() => navigate("/login"), 1200);
  };

  // -------- API calls --------
  const fetchCart = async () => {
    // ⚠️ CHẶN 1: Nếu không phải Customer, KHÔNG tải giỏ hàng
    if (!isCustomer) {
      setServerSynced(false);
      setError(null);
      return;
    }
    
    if (!isAuthenticated || !token) {
      setServerSynced(false);
      setError({ type: "auth", message: "Vui lòng đăng nhập để xem giỏ hàng." });
      navigate('/login');
      return;
    }

    try {
      const data = await cartService.getCart();
      if (data) {
        const { items, totals } = adaptCartFromApi(data);
        setCartItems(items);
        setTotals(totals);
        setServerSynced(true);
        setError(null);
      }
    } catch (err) {
      console.error("fetchCart error:", err);
      setServerSynced(false);
      if (err?.response?.status === 401) {
        setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
        navigate('/login');
      } else if (err?.response?.status === 403) {
        // Lỗi 403 thường xảy ra khi Staff/Admin cố gắng truy cập, đã được chặn ở trên,
        // nhưng vẫn giữ phòng trường hợp API trả về lỗi này.
        setError({ type: "auth", message: "Tài khoản của bạn không có quyền xem giỏ hàng." });
        navigate('/');
      } else {
        // Lỗi chung cần chặn đối với Staff đã được xử lý ở if (!isCustomer)
        setError({ type: "error", message: "Không thể tải giỏ hàng từ server. Vui lòng thử lại." });
      }
    }
  };

  const addToCart = async (productOrId, quantity = 1) => {
    // ⚠️ CHẶN 2: Nếu không phải Customer, KHÔNG cho phép thêm hàng vào giỏ
    if (!isCustomer) return; 
    
    if (!isAuthenticated) return requireAuth();

    const productId =
      typeof productOrId === "object"
        ? productOrId.productId ?? productOrId.id
        : productOrId;

    if (productId === undefined || productId === null) {
      setError({ type: "error", message: "Không xác định được sản phẩm." });
      return;
    }

    try {
      // BE: quantity là ABSOLUTE khi tạo/cập nhật (ở đây thêm 1 thì gửi 1)
      await cartService.updateCartItem(productId, Number(quantity) || 1);
      await fetchCart();
      setError(null);
      showSuccess("Đã cập nhật giỏ hàng thành công!");
    } catch (err) {
      console.error("addToCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể thêm sản phẩm. Vui lòng thử lại sau." });
    }
  };
  
  // ⚠️ CHẶN 3: Thêm điều kiện isCustomer vào các hàm khác
  const updateQuantity = async (productId, nextQty) => {
    if (!isCustomer) return;
    if (!isAuthenticated) return requireAuth();

    try {
      if (nextQty <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      await cartService.updateCartItem(productId, Number(nextQty));
      await fetchCart();
      setError(null);
      showSuccess("Đã cập nhật số lượng!");
    } catch (err) {
      console.error("updateQuantity error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể cập nhật số lượng. Vui lòng thử lại sau." });
    }
  };

  const removeFromCart = async (productId) => {
    if (!isCustomer) return;
    if (!isAuthenticated) return requireAuth();
    if (loading) return; // Prevent double-click

    try {
      setLoading(true);
      await cartService.removeFromCart(productId);
      await fetchCart();
      setError(null);
      showSuccess("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (err) {
      console.error("removeFromCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể xóa sản phẩm. Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isCustomer) return;
    if (!isAuthenticated) return requireAuth();
    if (loading) return; // Prevent double-click

    try {
      setLoading(true);
      await cartService.clearCart();
      await fetchCart();
      setError(null);
      showSuccess("Đã xóa tất cả sản phẩm khỏi giỏ hàng!");
    } catch (err) {
      console.error("clearCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể xóa giỏ hàng. Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  // -------- Effects --------
  useEffect(() => {
    // ⚠️ CHẶN 4: Chỉ chạy fetchCart nếu là Customer
    if (isAuthenticated && isCustomer) {
      fetchCart();
    } else {
      setCartItems([]);
      setTotals({ totalItems: 0, subTotal: 0, currency: "" });
      setServerSynced(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]); // Thêm user?.role vào dependency

  // -------- Selectors --------
  const getTotalItems = () => totals.totalItems;
  const getTotalPrice = () => totals.subTotal;
  const getDistinctProductCount = () => {
    return cartItems.length; // Số lượng loại sản phẩm khác nhau
  };

  const value = {
    cartItems,
    totals,
    serverSynced,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    getTotalItems,
    getTotalPrice,
    getDistinctProductCount, 
    error,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {/* ⚠️ CHẶN 5: CHỈ HIỆN LỖI NỘI BỘ CỦA CartContext NẾU LÀ CUSTOMER */}
      {error && isCustomer && ( 
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg ${
            error?.type === "auth" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
          } shadow-lg z-50`}
        >
          {error?.message}
        </div>
      )}
      {children}
    </CartContext.Provider>
  );
};