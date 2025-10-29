import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input, Card, Modal, Empty } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  TeamOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

// Import components
import CreateShipperForm from './CreateShipperForm';

// Import service
import shipperService from '../../services/shipperService';

const ShipperManagement = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create'
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load danh sách shippers - CHỈ TỪ API
  const loadShippers = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING SHIPPERS FROM API ===');
      const response = await shipperService.getAllShippers();
      
      console.log('=== SHIPPERS LOADED ===');
      console.log('Shippers data:', response);
      console.log('Count:', response?.length || 0);
      
      setShippers(response || []);
      
      if (response && response.length > 0) {
        message.success(`Đã tải ${response.length} shipper từ API`);
      } else {
        message.info('Chưa có shipper nào trong hệ thống');
      }
      
    } catch (error) {
      console.error('=== ERROR LOADING SHIPPERS ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      
      // Xử lý lỗi cụ thể
      if (error.response) {
        const { status, data } = error.response;
        console.error(`API Error ${status}:`, data);
        
        switch (status) {
          case 401:
            message.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
            break;
          case 403:
            message.error('Bạn không có quyền xem danh sách shipper!');
            break;
          case 404:
            message.info('Chưa có shipper nào trong hệ thống');
            setShippers([]); // Set empty array
            break;
          case 500:
            message.error('Lỗi server! Vui lòng thử lại sau.');
            break;
          default:
            message.error(`Lỗi API: ${status} - ${data?.message || 'Không xác định'}`);
        }
      } else if (error.request) {
        message.error('Không thể kết nối đến server!');
      } else {
        message.error(`Lỗi: ${error.message}`);
      }
      
      // KHÔNG dùng mock data - để trống
      setShippers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    if (currentView === 'list') {
      loadShippers();
    }
  }, [currentView]);

  // Xử lý tạo thành công
  const handleCreateSuccess = (newShipper) => {
    console.log('New shipper created:', newShipper);
    message.success('Đã tạo tài khoản shipper thành công!');
    setCurrentView('list');
    loadShippers(); // Reload danh sách
  };

  // Quay lại danh sách
  const handleBackToList = () => {
    setCurrentView('list');
  };

  // Xử lý edit (placeholder)
  const handleEdit = (shipperId) => {
    console.log('Edit shipper:', shipperId);
    message.info(`Chỉnh sửa shipper ID: ${shipperId} (Tính năng đang phát triển)`);
  };

  // Xử lý delete với API thật
  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa shipper',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa shipper này không?</p>
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            <strong>ID:</strong> {record.shipperId}<br />
            <strong>Tên:</strong> {record.shipperName}<br />
            <strong>Username:</strong> {record.username}<br />
            <strong>Email:</strong> {record.email}
          </div>
          <p style={{ color: '#ff4d4f', marginTop: '10px', fontSize: '14px' }}>
            ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          console.log('=== DELETING SHIPPER ===');
          console.log('Shipper ID:', record.shipperId);
          
          // Hiển thị loading
          const hide = message.loading('Đang xóa shipper...', 0);
          
          // Gọi API xóa
          await shipperService.deleteShipper(record.shipperId);
          
          // Ẩn loading
          hide();
          
          console.log('=== DELETE SUCCESS ===');
          message.success(`Đã xóa shipper "${record.shipperName}" thành công!`);
          
          // Reload danh sách
          loadShippers();
          
        } catch (error) {
          console.error('=== DELETE ERROR ===');
          console.error('Error object:', error);
          
          if (error.response) {
            const { status, data } = error.response;
            switch (status) {
              case 400:
                message.error('Không thể xóa shipper này!');
                break;
              case 401:
                message.error('Bạn không có quyền xóa shipper!');
                break;
              case 403:
                message.error('Truy cập bị từ chối!');
                break;
              case 404:
                message.error('Shipper không tồn tại hoặc đã bị xóa!');
                loadShippers(); // Reload để cập nhật UI
                break;
              case 409:
                message.error('Không thể xóa shipper đang có đơn hàng!');
                break;
              default:
                message.error(`Lỗi: ${status} - ${data?.message || 'Không xác định'}`);
            }
          } else {
            message.error('Không thể kết nối đến server!');
          }
        }
      }
    });
  };

  // Filter shippers dựa trên search text
  const filteredShippers = shippers.filter(shipper =>
    shipper.shipperName?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.username?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.phone?.includes(searchText)
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shipperId',
      key: 'shipperId',
      width: 60,
      sorter: (a, b) => a.shipperId - b.shipperId,
    },
    {
      title: 'Tên shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      ellipsis: true,
      sorter: (a, b) => a.shipperName.localeCompare(b.shipperName),
      render: (name, record) => (
        <div>
          <strong style={{ color: '#1890ff' }}>{name}</strong>
          <div style={{ color: '#666', fontSize: '12px' }}>
            @{record.username}
          </div>
        </div>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender) => {
        const genderConfig = {
          'MALE': { color: 'blue', text: 'Nam' },
          'FEMALE': { color: 'pink', text: 'Nữ' },
          'OTHER': { color: 'purple', text: 'Khác' }
        };
        const config = genderConfig[gender] || { color: 'default', text: gender };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'Nam', value: 'MALE' },
        { text: 'Nữ', value: 'FEMALE' },
        { text: 'Khác', value: 'OTHER' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ color: '#1890ff' }}>
          {email}
        </a>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone) => (
        <a href={`tel:${phone}`} style={{ color: '#1890ff' }}>
          {phone}
        </a>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => {
        if (!date) return <span style={{ color: '#ccc' }}>N/A</span>;
        return new Date(date).toLocaleDateString('vi-VN');
      },
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt) - new Date(b.createdAt);
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record.shipperId)}
          >
            Sửa
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Render Create view
  if (currentView === 'create') {
    return (
      <CreateShipperForm
        onBack={handleBackToList}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  // Default list view
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Quản lý Shipper
        </h2>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadShippers}
            loading={loading}
          >
            Tải lại
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setCurrentView('create')}
          >
            Tạo tài khoản Shipper
          </Button>
        </Space>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, username, email, số điện thoại..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color="blue">Tổng: {filteredShippers.length} shipper</Tag>
          <Tag color="green">
            Nam: {filteredShippers.filter(s => s.gender === 'MALE').length}
          </Tag>
          <Tag color="pink">
            Nữ: {filteredShippers.filter(s => s.gender === 'FEMALE').length}
          </Tag>
          <Tag color="purple">
            Khác: {filteredShippers.filter(s => s.gender === 'OTHER').length}
          </Tag>
        </Space>
      </div>

      {/* Table hoặc Empty state */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Đang tải danh sách shipper...</div>
          </div>
        ) : filteredShippers.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={filteredShippers}
            rowKey="shipperId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} shipper`,
            }}
            scroll={{ x: 1000 }}
          />
        ) : (
          <Empty
            description="Chưa có shipper nào trong hệ thống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCurrentView('create')}
            >
              Tạo shipper đầu tiên
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default ShipperManagement;