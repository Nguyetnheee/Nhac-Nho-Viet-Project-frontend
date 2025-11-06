import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Card,
  message,
  Modal,
  Descriptions,
  Badge,
  Statistic,
  Row,
  Col,
  Empty,
  Spin,
} from 'antd';
import { translateToVietnamese } from '../utils/errorMessages';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import shipperService from '../services/shipperService';

const { TabPane } = Tabs;

const ShipperOrderManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completeOrderId, setCompleteOrderId] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);

  // Load orders based on active tab
  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab]);

  // Auto refresh every 30 seconds for pending orders
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'pending') {
        loadOrders('pending', true); // Silent refresh
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadOrders = async (tab = activeTab, silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      let response;
      switch (tab) {
        case 'pending':
          response = await shipperService.getPendingOrders();
          setPendingOrders(response || []);
          break;
        case 'active':
          response = await shipperService.getActiveOrders();
          setActiveOrders(response || []);
          break;
        case 'completed':
          response = await shipperService.getCompletedOrders();
          setCompletedOrders(response || []);
          break;
        default:
          break;
      }
      
      if (!silent) {
        message.success('Tải danh sách đơn hàng thành công');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (!silent) {
        message.error('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    Modal.confirm({
      title: 'Xác nhận nhận đơn',
      content: 'Bạn xác nhận sẽ nhận đơn hàng này và đi giao?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          await shipperService.acceptOrder(orderId);
          message.success('Đã xác nhận nhận đơn hàng!');
          // Refresh both pending and active lists
          await loadOrders('pending', true);
          await loadOrders('active', true);
          // Switch to active tab
          setActiveTab('active');
        } catch (error) {
          console.error('Error accepting order:', error);
          message.error('Không thể xác nhận đơn hàng: ' + (error.response?.data?.message || error.message));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCompleteOrder = async (orderId) => {
    const order = activeOrders.find(o => o.orderId === orderId);
    console.log('Attempting to complete order:', orderId, order);
    setCompleteOrderId(orderId);
    setProofFile(null);
    setProofPreviewUrl(null);
    setCompleteModalVisible(true);
  };

  const submitCompleteOrder = async () => {
    if (!proofFile) {
      message.warning('Vui lòng tải lên ảnh bằng chứng giao hàng.');
      return;
    }
    try {
      setLoading(true);
      await shipperService.completeOrder(completeOrderId, proofFile);
      message.success('Đã xác nhận giao hàng thành công!');
      setCompleteModalVisible(false);
      setProofFile(null);
      setProofPreviewUrl(null);
      // Refresh lists
      await loadOrders('active', true);
      await loadOrders('completed', true);
      setActiveTab('completed');
    } catch (error) {
      console.error('Error completing order:', error);
      let errorMessage = 'Không thể xác nhận giao hàng';
      if (error.response?.data?.message) {
        errorMessage += ': ' + translateToVietnamese(error.response.data.message);
      } else if (error.response?.status === 403) {
        errorMessage += ': Không có quyền thực hiện. Vui lòng kiểm tra lại trạng thái đơn hàng.';
      } else if (error.message) {
        errorMessage += ': ' + translateToVietnamese(error.message);
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VNĐ';
    const validAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(validAmount)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(validAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'CONFIRMED': { color: 'blue', text: 'Đã gán - Chờ nhận', icon: <ClockCircleOutlined /> },
      'SHIPPING': { color: 'orange', text: 'Đang giao', icon: <TruckOutlined /> },
      'DELIVERED': { color: 'green', text: 'Đã giao', icon: <CheckCircleOutlined /> },
      'COMPLETED': { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
    };
    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Common columns for all tables
  const baseColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 80,
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 150,
      render: (name, record) => (
        <div>
          <div><UserOutlined /> {name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            <PhoneOutlined /> {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Địa chỉ giao hàng',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address) => (
        <div style={{ maxWidth: '200px' }}>
          <EnvironmentOutlined /> {address}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 130,
      render: (amount) => <strong style={{ color: '#cf1322' }}>{formatCurrency(amount)}</strong>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 160,
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => getStatusTag(status),
    },
  ];

  // Columns for pending orders (with Accept action)
  const pendingColumns = [
    ...baseColumns,
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleAcceptOrder(record.orderId)}
          >
            Nhận đơn
          </Button>
        </Space>
      ),
    },
  ];

  // Columns for active orders (with Complete action)
  const activeColumns = [
    ...baseColumns,
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<TruckOutlined />}
            style={{ backgroundColor: '#52c41a' }}
            onClick={() => handleCompleteOrder(record.orderId)}
          >
            Đã giao
          </Button>
        </Space>
      ),
    },
  ];

  // Columns for completed orders (View only)
  const completedColumns = [
    ...baseColumns,
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
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
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <ShoppingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Quản lý đơn hàng</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => loadOrders(activeTab)}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đơn chờ nhận"
                value={pendingOrders.length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đang giao"
                value={activeOrders.length}
                prefix={<TruckOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={completedOrders.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <Badge count={pendingOrders.length} offset={[10, 0]}>
                  <ClockCircleOutlined />
                  <span style={{ marginLeft: '8px' }}>Chờ nhận</span>
                </Badge>
              </span>
            }
            key="pending"
          >
            <Table
              columns={pendingColumns}
              dataSource={pendingOrders}
              rowKey="orderId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} đơn hàng`,
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có đơn hàng nào chờ nhận"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <Badge count={activeOrders.length} offset={[10, 0]}>
                  <TruckOutlined />
                  <span style={{ marginLeft: '8px' }}>Đang giao</span>
                </Badge>
              </span>
            }
            key="active"
          >
            <Table
              columns={activeColumns}
              dataSource={activeOrders}
              rowKey="orderId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} đơn hàng`,
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có đơn hàng nào đang giao"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                <span style={{ marginLeft: '8px' }}>Đã hoàn thành</span>
              </span>
            }
            key="completed"
          >
            <Table
              columns={completedColumns}
              dataSource={completedOrders}
              rowKey="orderId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} đơn hàng`,
              }}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Chưa có đơn hàng nào hoàn thành"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
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
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã đơn hàng">
              <strong>#{selectedOrder.orderId}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedOrder.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {formatDate(selectedOrder.orderDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Tên khách hàng">
              <UserOutlined /> {selectedOrder.receiverName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <PhoneOutlined /> {selectedOrder.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              <EnvironmentOutlined /> {selectedOrder.address}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <strong style={{ color: '#cf1322', fontSize: '16px' }}>
                {formatCurrency(selectedOrder.totalPrice)}
              </strong>
            </Descriptions.Item>
            {selectedOrder.voucherCode && (
              <Descriptions.Item label="Mã giảm giá">
                {selectedOrder.voucherCode}
              </Descriptions.Item>
            )}
            {selectedOrder.discountAmount && (
              <Descriptions.Item label="Số tiền giảm">
                {formatCurrency(selectedOrder.discountAmount)}
              </Descriptions.Item>
            )}
            {selectedOrder.note && (
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.note}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
      
      {/* Complete Order Modal with proof image upload */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>Xác nhận đã giao hàng</span>
          </Space>
        }
        open={completeModalVisible}
        onCancel={() => {
          setCompleteModalVisible(false);
          setProofFile(null);
          setProofPreviewUrl(null);
        }}
        okText="Xác nhận đã giao"
        cancelText="Hủy"
        onOk={submitCompleteOrder}
        okButtonProps={{ disabled: !proofFile, loading }}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 12 }}>
          <p>Vui lòng tải lên ảnh bằng chứng đã giao hàng cho khách (bắt buộc).</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              setProofFile(file || null);
              if (file) {
                const url = URL.createObjectURL(file);
                setProofPreviewUrl(url);
              } else {
                setProofPreviewUrl(null);
              }
            }}
          />
        </div>
        {proofPreviewUrl && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={proofPreviewUrl}
              alt="Proof preview"
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #eee' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShipperOrderManagement;
