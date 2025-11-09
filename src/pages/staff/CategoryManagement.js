import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Card, Typography, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import categoryService from '../../services/categoryService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Load danh sách categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      const transformedData = data.map(category => ({ ...category, key: category.categoryId }));
      setCategories(transformedData);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục!');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Xử lý tạo mới
  const handleCreate = () => {
    setIsEditMode(false);
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (category) => {
    setIsEditMode(true);
    setEditingCategory(category);
    form.setFieldsValue({
      categoryName: category.categoryName,
      description: category.description || ''
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = (category) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa danh mục này không?</p>
          <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginTop: '10px', border: '1px solid #eee' }}>
            <p style={{ margin: 0 }}><strong>ID:</strong> {category.categoryId}</p>
            <p style={{ margin: 0 }}><strong>Tên:</strong> {category.categoryName}</p>
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
        const hide = message.loading('Đang xóa danh mục...', 0);
        try {
          await categoryService.deleteCategory(category.categoryId);
          hide();
          message.success(`Đã xóa danh mục "${category.categoryName}" thành công!`);
          loadCategories();
        } catch (error) {
          hide();
          console.error('Delete error:', error);
          const errorMessage = error.response?.data?.message || 'Xóa danh mục thất bại. Vui lòng thử lại.';
          message.error(errorMessage);
        }
      }
    });
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      if (isEditMode && editingCategory) {
        // Cập nhật
        await categoryService.updateCategory(editingCategory.categoryId, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        // Tạo mới
        await categoryService.createCategory(values);
        message.success('Thêm danh mục thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadCategories();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    }
  };

  // Lọc dữ liệu theo search text
  const filteredCategories = categories.filter(category =>
    category.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: 'STT', 
      dataIndex: 'categoryId', 
      key: 'categoryId', 
      width: 80,
      sorter: (a, b) => a.categoryId - b.categoryId
    },
    { 
      title: 'Tên danh mục', 
      dataIndex: 'categoryName', 
      key: 'categoryName',
      render: (text) => <Text strong className="text-vietnam-green">{text}</Text>,
      sorter: (a, b) => a.categoryName.localeCompare(b.categoryName)
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description',
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
              Quản lý Danh mục
            </Title>
            <Text type="secondary">Quản lý các danh mục sản phẩm trong hệ thống.</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadCategories} loading={loading}>
              Tải lại
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreate}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm danh mục
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
            <Tag color="blue" className="text-sm">{filteredCategories.length} danh mục</Tag>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="categoryId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          locale={{
            emptyText: (
              <Empty description="Không có danh mục nào." image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreate}
                  className="bg-vietnam-green hover:!bg-emerald-800"
                >
                  Thêm danh mục đầu tiên
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Modal tạo/sửa danh mục */}
      <Modal
        title={isEditMode ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
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
            name="categoryName"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Ví dụ: Mâm cúng, Đồ thờ cúng, Hoa quả..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả về danh mục (tùy chọn)"
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
                setEditingCategory(null);
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

export default CategoryManagement;

