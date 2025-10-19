import api from './api';

export const cartService = {
  // Lấy thông tin giỏ hàng hiện tại
  getCart: () => api.get('/api/cart'),

  // Thêm sản phẩm vào giỏ hàng
  addToCart: (productId, quantity = 1, productInfo = null) => api.post('/api/cart/items', {
    productId,
    quantity,
    selected: true,
    ...(productInfo && {
      productName: productInfo.productName,
      price: productInfo.price,
      imageUrl: productInfo.imageUrl,
      description: productInfo.description
    })
  }),

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: (productId) => api.delete(`/api/cart/items/${productId}`),

  // Xóa toàn bộ giỏ hàng
  clearCart: () => api.delete('/api/cart'),

  // Thanh toán giỏ hàng
  checkout: () => api.post('/api/cart/checkout')
};

// Kiểu dữ liệu của response:
/*
{
  cartId: number,
  cartStatus: string,
  customerId: number,
  customerName: string,
  items: [
    {
      productId: number,
      productName: string,
      quantity: number,
      selected: boolean
    }
  ]
}
*/