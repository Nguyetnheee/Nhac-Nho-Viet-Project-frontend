import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trayService } from '../services/trayService'; 
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ToastContainer';

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID theo tên param trong route /trays/:id
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // State quantity

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  // HÀM FETCH (Sử dụng API /api/products/{id})
  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true);
      console.log('Fetching product details for ID:', productId);
      
      const response = await trayService.getTrayById(productId);
      const data = response?.data;
      
      console.log('API Response:', data);

      if (data && data.productId) {
        setProduct(data); 
      } else {
        setProduct(null);
        showError('Không tìm thấy thông tin sản phẩm');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      showError('Có lỗi xảy ra khi tải thông tin sản phẩm');
      setProduct(null);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.productId, 
      name: product.productName || 'Unknown Product',
      price: product.price || 0,
      // ⚠️ ĐÃ SỬA LỖI: Dùng state quantity thay vì giá trị cứng
      quantity: quantity, 
      image: product.productImage || ''
    };

    try {
      addToCart(cartItem);
      showSuccess(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error) {
      showError('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-4">Mã sản phẩm: {id}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-vietnam-red hover:text-vietnam-gold transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100">
          <img
            src={product.productImage || 'https://via.placeholder.com/400x400'}
            alt={product.productName || 'Product Image'}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-serif font-bold text-vietnam-red">{product.productName}</h1>
          
          <div className="text-3xl font-bold text-vietnam-red border-b pb-4">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.price || 0)}
          </div>

          <div className="prose max-w-none text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm:</h3>
            <p className='text-base'>{product.productDescription || 'Chưa có mô tả'}</p>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium text-lg text-gray-700">Số lượng:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                // Cập nhật state quantity khi người dùng thay đổi
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-vietnam-red focus:border-vietnam-red text-center shadow-sm"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-vietnam-red text-white py-3 px-6 rounded-md hover:bg-red-700 transition-colors duration-300 font-bold text-lg shadow-lg"
            >
              Thêm vào giỏ hàng
            </button>
          </div>

          {/* Additional Details */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin chi tiết:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Danh mục:</p>
                <p className="font-medium text-gray-800">
                  {product.categoryName || 'Chưa phân loại'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Khu vực:</p>
                <p className="font-medium text-gray-800">
                  {product.regionName || 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;