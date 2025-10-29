import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  EditOutlined,
  TeamOutlined,
  GoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';

// Import các component trang con
import Overview from './staff/Overview';
import Inventory from './staff/Inventory';
import RitualManagement from './staff/RitualManagement';
import TrayManagement from './staff/TrayManagement';
import ChecklistManagement from './staff/ChecklistManagement';

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
  getItem('Xây dựng', 'sub1', <EditOutlined />, [
    getItem('Lễ hội', '3'),
    getItem('Mâm cúng', '4'),
    getItem('Checklist', '5'),
  ]),
  getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
  getItem('Files', '9', <FileOutlined />),
];

const StaffDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1'); // State để tracking menu được chọn
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
        return <div><h2>Team 1</h2><p>Nội dung Team 1...</p></div>;
      case '8':
        return <div><h2>Team 2</h2><p>Nội dung Team 2...</p></div>;
      case '9':
        return <div><h2>Files</h2><p>Quản lý file...</p></div>;
      default:
        return <Overview />;
    }
  };

  // Function để lấy breadcrumb dựa trên menu được chọn
  const getBreadcrumb = () => {
    const breadcrumbMap = {
      '1': [{ title: 'Dashboard' }, { title: 'Tổng quan' }],
      '2': [{ title: 'Dashboard' }, { title: 'Kho hàng' }],
      '3': [{ title: 'Dashboard' }, { title: 'Xây dựng' }, { title: 'Lễ hội' }],
      '4': [{ title: 'Dashboard' }, { title: 'Xây dựng' }, { title: 'Mâm cúng' }],
      '5': [{ title: 'Dashboard' }, { title: 'Xây dựng' }, { title: 'Checklist' }],
      '6': [{ title: 'Dashboard' }, { title: 'Team' }, { title: 'Team 1' }],
      '8': [{ title: 'Dashboard' }, { title: 'Team' }, { title: 'Team 2' }],
      '9': [{ title: 'Dashboard' }, { title: 'Files' }],
    };
    return breadcrumbMap[selectedKey] || [{ title: 'Dashboard' }];
  };

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6
        }} />
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
          padding: '0 16px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h3 style={{ margin: 0, color: '#1890ff' }}>
            🎋 Nhắc Nhớ Việt - Staff Dashboard
          </h3>
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