import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../services/productDetailService';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/ToastContainer';

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      console.log('Fetching details for productId:', productId);
      const response = await getProductDetails(productId);
      console.log('API Response:', response);

      if (response?.data) {
        let productData;
        if (response.data.content) {
          // Nếu response là từ API filter
          const filteredProduct = response.data.content.find(p => p.productId.toString() === productId);
          if (filteredProduct) {
            productData = {
              productDetailId: filteredProduct.productId,
              product: {
                productId: filteredProduct.productId,
                productName: filteredProduct.productName,
                productDescription: filteredProduct.productDescription,
                productImage: filteredProduct.productImage,
                price: filteredProduct.price,
                category: {
                  categoryId: filteredProduct.categoryId,
                  categoryName: filteredProduct.categoryName
                },
                region: {
                  regionId: filteredProduct.regionId,
                  regionName: filteredProduct.regionName
                }
              }
            };
          }
        } else {
          // Nếu response là từ API get detail
          productData = response.data;
        }

        if (productData) {
          console.log('Setting product state with:', productData);
          setProduct(productData);
        } else {
          console.log('Product not found');
          setProduct(null);
          showError('Không tìm thấy thông tin sản phẩm');
        }
      } else {
        console.log('Invalid response data');
        setProduct(null);
        showError('Không thể tải thông tin sản phẩm');
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
    if (!product || !product.product) return;

    const cartItem = {
      id: product.productDetailId,
      name: product.product?.productName || 'Unknown Product',
      price: product.product?.price || 0,
      quantity: quantity,
      image: product.product?.productImage || ''
    };

    try {
      addToCart(cartItem);
      showSuccess('Sản phẩm đã được thêm vào giỏ hàng');
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

  if (!product || !product.product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-4">Mã sản phẩm: {productId}</p>
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

  if (!product.product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dữ liệu sản phẩm không hợp lệ</h2>
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
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={product.product?.productImage || 'https://via.placeholder.com/400x400'}
            alt={product.product?.productName || 'Product Image'}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.product?.productName}</h1>
          
          <div className="text-xl font-semibold text-vietnam-red">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.product?.price || 0)}
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold">Mô tả sản phẩm:</h3>
            <p>{product.product?.productDescription || 'Chưa có mô tả'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium">Số lượng:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-vietnam-red focus:border-vietnam-red"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-vietnam-red text-white py-3 px-6 rounded-md hover:bg-vietnam-gold transition-colors duration-300"
            >
              Thêm vào giỏ hàng
            </button>
          </div>

          {/* Additional Details */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Chi tiết bổ sung:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Danh mục:</p>
                <p className="font-medium">
                  {product.product?.category?.categoryName || 'Chưa phân loại'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Khu vực:</p>
                <p className="font-medium">
                  {product.product?.region?.regionName || 'Chưa xác định'}
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