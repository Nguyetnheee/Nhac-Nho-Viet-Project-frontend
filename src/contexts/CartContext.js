import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart data when component mounts and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, productInfo = null) => {
    try {
      setLoading(true);
      // If productInfo is not provided, fetch it first
      if (!productInfo) {
        const response = await cartService.addToCart(productId, quantity);
        await fetchCart();
      } else {
        // Send complete product info to cart
        await cartService.addToCart(productId, quantity, {
          productName: productInfo.name,
          price: productInfo.price,
          imageUrl: productInfo.imageUrl,
          description: productInfo.description
        });
        await fetchCart();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      console.log('Removing product from cart:', productId);
      await cartService.removeFromCart(productId);
      console.log('Product removed successfully');
      await fetchCart(); // Refresh cart data
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi khi xóa sản phẩm');
      throw err; // Throw error to handle in component
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      await fetchCart(); // Refresh cart data
    } catch (err) {
      setError(err.message);
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    try {
      setLoading(true);
      await cartService.checkout();
      await fetchCart(); // Refresh cart data after checkout
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error during checkout:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  };

  const getTotalQuantity = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => 
      total + item.quantity, 0
    );
  };

  const getSelectedItemsCount = () => {
    if (!cart?.items) return 0;
    // Chỉ tính số lượng các item được chọn (selected = true)
    return cart.items.reduce((total, item) => total + (item.selected ? 1 : 0), 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    getTotalPrice,
    getTotalQuantity,
    getSelectedItemsCount,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
