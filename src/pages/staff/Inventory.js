import React, { useState } from 'react';
import { Table, Button, Space, Tag, Input } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Inventory = () => {
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      filterable: true,
    },
    {
      title: 'Loại',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'Mâm cúng' ? 'blue' : 'green'}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <Tag color={quantity > 10 ? 'green' : quantity > 5 ? 'orange' : 'red'}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} VNĐ`,
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
      category: 'Mâm cúng',
      quantity: 15,
      price: 850000,
    },
    {
      key: '2',
      id: 2,
      name: 'Lễ Cúng',
      category: 'Mâm cúng',
      quantity: 8,
      price: 555000,
    },
    // Thêm data mẫu khác...
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý kho hàng</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm sản phẩm
        </Button>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table 
        columns={columns} 
        dataSource={data}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  );
};

export default Inventory;