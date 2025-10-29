import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

// Import các component mới
import ViewRitual from './ViewRitual';
import EditRitual from './EditRitual';

const { TextArea } = Input;
const { Option } = Select;

const RitualManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'view', 'edit'
  const [selectedRitualId, setSelectedRitualId] = useState(null);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên lễ hội',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Vùng miền',
      dataIndex: 'region',
      key: 'region',
      render: (region) => <Tag color="blue">{region}</Tag>,
    },
    {
      title: 'Ngày diễn ra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record.id)}
          >
            Xem
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record.id)}
          >
            Sửa
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      id: 1,
      name: 'Tết Nguyên Đán',
      region: 'Toàn quốc',
      date: '01/01/2025',
      status: 'active',
    },
    {
      key: '2',
      id: 2,
      name: 'Lễ hội Chợ trâu Đồ Sơn',
      region: 'Miền Bắc',
      date: null,
      status: 'active',
    },
    // Thêm data mẫu khác...
  ];

  // Navigation handlers
  const handleView = (ritualId) => {
    setSelectedRitualId(ritualId);
    setCurrentView('view');
  };

  const handleEdit = (ritualId) => {
    setSelectedRitualId(ritualId);
    setCurrentView('edit');
  };

  const handleDelete = (ritualId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lễ hội này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        console.log('Xóa lễ hội:', ritualId);
        // Thực hiện logic xóa ở đây
      },
    });
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRitualId(null);
  };

  const handleSaveEdit = (updatedRitual) => {
    console.log('Đã cập nhật lễ hội:', updatedRitual);
    // Refresh data và quay về list
    handleBackToList();
  };

  const handleAddRitual = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    console.log('Thêm lễ hội:', values);
    // Gọi API thêm lễ hội ở đây
    setIsModalVisible(false);
    form.resetFields();
  };

  // Render different views based on currentView state
  if (currentView === 'view') {
    return (
      <ViewRitual
        ritualId={selectedRitualId}
        onBack={handleBackToList}
        onEdit={handleEdit}
      />
    );
  }

  if (currentView === 'edit') {
    return (
      <EditRitual
        ritualId={selectedRitualId}
        onBack={handleBackToList}
        onSave={handleSaveEdit}
      />
    );
  }

  // Default list view
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý lễ hội</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRitual}>
          Thêm lễ hội
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title="Thêm lễ hội mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên lễ hội"
            rules={[{ required: true, message: 'Vui lòng nhập tên lễ hội!' }]}
          >
            <Input placeholder="Nhập tên lễ hội..." />
          </Form.Item>

          <Form.Item
            name="region"
            label="Vùng miền"
            rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}
          >
            <Select placeholder="Chọn vùng miền">
              <Option value="Toàn quốc">Toàn quốc</Option>
              <Option value="Miền Bắc">Miền Bắc</Option>
              <Option value="Miền Trung">Miền Trung</Option>
              <Option value="Miền Nam">Miền Nam</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày diễn ra"
          >
            <Input placeholder="VD: 01/01/2025" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả lễ hội..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm lễ hội
              </Button>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RitualManagement;