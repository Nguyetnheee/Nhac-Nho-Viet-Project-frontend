import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  Space,
  message,
  Row,
  Col,
  Alert,
  Typography,
  Divider
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined
} from '@ant-design/icons';

// Import service
import shipperService from '../../services/shipperService';

const { Option } = Select;
const { Title, Text } = Typography;

const CreateShipperForm = ({ onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu gửi lên server
      const shipperData = {
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone,
        shipperName: values.shipperName,
        gender: values.gender
      };

      console.log('=== CREATING SHIPPER ACCOUNT ===');
      console.log('Shipper data:', shipperData);

      // Gọi API tạo shipper
      const response = await shipperService.createShipper(shipperData);

      console.log('=== SHIPPER CREATED SUCCESSFULLY ===');
      console.log('Response:', response);

      // Hiển thị thông tin tài khoản vừa tạo
      setCreatedAccount(response);
      
      message.success('Tài khoản shipper đã được tạo thành công!');

      // Reset form
      form.resetFields();

      // Callback thành công nếu có
      if (onSuccess) {
        onSuccess(response);
      }

    } catch (error) {
      console.error('=== ERROR CREATING SHIPPER ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);

      // Xử lý các loại lỗi
      if (error.response) {
        const { status, data } = error.response;
        console.error(`API Error ${status}:`, data);

        switch (status) {
          case 400:
            message.error(`Dữ liệu không hợp lệ: ${data.message || JSON.stringify(data)}`);
            break;
          case 401:
            message.error('Bạn không có quyền tạo tài khoản shipper!');
            break;
          case 403:
            message.error('Truy cập bị từ chối! Kiểm tra quyền Staff của bạn.');
            break;
          case 409:
            message.error('Username hoặc email đã tồn tại!');
            break;
          case 500:
            message.error('Lỗi server! Vui lòng thử lại sau.');
            break;
          default:
            message.error(`Lỗi không xác định: ${status} - ${data?.message || 'Không rõ nguyên nhân'}`);
        }
      } else if (error.request) {
        message.error('Không thể kết nối đến server!');
      } else {
        message.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tạo username tự động từ tên
  const generateUsername = (shipperName) => {
    if (!shipperName) return '';
    
    // Convert Vietnamese to ASCII và tạo username
    const username = shipperName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]/g, '') // Remove special chars
      .slice(0, 20); // Limit length
    
    // Add random numbers to make unique
    const randomNum = Math.floor(Math.random() * 1000);
    return `${username}${randomNum}`;
  };

  // Tự động tạo username khi nhập tên
  const handleNameChange = (e) => {
    const name = e.target.value;
    if (name && !form.getFieldValue('username')) {
      const suggestedUsername = generateUsername(name);
      form.setFieldValue('username', suggestedUsername);
    }
  };

  // Tạo password ngẫu nhiên
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('password', password);
    message.info('Đã tạo mật khẩu ngẫu nhiên!');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            Quay lại danh sách
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> Tạo tài khoản Shipper
          </Title>
        </Space>
      </div>

      {/* Alert hướng dẫn */}
      <Alert
        message="Hướng dẫn tạo tài khoản Shipper"
        description="Điền đầy đủ thông tin để tạo tài khoản mới cho shipper. Sau khi tạo thành công, shipper có thể sử dụng username/password để đăng nhập vào hệ thống."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        <Col span={16}>
          {/* Form tạo tài khoản */}
          <Card title="Thông tin tài khoản" style={{ marginBottom: 24 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {/* Thông tin cá nhân */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="shipperName"
                    label="Họ và tên shipper"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                      { min: 2, message: 'Họ tên phải ít nhất 2 ký tự!' },
                      { max: 100, message: 'Họ tên không được quá 100 ký tự!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nguyễn Văn A"
                      onChange={handleNameChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="MALE">Nam</Option>
                      <Option value="FEMALE">Nữ</Option>
                      <Option value="OTHER">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Thông tin liên hệ */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="shipper@example.com"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải 10-11 số!' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="0901234567"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Thông tin đăng nhập</Divider>

              {/* Thông tin đăng nhập */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                      { required: true, message: 'Vui lòng nhập username!' },
                      { min: 3, message: 'Username phải ít nhất 3 ký tự!' },
                      { max: 50, message: 'Username không được quá 50 ký tự!' },
                      { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ chứa chữ, số và _!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="shipper_username"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu!' },
                      { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' },
                      { max: 100, message: 'Mật khẩu không được quá 100 ký tự!' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập mật khẩu"
                      iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Nút tạo password tự động */}
              <Row gutter={16}>
                <Col span={24}>
                  <Button 
                    type="dashed" 
                    onClick={generateRandomPassword}
                    style={{ marginBottom: 16 }}
                  >
                    🎲 Tạo mật khẩu ngẫu nhiên
                  </Button>
                </Col>
              </Row>

              {/* Submit buttons */}
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                  >
                    {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Shipper'}
                  </Button>
                  <Button size="large" onClick={onBack}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          {/* Thông tin tài khoản vừa tạo */}
          {createdAccount && (
            <Card title="✅ Tài khoản đã tạo thành công!" type="inner">
              <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>👤 Tên shipper:</Text>
                    <br />
                    <Text copyable>{createdAccount.shipperName}</Text>
                  </div>
                  
                  <div>
                    <Text strong>🔑 Username:</Text>
                    <br />
                    <Text copyable code>{createdAccount.username}</Text>
                  </div>
                  
                  <div>
                    <Text strong>🔒 Password:</Text>
                    <br />
                    <Text copyable code>{createdAccount.password}</Text>
                  </div>
                  
                  <div>
                    <Text strong>📧 Email:</Text>
                    <br />
                    <Text copyable>{createdAccount.email}</Text>
                  </div>
                  
                  <div>
                    <Text strong>📱 Phone:</Text>
                    <br />
                    <Text>{createdAccount.phone}</Text>
                  </div>
                  
                  <div>
                    <Text strong>👥 Giới tính:</Text>
                    <br />
                    <Text>{createdAccount.gender === 'MALE' ? 'Nam' : createdAccount.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</Text>
                  </div>
                </Space>
              </div>
              
              <Alert
                message="Lưu ý quan trọng"
                description="Hãy lưu lại thông tin tài khoản và cung cấp cho shipper để họ có thể đăng nhập vào hệ thống."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Card>
          )}

          {/* Hướng dẫn */}
          <Card title="💡 Hướng dẫn" type="inner" style={{ marginTop: 16 }}>
            <Space direction="vertical">
              <Text>✅ Username sẽ được tạo tự động từ tên</Text>
              <Text>✅ Có thể tạo mật khẩu ngẫu nhiên</Text>
              <Text>✅ Email phải là địa chỉ email hợp lệ</Text>
              <Text>✅ SĐT phải 10-11 chữ số</Text>
              <Text>✅ Sau khi tạo, shipper có thể đăng nhập ngay</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateShipperForm;