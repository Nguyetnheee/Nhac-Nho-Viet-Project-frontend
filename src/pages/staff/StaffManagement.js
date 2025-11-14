// src/pages/staff/StaffManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Card, message, Tag, Typography, Modal, Space, Tooltip, Form, Select } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { managerService } from '../../services/managerService';

const { Title, Text } = Typography;
const { Option } = Select;

const StaffManagement = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadStaffs = async () => {
    setLoading(true);
    try {
      console.log('Đang tải danh sách staff từ API...');
      const response = await managerService.getAllStaffs();
      console.log('API Response:', response);

      // Xử lý dữ liệu từ backend
      // Backend trả về: [{ staffId, staffName, email, phone, gender }]
      let staffList = [];

      if (Array.isArray(response)) {
        staffList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        staffList = response.data;
      }

      const mappedStaffs = staffList.map((staff, index) => {
        return {
          key: staff.staffId || index,
          staffId: staff.staffId,
          staffName: staff.staffName || 'Chưa cập nhật',
          email: staff.email,
          phone: staff.phone || 'Chưa có',
          gender: staff.gender || 'Chưa rõ',
        };
      });

      setStaffs(mappedStaffs);
      message.success(`Đã tải ${mappedStaffs.length} staff thành công`);
    } catch (error) {
      console.error('Error loading staffs:', error);

      // Thông báo lỗi dễ hiểu cho người dùng
      let errorMessage = 'Không thể tải danh sách staff. ';

      if (error.response) {
        // Lỗi từ server
        if (error.response.status === 404) {
          errorMessage += 'Không tìm thấy dữ liệu.';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage += 'Bạn không có quyền xem thông tin này.';
        } else if (error.response.status >= 500) {
          errorMessage += 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.';
        } else {
          errorMessage += 'Vui lòng thử lại.';
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage += 'Không thể kết nối với hệ thống. Vui lòng kiểm tra kết nối mạng.';
      } else {
        // Lỗi khác
        errorMessage += 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      }

      message.error(errorMessage);
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffs();
  }, []);

  const handleViewDetail = (record) => {
    setSelectedStaff(record);
    setIsDetailModalVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCreateSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Creating staff with data:', values);
      
      const staffData = {
        username: values.username,
        password: values.password,
        email: values.email,
        phone: values.phone,
        staffName: values.staffName,
        gender: values.gender
      };

      await managerService.createStaff(staffData);
      message.success('Tạo tài khoản staff thành công!');
      setIsCreateModalVisible(false);
      form.resetFields();
      await loadStaffs();
    } catch (error) {
      console.error('Error creating staff:', error);
      let errorMessage = 'Không thể tạo tài khoản staff. ';
      
      if (error.response?.status === 400) {
        errorMessage += error.response?.data?.message || 'Thông tin không hợp lệ.';
      } else if (error.response?.status === 403) {
        errorMessage += 'Bạn không có quyền tạo tài khoản staff.';
      } else if (error.response?.status === 409) {
        errorMessage += 'Username hoặc email đã tồn tại.';
      } else {
        errorMessage += error.response?.data?.message || 'Vui lòng thử lại.';
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredStaffs = staffs.filter(staff => {
    if (!searchText) return true;

    const searchLower = searchText.toLowerCase();
    return (
      staff.staffName?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.phone?.includes(searchText)
    );
  });

  const getGenderTag = (gender) => {
    // Chuẩn hóa giá trị gender trước khi kiểm tra
    const normalizedGender = gender?.toString().toUpperCase().trim();
    
    const genderMap = {
      'MALE': { text: 'Nam', color: 'blue' },
      'NAM': { text: 'Nam', color: 'blue' },
      'M': { text: 'Nam', color: 'blue' },
      'FEMALE': { text: 'Nữ', color: 'pink' },
      'NỮ': { text: 'Nữ', color: 'pink' },
      'NU': { text: 'Nữ', color: 'pink' },
      'F': { text: 'Nữ', color: 'pink' },
    };

    const genderInfo = genderMap[normalizedGender] || { text: 'Chưa rõ', color: 'default' };
    return <Tag color={genderInfo.color}>{genderInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'staffId',
      key: 'staffId',
      width: 80,
      sorter: (a, b) => (a.staffId || 0) - (b.staffId || 0),
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'staffName',
      key: 'staffName',
      width: 200,
      sorter: (a, b) => (a.staffName || '').localeCompare(b.staffName || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      align: 'center',
      render: (gender) => getGenderTag(gender),
      filters: [
        { text: 'Nam', value: 'MALE' },
        { text: 'Nữ', value: 'FEMALE' },
      ],
      filterResetText: 'Đặt lại',
      onFilter: (value, record) => record.gender?.toUpperCase() === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>Quản Lý Nhân Viên</Space>
            </Title>
            <Text type="secondary">Quản lý và tạo tài khoản nhân viên trong hệ thống</Text>
          </div>
          <Space>
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={loadStaffs} loading={loading}>
                Tải lại
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm nhân viên mới
            </Button>
          </Space>
        </div>
      </Card>

      <div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1, minWidth: '300px' }}
            allowClear
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Text strong>
            Tổng số: <Tag color="blue">{filteredStaffs.length} nhân viên</Tag>
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filteredStaffs}
          rowKey="staffId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
           
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: { items_per_page: '/ trang' },
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: searchText ? 'Không tìm thấy staff nào' : 'Không có staff nào',
            filterReset: 'Đặt lại',
            filterConfirm: 'OK',
          }}
        />
      </div>

      {/* Modal Chi tiết staff */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Thông tin chi tiết của nhân viên</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedStaff && (
          <div style={{ padding: '16px 0' }}>
            <div style={{
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'auto 1fr'
            }}>
              <div style={{ display: 'contents' }}>
              

                <Text strong>Tên nhân viên:</Text>
                <Text>{selectedStaff.staffName}</Text>

                <Text strong>Email:</Text>
                <Text copyable>{selectedStaff.email}</Text>

                <Text strong>Số điện thoại:</Text>
                <Text copyable>{selectedStaff.phone}</Text>

                <Text strong>Giới tính:</Text>
                <div>{getGenderTag(selectedStaff.gender)}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tạo staff mới */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Tạo tài khoản nhân viên mới</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Tên nhân viên"
            name="staffName"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
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

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo tài khoản
              </Button>
              <Button onClick={() => {
                setIsCreateModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;

