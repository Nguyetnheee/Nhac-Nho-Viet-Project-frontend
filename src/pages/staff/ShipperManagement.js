// src/pages/admin/ShipperManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Input, Card, Modal, Empty, Typography } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  TeamOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import CreateShipperForm from './CreateShipperForm';
import shipperService from '../../services/shipperService';

const { Title, Text } = Typography;

// Mock data cho shipper
const MOCK_SHIPPERS = [
  {
    shipperId: 1,
    shipperName: 'Nguyễn Văn An',
    username: 'nguyenvanan',
    email: 'an.nguyen@gmail.com',
    phone: '0901234567',
    gender: 'MALE',
    createdAt: '2024-01-15T08:30:00'
  },
  {
    shipperId: 2,
    shipperName: 'Trần Thị Bình',
    username: 'tranthibinh',
    email: 'binh.tran@gmail.com',
    phone: '0912345678',
    gender: 'FEMALE',
    createdAt: '2024-02-20T10:15:00'
  },
  {
    shipperId: 3,
    shipperName: 'Lê Văn Cường',
    username: 'levancuong',
    email: 'cuong.le@gmail.com',
    phone: '0923456789',
    gender: 'MALE',
    createdAt: '2024-03-10T14:45:00'
  },
  {
    shipperId: 4,
    shipperName: 'Phạm Thị Dung',
    username: 'phamthidung',
    email: 'dung.pham@gmail.com',
    phone: '0934567890',
    gender: 'FEMALE',
    createdAt: '2024-04-05T09:20:00'
  },
  {
    shipperId: 5,
    shipperName: 'Hoàng Văn Em',
    username: 'hoangvanem',
    email: 'em.hoang@gmail.com',
    phone: '0945678901',
    gender: 'MALE',
    createdAt: '2024-05-12T11:00:00'
  }
];

const ShipperManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [shippers, setShippers] = useState(MOCK_SHIPPERS); // Khởi tạo với mock data
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadShippers = async () => {
    setLoading(true);
    try {
      // Uncomment dòng dưới để dùng real API, comment lại để dùng mock data
      // const response = await shipperService.getAllShippers();
      // setShippers(response || []);
      
      // Sử dụng mock data (tạm thời)
      setShippers(MOCK_SHIPPERS);
      message.success('Đã tải danh sách shipper (Mock data)');
    } catch (error) {
      console.error('Error loading shippers:', error);
      message.error('Tải danh sách shipper thất bại!');
      setShippers(MOCK_SHIPPERS); // Fallback về mock data nếu API fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'list') {
      loadShippers();
    }
  }, [currentView]);

  const handleCreateSuccess = (newShipper) => {
    message.success('Đã tạo tài khoản shipper thành công!');
    setCurrentView('list');
  };

  const handleBackToList = () => {
    setCurrentView('list');
  };

  const handleEdit = (shipperId) => {
    message.info(`Chỉnh sửa shipper ID: ${shipperId} (Tính năng đang phát triển)`);
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa shipper',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa shipper này không?</p>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginTop: '10px', border: '1px solid #eee' }}>
            <p style={{ margin: 0 }}><strong>ID:</strong> {record.shipperId}</p>
            <p style={{ margin: 0 }}><strong>Tên:</strong> {record.shipperName}</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> {record.email}</p>
          </div>
          <p style={{ color: '#ff4d4f', marginTop: '10px' }}>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const hide = message.loading('Đang xóa shipper...', 0);
        try {
          await shipperService.deleteShipper(record.shipperId);
          hide();
          message.success(`Đã xóa shipper "${record.shipperName}" thành công!`);
          loadShippers();
        } catch (error) {
          hide();
          console.error('Delete error:', error);
          message.error('Xóa shipper thất bại. Vui lòng thử lại.');
        }
      }
    });
  };

  const filteredShippers = shippers.filter(shipper =>
    shipper.shipperName?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.username?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    shipper.phone?.includes(searchText)
  );

  const columns = [
    { title: 'ID', dataIndex: 'shipperId', key: 'shipperId', width: 80, sorter: (a, b) => a.shipperId - b.shipperId },
    {
      title: 'Tên shipper',
      dataIndex: 'shipperName',
      key: 'shipperName',
      sorter: (a, b) => a.shipperName.localeCompare(b.shipperName),
      render: (name, record) => (
        <div>
          <Text strong className="text-vietnam-red">{name}</Text>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>@{record.username}</Text>
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
          'MALE': { color: 'geekblue', text: 'Nam' },
          'FEMALE': { color: 'pink', text: 'Nữ' },
          'OTHER': { color: 'purple', text: 'Khác' }
        };
        const config = genderConfig[gender] || { color: 'default', text: 'N/A' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'Nam', value: 'MALE' },
        { text: 'Nữ', value: 'FEMALE' },
        { text: 'Khác', value: 'OTHER' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.shipperId)}>Sửa</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  if (currentView === 'create') {
    return (
      <div className="bg-vietnam-cream min-h-screen p-6">
        <CreateShipperForm onBack={handleBackToList} onSuccess={handleCreateSuccess} />
      </div>
    );
  }

  return (
    <div className="bg-vietnam-cream min-h-screen p-6 font-sans">
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-red !mb-1">
              <Space><TeamOutlined /> Quản lý Shipper</Space>
            </Title>
            <Text type="secondary">Quản lý và cấp tài khoản cho người giao hàng.</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadShippers} loading={loading}>Tải lại</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCurrentView('create')} className="bg-vietnam-red hover:!bg-red-800">
              Tạo tài khoản
            </Button>
          </Space>
        </div>
      </Card>
      
      <Card className="shadow-lg rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, username, email, điện thoại..."
            prefix={<SearchOutlined className="text-gray-400"/>}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-96"
            allowClear
          />
           <div className="flex-shrink-0">
            <Text strong>Tổng số: </Text>
            <Tag color="blue" className="text-sm">{filteredShippers.length} shipper</Tag>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredShippers}
          rowKey="shipperId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} shipper`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty description="Không có shipper nào." image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCurrentView('create')} className="bg-vietnam-red hover:!bg-red-800">
                  Tạo shipper đầu tiên
                </Button>
              </Empty>
            )
          }}
        />
      </Card>
    </div>
  );
};

export default ShipperManagement;