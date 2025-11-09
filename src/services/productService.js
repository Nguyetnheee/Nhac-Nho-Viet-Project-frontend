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

};

export default productService;