// src/services/productDetailService.js
// Tất cả các API liên quan đến product-details (yêu cầu MANAGER role)

import api from './api';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://isp-7jpp.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

publicApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});



const productDetailService = {
  /**
   * Lấy productDetailId từ productId
   * Backend có thể trả:
   *  - object: { productDetailId, ... }
   *  - array: [{ productDetailId, ... }]
   *  - number: id
   */
  getProductDetailIdByProductId: async (productId) => {
    if (!productId) throw new Error('productId is required');

    try {
      const response = await publicApi.get(
        `/api/product-details/${productId}/details`
      );
      const data = response?.data;

      if (!data) {
        throw new Error('Product detail not found');
      }

      // Trường hợp API trả array
      if (Array.isArray(data)) {
        if (!data.length) throw new Error('Product detail not found');
        const first = data[0];
        if (first.productDetailId) return first.productDetailId;
        if (first.id) return first.id;
      }

      // Trường hợp API trả object
      if (typeof data === 'object') {
        if (data.productDetailId) return data.productDetailId;
        if (data.id) return data.id;
      }

      // Trường hợp API trả trực tiếp id
      if (typeof data === 'number') {
        return data;
      }

      throw new Error('productDetailId not found in response');
    } catch (error) {
      if (error.response?.status !== 500) {
        console.error(
          'Error fetching product detail ID:',
          error.response?.status || error.message
        );
      }
      throw error;
    }
  },

  /**
   * Helper: Lấy chi tiết mâm cúng + checklist theo productId
   * Quy trình:
   *  1. Lấy productDetailId từ productId
   *  2. Gọi /{productDetailId}/details
   */
  getProductDetailWithChecklistsByProductId: async (productId) => {
    const productDetailId =
      await productDetailService.getProductDetailIdByProductId(productId);
    return productDetailService.getProductDetailWithChecklists(productDetailId);
  },

  // Lấy chi tiết nguyên liệu theo productDetailId
  // GET /api/product-details/{productDetailId}/details
  getProductDetailIngredients: async (productDetailId) => {
    if (!productDetailId) {
      throw new Error('productDetailId is required');
    }
    try {
      const response = await publicApi.get(
        `/api/product-details/${productDetailId}/details`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product detail ingredients:', error);
      throw error;
    }
  },

  // Lấy product detail với checklists đầy đủ
  // GET /api/product-details/{productDetailId}/details
  getProductDetailWithChecklists: async (productDetailId) => {
    if (!productDetailId) {
      throw new Error('productDetailId is required');
    }
    try {
      const response = await publicApi.get(
        `/api/product-details/${productDetailId}/details`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching product detail with checklists:', error);
      throw error;
    }
  },

  // Tạo product detail mới
  // POST /api/product-details
  createProductDetail: async (productId) => {
    if (!productId) throw new Error('productId is required');
    try {
      const response = await publicApi.post('/api/product-details', {
        productId,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status !== 500) {
        console.error(
          'Error creating product detail:',
          error.response?.status || error.message
        );
      }
      throw error;
    }
  },

  // Cập nhật product detail
  // PUT /api/product-details/{productDetailId}
  updateProductDetail: async (productDetailId, productDetailData) => {
    if (!productDetailId) {
      throw new Error('productDetailId is required');
    }
    try {
      const response = await publicApi.put(
        `/api/product-details/${productDetailId}`,
        productDetailData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product detail:', error);
      throw error;
    }
  },

  // Gán checklist cho product detail
  // POST /api/product-details/{productDetailId}/assign-checklists
  assignChecklistsToProductDetail: async (productDetailId, checklistIds) => {
    if (!productDetailId) throw new Error('productDetailId is required');
    if (!Array.isArray(checklistIds) || checklistIds.length === 0) {
      throw new Error('checklistIds is required');
    }

    try {
      const response = await publicApi.post(
        `/api/product-details/${productDetailId}/assign-checklists`,
        {
          productDetailId,
          checklistIds,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning checklists:', error);
      throw error;
    }
  },

  // Xóa product detail
  // DELETE /api/product-details/{productDetailId}
  deleteProductDetail: async (productDetailId) => {
    if (!productDetailId) {
      throw new Error('productDetailId is required');
    }
    try {
      const response = await publicApi.delete(
        `/api/product-details/${productDetailId}`
      );
      return response.data || { success: true };
    } catch (error) {
      console.error('Error deleting product detail:', error);
      throw error;
    }
  },

  // Hàm legacy giữ lại nếu còn chỗ nào dùng (khuyến nghị: dần bỏ)
  getProductDetails: async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required to fetch details.');
    }

    try {
      const response = await publicApi.get(
        `/api/product-details/${productId}/details`
      );
      const data = response?.data;

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Product details not found or invalid format');
      }

      const firstDetail = data[0];
      const productInfo = firstDetail.product;

      const items = data.map((detail) => ({
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
            items,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },
};

export default productDetailService;
