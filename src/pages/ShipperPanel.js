// src/pages/ShipperPanel.js
import React, { useState } from 'react';
import { Layout, Menu, Card, Button } from 'antd';
import {
  ShoppingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import ShipperOrderManagement from './ShipperOrderManagement';

const { Header, Sider, Content } = Layout;

const ShipperPanel = () => {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  
  const shipperUsername = user?.username || "Shipper";

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
          <Card title="Thông tin cá nhân" style={{ margin: '24px' }}>
            <p><strong>Tên đăng nhập:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Vai trò:</strong> Shipper</p>
          </Card>
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
    </Layout>
  );
};

export default ShipperPanel;