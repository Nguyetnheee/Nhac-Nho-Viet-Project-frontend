// src/services/productDetailService.js
// Tất cả các API liên quan đến product-details (yêu cầu STAFF role)
import api from './api';

const productDetailService = {
    // Lấy productDetailId từ productId
    // GET /api/product-details/by-product/{productId}
    getProductDetailIdByProductId: async (productId) => {
        try {
            const response = await api.get(`/api/product-details/by-product/${productId}`);
            const data = response?.data;
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Product details not found');
            }
            
            // Lấy productDetailId từ phần tử đầu tiên
            const firstDetail = data[0];
            return firstDetail.productDetailId;
        } catch (error) {
            // Chỉ log nếu không phải lỗi 500 (có thể do product detail chưa tồn tại)
            if (error.response?.status !== 500) {
                console.error('Error fetching product detail ID:', error.response?.status || error.message);
            }
            throw error;
        }
    },

    // Lấy chi tiết nguyên liệu của mâm cúng theo productDetailId
    // GET /api/product-details/{productDetailId}/details
    getProductDetailIngredients: async (productDetailId) => {
        try {
            const response = await api.get(`/api/product-details/${productDetailId}/details`);
            // Response structure:
            // {
            //   "productDetailId": 0,
            //   "productId": 0,
            //   "productName": "string",
            //   "price": 0,
            //   "categoryName": "string",
            //   "regionName": "string",
            //   "checklists": [...]
            // }
            return response.data;
        } catch (error) {
            console.error('Error fetching product detail ingredients:', error);
            throw error;
        }
    },

    // Lấy product detail với checklists đầy đủ (alias của getProductDetailIngredients)
    // GET /api/product-details/{productDetailId}/details
    getProductDetailWithChecklists: async (productDetailId) => {
        try {
            const response = await api.get(`/api/product-details/${productDetailId}/details`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product detail with checklists:', error);
            throw error;
        }
    },

    // Tạo product detail mới
    // POST /api/product-details
    createProductDetail: async (productId) => {
        try {
            const response = await api.post('/api/product-details', {
                productId: productId
            });
            return response.data;
        } catch (error) {
            // Log lỗi nhưng không spam console
            if (error.response?.status !== 500) {
                console.error('Error creating product detail:', error.response?.status || error.message);
            }
            throw error;
        }
    },

    // Cập nhật product detail
    // PUT /api/product-details/{id}
    updateProductDetail: async (productDetailId, productDetailData) => {
        try {
            const response = await api.put(`/api/product-details/${productDetailId}`, productDetailData);
            return response.data;
        } catch (error) {
            console.error('Error updating product detail:', error);
            throw error;
        }
    },

    // Assign checklists to product detail
    // POST /api/product-details/{productDetailId}/assign-checklists
    assignChecklistsToProductDetail: async (productDetailId, checklistIds) => {
        try {
            const response = await api.post(`/api/product-details/${productDetailId}/assign-checklists`, {
                checklistIds: checklistIds
            });
            return response.data;
        } catch (error) {
            console.error('Error assigning checklists:', error);
            throw error;
        }
    },

    // Xóa product detail
    // DELETE /api/product-details/{id}
    deleteProductDetail: async (productDetailId) => {
        try {
            const response = await api.delete(`/api/product-details/${productDetailId}`);
            return response.data || { success: true };
        } catch (error) {
            console.error('Error deleting product detail:', error);
            throw error;
        }
    },

    // Hàm cũ - giữ lại để tương thích ngược (deprecated)
    // GET /api/product-details/by-product/{productId}
    getProductDetails: async (productId) => {
        if (!productId) {
            throw new Error('Product ID is required to fetch details.');
        }
        
        try {
            const response = await api.get(`/api/product-details/by-product/${productId}`);
            const data = response?.data;

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
    }
};

export default productDetailService;