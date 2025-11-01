import React from 'react';
import { useToast } from '../components/ToastContainer';
import { Button, Space, Typography, Card, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const ToastDemo = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess(
      'Đăng nhập thành công!', 
      'Chào mừng bạn quay trở lại. Hệ thống đã xác thực thành công tài khoản của bạn.'
    );
  };

  const handleError = () => {
    showError(
      'Lỗi xác thực!', 
      'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin và thử lại.'
    );
  };

  const handleWarning = () => {
    showWarning(
      'Cảnh báo phiên làm việc!', 
      'Phiên làm việc của bạn sắp hết hạn. Vui lòng lưu công việc và đăng nhập lại để tiếp tục.'
    );
  };

  const handleInfo = () => {
    showInfo(
      'Thông báo hệ thống!', 
      'Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Dự kiến thời gian bảo trì là 30 phút.'
    );
  };

  const handleSuccessSimple = () => {
    showSuccess('Đã lưu thành công!');
  };

  const handleErrorSimple = () => {
    showError('Không thể kết nối đến máy chủ!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>Demo Toast Notifications</Title>
      
      <Paragraph>
        Nhấn các nút bên dưới để xem các loại thông báo toast với giao diện được cải thiện:
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Toast với mô tả chi tiết" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                onClick={handleSuccess}
                style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                ✓ Thành công
              </Button>
              <Button 
                danger 
                onClick={handleError}
                style={{ width: '100%' }}
              >
                ✗ Lỗi
              </Button>
              <Button 
                onClick={handleWarning}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#faad14', 
                  borderColor: '#faad14', 
                  color: 'white' 
                }}
              >
                ⚠ Cảnh báo
              </Button>
              <Button 
                onClick={handleInfo}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#1890ff', 
                  borderColor: '#1890ff', 
                  color: 'white' 
                }}
              >
                ℹ Thông tin
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Toast đơn giản" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                onClick={handleSuccessSimple}
                style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Thành công đơn giản
              </Button>
              <Button 
                danger 
                onClick={handleErrorSimple}
                style={{ width: '100%' }}
              >
                Lỗi đơn giản
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <Title level={5}>Cách sử dụng trong component:</Title>
        <pre style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
{`import { useToast } from '../components/ToastContainer';

const YourComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Với mô tả
  showSuccess('Tiêu đề', 'Mô tả chi tiết');
  
  // Không có mô tả
  showError('Chỉ có thông báo lỗi');
  
  // Với thời gian tùy chỉnh (ms)
  showWarning('Cảnh báo', 'Mô tả', 3000);
};`}
        </pre>
      </div>
    </div>
  );
};

export default ToastDemo;