import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Spin, Card, Typography, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import regionService from '../../services/regionService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Load danh sách vùng miền
  const loadRegions = async () => {
    setLoading(true);
    try {
      const data = await regionService.getAllRegions();
      const transformedData = data.map(region => ({ ...region, key: region.regionId }));
      setRegions(transformedData);
    } catch (error) {
      message.error('Không thể tải danh sách vùng miền!');
      console.error('Error loading regions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  // Xử lý tạo mới
  const handleCreate = () => {
    setIsEditMode(false);
    setEditingRegion(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (region) => {
    setIsEditMode(true);
    setEditingRegion(region);
    form.setFieldsValue({
      regionName: region.regionName,
      regionDescription: region.regionDescription || ''
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = (region) => {
    Modal.confirm({
      title: 'Xác nhận xóa vùng miền',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa vùng miền này không?</p>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginTop: '10px', border: '1px solid #eee' }}>
            <p style={{ margin: 0 }}><strong>ID:</strong> {region.regionId}</p>
            <p style={{ margin: 0 }}><strong>Tên:</strong> {region.regionName}</p>
          </div>
          <p style={{ color: '#ff4d4f', marginTop: '10px' }}>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const hide = message.loading('Đang xóa vùng miền...', 0);
        try {
          await regionService.deleteRegion(region.regionId);
          hide();
          message.success(`Đã xóa vùng miền "${region.regionName}" thành công!`);
          loadRegions();
        } catch (error) {
          hide();
          console.error('Delete error:', error);
          const errorMessage = error.response?.data?.message || 'Xóa vùng miền thất bại. Vui lòng thử lại.';
          message.error(errorMessage);
        }
      }
    });
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (isEditMode && editingRegion) {
        // Cập nhật
        await regionService.updateRegion(editingRegion.regionId, values);
        message.success('Cập nhật vùng miền thành công!');
      } else {
        // Tạo mới
        await regionService.createRegion(values);
        message.success('Thêm vùng miền thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadRegions();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    }
  };

  // Lọc dữ liệu theo search text
  const filteredRegions = regions.filter(region =>
    region.regionName?.toLowerCase().includes(searchText.toLowerCase()) ||
    region.regionDescription?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: 'STT', 
      dataIndex: 'regionId', 
      key: 'regionId', 
      width: 80,
      sorter: (a, b) => a.regionId - b.regionId
    },
    { 
      title: 'Tên vùng miền', 
      dataIndex: 'regionName', 
      key: 'regionName',
      render: (text) => <Text strong className="text-vietnam-green">{text}</Text>,
      sorter: (a, b) => a.regionName.localeCompare(b.regionName)
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'regionDescription', 
      key: 'regionDescription',
      ellipsis: true,
      render: (text) => text || <Text type="secondary">Chưa có mô tả</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="font-sans">
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              Quản lý Vùng miền
            </Title>
            <Text type="secondary">Quản lý các vùng miền trong hệ thống.</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadRegions} loading={loading}>
              Tải lại
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreate}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm vùng miền
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Input
            placeholder="Tìm kiếm theo tên, mô tả..."
            prefix={<SearchOutlined className="text-gray-400"/>}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-96"
            allowClear
          />
          <div className="flex-shrink-0">
            <Text strong>Tổng số: </Text>
            <Tag color="blue" className="text-sm">{filteredRegions.length} vùng miền</Tag>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRegions}
          rowKey="regionId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} vùng miền`,
          }}
          locale={{
            emptyText: (
              <Empty description="Không có vùng miền nào." image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreate}
                  className="bg-vietnam-green hover:!bg-emerald-800"
                >
                  Thêm vùng miền đầu tiên
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Modal tạo/sửa vùng miền */}
      <Modal
        title={isEditMode ? 'Chỉnh sửa Vùng miền' : 'Thêm Vùng miền Mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingRegion(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="regionName"
            label="Tên vùng miền"
            rules={[
              { required: true, message: 'Vui lòng nhập tên vùng miền!' },
              { min: 2, message: 'Tên vùng miền phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Ví dụ: Miền Bắc, Miền Trung, Miền Nam" />
          </Form.Item>

          <Form.Item
            name="regionDescription"
            label="Mô tả"
            rules={[
              { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả về vùng miền (tùy chọn)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                className="bg-vietnam-green hover:!bg-emerald-800"
              >
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingRegion(null);
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

export default RegionManagement;
