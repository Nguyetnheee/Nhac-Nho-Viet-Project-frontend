import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Select,
  message,
  Card,
  Descriptions,
  Spin,
  Popconfirm,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  Dropdown,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import staffService from '../../services/staffService';

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    confirmed: 0,
    shipping: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchShippers();
  }, []);

  useEffect(() => {
    calculateStatistics();
  }, [orders]);

  const calculateStatistics = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      paid: orders.filter(o => o.status === 'PAID').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      shipping: orders.filter(o => o.status === 'SHIPPING').length,
    };
    setStatistics(stats);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAllOrders();
      
      // Debug: Check raw backend response
      console.log('Raw orders from backend:', response);
      console.log('First order sample:', response[0]);
      
      // Map backend response to frontend format
      const mappedOrders = response.map(order => ({
        orderId: order.orderId,
        customerName: order.receiverName,
        phoneNumber: order.phone,
        email: order.email || 'N/A',
        deliveryAddress: order.address,
        totalAmount: order.totalPrice,
        status: order.status,
        paymentMethod: order.paymentMethod || 'N/A',
        shipperName: order.shipperName || null,
        shipperId: order.shipperId || null,
        shipperPhone: order.shipperPhone || null,
        createdAt: order.orderDate,
        updatedAt: order.updatedAt || order.orderDate,
        note: order.note,
        items: order.items || [],
      }));
      
      console.log('Mapped orders:', mappedOrders);
      console.log('First mapped order:', mappedOrders[0]);
      
      setOrders(mappedOrders);
      message.success('Tải danh sách đơn hàng thành công');
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippers = async () => {
    try {
      const response = await staffService.getAllShippers();
      
      // Map backend response to frontend format
      const mappedShippers = response.map(shipper => ({
        shipperId: shipper.shipperId,
        id: shipper.shipperId, // Alias for compatibility
        name: shipper.shipperName,
        username: shipper.shipperName, // Alias for compatibility
        phoneNumber: shipper.phone,
        phone: shipper.phone, // Keep original
        email: shipper.email,
        gender: shipper.gender,
      }));
      
      setShippers(mappedShippers);
      console.log('Shippers loaded:', mappedShippers); // Debug log
    } catch (error) {
      message.error('Không thể tải danh sách shipper: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching shippers:', error);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      setLoading(true);
      await staffService.confirmOrder(orderId);
      message.success('Xác nhận đơn hàng thành công');
      fetchOrders(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể xác nhận đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('Error confirming order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await staffService.cancelOrder(orderId);
      message.success('Hủy đơn hàng thành công');
      fetchOrders(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể hủy đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('Error canceling order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gán shipper nhanh từ dropdown trong bảng
  const handleQuickAssign = async (orderId, shipperId) => {
    try {
      setLoading(true);
      await staffService.assignOrderToShipper(orderId, shipperId);
      
      // Tìm tên shipper từ danh sách
      const selectedShipper = shippers.find(s => s.shipperId === shipperId);
      
      // Cập nhật state ngay lập tức (optimistic update)
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { 
                ...order, 
                shipperName: selectedShipper?.name || selectedShipper?.shipperName,
                shipperId: shipperId,
                shipperPhone: selectedShipper?.phoneNumber || selectedShipper?.phone
              } 
            : order
        )
      );
      
      message.success('Gán shipper thành công');
      
      // Vẫn fetch lại để đảm bảo dữ liệu đồng bộ với backend
      fetchOrders();
    } catch (error) {
      message.error('Không thể gán shipper: ' + (error.response?.data?.message || error.message));
      console.error('Error assigning shipper:', error);
      // Nếu lỗi, fetch lại để rollback về trạng thái thực tế
      fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShipper = async () => {
    if (!selectedShipper) {
      message.warning('Vui lòng chọn shipper');
      return;
    }

    try {
      setLoading(true);
      await staffService.assignOrderToShipper(selectedOrder.orderId, selectedShipper);
      message.success('Gán đơn hàng cho shipper thành công');
      setAssignModalVisible(false);
      setSelectedShipper(null);
      fetchOrders(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể gán đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('Error assigning order:', error);
    } finally {
      setLoading(false);
    }
  };

  const showOrderDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const showAssignModal = (order) => {
    setSelectedOrder(order);
    setAssignModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'gold',
      PAID: 'blue',
      CONFIRMED: 'green',
      SHIPPING: 'orange',
      DELIVERED: 'cyan',
      COMPLETED: 'success',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    // Handle null, undefined, or invalid values
    const validAmount = Number(amount);
    if (isNaN(validAmount)) {
      return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(validAmount);
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
      width: 120,
      fixed: 'left',
      render: (text) => <strong>#{text}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true,
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
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
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
      filters: [
        { text: 'Chờ thanh toán', value: 'PENDING' },
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Đang giao', value: 'SHIPPING' },
        { text: 'Đã giao', value: 'DELIVERED' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Shipper',
      key: 'shipper',
      width: 200,
      render: (_, record) => {
        // Debug
        console.log('Shipper column - Order:', record.orderId, '| shipperName:', record.shipperName, '| shipperId:', record.shipperId);
        
        // Chỉ cho phép gán shipper khi đơn đã CONFIRMED
        if (record.status !== 'CONFIRMED') {
          return record.shipperName ? (
            <Tag color="blue">{record.shipperName}</Tag>
          ) : (
            <Tag color="default">Chưa gán</Tag>
          );
        }

        // Nếu đã có shipper, hiển thị tên
        if (record.shipperName) {
          return <Tag color="blue">{record.shipperName}</Tag>;
        }

        // Nếu chưa có shipper và status = CONFIRMED, hiển thị dropdown
        return (
          <Select
            placeholder="Chọn shipper"
            style={{ width: '100%' }}
            onChange={(shipperId) => handleQuickAssign(record.orderId, shipperId)}
            loading={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {shippers.map((shipper) => (
              <Option 
                key={shipper.shipperId} 
                value={shipper.shipperId}
                label={shipper.name}
              >
                <Space>
                  <UserOutlined />
                  <span>{shipper.name}</span>
                </Space>
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        // Debug: Kiểm tra status của record
        console.log('Order ID:', record.orderId, '| Status:', record.status);
        
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'Chi tiết',
            onClick: () => showOrderDetail(record)
          }
        ];

        // Chuẩn hóa status - hỗ trợ cả tiếng Anh và tiếng Việt
        const statusUpper = record.status?.toUpperCase() || '';
        const isPaid = statusUpper === 'PAID' || record.status === 'Đã thanh toán';
        const isConfirmed = statusUpper === 'CONFIRMED' || record.status === 'Đã xác nhận';

        // Thêm "Xác nhận" nếu status là PAID (Đã thanh toán)
        if (isPaid) {
          menuItems.push({
            key: 'confirm',
            icon: <CheckCircleOutlined />,
            label: 'Xác nhận',
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận đơn hàng',
                content: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
                onOk: () => handleConfirmOrder(record.orderId),
                okText: 'Có',
                cancelText: 'Không'
              });
            }
          });
        }

        // Thêm "Gán shipper" nếu status là CONFIRMED (Đã xác nhận)
        if (isConfirmed) {
          menuItems.push({
            key: 'assign',
            icon: <UserOutlined />,
            label: 'Gán shipper',
            onClick: () => showAssignModal(record)
          });
        }

        // Thêm divider và "Hủy" nếu status là PAID hoặc CONFIRMED
        if (isPaid || isConfirmed) {
          menuItems.push(
            {
              type: 'divider'
            },
            {
              key: 'cancel',
              icon: <CloseCircleOutlined />,
              label: 'Hủy',
              danger: true,
              onClick: () => {
                Modal.confirm({
                  title: 'Hủy đơn hàng',
                  content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                  onOk: () => handleCancelOrder(record.orderId),
                  okText: 'Có',
                  cancelText: 'Không',
                  okType: 'danger'
                });
              }
            }
          );
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text" 
              icon={<MoreOutlined style={{ fontSize: '18px' }} />}
              className="hover:bg-gray-100"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <ShoppingCartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Quản lý đơn hàng</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={statistics.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card>
              <Statistic
                title="Chờ thanh toán"
                value={statistics.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={5}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={statistics.paid}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12} xl={5}>
            <Card>
              <Statistic
                title="Đã xác nhận"
                value={statistics.confirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={12} xl={5}>
            <Card>
              <Statistic
                title="Đang giao"
                value={statistics.shipping}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Orders Table */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="orderId"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          bordered
        />
      </Card>

      {/* Chi tiết đơn hàng Modal */}
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
            <Descriptions.Item label="Tổng tiền">
              <strong style={{ color: '#cf1322', fontSize: '16px' }}>
                {formatCurrency(selectedOrder.totalAmount)}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder.paymentMethod || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Shipper">
              {selectedOrder.shipperName || <Tag color="default">Chưa gán</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="SĐT Shipper">
              {selectedOrder.shipperPhone || 'N/A'}
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

      {/* Gán shipper Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>Gán shipper cho đơn hàng #{selectedOrder?.orderId}</span>
          </Space>
        }
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedShipper(null);
        }}
        onOk={handleAssignShipper}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: 16 }}>
            <strong>Khách hàng:</strong> {selectedOrder?.customerName}
          </p>
          <p style={{ marginBottom: 16 }}>
            <strong>Địa chỉ giao hàng:</strong> {selectedOrder?.deliveryAddress}
          </p>
          <p style={{ marginBottom: 16 }}>
            <strong>Chọn shipper:</strong>
          </p>
          <Select
            placeholder="Chọn shipper"
            style={{ width: '100%' }}
            onChange={(value) => setSelectedShipper(value)}
            value={selectedShipper}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {shippers.map((shipper) => (
              <Option 
                key={shipper.shipperId || shipper.id} 
                value={shipper.shipperId || shipper.id}
                label={shipper.name || shipper.username}
              >
                <Space>
                  <UserOutlined />
                  <span>
                    {shipper.name || shipper.username} - {shipper.phoneNumber || shipper.phone}
                  </span>
                </Space>
              </Option>
            ))}
          </Select>
          {shippers.length === 0 && (
            <p style={{ color: '#faad14', marginTop: 8 }}>
              ⚠️ Chưa có shipper nào trong hệ thống
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
