// src/services/productDetailService.js
import api, { publicApi } from './api'; 
import { trayService } from './trayService'; // Giữ lại

// Endpoint mới: GET: /api/product-details/by-product/{productId}
const API_PRODUCT_DETAIL_BASE_URL = '/api/product-details/by-product';

export const getProductDetails = async (productId) => {
  // ⚠️ Kiểm tra để ngăn lỗi undefined
  if (!productId) {
    throw new Error('Product ID is required to fetch details.');
  }
  
  try {
    console.log('Fetching product details for ID:', productId);
    
    // ⚠️ SỬ DỤNG publicApi để tránh lỗi 403 do Authorization
    // Dùng publicApi (không gắn token)
    const apiInstance = publicApi || api; 

    const response = await apiInstance.get(`${API_PRODUCT_DETAIL_BASE_URL}/${productId}`);
    const data = response?.data;
    
    console.log('Raw API response (Product Details):', data);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Product details not found or invalid format');
    }
    
    // Logic chuẩn hóa dữ liệu cũ
    const firstDetail = data[0];
    const productInfo = firstDetail.product;
    
    const items = data.map(detail => ({
        itemId: detail.itemId,
        proDetailQuantity: detail.proDetailQuantity,
    }));

    return {
      data: {
        productDetailId: firstDetail.productDetailId, 
        product: {
          productId: productInfo.productId,
          productName: productInfo.productName,
          productDescription: productInfo.productDescription,
          productImage: productInfo.productImage,
          price: productInfo.price,
          status: productInfo.status,
          category: productInfo.category, 
          region: productInfo.region, 
          items: items 
        }
      }
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};