// src/pages/admin/components/CreateShipperForm.js
import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, Space, message, Row, Col, Alert, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, TeamOutlined, ArrowLeftOutlined, SaveOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import shipperService from '../../services/shipperService';

const { Option } = Select;
const { Title, Text } = Typography;

const CreateShipperForm = ({ onBack, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const shipperData = {
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone,
        shipperName: values.shipperName,
        gender: values.gender
      };
      const response = await shipperService.createShipper(shipperData);
      setCreatedAccount(response);
      message.success('Tài khoản shipper đã được tạo thành công!');
      form.resetFields();
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error creating shipper:', error);
      const errorMessage = error.response?.data?.message || 'Tạo tài khoản thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateUsername = (shipperName) => {
    if (!shipperName) return '';
    const username = shipperName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').slice(0, 20);
    const randomNum = Math.floor(Math.random() * 1000);
    return `${username}${randomNum}`;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (name && !form.isFieldTouched('username')) {
      const suggestedUsername = generateUsername(name);
      form.setFieldsValue({ username: suggestedUsername });
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ password: password });
    message.info('Đã tạo mật khẩu ngẫu nhiên!');
  };

  return (
    <div className="font-sans">
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
                <Title level={2} className="font-serif !text-vietnam-green !mb-1">
                    <Space><TeamOutlined /> Tạo tài khoản Shipper mới</Space>
                </Title>
                <Text type="secondary">Cấp tài khoản cho người giao hàng mới vào hệ thống.</Text>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Quay lại danh sách</Button>
        </div>
      </Card>
      
      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4} className="font-serif !text-vietnam-green">Thông tin cá nhân</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="shipperName" label="Họ và tên shipper" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" onChange={handleNameChange} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                    <Select placeholder="Chọn giới tính">
                      <Option value="MALE">Nam</Option>
                      <Option value="FEMALE">Nữ</Option>
                      <Option value="OTHER">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                    <Input prefix={<MailOutlined />} placeholder="shipper@example.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải 10-11 số!' }]}>
                    <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={4} className="font-serif !text-vietnam-green">Thông tin đăng nhập</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập username!' }, { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ chứa chữ, số và _!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Tự động tạo hoặc nhập tay" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự!' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="dashed" onClick={generateRandomPassword} style={{ marginBottom: 24 }}>🎲 Tạo mật khẩu ngẫu nhiên</Button>
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="bg-vietnam-green hover:!bg-emerald-800">
                    {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </Button>
                  <Button size="large" onClick={onBack}>Hủy</Button>
                </Space>
              </Form.Item>
            </Card>
          </Form>
        </Col>

        <Col xs={24} lg={8}>
          {createdAccount ? (
            <Card title="✅ Tạo tài khoản thành công" className="shadow-lg rounded-xl bg-green-50 border-green-200">
              <Space direction="vertical" className="w-full">
                  <Text strong>Tên shipper:</Text> <Text copyable>{createdAccount.shipperName}</Text>
                  <Text strong>Username:</Text> <Text copyable code>{createdAccount.username}</Text>
                  <Text strong>Password:</Text> <Text copyable code>{createdAccount.password || "********"}</Text>
                  <Text strong>Email:</Text> <Text copyable>{createdAccount.email}</Text>
              </Space>
              <Alert message="Lưu ý quan trọng" description="Hãy sao chép và gửi thông tin tài khoản này cho shipper." type="warning" showIcon className="mt-4"/>
            </Card>
          ) : (
             <Card title="💡 Hướng dẫn" className="shadow-lg rounded-xl">
              <Space direction="vertical">
                <Text>✅ Điền đầy đủ thông tin vào biểu mẫu bên trái.</Text>
                <Text>✅ Username có thể được tạo tự động từ họ tên.</Text>
                <Text>✅ Sử dụng chức năng "Tạo mật khẩu ngẫu nhiên" để bảo mật hơn.</Text>
                <Text>✅ Sau khi tạo, thông tin tài khoản sẽ hiển thị ở đây.</Text>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CreateShipperForm;