import React from 'react';
import { Alert, Card, Row, Col, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

const ToastColorDemo = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Toast Color Scheme Demo</Title>
      <Paragraph>
        Đây là bản xem trước màu sắc mới cho hệ thống thông báo toast (màu cơ bản không gradient):
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Success Toast - Màu xanh lá">
            <Alert
              message="Đăng nhập thành công!"
              description="Chào mừng bạn quay trở lại. Hệ thống đã xác thực thành công tài khoản của bạn và bạn có thể tiếp tục sử dụng các tính năng."
              type="success"
              showIcon
              closable
              style={{
                marginBottom: '16px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Error Toast - Màu đỏ">
            <Alert
              message="Lỗi xác thực!"
              description="Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin và thử lại. Nếu vấn đề vẫn tiếp tục, hãy liên hệ hỗ trợ."
              type="error"
              showIcon
              closable
              style={{
                marginBottom: '16px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Warning Toast - Màu cam">
            <Alert
              message="Cảnh báo phiên làm việc!"
              description="Phiên làm việc của bạn sắp hết hạn. Vui lòng lưu công việc và đăng nhập lại để tiếp tục sử dụng hệ thống."
              type="warning"
              showIcon
              closable
              style={{
                marginBottom: '16px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Info Toast - Màu xanh dương">
            <Alert
              message="Thông báo hệ thống!"
              description="Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Dự kiến thời gian bảo trì là 30 phút. Vui lòng hoàn thành công việc trước thời gian này."
              type="info"
              showIcon
              closable
              style={{
                marginBottom: '16px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>Đặc điểm của hệ thống màu sắc mới (Solid colors):</Title>
        <Space direction="vertical" size="small">
          <Paragraph>
            • <strong>Success (Xanh lá #f6ffed):</strong> Màu xanh lá nhẹ nhàng, tạo cảm giác tích cực và thành công
          </Paragraph>
          <Paragraph>
            • <strong>Error (Đỏ #fff2f0):</strong> Màu đỏ nhẹ nhàng, dễ đọc và cảnh báo rõ ràng
          </Paragraph>
          <Paragraph>
            • <strong>Warning (Cam #fffbe6):</strong> Màu cam ấm áp, cảnh báo nhẹ nhàng nhưng hiệu quả
          </Paragraph>
          <Paragraph>
            • <strong>Info (Xanh dương #e6f7ff):</strong> Màu xanh dương nhẹ nhàng, phù hợp với thông tin và hướng dẫn
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default ToastColorDemo;