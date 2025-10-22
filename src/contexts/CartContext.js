// src/contexts/CartContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  // Server state only
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ totalItems: 0, subTotal: 0, currency: "" });
  const [serverSynced, setServerSynced] = useState(false);
  const [error, setError] = useState(null);

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
        setError({ type: "auth", message: "Tài khoản của bạn không có quyền xem giỏ hàng." });
        navigate('/');
      } else {
        setError({ type: "error", message: "Không thể tải giỏ hàng từ server. Vui lòng thử lại." });
      }
    }
  };

  const addToCart = async (productOrId, quantity = 1) => {
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
      showSuccess("Đã cập nhật giỏ hàng thành công!"); // Hiển thị toast
    } catch (err) {
      console.error("addToCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể thêm sản phẩm. Vui lòng thử lại sau." });
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (productId, nextQty) => {
    if (!isAuthenticated) return requireAuth();

    try {
      // Lấy thông tin sản phẩm hiện tại từ server
      const currentCart = await cartService.getCart();
      const currentItem = currentCart.items?.find(item => item.productId === productId);
      
      if (!currentItem) {
        setError({ type: "error", message: "Không tìm thấy sản phẩm trong giỏ hàng." });
        return;
      }

      const currentQty = Number(currentItem.quantity) || 0;
      const desiredQty = Number(nextQty);

      // Validate số lượng mới
      if (!Number.isFinite(desiredQty) || desiredQty < 0) {
        setError({ type: "error", message: "Số lượng không hợp lệ." });
        return;
      }

      // Nếu số lượng = 0, xóa sản phẩm
      if (desiredQty === 0) {
        await cartService.removeFromCart(productId);
        await fetchCart();
        setError(null);
        return;
      }

      // Cập nhật số lượng trên server
      await cartService.updateCartItem(productId, desiredQty);
      
      // Refresh lại data từ server
      await fetchCart();
      setError(null);
    } catch (err) {
      console.error("updateQuantity error:", err);
      // Nếu lỗi, refresh lại data từ server
      await fetchCart();
      if (err?.status === 401) {
        setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      } else if (err?.status === 403) {
        setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      } else {
        setError({ type: "error", message: "Không thể cập nhật số lượng. Vui lòng thử lại sau." });
      }
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return requireAuth();
    try {
      await cartService.removeFromCart(productId); // POST /api/cart/items/remove?productId=...
      await fetchCart();
      setError(null);
    } catch (err) {
      console.error("removeFromCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể xóa sản phẩm. Vui lòng thử lại sau." });
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return requireAuth();
    try {
      await cartService.clearCart(); // nếu BE hỗ trợ /api/cart/clear
      await fetchCart();
      setError(null);
    } catch (err) {
      console.error("clearCart error:", err);
      if (err?.status === 401) setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
      else if (err?.status === 403) setError({ type: "auth", message: "Tài khoản của bạn không có quyền thao tác giỏ hàng." });
      else setError({ type: "error", message: "Không thể xóa giỏ hàng. Vui lòng thử lại sau." });
    }
  };

  // -------- Effects --------
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setTotals({ totalItems: 0, subTotal: 0, currency: "" });
      setServerSynced(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
    getDistinctProductCount, // Thêm selector
    error,
  };

  return (
    <CartContext.Provider value={value}>
      {error && (
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
