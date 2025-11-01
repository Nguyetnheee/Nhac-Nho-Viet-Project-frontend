import React, { useState } from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import CustomAlert from '../components/CustomAlert';

const { Title, Paragraph } = Typography;

const CustomAlertDemo = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'success',
      message: 'Đăng nhập thành công!',
      description: 'Chào mừng bạn quay trở lại. Hệ thống đã xác thực thành công tài khoản của bạn và bạn có thể tiếp tục sử dụng các tính năng.',
      visible: true
    },
    {
      id: 2,
      type: 'error',
      message: 'Lỗi xác thực!',
      description: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin và thử lại. Nếu vấn đề vẫn tiếp tục, hãy liên hệ hỗ trợ.',
      visible: true
    },
    {
      id: 3,
      type: 'warning',
      message: 'Cảnh báo phiên làm việc!',
      description: 'Phiên làm việc của bạn sắp hết hạn. Vui lòng lưu công việc và đăng nhập lại để tiếp tục sử dụng hệ thống.',
      visible: true
    },
    {
      id: 4,
      type: 'info',
      message: 'Thông báo hệ thống!',
      description: 'Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Dự kiến thời gian bảo trì là 30 phút. Vui lòng hoàn thành công việc trước thời gian này.',
      visible: true
    }
  ]);

  const hideAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, visible: false } : alert
    ));
  };

  const showAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, visible: true })));
  };

  const addDynamicAlert = (type) => {
    const messages = {
      success: {
        message: 'Thao tác thành công!',
        description: 'Dữ liệu đã được lưu thành công vào hệ thống.'
      },
      error: {
        message: 'Lỗi hệ thống!',
        description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
      },
      warning: {
        message: 'Cảnh báo dung lượng!',
        description: 'Dung lượng lưu trữ của bạn đã sử dụng 90%. Vui lòng dọn dẹp để tiếp tục.'
      },
      info: {
        message: 'Cập nhật mới!',
        description: 'Phiên bản mới của ứng dụng đã có. Nhấn để cập nhật ngay.'
      }
    };

    const newAlert = {
      id: Date.now(),
      type,
      ...messages[type],
      visible: true
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Custom Alert Component Demo</Title>
      <Paragraph>
        Đây là hệ thống thông báo mới với màu sắc đẹp và phù hợp cho từng loại thông báo khác nhau.
      </Paragraph>

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Thêm thông báo động:</Title>
        <Space wrap>
          <Button 
            type="primary" 
            onClick={() => addDynamicAlert('success')}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Thêm Success
          </Button>
          <Button 
            danger 
            onClick={() => addDynamicAlert('error')}
          >
            Thêm Error
          </Button>
          <Button 
            onClick={() => addDynamicAlert('warning')}
            style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }}
          >
            Thêm Warning
          </Button>
          <Button 
            onClick={() => addDynamicAlert('info')}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
          >
            Thêm Info
          </Button>
          <Button onClick={showAllAlerts}>
            Hiện tất cả
          </Button>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {alerts.map((alert) => (
          alert.visible && (
            <Col xs={24} lg={12} key={alert.id}>
              <CustomAlert
                type={alert.type}
                message={alert.message}
                description={alert.description}
                onClose={() => hideAlert(alert.id)}
              />
            </Col>
          )
        ))}
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>Đặc điểm của Custom Alert (Solid Colors):</Title>
        <Space direction="vertical" size="small">
          <Paragraph>
            • <strong>Solid Background:</strong> Màu nền cơ bản, không gradient, dễ nhìn
          </Paragraph>
          <Paragraph>
            • <strong>Responsive Design:</strong> Tự động điều chỉnh theo kích thước màn hình
          </Paragraph>
          <Paragraph>
            • <strong>Icon Integration:</strong> Icons phù hợp cho từng loại thông báo
          </Paragraph>
          <Paragraph>
            • <strong>Closable:</strong> Có thể đóng thông báo bằng nút X
          </Paragraph>
          <Paragraph>
            • <strong>Accessibility:</strong> Hỗ trợ screen reader và keyboard navigation
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default CustomAlertDemo;