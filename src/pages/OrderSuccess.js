import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { translateToVietnamese } from '../utils/errorMessages';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CarOutlined, 
  SmileOutlined,
  CloseCircleOutlined,
  TagOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

// Order status mapping
const ORDER_STATUS_MAP = {
  'PENDING': { label: 'Chờ thanh toán', step: 0, color: 'bg-gray-500' },
  'PAID': { label: 'Đã thanh toán', step: 1, color: 'bg-yellow-500' },
  'CONFIRMED': { label: 'Đã xác nhận', step: 2, color: 'bg-blue-500' },
  'PROCESSING': { label: 'Đang xử lý', step: 3, color: 'bg-indigo-500' },
  'SHIPPING': { label: 'Đang giao hàng', step: 4, color: 'bg-purple-500' },
  'DELIVERED': { label: 'Đã giao hàng', step: 5, color: 'bg-green-500' },
  'COMPLETED': { label: 'Hoàn thành', step: 6, color: 'bg-emerald-600' },
  'CANCELLED': { label: 'Đã hủy', step: -1, color: 'bg-red-500' },
};

const OrderSuccess = () => {
  const { orderId: paramOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [cartCleared, setCartCleared] = useState(false);

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
      console.log('📤 Fetching order details for orderId:', orderId);
      
      // DEBUG: Kiểm tra token và authorization
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      console.log('🔐 Auth Debug:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'NO TOKEN',
        role: role,
        endpoint: `/api/customer/orders/${orderId}`
      });

      // Thử decode token để kiểm tra authorities
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('🔓 JWT Payload:', {
              sub: payload.sub,
              authorities: payload.authorities || payload.roles,
              exp: new Date(payload.exp * 1000).toLocaleString('vi-VN'),
              isExpired: payload.exp * 1000 < Date.now()
            });
            
            // Kiểm tra token hết hạn
            if (payload.exp * 1000 < Date.now()) {
              showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
              setTimeout(() => {
                localStorage.clear();
                navigate('/login');
              }, 2000);
              return;
            }
          }
        } catch (decodeError) {
          console.error('❌ Cannot decode token:', decodeError);
        }
      }
      
      let response = null;
      let lastError = null;

      // Thử nhiều endpoint khác nhau với cả authenticated và public endpoints
      const endpoints = [
        { url: `/api/customer/orders/${orderId}`, auth: true },  // Endpoint chính (authenticated)
        { url: `/api/orders/${orderId}`, auth: true },           // Endpoint phụ (authenticated)
        { url: `/api/customer/order/${orderId}`, auth: true },   // Singular form (authenticated)
        { url: `/api/public/orders/${orderId}`, auth: false },   // Public endpoint (không cần auth)
        { url: `/api/orders/public/${orderId}`, auth: false },   // Public endpoint variant
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint.url} (auth: ${endpoint.auth})`);
          
          if (endpoint.auth) {
            response = await api.get(endpoint.url);
          } else {
            // Thử endpoint public (không gửi token)
            response = await api.get(endpoint.url, {
              headers: { 'X-Skip-Auth': 'true' }
            });
          }
          
          console.log(`✅ Success with endpoint: ${endpoint.url}`, response.data);
          break; // Thành công thì thoát vòng lặp
        } catch (err) {
          console.warn(`❌ Failed endpoint ${endpoint.url}:`, {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
          });
          lastError = err;
          // Tiếp tục thử endpoint tiếp theo
        }
      }

      // Nếu tất cả endpoint đều thất bại
      if (!response) {
        console.error('🚨 ALL ENDPOINTS FAILED - This is likely a backend issue');
        console.error('📋 Tested endpoints:', endpoints.map(e => e.url));
        throw lastError || new Error('All endpoints failed');
      }
      
      // Map field names để đảm bảo tương thích với backend
      let rawData = response.data;
      
      // ✅ Kiểm tra nếu data nằm trong nested object
      if (rawData.data) {
        console.log('⚠️ Data is nested in .data property');
        rawData = rawData.data;
      }
      
      // ✅ Log toàn bộ raw data để debug
      console.log('🔍 RAW DATA FROM BACKEND:', JSON.stringify(rawData, null, 2));
      console.log('🔍 All keys in rawData:', Object.keys(rawData));
      
      let mappedData = {
        ...rawData,
        orderStatus: rawData.orderStatus || rawData.status, // Backend có thể dùng 'status' hoặc 'orderStatus'
        orderId: rawData.orderId || rawData.id,
        orderCode: rawData.orderCode || rawData.orderId || rawData.id, // ✅ Lấy orderCode
        orderDate: rawData.orderDate || rawData.createdAt || rawData.createdDate,
        // ✅ Thông tin khách hàng - thử nhiều variations
        customerName: rawData.customerName || rawData.fullName || rawData.name || 
                     rawData.receiverName || rawData.recipientName || 
                     rawData.customer?.name || rawData.customer?.fullName || '',
        customerEmail: rawData.customerEmail || rawData.email || 
                      rawData.customer?.email || rawData.user?.email || '',
        customerPhone: rawData.customerPhone || rawData.phone || rawData.phoneNumber || 
                      rawData.receiverPhone || rawData.customer?.phone || 
                      rawData.customer?.phoneNumber || '',
        customerAddress: rawData.customerAddress || rawData.address || rawData.shippingAddress || 
                        rawData.deliveryAddress || rawData.receiverAddress ||
                        rawData.customer?.address || rawData.shipping?.address || '',
      };
      
      console.log('📊 Order data mapping:', {
        raw: { 
          status: rawData.status, 
          orderStatus: rawData.orderStatus,
          orderCode: rawData.orderCode,
          orderId: rawData.orderId,
          customerName: rawData.customerName,
          fullName: rawData.fullName,
          name: rawData.name,
          receiverName: rawData.receiverName,
          customerEmail: rawData.customerEmail,
          email: rawData.email,
          customerPhone: rawData.customerPhone,
          phone: rawData.phone,
          phoneNumber: rawData.phoneNumber,
          receiverPhone: rawData.receiverPhone,
          customerAddress: rawData.customerAddress,
          address: rawData.address,
          shippingAddress: rawData.shippingAddress,
          deliveryAddress: rawData.deliveryAddress,
          receiverAddress: rawData.receiverAddress,
        },
        mapped: { 
          orderStatus: mappedData.orderStatus,
          orderCode: mappedData.orderCode,
          customerName: mappedData.customerName,
          customerEmail: mappedData.customerEmail,
          customerPhone: mappedData.customerPhone,
          customerAddress: mappedData.customerAddress,
        }
      });
      
      // ✅ KIỂM TRA: Nếu đơn hàng PENDING hoặc CANCELLED -> redirect sang PendingOrderDetail
      const orderStatus = mappedData.orderStatus;
      if (orderStatus === 'PENDING' || orderStatus === 'CANCELLED') {
        console.log('⚠️ Order is PENDING/CANCELLED, redirecting to PendingOrderDetail');
        navigate(`/pending-order/${orderId}`, { replace: true });
        return;
      }
      
      // 🔁 Fallback: Nếu thiếu thông tin giao hàng, lấy từ danh sách đơn hàng của khách
      const missingCustomerInfo = !mappedData.customerName || !mappedData.customerPhone || !mappedData.customerAddress;
      if (missingCustomerInfo) {
        try {
          const listRes = await api.get('/api/customer/orders');
          const listData = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data || []);
          const found = listData.find(o =>
            String(o.orderId) === String(orderId) || String(o.orderCode) === String(orderId)
          );
          if (found) {
            mappedData = {
              ...mappedData,
              customerName: mappedData.customerName || found.receiverName || found.customerName || found.fullName || found.name,
              customerPhone: mappedData.customerPhone || found.phone || found.phoneNumber || found.customerPhone,
              customerAddress: mappedData.customerAddress || found.address || found.customerAddress || found.shippingAddress,
              customerEmail: mappedData.customerEmail || found.email || found.customerEmail,
            };
          }
        } catch (e) {
          console.warn('⚠️ Cannot fetch customer orders list for fallback:', e.response?.status, e.message);
        }
      }

      setOrderData(mappedData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Fetch order details error:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      // Thông báo dễ hiểu cho người dùng
      let errorMessage = 'Không thể tải thông tin đơn hàng';
      if (error.response?.status === 403) {
        errorMessage = `xem đơn hàng này. Vui lòng liên hệ bộ phận hỗ trợ`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại để tiếp tục.';
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.';
      } else if (error.response?.data?.message) {
        // Dịch message từ backend sang tiếng Việt
        errorMessage = translateToVietnamese(error.response.data.message);
      }
      
      showError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) {
      showError('Không tìm thấy mã đơn hàng');
      navigate('/');
      return;
    }

    // 🛒 Clear giỏ hàng khi vào trang này (thanh toán thành công)
    if (!cartCleared) {
      console.log('🛒 Clearing cart after successful payment');
      clearCart();
      setCartCleared(true);
    }

    // Fetch ngay lần đầu
    fetchOrderDetails();

    // Auto refresh mỗi 10 giây để cập nhật trạng thái
    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 10000); // 10 seconds

    setRefreshInterval(interval);

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  // Lấy tiêu đề header theo status
  const getHeaderTitle = () => {
    const status = orderData?.orderStatus;
    
    switch(status) {
      case 'PAID':
        return 'Thanh toán thành công!';
      case 'CONFIRMED':
        return 'Đơn hàng đã được xác nhận!';
      case 'PROCESSING':
        return 'Đơn hàng đang được xử lý!';
      case 'SHIPPING':
        return 'Đơn hàng đang được giao!';
      case 'DELIVERED':
        return 'Đơn hàng đã được giao!';
      case 'COMPLETED':
        return 'Đơn hàng hoàn thành!';
      case 'CANCELLED':
        return 'Đơn hàng đã bị hủy';
      default:
        return 'Thông tin đơn hàng';
    }
  };

  // Get current step based on order status
  const getCurrentStep = () => {
    if (!orderData?.orderStatus) return 0;
    const statusInfo = ORDER_STATUS_MAP[orderData.orderStatus];
    if (!statusInfo) {
      console.warn('⚠️ Unknown status:', orderData.orderStatus);
      return 0;
    }
    return statusInfo.step;
  };

  // Render timeline
  const renderTimeline = () => {
    const currentStep = getCurrentStep();
    const status = orderData?.orderStatus;
    
    console.log('📊 Timeline Debug:', {
      status: status,
      currentStep: currentStep,
      statusMapping: ORDER_STATUS_MAP[status]
    });
    
    // Nếu đơn hàng bị hủy
    if (status === 'CANCELLED') {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center px-6 py-3 bg-red-100 text-red-800 rounded-full">
            <CloseCircleOutlined className="text-xl mr-2" />
            <span className="font-semibold">Đơn hàng đã bị hủy</span>
          </div>
        </div>
      );
    }

    const steps = [
      { step: 1, label: 'Đã thanh toán', Icon: CheckCircleOutlined, status: 'PAID' },
      { step: 2, label: 'Đã xác nhận', Icon: FileTextOutlined, status: 'CONFIRMED' },
      { step: 3, label: 'Đang xử lý', Icon: SyncOutlined, status: 'PROCESSING' },
      { step: 4, label: 'Đang giao', Icon: CarOutlined, status: 'SHIPPING' },
      { step: 5, label: 'Đã giao', Icon: CheckCircleOutlined, status: 'DELIVERED' },
      { step: 6, label: 'Hoàn thành', Icon: SmileOutlined, status: 'COMPLETED' }
    ];

    return (
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-vietnam-green transition-all duration-500"
            style={{ 
              width: currentStep >= 1 
                ? `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
                : '0%'
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((item) => {
            const isCompleted = currentStep >= item.step;
            const isCurrent = currentStep === item.step;
            const { Icon } = item;
            
            return (
              <div key={item.step} className="flex flex-col items-center">
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 border-4 border-white shadow-lg
                    ${isCompleted 
                      ? 'bg-vietnam-green text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                    ${isCurrent ? 'ring-4 ring-vietnam-gold ring-opacity-50 scale-110' : ''}
                  `}
                >
                  <Icon 
                    className={`text-2xl ${isCurrent && isCompleted ? 'animate-pulse' : ''}`}
                    spin={isCurrent && item.step === 3} // Spin icon cho "Đang xử lý"
                  />
                </div>
                <div className={`
                  mt-3 text-xs sm:text-sm font-medium text-center max-w-[80px]
                  ${isCompleted ? 'text-vietnam-green' : 'text-gray-500'}
                  ${isCurrent ? 'font-bold' : ''}
                `}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vietnam-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-vietnam-green mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-vietnam-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Không tìm thấy đơn hàng</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-vietnam-cream py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-bounce">
            <CheckCircleOutlined className="text-5xl text-green-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-vietnam-green mb-2">
            {getHeaderTitle()}
          </h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-vietnam-green overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Order Header */}
            <div className="border-b-2 border-gray-100 pb-6 mb-6">
              <h2 className="text-2xl font-serif font-bold text-vietnam-green mb-4">
                Hóa đơn mua hàng
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt hàng</p>
                  <p className="font-semibold text-gray-800">
                    {formatDateTime(orderData.orderDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold text-vietnam-green text-lg">
                    #{orderData.orderCode || orderData.orderId}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Thông tin khách hàng */}
            <div className="border-b-2 border-gray-100 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-vietnam-green mb-4 flex items-center">
                <UserOutlined className="mr-2" />
                Thông tin giao hàng
              </h3>
              
              <div className="space-y-3">
                {orderData.customerName && (
                  <div className="flex items-start">
                    <UserOutlined className="text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Người nhận</p>
                      <p className="font-semibold text-gray-800">
                        {orderData.customerName}
                      </p>
                    </div>
                  </div>
                )}
                
                {orderData.customerPhone && (
                  <div className="flex items-start">
                    <PhoneOutlined className="text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold text-gray-800">
                        {orderData.customerPhone}
                      </p>
                    </div>
                  </div>
                )}
                
                {orderData.customerEmail && (
                  <div className="flex items-start">
                    <MailOutlined className="text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-800">
                        {orderData.customerEmail}
                      </p>
                    </div>
                  </div>
                )}
                
                {orderData.customerAddress && (
                  <div className="flex items-start">
                    <EnvironmentOutlined className="text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                      <p className="font-semibold text-gray-800">
                        {orderData.customerAddress}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Hiển thị thông báo nếu không có thông tin */}
                {!orderData.customerName && !orderData.customerPhone && !orderData.customerEmail && !orderData.customerAddress && (
                  <div className="text-center py-4 text-gray-500">
                    <InfoCircleOutlined className="mr-2" />
                    Chưa có thông tin giao hàng
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-vietnam-green mb-4">
                Sản phẩm đã đặt
              </h3>
              
              <div className="space-y-3">
                {orderData.items && orderData.items.length > 0 ? (
                  orderData.items.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-vietnam-cream rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-2">
                            {item.productName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="font-medium mr-1">Số lượng:</span>
                              {item.quantity}
                            </span>
                            <span className="flex items-center">
                              <span className="font-medium mr-1">Đơn giá:</span>
                              {formatMoney(item.price)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-vietnam-green">
                            {formatMoney(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Không có sản phẩm</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t-2 border-gray-100 pt-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatMoney(orderData.totalPrice)}</span>
                </div>
                
                {/* Hiển thị voucher nếu có */}
                {orderData.voucherCode && orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <TagOutlined className="mr-2 text-base" />
                      Mã giảm giá ({orderData.voucherCode}):
                    </span>
                    <span className="font-medium">-{formatMoney(orderData.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-vietnam-green">
                    {formatMoney(orderData.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="bg-gradient-to-br from-vietnam-cream to-yellow-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-vietnam-green">
                  Trạng thái đơn hàng
                </h3>
                <button
                  onClick={fetchOrderDetails}
                  className="text-sm text-vietnam-green hover:text-vietnam-gold transition-colors flex items-center gap-1"
                  title="Làm mới trạng thái"
                >
                  <ReloadOutlined className="text-base" />
                  Làm mới
                </button>
              </div>
              
              {renderTimeline()}
              
              <div className="mt-6 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                  <span className={`w-3 h-3 rounded-full mr-2 ${ORDER_STATUS_MAP[orderData.orderStatus]?.color || 'bg-gray-400'}`}></span>
                  <span className="text-sm font-medium text-gray-700">
                    Hiện tại: <span className="text-vietnam-green font-bold">
                      {ORDER_STATUS_MAP[orderData.orderStatus]?.label || orderData.orderStatus}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Auto refresh notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <InfoCircleOutlined className="text-xl text-blue-500 mt-0.5 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Cập nhật tự động:</span> Trạng thái đơn hàng sẽ được cập nhật tự động mỗi 10 giây.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Cần hỗ trợ?{' '}
                <a 
                  href="#!" 
                  className="text-vietnam-green font-semibold hover:text-vietnam-gold transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Navigate to support page or open chat
                  }}
                >
                  Liên hệ chúng tôi
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
          >
            Xem tất cả đơn hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-outline"
          >
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
