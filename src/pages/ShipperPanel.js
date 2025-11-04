// src/pages/ShipperPanel.js
import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Card, 
  Button, 
  Descriptions, 
  Form, 
  Input, 
  Select, 
  Modal, 
  message,
  Spin,
  Tag,
} from 'antd';
import {
  ShoppingOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import ShipperOrderManagement from './ShipperOrderManagement';
import shipperService from '../services/shipperService';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

const ShipperPanel = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  const [shipperProfile, setShipperProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const shipperUsername = shipperProfile?.shipperName || user?.username || "Shipper";

  // Fetch profile khi component mount
  useEffect(() => {
    fetchShipperProfile();
  }, []);

  const fetchShipperProfile = async () => {
    setLoading(true);
    try {
      const response = await shipperService.getProfile();
      setShipperProfile(response);
    } catch (error) {
      console.error('Error fetching shipper profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const response = await shipperService.updateProfile(values);
      setShipperProfile(prev => ({
        ...prev,
        ...response,
      }));
      message.success('Cập nhật thông tin thành công!');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating shipper profile:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = () => {
    setEditModalVisible(true);
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'Quản lý đơn hàng',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'orders':
        return <ShipperOrderManagement />;
      case 'profile':
        return (
          <div style={{ margin: '24px' }}>
            <Card 
              title="Thông tin cá nhân" 
              extra={
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={showEditModal}
                >
                  Chỉnh sửa
                </Button>
              }
              loading={loading}
            >
              {shipperProfile ? (
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Tên đăng nhập">
                    {shipperProfile.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên shipper">
                    {shipperProfile.shipperName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    {shipperProfile.gender === 'MALE' ? 'Nam' : 
                     shipperProfile.gender === 'FEMALE' ? 'Nữ' : 
                     shipperProfile.gender === 'OTHER' ? 'Khác' : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {shipperProfile.phone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {shipperProfile.email || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={shipperProfile.status === 'ACTIVE' ? 'green' : 'red'}>
                      {shipperProfile.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <p>Đang tải thông tin...</p>
              )}
            </Card>
          </div>
        );
      default:
        return <ShipperOrderManagement />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#001529' }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          borderBottom: '1px solid #002140'
        }}>
          {!collapsed ? '🚚 Shipper Panel' : '🚚'}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          items={menuItems}
          onClick={({ key }) => setActiveMenu(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#001529' }}>
              Chào mừng, <strong>{shipperUsername}</strong>!
            </h2>
          </div>
          
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>

        <Content style={{ margin: '0', overflow: 'initial', background: '#f0f2f5' }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Modal chỉnh sửa thông tin */}
      {editModalVisible && (
        <EditProfileModal
          visible={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onSubmit={handleUpdateProfile}
          initialValues={shipperProfile}
          loading={loading}
        />
      )}
    </Layout>
  );
};

// Component riêng cho Modal Edit
const EditProfileModal = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        shipperName: initialValues.shipperName,
        email: initialValues.email,
        phone: initialValues.phone,
        gender: initialValues.gender,
      });
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      title="Chỉnh sửa thông tin cá nhân"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          label="Tên shipper"
          name="shipperName"
          rules={[
            { required: true, message: 'Vui lòng nhập tên!' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập tên shipper" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value="MALE">Nam</Option>
            <Option value="FEMALE">Nữ</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            block
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShipperPanel;