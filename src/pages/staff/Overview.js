import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Spin, message, Typography, Input } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  GiftOutlined,
  TruckOutlined,
  TagOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { ritualService } from '../../services/ritualService';
import { trayService } from '../../services/trayService';
import { orderService } from '../../services/orderService';
import shipperService from '../../services/shipperService';
import productService from '../../services/productService';
import { managerService, staffService } from '../../services/managerService';
import api from '../../services/api';

const { Title, Text } = Typography;

const Overview = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRituals: 0,
    totalTrays: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [products, setProducts] = useState([]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentUsers(),
        fetchRecentOrders(),
        fetchRecentVouchers(),
        fetchShippers(),
        fetchAllOrders(),
        fetchProducts(),
        fetchTopSelling()
      ]);
    } catch (error) {
      message.error('Không thể tải dữ liệu tổng quan!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const [ritualsRes, traysRes, ordersRes] = await Promise.all([
        ritualService.getAllRituals(),
        trayService.getAllTrays(),
        orderService.getStaffOrders().catch(() => ({ data: [] }))
      ]);

      const rituals = Array.isArray(ritualsRes) ? ritualsRes : ritualsRes?.data || [];
      const trays = Array.isArray(traysRes?.data) ? traysRes.data : traysRes || [];
      const ordersData = Array.isArray(ordersRes?.data) ? ordersRes.data : (ordersRes?.data || []);

      // 使用函数式更新，保留 totalCustomers 的值（如果已由 fetchRecentUsers 设置）
      setStats(prev => ({
        totalRituals: rituals.length,
        totalTrays: trays.length,
        totalOrders: ordersData.length,
        totalCustomers: prev.totalCustomers // 保留之前的值
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await managerService.getCustomers();
      // managerService.getCustomers() đã trả về response.data, nên response có thể là mảng trực tiếp
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response?.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      }

      // Debug: Log để kiểm tra dữ liệu
      console.log('📊 Raw response from managerService.getCustomers():', response);
      console.log('📋 Processed users array:', users);
      if (users.length > 0) {
        console.log('👤 First user sample:', users[0]);
        console.log('📅 First user createdAt:', users[0]?.createdAt, 'Type:', typeof users[0]?.createdAt);
        console.log('📅 First user updatedAt:', users[0]?.updatedAt, 'Type:', typeof users[0]?.updatedAt);
        console.log('🔍 All keys in first user:', Object.keys(users[0]));
        console.log('🔍 Full first user object:', JSON.stringify(users[0], null, 2));
      }

      // Map đầy đủ tất cả các field từ API
      setRecentUsers(users.map((user, index) => {
        // Kiểm tra các tên field có thể có (createdAt, created_at, createDate, etc.)
        // Đảm bảo chỉ lấy string, không lấy null hoặc object
        let createdAt = user.createdAt || user.created_at || user.createDate || user.dateCreated || null;
        const updatedAt = user.updatedAt || user.updated_at || user.updateDate || user.dateUpdated || null;
        
        // Chuyển đổi createdAt thành string nếu nó là object/null hoặc không phải string hợp lệ
        if (createdAt && typeof createdAt !== 'string') {
          // Nếu là object, thử chuyển thành string
          if (createdAt instanceof Date) {
            createdAt = createdAt.toISOString();
          } else if (typeof createdAt === 'object' && createdAt !== null) {
            // Nếu là object phức tạp, bỏ qua và dùng null
            createdAt = null;
          }
        }
        
        // Nếu createdAt là null/undefined/empty string nhưng updatedAt có giá trị, dùng updatedAt làm fallback
        if ((!createdAt || createdAt === 'null' || createdAt === 'undefined') && updatedAt && typeof updatedAt === 'string') {
          createdAt = updatedAt; // Dùng updatedAt nếu createdAt không có
        }
        
        // Đảm bảo cả hai đều là string hoặc null
        const finalCreatedAt = (createdAt && typeof createdAt === 'string') ? createdAt : null;
        const finalUpdatedAt = (updatedAt && typeof updatedAt === 'string') ? updatedAt : null;
        
        return {
          key: user.id || index,
          id: user.id || index,
          username: user.username || 'N/A',
          email: user.email || 'N/A',
          phone: user.phone || 'N/A',
          customerName: user.customerName || 'N/A',
          gender: user.gender || 'N/A',
          address: user.address || 'N/A',
          createdAt: finalCreatedAt,
          updatedAt: finalUpdatedAt
        };
      }));

      // Cập nhật tổng số khách hàng
      setStats(prev => ({ ...prev, totalCustomers: users.length }));
    } catch (error) {
      console.error('❌ Error fetching recent users:', error);
      console.error('Error details:', error.response?.data || error.message);
      setRecentUsers([]);
      setStats(prev => ({ ...prev, totalCustomers: 0 }));
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await orderService.getStaffOrders().catch(() => null);
      if (response?.data) {
        const orders = Array.isArray(response.data) ? response.data : response.data.data || [];
        // Map đơn hàng và sắp xếp theo thứ tự mới nhất lên đầu
        // ⭐ QUY TẮC: PENDING (Chờ thanh toán) được xử lý như CANCELLED (Đã hủy)
        const mappedOrders = orders.map((order, index) => {
          let normalizedStatus = order.status || 'CANCELLED';
          // Map PENDING thành CANCELLED
          if (normalizedStatus === 'PENDING' || normalizedStatus === 'pending') {
            normalizedStatus = 'CANCELLED';
          }
          return {
            key: order.orderId || order.id || index,
            orderId: order.orderId || order.id || 'N/A',
            customerName: order.receiverName || order.fullName || order.customerName || 'N/A',
            totalAmount: order.totalPrice || order.totalAmount || 0,
            status: normalizedStatus,
            createdAt: order.orderDate || order.createdAt || 'N/A',
            shippingAddress: order.address || order.shippingAddress || 'N/A',
            shippingStatus: order.shippingStatus || 'Chưa vận chuyển',
            shipperName: order.shipperName || 'Chưa phân công'
          };
        });

        // Sắp xếp theo createdAt (mới nhất lên đầu)
        const sortedOrders = mappedOrders.sort((a, b) => {
          // Lấy giá trị date để so sánh
          const dateA = a.createdAt !== 'N/A' ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt !== 'N/A' ? new Date(b.createdAt) : new Date(0);
          
          // Sắp xếp giảm dần (mới nhất lên đầu)
          return dateB.getTime() - dateA.getTime();
        });

        setRecentOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const fetchRecentVouchers = async () => {
    try {
      const response = await api.get('/api/vouchers/valid').catch(() => null);
      if (response?.data) {
        const vouchers = Array.isArray(response.data)
          ? response.data
          : (Array.isArray(response.data.data) ? response.data.data : []);

        setRecentVouchers(vouchers.map((voucher, index) => ({
          key: voucher.voucherId || voucher.id || index,
          code: voucher.code || voucher.voucherCode || 'N/A',
          discount: voucher.discountValue ?? voucher.discount ?? 0,
          type: voucher.discountType || voucher.type || 'PERCENTAGE',
          status: (voucher.isValid !== false && voucher.isActive !== false) ? 'ACTIVE' : 'INACTIVE',
          createdAt: voucher.createdAt || voucher.startDate || 'N/A',
          expiryDate: voucher.endDate || voucher.expiryDate || 'N/A'
        })));
      } else {
        setRecentVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching recent vouchers:', error);
      setRecentVouchers([]);
    }
  };

  const fetchShippers = async () => {
    try {
      const data = await shipperService.getAllShippers();
      const shippersList = Array.isArray(data) ? data : data?.data || [];
      setShippers(shippersList.map((shipper, index) => ({
        key: shipper.shipperId || shipper.id || index,
        shipperId: shipper.shipperId || shipper.id || 'N/A',
        name: shipper.shipperName || shipper.name || 'N/A',
        email: shipper.email || 'N/A',
        phone: shipper.phone || 'N/A',
        gender: shipper.gender || 'N/A'
      })));
    } catch (error) {
      console.error('Error fetching shippers:', error);
      setShippers([]);
      // Không hiển thị message error ở đây vì đây là component tổng quan
      // Nếu cần thiết có thể bỏ comment dòng dưới
      // message.warning('Không thể tải danh sách người giao hàng');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await orderService.getStaffOrders().catch(() => null);
      if (response?.data) {
        const orders = Array.isArray(response.data) ? response.data : response.data.data || [];
        // ⭐ QUY TẮC: PENDING (Chờ thanh toán) được xử lý như CANCELLED (Đã hủy)
        const normalizedOrders = orders.map(order => {
          if (order.status === 'PENDING' || order.status === 'pending') {
            return { ...order, status: 'CANCELLED' };
          }
          return order;
        });
        setAllOrders(normalizedOrders);
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
      setAllOrders([]);
    }
  };

  const fetchTopSelling = async () => {
    try {
      const response = await api.get('/api/manager/orders/top-selling').catch(() => null);
      let list = [];
      if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        list = response.data.content;
      }
      setTopSelling(list.slice(0, 10));
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setTopSelling([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      const productsList = Array.isArray(data) ? data : data?.data || [];
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const formatDate = (dateString) => {
    // Kiểm tra null, undefined, 'N/A', hoặc không phải string
    if (!dateString || 
        dateString === 'N/A' || 
        dateString === null || 
        dateString === undefined ||
        typeof dateString !== 'string') {
      return 'N/A';
    }
    
    // Kiểm tra string rỗng hoặc chỉ có khoảng trắng
    if (dateString.trim() === '' || dateString === 'null' || dateString === 'undefined') {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'N/A';
      }
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' VNĐ';
  };

  const getStatusTag = (status) => {
    // ⭐ QUY TẮC: PENDING được xử lý như CANCELLED
    const normalizedStatus = (status === 'PENDING' || status === 'pending') ? 'CANCELLED' : status;
    const statusMap = {
      'CONFIRMED': { color: 'blue', text: 'Đã xác nhận' },
      'COMPLETED': { color: 'green', text: 'Đã hoàn thành' },
      'CANCELLED': { color: 'red', text: 'Đã hủy' },
      'PAID': { color: 'green', text: 'Đã thanh toán' },
      'SHIPPING': { color: 'cyan', text: 'Đang giao' },
      'ACTIVE': { color: 'green', text: 'Hoạt động' },
      'INACTIVE': { color: 'default', text: 'Không hoạt động' }
    };
    const statusInfo = statusMap[normalizedStatus] || { color: 'default', text: normalizedStatus };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Tính tổng doanh thu (theo các trạng thái được tính là doanh thu)
  const getTotalRevenue = () => {
    let total = 0;
    allOrders.forEach(order => {
      if (order && (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'CONFIRMED')) {
        const amount = order.totalPrice || order.totalAmount || 0;
        total += amount;
      }
    });
    return total;
  };

  // 1. Tính toán dữ liệu cho biểu đồ tổng quan đơn hàng theo trạng thái
  const getOrderStatusChartData = () => {
    const statusCount = {};
    allOrders.forEach(order => {
      // ⭐ QUY TẮC: PENDING được map thành CANCELLED
      let status = order.status || 'UNKNOWN';
      if (status === 'PENDING' || status === 'pending') {
        status = 'CANCELLED';
      }
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusMap = {
      'CONFIRMED': 'Đã xác nhận',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy',
      'PAID': 'Đã thanh toán',
      'SHIPPING': 'Đang giao'
    };

    // Màu sắc cho từng trạng thái
    const statusColorMap = {
      'CANCELLED': '#ff4d4f',      // Đỏ - Đã hủy
      'CONFIRMED': '#2f54eb',       // Xanh biển - Đã xác nhận
      'COMPLETED': '#1890ff',       // Xanh đậm - Đã hoàn thành
      'PAID': '#73d13d',            // Xanh lá - Đã thanh toán
      'SHIPPING': '#13c2c2',        // Cyan - Đang giao
    };

    return Object.entries(statusCount).map(([status, value]) => ({
      name: statusMap[status] || status,
      value: value,
      itemStyle: {
        color: statusColorMap[status] || '#d9d9d9'
      }
    }));
  };

  // 2. Tính toán dữ liệu cho biểu đồ doanh thu
  const getRevenueChartData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let totalRevenue = 0;
    let dailyRevenue = 0;
    let monthlyRevenue = 0;

    // Chỉ tính các đơn hàng có status PAID
    allOrders.forEach(order => {
      // Chỉ tính doanh thu cho đơn hàng đã thanh toán
      if (order.status !== 'PAID' && order.status !== 'COMPLETED' && order.status !== 'CONFIRMED') {
        return;
      }

      const amount = order.totalPrice || order.totalAmount || 0;
      totalRevenue += amount;

      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate >= thisMonth) {
        monthlyRevenue += amount;
        if (orderDate >= today) {
          dailyRevenue += amount;
        }
      }
    });

    const monthlyWithoutDaily = monthlyRevenue - dailyRevenue;
    const totalWithoutMonthly = totalRevenue - monthlyRevenue;

    return [
      { name: 'Theo ngày', value: dailyRevenue },
      { name: 'Theo tháng (trừ ngày)', value: monthlyWithoutDaily },
      { name: 'Tổng cộng (trước tháng này)', value: totalWithoutMonthly }
    ];
  };

  // 3. Tính toán dữ liệu cho biểu đồ xu hướng đơn hàng theo thời gian (24h)
  const getOrderTrendChartData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourCounts = new Array(24).fill(0);

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    allOrders.forEach(order => {
      const orderDate = new Date(order.orderDate || order.createdAt);
      if (orderDate >= last24Hours && orderDate <= now) {
        const hour = orderDate.getHours();
        hourCounts[hour]++;
      }
    });

    return {
      hours: hours.map(h => `${h}h`),
      counts: hourCounts
    };
  };

  // 4. Tính toán dữ liệu cho biểu đồ hiệu suất shipper
  const getShipperPerformanceData = () => {
    const shipperStats = {};

    allOrders.forEach(order => {
      const shipperId = order.shipperId || order.shipper?.shipperId;
      const shipperName = order.shipperName || order.shipper?.shipperName || `Shipper ${shipperId || 'N/A'}`;

      // Chỉ tính các đơn hàng có shipper được gán
      if (!shipperName || shipperName === 'Shipper N/A' || shipperName === 'Shipper null') {
        return; // Bỏ qua các đơn hàng chưa có shipper
      }

      if (!shipperStats[shipperName]) {
        shipperStats[shipperName] = {
          total: 0,
          completed: 0,
          delivered: 0
        };
      }

      shipperStats[shipperName].total++;
      
      // Tính completed: các đơn đã được gán cho shipper (CONFIRMED, SHIPPING, DELIVERED, COMPLETED)
      if (order.status === 'CONFIRMED' || order.status === 'SHIPPING' || 
          order.status === 'DELIVERED' || order.status === 'COMPLETED') {
        shipperStats[shipperName].completed++;
      }
      
      // Tính delivered: các đơn đã giao thành công (DELIVERED hoặc COMPLETED)
      if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
        shipperStats[shipperName].delivered++;
      }
    });

    const shipperNames = Object.keys(shipperStats);
    const completedOrders = shipperNames.map(name => shipperStats[name].completed);
    const deliveredOrders = shipperNames.map(name => shipperStats[name].delivered);
    
    // Tính tỷ lệ thành công: (delivered / total) * 100
    const successRates = shipperNames.map(name => {
      const stats = shipperStats[name];
      if (stats.total === 0) return 0;
      
      // Tính tỷ lệ dựa trên delivered/total
      const rate = (stats.delivered / stats.total) * 100;
      return parseFloat(rate.toFixed(1));
    });

    // Debug log để kiểm tra
    console.log('📊 Shipper Performance Data:', {
      shipperNames,
      completedOrders,
      deliveredOrders,
      successRates,
      stats: shipperStats
    });

    return {
      shipperNames,
      completedOrders,
      deliveredOrders,
      successRates
    };
  };

  // 5. Tính toán dữ liệu cho top sản phẩm bán chạy
  const getTopProductsData = () => {
    // Dữ liệu đã được backend tính sẵn
    return (topSelling || []).map(p => ({
      name: p.productName || `Sản phẩm ${p.productId}`,
      quantity: p.quantity || 0,
      revenue: p.revenue || 0
    }));
  };

  const userColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      render: (gender) => {
        const genderMap = {
          'male': { text: 'Nam', color: 'blue' },
          'female': { text: 'Nữ', color: 'pink' },
          'other': { text: 'Khác', color: 'default' },
          'nam': { text: 'Nam', color: 'blue' },
          'nữ': { text: 'Nữ', color: 'pink' },
          'khác': { text: 'Khác', color: 'default' },
          'Nam': { text: 'Nam', color: 'blue' },
          'Nữ': { text: 'Nữ', color: 'pink' },
          'Khác': { text: 'Khác', color: 'default' },
          'MALE': { text: 'Nam', color: 'blue' },
          'FEMALE': { text: 'Nữ', color: 'pink' },
          'OTHER': { text: 'Khác', color: 'default' }
        };
        const genderInfo = genderMap[gender] || genderMap[gender?.toLowerCase()] || { text: gender || 'N/A', color: 'default' };
        return <Tag color={genderInfo.color}>{genderInfo.text}</Tag>;
      },
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => formatDate(text),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (text) => formatDate(text),
    },
  ];

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => formatDate(text),
    },
  ];

  const shippingColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Địa chỉ giao hàng',
      dataIndex: 'shippingAddress',
      key: 'shippingAddress',
      ellipsis: true,
    },
    {
      title: 'Trạng thái vận chuyển',
      dataIndex: 'shippingStatus',
      key: 'shippingStatus',
      render: (status) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
    },
  ];

  const voucherColumns = [
    {
      title: 'Mã voucher',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount, record) =>
        record.type === 'PERCENTAGE' ? `${discount}%` : formatCurrency(discount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => formatDate(text),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text) => formatDate(text),
    },
  ];

  const shipperColumns = [
    {
      title: 'STT',
      dataIndex: 'shipperId',
      key: 'shipperId',
      width: 80,
    },
    {
      title: 'Tên shipper',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        const genderMap = {
          'MALE': { text: 'Nam', color: 'blue' },
          'FEMALE': { text: 'Nữ', color: 'pink' },
          'OTHER': { text: 'Khác', color: 'default' }
        };
        const genderInfo = genderMap[gender] || { text: gender || 'N/A', color: 'default' };
        return <Tag color={genderInfo.color}>{genderInfo.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>
                {/* <BookOutlined />  */}
                Tổng quan hệ thống</Space>
            </Title>
            <Text type="secondary">Tổng quan về hệ thống</Text>
          </div>

        </div>
      </Card>

      <Spin spinning={loading}>
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Khách hàng"
                value={stats.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng lễ hội"
                value={stats.totalRituals}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={getTotalRevenue()}
                prefix={<GiftOutlined />}
                valueStyle={{ color: '#eb2f96' }}
                formatter={(value) => formatCurrencyVND(value)}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* 1. Biểu đồ tổng quan đơn hàng theo trạng thái */}
          <Col xs={24} lg={12}>
            <Card title="Tổng quan đơn hàng theo trạng thái">
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left'
                  },
                  series: [
                    {
                      name: 'Đơn hàng',
                      type: 'pie',
                      radius: ['40%', '70%'],
                      avoidLabelOverlap: false,
                      itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                      },
                      label: {
                        show: true,
                        formatter: '{c}'
                      },
                      emphasis: {
                        label: {
                          show: true,
                          fontSize: 16,
                          fontWeight: 'bold',
                          formatter: '{c}'
                        }
                      },
                      data: getOrderStatusChartData()
                    }
                  ]
                }}
                style={{ height: '400px' }}
              />
            </Card>
          </Col>

          {/* 2. Biểu đồ doanh thu */}
          <Col xs={24} lg={12}>
            <Card title="Tổng doanh thu">
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: (params) => {
                      return `${params.name}<br/>${formatCurrencyVND(params.value)} (${params.percent}%)`;
                    }
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left'
                  },
                  series: [
                    {
                      name: 'Doanh thu',
                      type: 'pie',
                      radius: ['50%', '70%'],
                      avoidLabelOverlap: false,
                      itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                      },
                      label: {
                        show: true,
                        formatter: (params) => {
                          return formatCurrencyVND(params.value);
                        }
                      },
                      emphasis: {
                        label: {
                          show: true,
                          fontSize: 16,
                          fontWeight: 'bold',
                          formatter: (params) => {
                            return formatCurrencyVND(params.value);
                          }
                        }
                      },
                      data: getRevenueChartData()
                    }
                  ]
                }}
                style={{ height: '400px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* 3. Biểu đồ xu hướng đơn hàng theo thời gian */}
          <Col xs={24} lg={24}>
            <Card title="Xu hướng đơn hàng trong 24 giờ qua">
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow'
                    }
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: {
                    type: 'category',
                    data: getOrderTrendChartData().hours,
                    axisLabel: {
                      rotate: 0
                    }
                  },
                  yAxis: {
                    type: 'value',
                    name: 'Số đơn hàng'
                  },
                  series: [
                    {
                      name: 'Số đơn hàng',
                      type: 'bar',
                      data: getOrderTrendChartData().counts,
                      itemStyle: {
                        color: '#1890ff'
                      },
                      label: {
                        show: true,
                        position: 'top'
                      }
                    }
                  ]
                }}
                style={{ height: '400px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* 4. Biểu đồ hiệu suất shipper */}
          <Col xs={24} lg={24}>
            <Card title="Hiệu suất Shipper">
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow'
                    }
                  },
                  legend: {
                    data: ['Số đơn hoàn thành', 'Số đơn đã giao', 'Tỷ lệ thành công (%)']
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: {
                    type: 'category',
                    data: getShipperPerformanceData().shipperNames,
                    axisLabel: {
                      rotate: 45
                    }
                  },
                  yAxis: [
                    {
                      type: 'value',
                      name: 'Số đơn',
                      position: 'left'
                    },
                    {
                      type: 'value',
                      name: 'Tỷ lệ (%)',
                      position: 'right'
                    }
                  ],
                  series: [
                    {
                      name: 'Số đơn hoàn thành',
                      type: 'bar',
                      data: getShipperPerformanceData().completedOrders,
                      itemStyle: {
                        color: '#1890ff'
                      }
                    },
                    {
                      name: 'Số đơn đã giao',
                      type: 'bar',
                      data: getShipperPerformanceData().deliveredOrders,
                      itemStyle: {
                        color: '#52c41a'
                      }
                    },
                    {
                      name: 'Tỷ lệ thành công (%)',
                      type: 'line',
                      yAxisIndex: 1,
                      data: getShipperPerformanceData().successRates,
                      itemStyle: {
                        color: '#ff4d4f'
                      },
                      label: {
                        show: true,
                        formatter: '{c}%'
                      }
                    }
                  ]
                }}
                style={{ height: '400px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* 5. Top sản phẩm bán chạy */}
          <Col xs={24} lg={24}>
            <Card title="Top 10 Sản phẩm bán chạy">
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'shadow'
                    },
                    formatter: (params) => {
                      let result = `${params[0].name}<br/>`;
                      params.forEach(param => {
                        result += `${param.seriesName}: ${param.value}<br/>`;
                      });
                      return result;
                    }
                  },
                  legend: {
                    data: ['Số lượng bán', 'Doanh thu (VNĐ)']
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: {
                    type: 'category',
                    data: getTopProductsData().map(p => p.name),
                    axisLabel: {
                      rotate: 45
                    }
                  },
                  yAxis: [
                    {
                      type: 'value',
                      name: 'Số lượng',
                      position: 'left'
                    },
                    {
                      type: 'value',
                      name: 'Doanh thu (VNĐ)',
                      position: 'right',
                      axisLabel: {
                        formatter: (value) => {
                          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                          return value;
                        }
                      }
                    }
                  ],
                  series: [
                    {
                      name: 'Số lượng bán',
                      type: 'bar',
                      data: getTopProductsData().map(p => p.quantity),
                      itemStyle: {
                        color: '#722ed1'
                      }
                    },
                    {
                      name: 'Doanh thu (VNĐ)',
                      type: 'bar',
                      yAxisIndex: 1,
                      data: getTopProductsData().map(p => p.revenue),
                      itemStyle: {
                        color: '#eb2f96'
                      }
                    }
                  ]
                }}
                style={{ height: '400px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }} align="stretch">
          {/* Recent Users Table */}
          <Col xs={24} lg={12}>
            <Card
              style={{ height: '100%' }}
              title={
                <Space>
                  <UserOutlined />
                  <span>Khách hàng gần đây</span>
                </Space>
              }
            >
              <Table
                columns={userColumns}
                dataSource={recentUsers}
                pagination={{
                  pageSize: 5,
                  showTotal: (total) => `Tổng ${total} khách hàng`,
                  locale: { items_per_page: '/ trang' },
                }}
                size="small"
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </Col>

          {/* Shippers Table */}
          <Col xs={24} lg={12}>
            <Card
              style={{ height: '100%' }}
              title={
                <Space>
                  <TruckOutlined />
                  <span>Danh sách Shipper</span>
                </Space>
              }
            >
              <Table
                columns={shipperColumns}
                dataSource={shippers}
                pagination={{
                  pageSize: 5,
                  showTotal: (total) => `Tổng ${total} shipper`,
                  locale: { items_per_page: '/ trang' },
                }}
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Recent Orders */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Đơn hàng gần đây</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Table
                columns={orderColumns}
                dataSource={recentOrders}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} đơn hàng`,
                  locale: { items_per_page: '/ trang' },
                }}
                size="small"
                scroll={{ x: true }}
                locale={{
                  filterConfirm: 'OK',
                  filterReset: 'Đặt lại',
                  filterEmptyText: 'Không có bộ lọc',
                  emptyText: 'Không có dữ liệu',
                }}
              />
            </Card>
          </Col>

          {/* Shipping Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TruckOutlined />
                  <span>Thông tin vận chuyển</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Table
                columns={shippingColumns}
                dataSource={recentOrders}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} đơn hàng`,
                  locale: { items_per_page: '/ trang' },
                }}
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recent Vouchers */}
        <Card
          title={
            <Space>
              <TagOutlined />
              <span>Voucher gần đây</span>
            </Space>
          }
        >
          <Table
            columns={voucherColumns}
            dataSource={recentVouchers}
            pagination={{
              pageSize: 5,
              showTotal: (total) => `Tổng ${total} voucher`,
              locale: { items_per_page: '/ trang' },
            }}
            size="small"
            scroll={{ x: true }}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default Overview;