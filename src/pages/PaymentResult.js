import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import { useToast } from '../components/ToastContainer';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // Lấy thông tin từ URL params (PayOS trả về)
        const orderId = searchParams.get('orderId') || 
                       searchParams.get('orderCode') || 
                       searchParams.get('id');
        const status = searchParams.get('status') || searchParams.get('code');
        const cancel = searchParams.get('cancel'); // Kiểm tra nếu user cancel
        
        // ⭐ Detect route path để biết success hay cancel
        const currentPath = window.location.pathname;
        const isSuccessRoute = currentPath.includes('/payment/success');
        const isCancelRoute = currentPath.includes('/payment/cancel');
        
        console.log('🔍 Payment callback params:', { 
          orderId, 
          status, 
          cancel,
          currentPath,
          isSuccessRoute,
          isCancelRoute,
          allParams: Object.fromEntries(searchParams.entries())
        });

        if (!orderId) {
          throw new Error('Không tìm thấy mã đơn hàng');
        }

        // TRƯỜNG HỢP 1: User thoát khỏi trang PayOS (cancel)
        // ⭐ Ưu tiên check route path trước, sau đó mới check params
        const isCancelled = isCancelRoute ||
                           cancel === 'true' || 
                           status === 'CANCELLED' || 
                           status === 'CANCEL';
        
        if (isCancelled) {
          console.log('⚠️ User cancelled payment');
          
          // Fetch thông tin đơn hàng để hiển thị
          let orderInfo = null;
          try {
            const orderResponse = await orderService.getOrderById(orderId);
            orderInfo = orderResponse.data || orderResponse;
            console.log('📦 Order info fetched:', orderInfo);
          } catch (orderError) {
            console.error('❌ Fetch order error:', orderError);
            // Continue even if fetch fails
          }
          
          // Gọi API cancel payment
          try {
            await paymentService.cancelPayment(orderId);
            console.log('✅ Payment cancelled successfully');
          } catch (cancelError) {
            console.error('❌ Cancel payment error:', cancelError);
            // Continue even if cancel API fails
          }

          // Set payment status với thông tin đơn hàng CHI TIẾT
          setPaymentStatus({ 
            status: 'CANCELLED', 
            orderId: orderInfo?.orderId || orderId,
            orderDate: orderInfo?.orderDate,
            orderStatus: orderInfo?.orderStatus,
            totalPrice: orderInfo?.totalPrice || orderInfo?.totalAmount || orderInfo?.total,
            items: orderInfo?.items || [] // Danh sách sản phẩm
          });
          setLoading(false);
          
          showWarning('Bạn chưa hoàn thành thanh toán. Đang chuyển đến trang chi tiết đơn hàng...');
          
          // ✅ Redirect đến PendingOrderDetail sau 2s
          setTimeout(() => {
            navigate(`/pending-order/${orderId}`);
          }, 2000);
          
          return;
        }

        // TRƯỜNG HỢP 2: Thanh toán THÀNH CÔNG
        // ⭐ Ưu tiên check route path /payment/success
        const isSuccess = isSuccessRoute ||
                         status === '00' || 
                         status === 'SUCCESS' || 
                         status === 'PAID' ||
                         searchParams.get('code') === '00';
        
        if (isSuccess) {
          console.log('✅ Payment successful');
          
          // Fetch thông tin đơn hàng để hiển thị
          let orderInfo = null;
          try {
            const orderResponse = await orderService.getOrderById(orderId);
            orderInfo = orderResponse.data || orderResponse;
            console.log('📦 Order info fetched:', orderInfo);
          } catch (orderError) {
            console.error('❌ Fetch order error:', orderError);
          }

          setPaymentStatus({ 
            status: 'SUCCESS',
            paid: true,
            orderId: orderInfo?.orderId || orderId,
            orderDate: orderInfo?.orderDate,
            orderStatus: orderInfo?.orderStatus,
            totalPrice: orderInfo?.totalPrice || orderInfo?.totalAmount || orderInfo?.total,
            items: orderInfo?.items || []
          });
          setLoading(false);
          
          showSuccess('Thanh toán thành công!');
          
          // ❌ KHÔNG tự động redirect
          // User phải tự bấm nút để chọn hành động tiếp theo
          
          return;
        }

        // TRƯỜNG HỢP 3: Thanh toán THẤT BẠI
        // PayOS redirect với code!=00 hoặc status=FAILED
        console.log('❌ Payment failed');
        
        // Fetch thông tin đơn hàng để hiển thị
        let orderInfo = null;
        try {
          const orderResponse = await orderService.getOrderById(orderId);
          orderInfo = orderResponse.data || orderResponse;
          console.log('📦 Order info fetched:', orderInfo);
        } catch (orderError) {
          console.error('❌ Fetch order error:', orderError);
        }

        setPaymentStatus({ 
          status: 'FAILED',
          orderId: orderInfo?.orderId || orderId,
          orderDate: orderInfo?.orderDate,
          orderStatus: orderInfo?.orderStatus,
          totalPrice: orderInfo?.totalPrice || orderInfo?.totalAmount || orderInfo?.total,
          items: orderInfo?.items || []
        });
        setLoading(false);
        
        showError('Thanh toán thất bại. Đang chuyển đến trang chi tiết đơn hàng...');
        
        // ✅ Redirect đến PendingOrderDetail sau 2s
        setTimeout(() => {
          navigate(`/pending-order/${orderId}`);
        }, 2000);

      } catch (error) {
        console.error('❌ Handle payment callback error:', error);
        setPaymentStatus({ status: 'ERROR', message: error.message });
        setLoading(false);
        showError(error.message || 'Có lỗi xảy ra khi kiểm tra thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên.');
        
        // ❌ KHÔNG tự động redirect
        // User phải tự bấm nút để chọn hành động tiếp theo
      }
    };

    handlePaymentCallback();
  }, [searchParams, showSuccess, showError, showWarning, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vietnam-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-vietnam-green mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang kiểm tra trạng thái thanh toán...</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus?.status === 'SUCCESS' || paymentStatus?.paid === true;
  const isCancelled = paymentStatus?.status === 'CANCELLED' || paymentStatus?.status === 'CANCEL';
  const isFailed = paymentStatus?.status === 'FAILED' || paymentStatus?.status === 'ERROR';

  return (
    <div className="min-h-screen bg-vietnam-cream py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card text-center">
          {/* Icon */}
          <div className="mb-6">
            {isSuccess ? (
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
                <CheckCircleOutlined className="text-6xl text-green-600" />
              </div>
            ) : isCancelled ? (
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100">
                <ClockCircleOutlined className="text-6xl text-yellow-600" />
              </div>
            ) : (
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
                <CloseCircleOutlined className="text-6xl text-red-600" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold mb-4 ${
            isSuccess ? 'text-green-600' : 
            isCancelled ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {isSuccess ? 'Thanh toán thành công!' : 
             isCancelled ? 'Chưa hoàn thành thanh toán' :
             'Thanh toán không thành công'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {isSuccess 
              ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý. Vui lòng kiểm tra thông tin đơn hàng bên dưới.'
              : isCancelled
              ? 'Bạn đã thoát khỏi trang thanh toán. Vui lòng chọn lại sản phẩm và thanh toán.'
              : 'Có lỗi xảy ra trong quá trình thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên, vui lòng thử lại.'}
          </p>

        

          {/* Order Info */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-vietnam-green mb-4">Thông tin đơn hàng</h3>
              
              {/* Order Header */}
              <div className="space-y-2 text-sm mb-4">
                {paymentStatus.orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-medium">#{paymentStatus.orderId}</span>
                  </div>
                )}
                {paymentStatus.orderDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span className="font-medium">
                      {new Intl.DateTimeFormat('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(new Date(paymentStatus.orderDate))}
                    </span>
                  </div>
                )}
                {paymentStatus.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái thanh toán:</span>
                    <span className={`font-medium ${
                      isSuccess ? 'text-green-600' : 
                      isCancelled ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {paymentStatus.status === 'SUCCESS' ? 'Thành công' :
                       paymentStatus.status === 'CANCELLED' ? 'Đã hủy' :
                       paymentStatus.status === 'FAILED' ? 'Thất bại' :
                       paymentStatus.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Items List */}
              {paymentStatus.items && paymentStatus.items.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3">Chi tiết sản phẩm:</h4>
                  <div className="space-y-3">
                    {paymentStatus.items.map((item, index) => (
                      <div key={item.productId || index} className="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.productName}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Số lượng: <span className="font-medium">{item.quantity}</span> × {' '}
                            {Number(item.price).toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-vietnam-green">
                            {Number(item.subtotal || (item.price * item.quantity)).toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              {paymentStatus.totalPrice && (
                <div className="flex justify-between border-t pt-3 mt-4">
                  <span className="text-gray-700 font-semibold text-lg">Tổng cộng:</span>
                  <span className="font-bold text-vietnam-green text-lg">
                    {Number(paymentStatus.totalPrice).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/trays')}
              className="btn-primary px-8 py-3"
            >
              Tiếp tục mua hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
