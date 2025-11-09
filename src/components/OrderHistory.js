import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import { useToast } from './ToastContainer';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Hiển thị 3 đơn hàng mỗi trang
  const navigate = useNavigate();
  const { showError } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // DEBUG: Kiểm tra token và role
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      console.log('🔐 Debug Auth Info:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'NO TOKEN',
        role: role,
        tokenLength: token?.length
      });

      // FORCE REFRESH: Thêm timestamp để tránh cache
      const timestamp = new Date().getTime();
      console.log(`🔍 Fetching orders from: /api/customer/orders?t=${timestamp}`);

      const response = await orderService.getCustomerOrders();
      const orderData = response.data || response;
      console.log('✅ Orders fetched:', orderData);
      console.log('✅ Raw response:', response);

      // DEBUG: Kiểm tra response structure chi tiết
      console.log('📊 Response details:', {
        isArray: Array.isArray(orderData),
        length: Array.isArray(orderData) ? orderData.length : 'N/A',
        firstItem: Array.isArray(orderData) && orderData.length > 0 ? orderData[0] : null,
        allStatuses: Array.isArray(orderData) ? orderData.map(o => o.status) : []
      });

      // ⭐ QUY TẮC: PENDING (Chờ thanh toán) được xử lý như CANCELLED (Đã hủy)
      // Map PENDING thành CANCELLED khi fetch orders
      const normalizedOrders = Array.isArray(orderData) ? orderData.map(order => {
        if (order.status === 'PENDING' || order.status === 'pending') {
          console.log(`🔄 Mapping PENDING to CANCELLED for Order #${order.orderId || order.orderCode}`);
          return { ...order, status: 'CANCELLED', orderStatus: 'CANCELLED' };
        }
        return order;
      }) : [];

      // DEBUG: In ra tất cả status sau khi normalize
      if (Array.isArray(normalizedOrders)) {
        console.log('📋 All orders with normalized status:');
        normalizedOrders.forEach((order, index) => {
          console.log(`  Order #${order.orderId || index}: Status = "${order.status}"`);
        });
      }

      // Sắp xếp đơn hàng theo thời gian mới nhất lên đầu
      const sortedOrders = normalizedOrders.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateB - dateA; // Mới nhất lên đầu (descending)
      });

      console.log('📅 Orders sorted by date (newest first)');
      console.log('📊 Total orders after sorting:', sortedOrders.length);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('❌ Fetch orders error:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers
      });

      // Thông báo dễ hiểu cho người dùng
      if (error.response?.status === 403) {
        showError('Bạn không có quyền xem thông tin này. Vui lòng đăng xuất và đăng nhập lại.');
      } else if (error.response?.status === 401) {
        showError('Thời gian đăng nhập đã hết. Vui lòng đăng nhập lại để tiếp tục.');
      } else {
        const backendMsg = error.response?.data?.message;
        if (backendMsg) {
          showError(`Không thể tải danh sách đơn hàng. ${backendMsg}`);
        } else {
          showError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
        }
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    // ⭐ QUY TẮC: PENDING được xử lý như CANCELLED
    const normalizedStatus = (status === 'PENDING' || status === 'pending') ? 'CANCELLED' : status;
    const badges = {
      // ⭐ Ở phía customer: CONFIRMED hiển thị là "Đang chuẩn bị" (khách đã thanh toán rồi)
      'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang chuẩn bị' },
      'PROCESSING': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang xử lý' },
      'SHIPPING': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Đang giao' },
      'DELIVERED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao' },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
    };
    const badge = badges[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-800', label: normalizedStatus };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Lọc và sắp xếp đơn hàng theo thời gian mới nhất lên đầu
  const filteredOrders = (filter === 'ALL'
    ? orders
    : orders.filter(order => order.status === filter)
  ).sort((a, b) => {
    // Sắp xếp theo orderDate mới nhất lên đầu
    const dateA = new Date(a.orderDate);
    const dateB = new Date(b.orderDate);
    return dateB - dateA; // Descending order (mới nhất lên đầu)
  });

  // Debug: Log filter results
  console.log('🔍 Filter applied:', filter);
  console.log('🔍 Total orders:', orders.length);
  console.log('🔍 Filtered orders:', filteredOrders.length);
  console.log('🔍 All order statuses:', orders.map(o => ({ id: o.orderId, status: o.status })));
  console.log('📅 Filtered orders sorted by date:', filteredOrders.map(o => ({
    id: o.orderId,
    date: o.orderDate,
    status: o.status
  })));

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vietnam-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-vietnam-green">Đơn hàng của tôi</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tổng {filteredOrders.length} đơn hàng
            {filter !== 'ALL' && ` (${filter === 'CONFIRMED' ? 'Đang chuẩn bị' :
              filter === 'SHIPPING' ? 'Đang giao' :
                filter === 'COMPLETED' ? 'Hoàn thành' :
                  'Đã hủy'})`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-sm text-vietnam-green hover:text-vietnam-gold transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {['ALL', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                ? 'bg-vietnam-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {status === 'ALL' ? 'Tất cả' :
              status === 'CONFIRMED' ? 'Đang chuẩn bị' :
                status === 'SHIPPING' ? 'Đang giao' :
                  status === 'COMPLETED' ? 'Hoàn thành' :
                    'Đã hủy'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">
            {filter === 'ALL'
              ? 'Bạn chưa có đơn hàng nào'
              : 'Không có đơn hàng nào ở trạng thái này'}
          </p>
          <button
            onClick={() => navigate('/trays')}
            className="mt-4 btn-primary"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentOrders.map((order) => {
              // Xác định trang chi tiết phù hợp dựa trên trạng thái đơn hàng
              // ⭐ LƯU Ý: PENDING đã được map thành CANCELLED, nên chỉ cần kiểm tra CANCELLED
              const isCancelled = order.orderStatus === 'CANCELLED' || order.status === 'CANCELLED';
              const detailRoute = isCancelled
                ? `/pending-order/${order.orderId}`
                : `/order-success/${order.orderId}`;

              return (
                <div
                  key={order.orderId}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(detailRoute)}
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        Đơn hàng {order.orderCode || order.orderId}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        <i className="far fa-calendar-alt mr-1"></i>
                        {new Intl.DateTimeFormat('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(order.orderDate))}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Order Details */}
                  <div className="mb-4 space-y-2 text-sm">
                    {order.receiverName && (
                      <div className="flex items-start">
                        <i className="fas fa-user text-gray-400 mr-2 mt-1"></i>
                        <div>
                          <span className="text-gray-500">Người nhận:</span>
                          <span className="text-gray-800 font-medium ml-2">{order.receiverName}</span>
                        </div>
                      </div>
                    )}
                    {order.phone && (
                      <div className="flex items-start">
                        <i className="fas fa-phone text-gray-400 mr-2 mt-1"></i>
                        <div>
                          <span className="text-gray-500">Số điện thoại:</span>
                          <span className="text-gray-800 font-medium ml-2">{order.phone}</span>
                        </div>
                      </div>
                    )}
                    {order.address && (
                      <div className="flex items-start">
                        <i className="fas fa-map-marker-alt text-gray-400 mr-2 mt-1"></i>
                        <div className="flex-1">
                          <span className="text-gray-500">Địa chỉ:</span>
                          <span className="text-gray-800 font-medium ml-2">{order.address}</span>
                        </div>
                      </div>
                    )}
                    {order.note && (
                      <div className="flex items-start">
                        <i className="fas fa-sticky-note text-gray-400 mr-2 mt-1"></i>
                        <div className="flex-1">
                          <span className="text-gray-500">Ghi chú:</span>
                          <span className="text-gray-800 font-medium ml-2 italic">{order.note}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Tổng cộng:</span>
                    <span className="text-lg font-bold text-vietnam-green">
                      {Number(order.totalPrice).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      className="text-sm text-vietnam-green hover:text-vietnam-gold font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(detailRoute);
                      }}
                    >
                      Xem chi tiết <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> - <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> trong tổng số <span className="font-medium">{filteredOrders.length}</span> đơn hàng
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-vietnam-green border-vietnam-green hover:bg-vietnam-green hover:text-white'
                    }`}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Trước
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                    // Hiển thị: Trang đầu, trang cuối, trang hiện tại và 2 trang xung quanh
                    const showPage =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                    const showEllipsis =
                      (pageNumber === currentPage - 2 && currentPage > 3) ||
                      (pageNumber === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span key={pageNumber} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-10 h-10 rounded-lg transition-colors ${currentPage === pageNumber
                            ? 'bg-vietnam-green text-white font-semibold'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border transition-colors ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-vietnam-green border-vietnam-green hover:bg-vietnam-green hover:text-white'
                    }`}
                >
                  Sau
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
