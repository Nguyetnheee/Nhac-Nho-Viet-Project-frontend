import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const ChecklistManagement = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên checklist',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lễ hội liên quan',
      dataIndex: 'ritual',
      key: 'ritual',
      render: (ritual) => <Tag color="green">{ritual}</Tag>,
    },
    {
      title: 'Số bước',
      dataIndex: 'steps',
      key: 'steps',
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
      name: 'Checklist Tết Nguyên Đán',
      ritual: 'Tết Nguyên Đán',
      steps: 8,
    },
    {
      key: '2',
      id: 2,
      name: 'Checklist Lễ Thôi Nôi',
      ritual: 'Thôi nôi',
      steps: 5,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý Checklist</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm checklist
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ChecklistManagement;