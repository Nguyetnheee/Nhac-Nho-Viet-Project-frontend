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

  // ⭐ LOCAL STORAGE KEY cho shipper mapping
  const SHIPPER_MAPPING_KEY = 'order_shipper_mapping';

  // Lưu thông tin shipper vào localStorage
  const saveShipperMapping = (orderId, shipperInfo) => {
    try {
      const mapping = JSON.parse(localStorage.getItem(SHIPPER_MAPPING_KEY) || '{}');
      mapping[orderId] = {
        shipperId: shipperInfo.shipperId,
        shipperName: shipperInfo.shipperName,
        shipperPhone: shipperInfo.shipperPhone,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(SHIPPER_MAPPING_KEY, JSON.stringify(mapping));
      console.log(`💾 Saved shipper mapping for order #${orderId}:`, mapping[orderId]);
    } catch (error) {
      console.error('Error saving shipper mapping:', error);
    }
  };

  // Lấy thông tin shipper từ localStorage
  const getShipperMapping = (orderId) => {
    try {
      const mapping = JSON.parse(localStorage.getItem(SHIPPER_MAPPING_KEY) || '{}');
      return mapping[orderId] || null;
    } catch (error) {
      console.error('Error getting shipper mapping:', error);
      return null;
    }
  };

  // Load data khi component mount
  useEffect(() => {
    const loadData = async () => {
      // Load shippers trước
      await fetchShippers();
      // Sau đó load orders (để có thể map tên shipper ngay)
      await fetchOrders();
    };
    loadData();
  }, []);

  // Tự động cập nhật tên shipper cho orders khi danh sách shippers thay đổi
  useEffect(() => {
    if (shippers.length > 0 && orders.length > 0) {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          // Nếu có shipperId nhưng chưa có shipperName
          if (order.shipperId && !order.shipperName) {
            const foundShipper = shippers.find(s => s.shipperId === order.shipperId);
            if (foundShipper) {
              const shipperName = foundShipper.name || foundShipper.shipperName || foundShipper.username;
              console.log(`🔄 Auto-updating shipper name for Order #${order.orderId}: ${shipperName}`);
              return {
                ...order,
                shipperName: shipperName,
                shipperPhone: foundShipper.phoneNumber || foundShipper.phone
              };
            }
          }
          return order;
        })
      );
    }
  }, [shippers]); // Chạy mỗi khi danh sách shippers thay đổi

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
      
      console.log('📦 Raw orders from backend:', response);
      console.log('📦 First order sample:', response[0]);
      
      // Map backend response to frontend format
      const mappedOrders = response.map(order => {
        let shipperName = order.shipperName || order.shipper?.name || null;
        const shipperId = order.shipperId || order.shipper?.shipperId || null;
        let shipperPhone = order.shipperPhone || order.shipper?.phone || null;
        
        // ⭐ BƯỚC 1: Nếu backend không trả về shipperName, tìm từ localStorage
        if (shipperId && !shipperName) {
          const savedMapping = getShipperMapping(order.orderId);
          if (savedMapping && savedMapping.shipperId === shipperId) {
            shipperName = savedMapping.shipperName;
            shipperPhone = savedMapping.shipperPhone;
            console.log(`💾 Restored from localStorage - Order #${order.orderId}: ${shipperName}`);
          }
        }
        
        // ⭐ BƯỚC 2: Nếu vẫn chưa có shipperName, tìm từ danh sách shippers
        if (shipperId && !shipperName && shippers.length > 0) {
          const foundShipper = shippers.find(s => s.shipperId === shipperId);
          if (foundShipper) {
            shipperName = foundShipper.name || foundShipper.shipperName || foundShipper.username;
            shipperPhone = foundShipper.phoneNumber || foundShipper.phone;
            console.log(`🔍 Found from shippers list - Order #${order.orderId}: ${shipperName}`);
            
            // Lưu vào localStorage để lần sau dùng
            saveShipperMapping(order.orderId, {
              shipperId,
              shipperName,
              shipperPhone
            });
          }
        }
        
        const mapped = {
          orderId: order.orderId,
          customerName: order.receiverName,
          phoneNumber: order.phone,
          email: order.email || 'N/A',
          deliveryAddress: order.address,
          totalAmount: order.totalPrice,
          status: order.status,
          paymentMethod: order.paymentMethod || 'N/A',
          shipperName: shipperName,
          shipperId: shipperId,
          shipperPhone: shipperPhone,
          createdAt: order.orderDate,
          updatedAt: order.updatedAt || order.orderDate,
          note: order.note,
          items: order.items || [],
        };
        
        // Log để debug
        if (mapped.shipperId) {
          console.log(`📌 Order #${mapped.orderId} has shipper:`, {
            shipperName: mapped.shipperName,
            shipperId: mapped.shipperId,
            shipperPhone: mapped.shipperPhone
          });
        }
        
        return mapped;
      });
      
      console.log('✅ Mapped orders:', mappedOrders);
      console.log(`✅ Total orders: ${mappedOrders.length}`);
      
      setOrders(mappedOrders);
      message.success(`Tải ${mappedOrders.length} đơn hàng thành công`);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippers = async () => {
    try {
      console.log('🚚 Loading shippers...');
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
      console.log('✅ Shippers loaded:', mappedShippers.length, 'shippers');
      console.log('📋 Shipper list:', mappedShippers);
      return mappedShippers; // Return để có thể await
    } catch (error) {
      message.error('Không thể tải danh sách shipper: ' + (error.response?.data?.message || error.message));
      console.error('❌ Error fetching shippers:', error);
      return []; // Return empty array nếu lỗi
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
    // Tìm thông tin shipper từ danh sách TRƯỚC khi gọi API
    const selectedShipper = shippers.find(s => s.shipperId === shipperId);
    
    if (!selectedShipper) {
      message.error('Không tìm thấy thông tin shipper');
      return;
    }
    
    const shipperName = selectedShipper.name || selectedShipper.shipperName || selectedShipper.username;
    const shipperPhone = selectedShipper.phoneNumber || selectedShipper.phone;
    
    console.log('🚀 Assigning shipper:', { 
      orderId, 
      shipperId,
      shipperName
    });
    
    try {
      // ⭐ BƯỚC 1: LƯU VÀO LOCALSTORAGE NGAY LẬP TỨC
      saveShipperMapping(orderId, {
        shipperId,
        shipperName,
        shipperPhone
      });
      
      // ⭐ BƯỚC 2: Cập nhật state UI NGAY LẬP TỨC
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { 
                ...order, 
                shipperName: shipperName,
                shipperId: shipperId,
                shipperPhone: shipperPhone
              } 
            : order
        )
      );
      
      console.log(`✅ UI updated + Saved to localStorage: Order #${orderId} → ${shipperName}`);
      
      // ⭐ BƯỚC 3: Gọi API để lưu vào database (background)
      staffService.assignOrderToShipper(orderId, shipperId)
        .then(() => {
          console.log(`✅ Backend saved: Order #${orderId} assigned to shipper ${shipperId}`);
          message.success(`Đã gán shipper "${shipperName}" cho đơn hàng #${orderId}`);
        })
        .catch((error) => {
          console.error('❌ Error saving to backend:', error);
          message.error('Lỗi khi lưu vào database: ' + (error.response?.data?.message || error.message));
          // Rollback nếu lỗi (xóa khỏi localStorage và fetch lại)
          localStorage.removeItem(`${SHIPPER_MAPPING_KEY}_${orderId}`);
          fetchOrders();
        });
      
    } catch (error) {
      console.error('❌ Error in handleQuickAssign:', error);
      message.error('Không thể gán shipper');
    }
  };

  const handleAssignShipper = async () => {
    if (!selectedShipper) {
      message.warning('Vui lòng chọn shipper');
      return;
    }

    // Tìm thông tin shipper TRƯỚC khi gọi API
    const shipper = shippers.find(s => s.shipperId === selectedShipper || s.id === selectedShipper);
    
    if (!shipper) {
      message.error('Không tìm thấy thông tin shipper');
      return;
    }

    const orderId = selectedOrder.orderId;
    const shipperName = shipper.name || shipper.username || shipper.shipperName;
    const shipperPhone = shipper.phoneNumber || shipper.phone;

    console.log('🚀 Assigning shipper via modal:', { 
      orderId, 
      shipperId: selectedShipper,
      shipperName 
    });
    
    try {
      setLoading(true);
      
      // ⭐ BƯỚC 1: LƯU VÀO LOCALSTORAGE NGAY
      saveShipperMapping(orderId, {
        shipperId: selectedShipper,
        shipperName,
        shipperPhone
      });
      
      // ⭐ BƯỚC 2: Cập nhật state NGAY LẬP TỨC
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { 
                ...order, 
                shipperName: shipperName,
                shipperId: selectedShipper,
                shipperPhone: shipperPhone
              } 
            : order
        )
      );
      
      console.log(`✅ UI updated + Saved to localStorage: Order #${orderId} → ${shipperName}`);
      
      // Đóng modal và clear state
      setAssignModalVisible(false);
      setSelectedShipper(null);
      
      // ⭐ BƯỚC 3: Gọi API để lưu vào database
      await staffService.assignOrderToShipper(orderId, selectedShipper);
      
      console.log(`✅ Backend saved: Order #${orderId} assigned to shipper ${selectedShipper}`);
      message.success(`Đã gán shipper "${shipperName}" cho đơn hàng #${orderId}`);
      
    } catch (error) {
      message.error('Không thể gán đơn hàng: ' + (error.response?.data?.message || error.message));
      console.error('❌ Error assigning order:', error);
      // Rollback nếu lỗi
      fetchOrders();
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
        // Debug - log để kiểm tra backend response
        console.log('🚚 Shipper column - Order:', record.orderId, 
          '| Status:', record.status,
          '| shipperName:', record.shipperName, 
          '| shipperId:', record.shipperId);
        
        // ✅ Nếu đã có tên shipper => LUÔN hiển thị Tag (giữ nguyên)
        if (record.shipperName) {
          return (
            <Tag color="blue" icon={<UserOutlined />}>
              {record.shipperName}
            </Tag>
          );
        }
        
        // ⚠️ Nếu có shipperId nhưng không có tên (edge case)
        if (record.shipperId) {
          // Tìm tên shipper từ danh sách shippers
          const shipper = shippers.find(s => s.shipperId === record.shipperId);
          if (shipper) {
            const shipperName = shipper.name || shipper.shipperName || shipper.username;
            return (
              <Tag color="blue" icon={<UserOutlined />}>
                {shipperName}
              </Tag>
            );
          }
          // Nếu không tìm thấy, hiển thị ID
          return (
            <Tag color="orange" icon={<UserOutlined />}>
              Shipper #{record.shipperId}
            </Tag>
          );
        }

        // ❌ Nếu chưa có shipper
        if (record.status !== 'CONFIRMED') {
          // Các status khác không cho gán
          return <Tag color="default">Chưa gán</Tag>;
        }

        // ✅ Status = CONFIRMED và chưa có shipper => hiển thị dropdown để gán
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
