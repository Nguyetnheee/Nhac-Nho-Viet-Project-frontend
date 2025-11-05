import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useToast } from '../components/ToastContainer';
import api from '../services/api';

const PendingOrderDetail = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy orderId từ URL params hoặc route param
  const orderId = paramOrderId || searchParams.get('orderId') || searchParams.get('orderCode');

  // Format tiền VNĐ
  const formatMoney = (amount) => {
    const validAmount = Number(amount || 0);
    if (isNaN(validAmount)) {
      return '0 VNĐ';
    }
    return new Intl.NumberFormat('vi-VN').format(validAmount) + ' VNĐ';
  };

  // Format ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      console.log('📤 Fetching pending order details for orderId:', orderId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Vui lòng đăng nhập để xem đơn hàng');
        navigate('/login');
        return;
      }

      // Gọi API chi tiết đơn hàng theo orderId (có đầy đủ thông tin)
      const detailResponse = await api.get(`/api/customer/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📦 Order detail response:', detailResponse.data);
      
      const orderDetail = detailResponse.data.data || detailResponse.data;
      console.log('✅ Order details:', orderDetail);

      // Gọi API danh sách orders để lấy thông tin khách hàng (receiverName, phone, address)
      const ordersResponse = await api.get('/api/customer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📦 All customer orders:', ordersResponse.data);
      
      // Tìm order theo orderId trong danh sách để lấy thông tin khách hàng
      const orders = ordersResponse.data.data || ordersResponse.data;
      const foundOrder = Array.isArray(orders) 
        ? orders.find(o => o.orderId === parseInt(orderId) || o.orderCode === orderId)
        : null;

      if (foundOrder) {
        console.log('👤 Customer info from list:', {
          receiverName: foundOrder.receiverName,
          phone: foundOrder.phone,
          address: foundOrder.address
        });
        
        // Merge: lấy items từ detail API, thông tin khách hàng từ list API
        setOrderData({
          ...orderDetail,
          receiverName: foundOrder.receiverName,
          phone: foundOrder.phone,
          address: foundOrder.address
        });
      } else {
        // Nếu không tìm thấy trong list (có thể do phân trang), chỉ dùng detail API
        console.log('⚠️ Order not found in list, using detail API only');
        setOrderData(orderDetail);
      }

      // Kiểm tra nếu đơn hàng đã thanh toán thành công -> redirect sang OrderSuccess
      const orderStatus = orderDetail.status || orderDetail.orderStatus;
      if (orderStatus === 'PAID' || orderStatus === 'CONFIRMED' || 
          orderStatus === 'PROCESSING' || orderStatus === 'SHIPPING' || 
          orderStatus === 'DELIVERED' || orderStatus === 'COMPLETED') {
        console.log('✅ Order is paid, redirecting to OrderSuccess');
        navigate(`/order-success/${orderId}`);
        return;
      }

    } catch (error) {
      console.error('❌ Fetch pending order error:', error);
      showError('Không thể tải thông tin đơn hàng');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      showError('Không tìm thấy mã đơn hàng');
      navigate('/trays');
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-vietnam-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-vietnam-green mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state - no order data
  if (!orderData) {
    return (
      <div className="min-h-screen bg-vietnam-cream py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <CloseCircleOutlined className="text-6xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc bạn không có quyền truy cập</p>
            <button 
              onClick={() => navigate('/trays')}
              className="btn-primary px-8 py-3"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Xác định trạng thái và icon
  const getStatusInfo = () => {
    const status = orderData.status || orderData.orderStatus || 'PENDING';
    
    switch(status) {
      case 'PENDING':
        return {
          icon: <ClockCircleOutlined className="text-6xl text-yellow-500" />,
          title: 'Thanh toán chưa hoàn thành',
          message: 'Bạn đã hủy thanh toán. Đơn hàng này sẽ tự động bị xóa. Vui lòng chọn lại sản phẩm và tạo đơn hàng mới.',
          color: 'yellow'
        };
      case 'CANCELLED':
        return {
          icon: <CloseCircleOutlined className="text-6xl text-red-500" />,
          title: 'Đơn hàng đã bị hủy',
          message: 'Đơn hàng này đã bị hủy do chưa thanh toán. Bạn có thể tạo đơn hàng mới với các sản phẩm yêu thích.',
          color: 'red'
        };
      default:
        return {
          icon: <WarningOutlined className="text-6xl text-orange-500" />,
          title: 'Đơn hàng chưa hoàn thành',
          message: 'Đơn hàng của bạn chưa được thanh toán thành công.',
          color: 'orange'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-vietnam-cream py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Status */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          {statusInfo.icon}
          <h1 className="text-3xl font-serif font-bold text-gray-800 mt-4 mb-2">
            {statusInfo.title}
          </h1>
          <p className="text-gray-600">{statusInfo.message}</p>
        </div>

        {/* Warning Banner */}
        {(orderData.status === 'PENDING' || orderData.orderStatus === 'PENDING') && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex items-start">
              <CloseCircleOutlined className="text-red-600 text-xl mr-3 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Đơn hàng sẽ bị xóa</h3>
                <p className="text-sm text-red-700 mt-1">
                  Do bạn đã hủy thanh toán, đơn hàng này sẽ tự động bị xóa khỏi hệ thống. 
                  Nếu vẫn muốn mua các sản phẩm này, vui lòng thêm vào giỏ hàng và tạo đơn mới.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {(orderData.status === 'CANCELLED' || orderData.orderStatus === 'CANCELLED') && (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6 rounded">
            <div className="flex items-start">
              <WarningOutlined className="text-gray-600 text-xl mr-3 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-gray-800">Đơn hàng đã được hủy</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Đơn hàng này đã bị hủy do chưa hoàn tất thanh toán. 
                  Bạn có thể xem lại thông tin đơn hàng và tạo đơn mới nếu cần.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-vietnam-green mb-4 flex items-center">
                <ShoppingCartOutlined className="mr-2" />
                Thông tin đơn hàng
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="font-semibold text-vietnam-green">
                    {orderData.orderCode || `#${orderData.orderId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-semibold">{formatDateTime(orderData.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                    ${(orderData.status || orderData.orderStatus) === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      (orderData.status || orderData.orderStatus) === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {(orderData.status || orderData.orderStatus) === 'PENDING' ? 'Chờ thanh toán' :
                     (orderData.status || orderData.orderStatus) === 'CANCELLED' ? 'Đã hủy' : 
                     (orderData.status || orderData.orderStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-semibold">Chuyển khoản ngân hàng</p>
                </div>
              </div>

              {/* Products List */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Sản phẩm đã đặt</h3>
                <div className="space-y-3">
                  {orderData.items && orderData.items.length > 0 ? (
                    orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-vietnam-green">{item.productName}</h4>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-vietnam-green">{formatMoney(item.price)}</p>
                          <p className="text-sm text-gray-600">
                            Tổng: {formatMoney(item.subtotal || (item.price * item.quantity))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có thông tin sản phẩm</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-vietnam-green mb-4 flex items-center">
                <EnvironmentOutlined className="mr-2" />
                Thông tin giao hàng
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <UserOutlined className="text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Người nhận</p>
                    <p className="font-semibold">
                      {orderData.receiverName || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneOutlined className="text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">
                      {orderData.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <EnvironmentOutlined className="text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                    <p className="font-semibold">
                      {orderData.address || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            
            {/* Price Summary Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-vietnam-green mb-4">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatMoney(orderData.totalPrice)}</span>
                </div>
                
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <TagOutlined />
                      Giảm giá:
                    </span>
                    <span className="font-semibold">-{formatMoney(orderData.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Phí giao hàng:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-vietnam-green">
                    <span>Tổng cộng:</span>
                    <span>{formatMoney(orderData.totalPrice - (orderData.discountAmount || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Nút chính - Tiếp tục mua sắm */}
                <button
                  onClick={() => navigate('/trays')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCartOutlined />
                  Tiếp tục mua sắm
                </button>

                {/* Nút phụ - Xem giỏ hàng */}
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-white border-2 border-vietnam-green text-vietnam-green px-6 py-3 rounded-lg font-semibold hover:bg-vietnam-cream transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCartOutlined />
                  Xem giỏ hàng
                </button>

                {/* Link xem tất cả đơn hàng */}
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-vietnam-green hover:underline text-sm"
                >
                  Xem tất cả đơn hàng
                </button>
              </div>

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
                <p className="text-sm text-vietnam-green font-semibold">
                  Hotline: 1900 xxxx
                </p>
                <p className="text-sm text-gray-600">
                  Email: support@nhacnhoviet.vn
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PendingOrderDetail;
