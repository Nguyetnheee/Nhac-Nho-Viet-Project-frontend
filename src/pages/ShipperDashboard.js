import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import shipperService from '../services/shipperService';
import { 
  Layout, 
  Card, 
  Table, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  notification, 
  Descriptions,
  Modal,
  Button,
  Space,
  Badge,
  Alert,
} from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;

const ShipperDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [shipperProfile, setShipperProfile] = useState(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
  });

  useEffect(() => {
    fetchShipperProfile();
    fetchOrders();
    
    // Polling mỗi 30 giây để kiểm tra đơn hàng mới
    const interval = setInterval(() => {
      fetchOrders(true); // silent fetch
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const fetchShipperProfile = async () => {
    try {
      const response = await shipperService.getProfile();
      setShipperProfile(response);
    } catch (error) {
      console.error('Error fetching shipper profile:', error);
    }
  };

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await orderService.getAllOrders();
      
      // Lọc các đơn hàng được gán cho shipper này
      const myOrders = response.data.filter(order => {
        // Giả sử order có shipperId hoặc shipperName
        const isMyOrder = order.shipperId === user?.id || 
                         order.shipperId === shipperProfile?.id ||
                         order.shipperId === shipperProfile?.shipperId;
        return isMyOrder && ['CONFIRMED', 'SHIPPING', 'DELIVERED'].includes(order.status);
      });

      // Kiểm tra đơn hàng mới
      const previousOrderIds = orders.map(o => o.orderId);
      const newOrders = myOrders.filter(o => !previousOrderIds.includes(o.orderId));
      
      if (newOrders.length > 0 && orders.length > 0) {
        setNewOrdersCount(prev => prev + newOrders.length);
        showNewOrderNotification(newOrders);
      }

      setOrders(myOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!silent) {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể tải danh sách đơn hàng',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const showNewOrderNotification = (newOrders) => {
    newOrders.forEach(order => {
      notification.info({
        message: '🎉 Bạn có đơn hàng mới!',
        description: (
          <div>
            <p><strong>Mã đơn:</strong> #{order.orderId}</p>
            <p><strong>Khách hàng:</strong> {order.customerName}</p>
            <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
          </div>
        ),
        duration: 10,
        placement: 'topRight',
        icon: <BellOutlined style={{ color: '#52c41a' }} />,
        onClick: () => {
          setSelectedOrder(order);
          setDetailModalVisible(true);
        },
      });
    });
  };

  const calculateStats = () => {
    setStats({
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length,
      pendingOrders: orders.filter(o => o.status === 'CONFIRMED').length,
      shippingOrders: orders.filter(o => o.status === 'SHIPPING').length,
    });
  };

  const showOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
    // Reset new orders count when viewing
    if (newOrdersCount > 0) {
      setNewOrdersCount(0);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: 'blue',
      SHIPPING: 'orange',
      DELIVERED: 'green',
      COMPLETED: 'success',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VNĐ',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
      render: (text) => <strong>#{text}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 120,
    },
    {
      title: 'Địa chỉ giao hàng',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      ellipsis: true,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (amount) => <strong style={{ color: '#cf1322' }}>{formatCurrency(amount)}</strong>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 'bold' }}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showOrderDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <h2 style={{ margin: 0, color: '#1890ff' }}>
            Shipper Dashboard - {shipperProfile?.name || user?.username || 'Shipper'}
          </h2>
        </div>
        <Space>
          <Badge count={newOrdersCount} offset={[-5, 5]}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: '20px' }} />}
              onClick={() => setActiveMenu('orders')}
            />
          </Badge>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            Đăng xuất
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {newOrdersCount > 0 && (
          <Alert
            message={`🎉 Bạn có ${newOrdersCount} đơn hàng mới!`}
            description="Nhấn vào icon chuông hoặc xem bảng đơn hàng bên dưới để xem chi tiết."
            type="success"
            showIcon
            closable
            onClose={() => setNewOrdersCount(0)}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ lấy hàng"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang giao"
                value={stats.shippingOrders}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={stats.completedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Orders Table */}
        <Card
          title={
            <Space>
              <ShoppingCartOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Đơn hàng của tôi</span>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
          />
        </Card>

        {/* Order Detail Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined style={{ color: '#1890ff' }} />
              <span>Chi tiết đơn hàng #{selectedOrder?.orderId}</span>
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <strong>#{selectedOrder.orderId}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag color={getStatusColor(selectedOrder.status)} style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {selectedOrder.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.deliveryAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <strong style={{ color: '#cf1322', fontSize: '18px' }}>
                  {formatCurrency(selectedOrder.totalAmount)}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt hàng" span={2}>
                {formatDate(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật" span={2}>
                {formatDate(selectedOrder.updatedAt)}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedOrder.note}
                </Descriptions.Item>
              )}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Descriptions.Item label="Sản phẩm" span={2}>
                  <Table
                    dataSource={selectedOrder.items}
                    pagination={false}
                    size="small"
                    rowKey="productId"
                    columns={[
                      {
                        title: 'Sản phẩm',
                        dataIndex: 'productName',
                        key: 'productName',
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        align: 'center',
                      },
                      {
                        title: 'Đơn giá',
                        dataIndex: 'price',
                        key: 'price',
                        render: (price) => formatCurrency(price),
                      },
                      {
                        title: 'Thành tiền',
                        key: 'subtotal',
                        render: (_, record) => formatCurrency(record.quantity * record.price),
                      },
                    ]}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default ShipperDashboard;