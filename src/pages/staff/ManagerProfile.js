import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Tag, Spin, message, Modal, Form, Input, Space } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { fetchManagerProfile } from '../../services/apiAuth';

const ManagerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [managerProfile, setManagerProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadManagerProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadManagerProfile = async () => {
    setLoading(true);
    try {
      // Fetch từ API để lấy thông tin mới nhất
      const data = await fetchManagerProfile();
      setManagerProfile(data);
      console.log('✅ Manager profile loaded:', data);
    } catch (error) {
      console.error('❌ Error loading manager profile:', error);
      // Fallback về user từ AuthContext nếu API fail
      if (user) {
        setManagerProfile({
          id: user.id,
          managerName: user.managerName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        });
      }
      message.error('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = () => {
    if (managerProfile) {
      form.setFieldsValue({
        managerName: managerProfile.managerName || '',
        email: managerProfile.email || '',
        phone: managerProfile.phone || ''
      });
    }
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setLoading(true);
    try {
      const profileData = {
        managerName: values.managerName,
        email: values.email,
        phone: values.phone
      };
      
      const result = await updateProfile(profileData);
      if (result.success) {
        message.success('Cập nhật thông tin thành công!');
        setEditModalVisible(false);
        form.resetFields();
        // Reload profile để lấy dữ liệu mới nhất
        await loadManagerProfile();
      } else {
        message.error(result.error || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const getRoleTag = (role) => {
    const roleMap = {
      'MANAGER': { text: 'Quản lý', color: 'blue' },
      'ADMIN': { text: 'Quản trị viên', color: 'purple' },
    };
    const roleInfo = roleMap[role?.toUpperCase()] || { text: role || 'N/A', color: 'default' };
    return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
  };

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Thông tin tài khoản</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={showEditModal}
            loading={loading}
          >
            Chỉnh sửa
          </Button>
        }
        loading={loading}
      >
        {managerProfile ? (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Tên đăng nhập">
              <span style={{ fontWeight: '500' }}>{managerProfile.username || 'N/A'}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Họ và tên">
              {managerProfile.managerName || 'Chưa cập nhật'}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {managerProfile.email || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item label="Số điện thoại">
              {managerProfile.phone || 'Chưa cập nhật'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Không có thông tin để hiển thị</p>
          </div>
        )}
      </Card>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa thông tin tài khoản"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Họ và tên"
            name="managerName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerProfile;

