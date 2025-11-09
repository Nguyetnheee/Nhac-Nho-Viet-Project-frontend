import api from './api';

const productService = {
    // Lấy danh sách sản phẩm
    getAllProducts: async () => {
        try {
            const response = await api.get('/api/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Lấy chi tiết sản phẩm theo ID - API MỚI
    getProductById: async (productId) => {
        try {
            console.log('Fetching product by ID:', productId);
            const response = await api.get(`/api/products/${productId}`);
            console.log('Product details response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            throw error;
        }
    },

    // Tạo sản phẩm mới với file upload
    createProduct: async (productData, file = null) => {
        try {
            const formData = new FormData();

            // Thêm các thông tin sản phẩm
            formData.append('productName', productData.productName);
            formData.append('price', productData.price);
            formData.append('productDescription', productData.productDescription);
            formData.append('categoryId', productData.categoryId);
            formData.append('regionId', productData.regionId);
            formData.append('productStatus', productData.productStatus);

            // Thêm file nếu có
            if (file) {
                formData.append('file', file);
            }

            console.log('Creating product with FormData...');
            const response = await api.post('/api/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Cập nhật sản phẩm với file upload
    updateProduct: async (productId, productData, file = null) => {
        try {
            const formData = new FormData();

            // Thêm các thông tin sản phẩm
            formData.append('productName', productData.productName);
            formData.append('price', productData.price);
            formData.append('productDescription', productData.productDescription);
            formData.append('categoryId', productData.categoryId);
            formData.append('regionId', productData.regionId);
            formData.append('productStatus', productData.productStatus);

            // Thêm file mới nếu có (không bắt buộc khi edit)
            if (file) {
                formData.append('file', file);
            }

            console.log('Updating product with FormData...', { productId, productData, hasFile: !!file });
            const response = await api.put(`/api/products/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Xóa sản phẩm
    deleteProduct: async (productId) => {
        try {
            console.log('Deleting product:', productId);
            const response = await api.delete(`/api/products/${productId}`);
            console.log('Delete response:', response);

            // API trả về 204 No Content, không có response.data
            return { success: true, message: 'Deleted successfully' };
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Lấy productDetailId từ productId (dành cho staff - có token)
    getProductDetailIdByProductId: async (productId) => {
        try {
            console.log('Fetching product detail ID for productId:', productId);
            const response = await api.get(`/api/product-details/by-product/${productId}`);
            const data = response?.data;
            
            console.log('Product details response:', data);
            
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Product details not found');
            }
            
            // Lấy productDetailId từ phần tử đầu tiên
            const firstDetail = data[0];
            return firstDetail.productDetailId;
        } catch (error) {
            console.error('Error fetching product detail ID:', error);
            throw error;
        }
    },

    // Lấy chi tiết nguyên liệu của mâm cúng theo productDetailId
    // GET /api/product-details/{productDetailId}/details
    getProductDetailIngredients: async (productDetailId) => {
        try {
            console.log('Fetching product detail ingredients for productDetailId:', productDetailId);
            const response = await api.get(`/api/product-details/${productDetailId}/details`);
            console.log('Product detail ingredients response:', response.data);
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

    // Lấy product detail với checklists đầy đủ (dành cho edit)
    // GET /api/product-details/{productDetailId}/details
    getProductDetailWithChecklists: async (productDetailId) => {
        try {
            console.log('Fetching product detail with checklists for productDetailId:', productDetailId);
            const response = await api.get(`/api/product-details/${productDetailId}/details`);
            console.log('Product detail with checklists response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching product detail with checklists:', error);
            throw error;
        }
    },

    // Cập nhật product detail với checklists
    // PUT /api/product-details/{id}
    updateProductDetail: async (productDetailId, productDetailData) => {
        try {
            console.log('Updating product detail:', productDetailId, productDetailData);
            const response = await api.put(`/api/product-details/${productDetailId}`, productDetailData);
            console.log('Product detail updated response:', response.data);
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
            console.log('Assigning checklists to product detail:', productDetailId, checklistIds);
            const response = await api.post(`/api/product-details/${productDetailId}/assign-checklists`, {
                checklistIds: checklistIds
            });
            console.log('Checklists assigned response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error assigning checklists:', error);
            throw error;
        }
    }
};

export default productService;