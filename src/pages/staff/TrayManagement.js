import React, { useState } from 'react';
import { Table, Button, Space, Tag, Image, Modal, Form, Input, InputNumber, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

const TrayManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <Image
          width={60}
          height={60}
          src={image}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tên mâm cúng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Loại',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="purple">{category}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 5 ? 'green' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">
            Sửa
          </Button>
          <Button type="primary" danger icon={<DeleteOutlined />} size="small">
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
      name: 'Lễ Cúng Thôi Nôi Bé Gái',
      category: 'Thôi nôi',
      price: 850000,
      stock: 15,
      image: 'https://via.placeholder.com/60x60?text=Tray1',
    },
    {
      key: '2',
      id: 2,
      name: 'Lễ Cúng Cơ Bản',
      category: 'Cơ bản',
      price: 555000,
      stock: 3,
      image: 'https://via.placeholder.com/60x60?text=Tray2',
    },
    // Thêm data mẫu khác...
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý mâm cúng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Thêm mâm cúng
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
        }}
      />

      <Modal
        title="Thêm mâm cúng mới"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên mâm cúng" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên mâm cúng..." />
          </Form.Item>
          
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập giá..."
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item name="stock" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng..." />
          </Form.Item>

          <Form.Item name="image" label="Hình ảnh">
            <Upload listType="picture-card">
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Thêm mâm cúng</Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrayManagement;