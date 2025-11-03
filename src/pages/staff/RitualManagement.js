// src/pages/admin/RitualManagement.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Spin, Card, Typography, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { ritualService } from '../../services/ritualService';
import ViewRitual from './ViewRitual';
import EditRitual from './EditRitual';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const RitualManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentView, setCurrentView] = useState('list');
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentView === 'list') {
      fetchRituals();
    }
  }, [currentView]);

  const fetchRituals = async () => {
    setLoading(true);
    try {
      const data = await ritualService.getAllRituals();
      const transformedData = data.map(ritual => ({ ...ritual, key: ritual.ritualId }));
      setRituals(transformedData);
    } catch (error) {
      message.error('Không thể tải danh sách lễ hội!');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (ritualId) => {
    setSelectedRitualId(ritualId);
    setCurrentView('view');
  };

  const handleEdit = (ritualId) => {
    setSelectedRitualId(ritualId);
    setCurrentView('edit');
  };

  const handleDelete = (ritualId, ritualName) => {
    Modal.confirm({
      title: 'Xác nhận xóa lễ hội',
      content: `Bạn có chắc chắn muốn xóa "${ritualName}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ritualService.deleteRitual(ritualId);
          message.success('Xóa lễ hội thành công!');
          fetchRituals();
        } catch (error) {
          message.error('Xóa lễ hội thất bại!');
        }
      },
    });
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRitualId(null);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await ritualService.createRitual(values);
      message.success('Thêm lễ hội thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchRituals();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Thêm lễ hội thất bại!';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const columns = [
    { title: 'STT', dataIndex: 'ritualId', key: 'ritualId', width: 80 },
    { title: 'Tên lễ hội', dataIndex: 'ritualName', key: 'ritualName', render: (text) => <Text strong>{text}</Text> },
    { title: 'Vùng miền', dataIndex: 'regionName', key: 'regionName', render: (region) => {
      if ( region === 'Miền Bắc') {
        return <Tag color="blue">Miền Bắc</Tag>;
      } else if ( region === 'Miền Trung') {
        return <Tag color="green">Miền Trung</Tag>;
      } else if ( region === 'Miền Nam') {
        return <Tag color="orange">Miền Nam</Tag>;
      } else {
        return <Tag color="purple">Toàn quốc</Tag>;
      }

    } },
    { title: 'Ngày âm lịch', dataIndex: 'dateLunar', key: 'dateLunar' },
    { title: 'Ngày dương lịch', dataIndex: 'dateSolar', key: 'dateSolar', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-' },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.ritualId)}>Xem</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.ritualId)}>Sửa</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.ritualId, record.ritualName)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  if (currentView === 'view') {
    return <ViewRitual ritualId={selectedRitualId} onBack={handleBackToList} onEdit={handleEdit} />;
  }

  if (currentView === 'edit') {
    return <EditRitual ritualId={selectedRitualId} onBack={handleBackToList} onSave={handleBackToList} />;
  }

  return (
    <div className="bg-vietnam-cream min-h-screen p-6 font-sans">
       <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space><BookOutlined /> Quản lý Lễ hội</Space>
            </Title>
            <Text type="secondary">Thêm, xóa, sửa và quản lý các nghi lễ truyền thống.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="bg-vietnam-green hover:!bg-emerald-800">
            Thêm lễ hội
          </Button>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={rituals}
            pagination={{ pageSize: 10, showTotal: (total) => `Tổng số ${total} lễ hội` }}
            locale={{
              emptyText: (
                <Empty description="Chưa có lễ hội nào." image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="bg-vietnam-green hover:!bg-emerald-800">
                    Thêm lễ hội đầu tiên
                  </Button>
                </Empty>
              )
            }}
          />
        </Spin>
      </Card>

      <Modal
        title="Thêm Lễ Hội Mới"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
          <Form.Item name="ritualName" label="Tên lễ hội" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
            <Input placeholder="Ví dụ: Lễ Vu Lan" />
          </Form.Item>
          <Form.Item name="regionId" label="Vùng miền" rules={[{ required: true, message: 'Vui lòng chọn vùng miền!' }]}>
            <Select placeholder="Chọn vùng miền">
              <Option value={1}>Miền Bắc</Option>
              <Option value={2}>Miền Trung</Option>
              <Option value={3}>Miền Nam</Option>
              <Option value={0}>Toàn quốc</Option>
            </Select>
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item name="dateLunar" label="Ngày âm lịch">
              <Input placeholder="Ví dụ: 15/07" />
            </Form.Item>
            <Form.Item name="dateSolar" label="Ngày dương lịch">
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả ngắn gọn về lễ hội..." />
          </Form.Item>
          <Form.Item name="meaning" label="Ý nghĩa">
            <TextArea rows={4} placeholder="Nêu ý nghĩa của lễ hội..." />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting} className="bg-vietnam-green hover:!bg-emerald-800">
                Thêm lễ hội
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RitualManagement;