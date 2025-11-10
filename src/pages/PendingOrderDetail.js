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
  TagOutlined,
  MailOutlined,
  FacebookOutlined
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
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
      
      // ⭐ QUY TẮC: PENDING (Chờ thanh toán) được xử lý như CANCELLED (Đã hủy)
      let normalizedStatus = orderDetail.status || orderDetail.orderStatus;
      if (normalizedStatus === 'PENDING' || normalizedStatus === 'pending') {
        console.log(`🔄 Mapping PENDING to CANCELLED for Order #${orderDetail.orderId || orderDetail.orderCode}`);
        normalizedStatus = 'CANCELLED';
      }
      
      // ✅ Map các field name từ backend - LẤY ĐÚNG GIÁ TRỊ TỪ BACKEND, KHÔNG TỰ TÍNH TOÁN
      const mappedOrderDetail = {
        ...orderDetail,
        orderId: orderDetail.orderId || orderDetail.id,
        orderCode: orderDetail.orderCode || orderDetail.orderId || orderDetail.id,
        orderDate: orderDetail.orderDate || orderDetail.createdAt || orderDetail.createdDate,
        status: normalizedStatus,
        orderStatus: normalizedStatus,
        // ✅ Lấy subTotal (tạm tính trước khi giảm giá) - giá trị gốc từ lúc checkout
        subTotal: orderDetail.subTotal || orderDetail.subtotal || orderDetail.sub_total || 
                  orderDetail.totalPrice || orderDetail.total || 0,
        // ✅ Lấy discountAmount (số tiền giảm giá) - giá trị chính xác từ lúc checkout
        discountAmount: orderDetail.discountAmount || orderDetail.discount || 0,
        // ✅ Lấy totalAmount (tổng sau khi trừ discount) - giá trị chính xác từ lúc checkout
        totalAmount: orderDetail.totalAmount || orderDetail.finalAmount || 
                     orderDetail.totalPrice || orderDetail.total || 0,
        // ✅ Lấy voucherCode để hiển thị mã voucher đã áp dụng
        voucherCode: orderDetail.voucherCode || orderDetail.voucher_code || null,
        // Thông tin khách hàng từ detail API
        receiverName: orderDetail.receiverName || orderDetail.customerName || orderDetail.fullName || orderDetail.name || '',
        phone: orderDetail.phone || orderDetail.customerPhone || orderDetail.phoneNumber || '',
        address: orderDetail.address || orderDetail.customerAddress || orderDetail.shippingAddress || '',
        email: orderDetail.email || orderDetail.customerEmail || '',
      };
      
      console.log('✅ Mapped order details:', mappedOrderDetail);
      console.log('💰 Price breakdown from backend:', {
        subTotal: mappedOrderDetail.subTotal,
        discountAmount: mappedOrderDetail.discountAmount,
        totalAmount: mappedOrderDetail.totalAmount,
        voucherCode: mappedOrderDetail.voucherCode,
        note: 'These values are EXACTLY as saved during checkout - no recalculation'
      });

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
        
        // Merge: ưu tiên thông tin từ list API (nếu có) - CHỈ merge thông tin khách hàng
        // ✅ QUAN TRỌNG: Giữ nguyên giá tiền và voucher từ detail API (mappedOrderDetail)
        // KHÔNG được lấy từ foundOrder vì có thể không chính xác
        setOrderData({
          ...mappedOrderDetail, // ✅ Giữ nguyên tất cả giá tiền, voucher từ detail API
          receiverName: foundOrder.receiverName || mappedOrderDetail.receiverName,
          phone: foundOrder.phone || mappedOrderDetail.phone,
          address: foundOrder.address || mappedOrderDetail.address,
          email: foundOrder.email || mappedOrderDetail.email,
          // ✅ Đảm bảo giá tiền và voucher không bị ghi đè
          subTotal: mappedOrderDetail.subTotal,
          discountAmount: mappedOrderDetail.discountAmount,
          totalAmount: mappedOrderDetail.totalAmount,
          voucherCode: mappedOrderDetail.voucherCode,
        });
      } else {
        // Nếu không tìm thấy trong list (có thể do phân trang), chỉ dùng detail API
        console.log('⚠️ Order not found in list, using detail API only');
        setOrderData(mappedOrderDetail);
      }

      // Kiểm tra nếu đơn hàng đã thanh toán thành công -> redirect sang OrderSuccess
      const orderStatus = mappedOrderDetail.status || mappedOrderDetail.orderStatus;
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

  // Hàm map status sang tiếng Việt
  const getStatusText = (status) => {
    const statusMap = {
      'PAID': 'Đã thanh toán',
      'CONFIRMED': 'Đang chuẩn bị',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao',
      'DELIVERED': 'Đã giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'PENDING': 'Đã hủy' // PENDING được map thành CANCELLED
    };
    return statusMap[status] || status;
  };

  // Xác định trạng thái và icon
  const getStatusInfo = () => {
    // ⭐ QUY TẮC: PENDING được xử lý như CANCELLED
    let status = orderData.status || orderData.orderStatus || 'CANCELLED';
    if (status === 'PENDING' || status === 'pending') {
      status = 'CANCELLED';
    }
    
    switch(status) {
      case 'CANCELLED':
        return {
          icon: <CloseCircleOutlined className="text-6xl text-red-500" />,
          title: 'Đơn hàng đã bị hủy',
          message: 'Đơn hàng này đã bị hủy do chưa thanh toán (khách hàng đã hủy hoặc thoát thanh toán). Bạn có thể tạo đơn hàng mới với các sản phẩm yêu thích.',
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

        {/* Warning Banner - PENDING đã được map thành CANCELLED */}
        {(orderData.status === 'CANCELLED' || orderData.orderStatus === 'CANCELLED') && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex items-start">
              <CloseCircleOutlined className="text-red-600 text-xl mr-3 mt-1" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Đơn hàng đã bị hủy</h3>
                <p className="text-sm text-red-700 mt-1">
                  Đơn hàng này đã bị hủy do chưa hoàn tất thanh toán (bạn đã hủy hoặc thoát thanh toán). 
                  Nếu vẫn muốn mua các sản phẩm này, vui lòng thêm vào giỏ hàng và tạo đơn mới.
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
                    {orderData.orderCode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-semibold">{formatDateTime(orderData.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                    ${(orderData.status || orderData.orderStatus) === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                      (orderData.status || orderData.orderStatus) === 'PAID' ? 'bg-yellow-100 text-yellow-800' :
                      (orderData.status || orderData.orderStatus) === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      (orderData.status || orderData.orderStatus) === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                      (orderData.status || orderData.orderStatus) === 'SHIPPING' ? 'bg-indigo-100 text-indigo-800' :
                      (orderData.status || orderData.orderStatus) === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      (orderData.status || orderData.orderStatus) === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {getStatusText(orderData.status || orderData.orderStatus)}
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
                          <p className="font-semibold text-vietnam-green">{(item.price).toLocaleString('vi-VN')} VNĐ</p>
                          <p className="text-sm text-gray-600">
                            Tổng: {(item.subtotal || (item.price * item.quantity)).toLocaleString('vi-VN')} VNĐ
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
                {/* ✅ Nếu có voucher: CHỈ hiển thị tổng cộng (giá cuối cùng) để tránh trừ chồng */}
                {orderData.voucherCode || orderData.discountAmount > 0 ? (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span>Phí giao hàng:</span>
                      <span className="font-medium text-green-600">Miễn phí</span>
                    </div>
                    
                    {/* ✅ Chỉ hiển thị tổng cộng - giá cuối cùng đã được tính sẵn từ lúc checkout */}
                    <div className="border-t-2 border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-xl font-bold text-vietnam-green">
                        <span>Tổng cộng:</span>
                        <span>{(orderData.totalAmount || 0).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      {orderData.voucherCode && (
                        <p className="text-sm text-green-600 text-right mt-1">
                          ✓ Đã áp dụng mã giảm giá {orderData.voucherCode}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* ✅ Nếu không có voucher: hiển thị breakdown bình thường */}
                    <div className="flex justify-between text-gray-700">
                      <span>Tạm tính:</span>
                      <span className="font-medium">{(orderData.subTotal || orderData.totalAmount || 0).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-700">
                      <span>Phí giao hàng:</span>
                      <span className="font-medium text-green-600">Miễn phí</span>
                    </div>
                    
                    <div className="border-t-2 border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-xl font-bold text-vietnam-green">
                        <span>Tổng cộng:</span>
                        <span>{(orderData.totalAmount || orderData.subTotal || 0).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>
                  </>
                )}
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


                {/* Link xem tất cả đơn hàng */}
                <button
                  onClick={() => navigate('/profile?tab=orders')}
                  className="w-full text-vietnam-green hover:underline text-sm"
                >
                  Xem tất cả đơn hàng
                </button>
              </div>

              {/* Help Section */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Cần liên hệ?</p>
                <div className="space-y-1">
                  <p className="text-sm text-vietnam-green font-semibold">
                    <PhoneOutlined className="mr-1" />
                    Hotline: 0366 852 182
                  </p>
                  <p className="text-sm text-gray-600">
                    <MailOutlined className="mr-1" />
                    <b>Email: </b>nhacnhoviet1@gmail.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <FacebookOutlined className="mr-1" />
                    <b>Facebook: </b>Nhắc Nhớ Việt
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PendingOrderDetail;
