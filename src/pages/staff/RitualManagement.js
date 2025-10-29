import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ritualService } from '../../services/ritualService';

// Import các component mới
import ViewRitual from './ViewRitual';
import EditRitual from './EditRitual';

const { TextArea } = Input;
const { Option } = Select;

const RitualManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentView, setCurrentView] = useState('list');
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data khi component mount
  useEffect(() => {
    fetchRituals();
  }, []);

  const fetchRituals = async () => {
    setLoading(true);
    try {
      const data = await ritualService.getAllRituals();
      // Transform data để phù hợp với Table
      const transformedData = data.map((ritual, index) => ({
        key: ritual.ritualId.toString(),
        id: ritual.ritualId,
        name: ritual.ritualName,
        region: ritual.regionName,
        dateLunar: ritual.dateLunar,
        dateSolar: ritual.dateSolar,
        description: ritual.description,
        meaning: ritual.meaning,
        imageUrl: ritual.imageUrl,
        status: 'active', // Mặc định, có thể thay đổi nếu backend có trường này
      }));
      setRituals(transformedData);
    } catch (error) {
      message.error('Không thể tải danh sách lễ hội!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      title: 'Ngày âm lịch',
      dataIndex: 'dateLunar',
      key: 'dateLunar',
    },
    {
      title: 'Ngày dương lịch',
      dataIndex: 'dateSolar',
      key: 'dateSolar',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
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
      onOk: async () => {
        try {
          await ritualService.deleteRitual(ritualId);
          message.success('Xóa lễ hội thành công!');
          fetchRituals(); // Refresh danh sách
        } catch (error) {
          message.error('Xóa lễ hội thất bại!');
          console.error(error);
        }
      },
    });
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRitualId(null);
    fetchRituals(); // Refresh data khi quay về
  };

  const handleSaveEdit = (updatedRitual) => {
    message.success('Cập nhật lễ hội thành công!');
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
    try {
      setLoading(true);

      // Log để kiểm tra dữ liệu trước khi gửi
      console.log('Form values:', values);

      const result = await ritualService.createRitual(values);

      console.log('Created ritual:', result);
      message.success('Thêm lễ hội thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchRituals(); // Refresh danh sách
    } catch (error) {
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Thêm lễ hội thất bại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={rituals}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} lễ hội`,
          }}
        />
      </Spin>

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
            name="ritualName"
            label="Tên lễ hội"
            rules={[{ required: true, message: 'Vui lòng nhập tên lễ hội!' }]}
          >
            <Input placeholder="Nhập tên lễ hội..." />
          </Form.Item>

          <Form.Item
            name="regionId"
            label="Vùng miền"
            rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}
          >
            <Select placeholder="Chọn vùng miền">
              <Option value={1}>Miền Bắc</Option>
              <Option value={2}>Miền Trung</Option>
              <Option value={3}>Miền Nam</Option>
              <Option value={0}>Toàn quốc</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateLunar"
            label="Ngày âm lịch"
          >
            <Input placeholder="VD: 01/01" />
          </Form.Item>

          <Form.Item
            name="dateSolar"
            label="Ngày dương lịch"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={4} placeholder="Nhập mô tả lễ hội..." />
          </Form.Item>

          <Form.Item
            name="meaning"
            label="Ý nghĩa"
          >
            <TextArea rows={4} placeholder="Nhập ý nghĩa lễ hội..." />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="URL hình ảnh"
          >
            <Input placeholder="Nhập URL hình ảnh..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
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