// src/pages/staff/CustomerManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Card, message, Tag, Typography, Modal, Space, Tooltip } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  PlusOutlined
} from '@ant-design/icons';
import staffService from '../../services/staffService';

const { Title, Text } = Typography;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      console.log('Đang tải danh sách khách hàng từ API...');
      const response = await staffService.getCustomers();
      console.log('API Response:', response);

      // Xử lý dữ liệu từ backend
      // Backend trả về: id, username, email, phone, customerName, gender, address, createdAt, updatedAt
      let customerList = [];

      if (Array.isArray(response)) {
        customerList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        customerList = response.data;
      }

      const mappedCustomers = customerList.map(customer => ({
        id: customer.id,
        username: customer.username,
        customerName: customer.customerName || customer.name || 'Chưa cập nhật',
        email: customer.email,
        phone: customer.phone || 'Chưa có',
        gender: customer.gender || 'Chưa rõ',
        address: customer.address || 'Chưa cập nhật',
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: customer.updatedAt || new Date().toISOString()
      }));

      setCustomers(mappedCustomers);
      message.success(`Đã tải ${mappedCustomers.length} khách hàng thành công`);
    } catch (error) {
      console.error('Error loading customers:', error);

      // Thông báo lỗi dễ hiểu cho người dùng
      let errorMessage = 'Không thể tải danh sách khách hàng. ';

      if (error.response) {
        // Lỗi từ server
        if (error.response.status === 404) {
          errorMessage += 'Không tìm thấy dữ liệu.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage += 'Bạn không có quyền xem thông tin này.';
        } else if (error.response.status >= 500) {
          errorMessage += 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.';
        } else {
          errorMessage += 'Vui lòng thử lại.';
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage += 'Không thể kết nối với hệ thống. Vui lòng kiểm tra kết nối mạng.';
      } else {
        // Lỗi khác
        errorMessage += 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      }

      message.error(errorMessage);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleViewDetail = (record) => {
    setSelectedCustomer(record);
    setIsDetailModalVisible(true);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchText) return true;

    const searchLower = searchText.toLowerCase();
    return (
      customer.customerName?.toLowerCase().includes(searchLower) ||
      customer.username?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchText) ||
      customer.address?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenderTag = (gender) => {
    const genderMap = {
      'MALE': { text: 'Nam', color: 'blue' },
      'FEMALE': { text: 'Nữ', color: 'pink' },
      'OTHER': { text: 'Khác', color: 'default' }
    };

    const genderInfo = genderMap[gender?.toUpperCase()] || { text: 'Chưa rõ', color: 'default' };
    return <Tag color={genderInfo.color}>{genderInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      sorter: (a, b) => (a.customerName || '').localeCompare(b.customerName || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      align: 'center',
      render: (gender) => getGenderTag(gender),
      filters: [
        { text: 'Nam', value: 'MALE' },
        { text: 'Nữ', value: 'FEMALE' },
        { text: 'Khác', value: 'OTHER' },
      ],
      filterResetText: 'Đặt lại',
      onFilter: (value, record) => record.gender?.toUpperCase() === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        );
      },
    },
  ];

  return (
    <div >

      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>Quản lý Khách hàng</Space>
            </Title>
            <Text type="secondary">Quản lý và xem thông tin khách hàng</Text>
          </div>
          <Space>
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={loadCustomers} loading={loading}>
                Tải lại
              </Button>
            </Tooltip>
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm sản phẩm
            </Button> */}
          </Space>
        </div>
      </Card>
      {/* <Card
        bordered={false}
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      > */}
        <div 
        // style={{
        //   display: 'flex',
        //   alignItems: 'center',
        //   justifyContent: 'space-between',
        //   marginBottom: '24px',
        //   borderBottom: '2px solid #f0f0f0',
        //   paddingBottom: '16px'
        // }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* <TeamOutlined style={{ fontSize: '32px', color: '#1890ff' }} /> */}
            <div>
              {/* <Title level={2} style={{ margin: 0 }}>
                Quản lý Khách hàng
              </Title>
              <Text type="secondary">Quản lý và xem thông tin khách hàng</Text> */}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <Input
            placeholder="Tìm kiếm theo tên, username, email, điện thoại, địa chỉ..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1, minWidth: '300px' }}
            allowClear
          />
          {/* <Button
            icon={<ReloadOutlined />}
            onClick={loadCustomers}
            loading={loading}
          >
            Tải lại
          </Button> */}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text strong>
            Tổng số: <Tag color="blue">{filteredCustomers.length} khách hàng</Tag>
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: { items_per_page: '/ trang' },
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: searchText ? 'Không tìm thấy khách hàng nào' : 'Không có khách hàng nào',
            filterReset: 'Đặt lại',
            filterConfirm: 'OK',
          }}
        />
      {/* </Card> */}

      {/* Modal Chi tiết khách hàng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>Thông tin chi tiết khách hàng</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedCustomer && (
          <div style={{ padding: '16px 0' }}>
            <div style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'auto 1fr'
            }}>
              <div style={{ display: 'contents' }}>
                <Text strong>STT:</Text>
                <Text>{selectedCustomer.id}</Text>

                <Text strong>Tên đăng nhập:</Text>
                <Text copyable>{selectedCustomer.username}</Text>

                <Text strong>Tên khách hàng:</Text>
                <Text>{selectedCustomer.customerName}</Text>

                <Text strong>Email:</Text>
                <Text copyable>
                  {/* <MailOutlined style={{ marginRight: '8px', color: '#52c41a' }} /> */}
                  {selectedCustomer.email}
                </Text>

                <Text strong>Số điện thoại:</Text>
                <Text copyable>
                  {/* <PhoneOutlined style={{ marginRight: '8px', color: '#faad14' }} /> */}
                  {selectedCustomer.phone}
                </Text>

                <Text strong>Giới tính:</Text>
                <div>{getGenderTag(selectedCustomer.gender)}</div>

                <Text strong>Địa chỉ:</Text>
                <Text>
                  {/* <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} /> */}
                  {selectedCustomer.address}
                </Text>

                <Text strong>Ngày tạo tài khoản:</Text>
                <Text>{formatDate(selectedCustomer.createdAt)}</Text>

                <Text strong>Cập nhật lần cuối:</Text>
                <Text>{formatDate(selectedCustomer.updatedAt)}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
