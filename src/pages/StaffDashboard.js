import React, { useState } from 'react';
import {
  FileOutlined,
  PieChartOutlined,
  EditOutlined,
  TeamOutlined,
  GoldOutlined,
  CarOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';

// Import các component trang con
import Overview from './staff/Overview';
import Inventory from './staff/Inventory';
import RitualManagement from './staff/RitualManagement';
import TrayManagement from './staff/TrayManagement';
import ChecklistManagement from './staff/ChecklistManagement';
import ShipperManagement from './staff/ShipperManagement';
import CustomerManagement from './staff/CustomerManagement';
import OrderManagement from './staff/OrderManagement';
import VoucherManagement from './staff/VoucherManagement';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Tổng quan', '1', <PieChartOutlined />),
  getItem('Kho hàng', '2', <GoldOutlined />),
  getItem('Quản lý', 'sub1', <EditOutlined />, [
    getItem('Lễ hội', '3'),
    getItem('Mâm cúng', '4'),
    getItem('Danh mục', '5'),
  ]),
  getItem('Ưu đãi', '10', <GiftOutlined />),
  getItem('Vai trò', 'sub2', <TeamOutlined />, [getItem('Shipper', '6', <CarOutlined />), getItem('Khách hàng', '8', <UserOutlined />)]),
  getItem('Đơn hàng', '9', <FileOutlined />),
];

const StaffDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1'); // State để tracking menu được chọn
  const { user, logout } = useAuth(); // Lấy thông tin user và logout function

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Handle logout
  const handleLogout = () => {
    logout(); // AuthContext sẽ tự động redirect về /admin-login cho STAFF
  };

  // Function để render content dựa trên menu được chọn
  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <Overview />;
      case '2':
        return <Inventory />;
      case '3':
        return <RitualManagement />;
      case '4':
        return <TrayManagement />;
      case '5':
        return <ChecklistManagement />;
      case '6':
        return <ShipperManagement />;
      case '8':
        return <CustomerManagement />;
      case '9':
        return <OrderManagement />;
      case '10':
        return <VoucherManagement />;
      default:
        return <Overview />;
    }
  };
  // Function để lấy breadcrumb dựa trên menu được chọn
  const getBreadcrumb = () => {
    const breadcrumbMap = {
      '1': [{ title: 'Dashboard' }, { title: 'Tổng quan' }],
      '2': [{ title: 'Dashboard' }, { title: 'Kho hàng' }],
      '3': [{ title: 'Dashboard' }, { title: 'Quản lý' }, { title: 'Lễ hội' }],
      '4': [{ title: 'Dashboard' }, { title: 'Quản lý' }, { title: 'Mâm cúng' }],
      '5': [{ title: 'Dashboard' }, { title: 'Quản lý' }, { title: 'Checklist' }],
      '6': [{ title: 'Dashboard' }, { title: 'Vai trò' }, { title: 'Shipper' }],
      '8': [{ title: 'Dashboard' }, { title: 'Vai trò' }, { title: 'Khách hàng' }],
      '9': [{ title: 'Dashboard' }, { title: 'Đơn hàng' }],
      '10': [{ title: 'Dashboard' }, { title: 'Ưu đãi' }],
    };
    return breadcrumbMap[selectedKey] || [{ title: 'Dashboard' }];
  };

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout style={{
      minHeight: '100vh',

    }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{
          // height: 32,
          margin: 16,
          marginBottom: 20,
          // background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6
        }}
        >
          <img src={`${process.env.PUBLIC_URL}/android-icon-192x192.png`} />

        </div>




        <Menu
          theme="dark"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h3 style={{ margin: 0, color: '#1890ff' }}>
            Xin chào, {user?.username || 'Staff'}!
          </h3>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={getBreadcrumb()}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Nhắc Nhớ Việt ©{new Date().getFullYear()} - Staff Management System
        </Footer>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;