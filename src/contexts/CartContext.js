import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { isAuthenticated, token, user } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useToast();

  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ totalItems: 0, subTotal: 0, currency: "" });
  const [serverSynced, setServerSynced] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ Kiểm tra nếu đang ở trang admin/staff/shipper
  const isAdminRoute = location.pathname.startsWith('/admin-login') ||
                       location.pathname.startsWith('/admin-dashboard') ||
                       location.pathname.startsWith('/staff-dashboard') ||
                       location.pathname.startsWith('/staff-login') ||
                       location.pathname.startsWith('/shipper-dashboard') ||
                       location.pathname.startsWith('/shipper-login') ||
                       location.pathname.startsWith('/shipper-panel');
  
  // ✅ CHẶT CHẼ HƠN - Chỉ là customer khi:
  // 1. Role = CUSTOMER hoặc ROLE_CUSTOMER
  // 2. KHÔNG phải đang ở trang admin/staff/shipper
  const isCustomer = (user?.role === 'CUSTOMER' || user?.role === 'ROLE_CUSTOMER') && !isAdminRoute;
  
  console.log('🛒 CartContext Debug:', {
    pathname: location.pathname,
    isAdminRoute,
    isAuthenticated,
    userRole: user?.role,
    isCustomer,
    hasToken: !!token
  });

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


  const increaseLocalItem = (productId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseLocalItem = (productId) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // -------- API calls --------
  const fetchCart = async () => {
    // ✅ Nếu không phải Customer, KHÔNG làm gì cả - HOÀN TOÀN IM LẶNG
    if (!isCustomer) {
      console.log('⏭️ Skip cart fetch - User is not CUSTOMER');
      setServerSynced(false);
      setError(null);
      setCartItems([]);
      setTotals({ totalItems: 0, subTotal: 0, currency: "" });
      setLoading(false);
      return;
    }
    
    if (!isAuthenticated || !token) {
      setServerSynced(false);
      setError({ type: "auth", message: "Vui lòng đăng nhập để xem giỏ hàng." });
      navigate('/login');
      return;
    }

    setLoading(true);
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
      
      // ✅ DOUBLE CHECK - Nếu không phải customer thì im lặng hoàn toàn
      if (!isCustomer) {
        setError(null);
        setLoading(false);
        return;
      }
      
      if (err?.response?.status === 401) {
        setError({ type: "auth", message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
        navigate('/login');
      } else if (err?.response?.status === 403) {
        // 403 - Không có quyền
        setError(null);
      } else {
        // Lỗi chung - CHỈ hiển thị cho CUSTOMER
        setError({ type: "error", message: "Không thể tải giỏ hàng từ server. Vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productOrId, quantity = 1) => {
    // Nếu không phải Customer, KHÔNG cho phép thêm hàng vào giỏ
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
  
  //Thêm điều kiện isCustomer vào các hàm khác
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
    // Chỉ chạy fetchCart nếu là Customer
    if (isAuthenticated && isCustomer) {
      fetchCart();
    } else {
      setCartItems([]);
      setTotals({ totalItems: 0, subTotal: 0, currency: "" });
      setServerSynced(false);
      setError(null);
    }
  }, [isAuthenticated, user?.role]); // Thêm user?.role vào dependency

  const getTotalItems = () => totals.totalItems;
  const getTotalPrice = () => totals.subTotal;
  const getDistinctProductCount = () => {
    return cartItems.length; 
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
    increaseLocalItem,
    decreaseLocalItem,
    getTotalItems,
    getTotalPrice,
    getDistinctProductCount,
    error,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {/*  ✅ CHỈ HIỆN LỖI CHO CUSTOMER - CHECK NHIỀU LẦN ĐỂ CHẮC CHẮN */}
      {error && 
       isCustomer && 
       user?.role === 'CUSTOMER' && 
       isAuthenticated && ( 
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