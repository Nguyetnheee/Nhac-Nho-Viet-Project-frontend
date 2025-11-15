import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trayService } from '../services/trayService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastContainer';
import { WarningOutlined, StarFilled, UserOutlined } from '@ant-design/icons';
import api from '../services/api';
const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID theo tên param trong route /trays/:id
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // State quantity
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPagination, setFeedbackPagination] = useState({
    current: 0,
    pageSize: 5,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
      fetchFeedbacks(0); // Load feedbacks trang đầu tiên
    } else {
      setLoading(false);
    }
  }, [id]);

  // Fetch feedbacks từ API
  const fetchFeedbacks = async (page = 0) => {
    try {
      setFeedbackLoading(true);
      console.log('📤 Fetching feedbacks - page:', page);
      
      const response = await api.get('/api/feedbacks', {
        params: {
          page: page,
          size: feedbackPagination.pageSize,
          sort: 'createdAt,desc' // Sắp xếp mới nhất trước
        }
      });
      
      console.log('✅ Feedbacks response:', response.data);
      
      const data = response.data;
      
      setFeedbacks(data.content || []);
      setFeedbackPagination({
        current: data.number || 0,
        pageSize: data.size || 5,
        total: data.totalElements || 0,
        totalPages: data.totalPages || 0
      });
      
      setFeedbackLoading(false);
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      setFeedbacks([]);
      setFeedbackLoading(false);
    }
  };

  const handleFeedbackPageChange = (newPage) => {
    fetchFeedbacks(newPage);
  };

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
      showError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      setProduct(null);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      showError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    const cartItem = {
      id: product.productId,
      productId: product.productId,
      name: product.productName || 'Unknown Product',
      price: product.price || 0,
      quantity: quantity,
      image: product.productImage || ''
    };

    try {
      // Truyền cả object và quantity riêng biệt
      addToCart(cartItem, quantity);
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
            className="text-vietnam-green hover:text-vietnam-gold transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarFilled
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Tính trung bình sao
  const calculateAverageRating = () => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, fb) => acc + (fb.star || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-100">
          <img
            src={product.productImage || 'https://via.placeholder.com/400x400'}
            alt={product.productName || 'Product Image'}
            className="w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-serif font-bold text-vietnam-green">{product.productName}</h1>

          <div className="text-3xl font-bold text-vietnam-green border-b pb-4">
            {(product.price || 0).toLocaleString('vi-VN')} VNĐ
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
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-vietnam-green focus:border-vietnam-green text-center shadow-sm"
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.productStatus === 'UNAVAILABLE'}
              className={`w-full py-3 px-6 rounded-md transition-colors duration-300 font-bold text-lg shadow-lg ${
                product.productStatus === 'UNAVAILABLE'
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-vietnam-green text-white hover:bg-emerald-700'
              }`}
            >
              {isAuthenticated ? 'Thêm vào giỏ hàng' : 'Đăng nhập để mua hàng'}
            </button>

            {/* Banner thông báo hết hàng */}
            {product.productStatus === 'UNAVAILABLE' && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-md">
                <p className="text-red-700 font-semibold text-center">
                  <WarningOutlined />
                  <span> Sản phẩm này tạm thời hết hàng, vui lòng quay lại sau</span>
                </p>
              </div>
            )}
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

      {/* Feedbacks Section */}
      <div className="mt-12 border-t pt-8">
        <div className="mb-6">
          <h2 className="text-3xl font-serif font-bold text-vietnam-green mb-2">
            Đánh giá từ khách hàng
          </h2>
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <StarFilled className="text-yellow-400 text-xl" />
                <span className="text-2xl font-bold text-vietnam-green">
                  {calculateAverageRating()}
                </span>
                <span className="text-sm">/ 5.0</span>
              </div>
              <span className="text-sm">
                ({feedbackPagination.total} đánh giá)
              </span>
            </div>
          )}
        </div>

        {feedbackLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-vietnam-green mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải đánh giá...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">Chưa có đánh giá nào cho sản phẩm này</p>
            <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.fbId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-vietnam-green/10 flex items-center justify-center">
                      <UserOutlined className="text-vietnam-green text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {feedback.userName || 'Khách hàng'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>
                  </div>
                  {renderStars(feedback.star)}
                </div>

                {feedback.content && (
                  <p className="text-gray-700 leading-relaxed ml-13">
                    {feedback.content}
                  </p>
                )}
              </div>
            ))}

            {/* Pagination */}
            {feedbackPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handleFeedbackPageChange(feedbackPagination.current - 1)}
                  disabled={feedbackPagination.current === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(feedbackPagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleFeedbackPageChange(index)}
                      className={`w-10 h-10 rounded-md transition-colors ${
                        index === feedbackPagination.current
                          ? 'bg-vietnam-green text-white font-bold'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleFeedbackPageChange(feedbackPagination.current + 1)}
                  disabled={feedbackPagination.current >= feedbackPagination.totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;