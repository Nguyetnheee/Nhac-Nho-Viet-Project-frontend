// src/pages/admin/ChecklistManagement.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, message, Row, Col, Typography, Tag, Alert, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, FilterOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { checklistService } from '../../services/checklistService';
import { ritualService } from '../../services/ritualService';

const { Title, Text } = Typography;
const { Option } = Select;

const ChecklistManagement = () => {
  const [loading, setLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAllChecklists();
    fetchRituals();
  }, []);

  const fetchAllChecklists = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getAllChecklists();
      setChecklists(response || []);
    } catch (error) {
      message.error('Không thể tải danh sách checklist!');
    } finally {
      setLoading(false);
    }
  };

  const fetchRituals = async () => {
    try {
      const response = await ritualService.getAllRituals();
      setRituals(response || []);
    } catch (error) {
      message.error('Không thể tải danh sách lễ hội!');
    }
  };

  const handleRitualChange = (ritualId) => {
    setSelectedRitualId(ritualId);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleReset = () => {
    setSelectedRitualId(null);
    setSearchText('');
  };

  const handleAction = (action, record) => {
    message.info(`Chức năng ${action} cho ID ${record.checklistId} đang được phát triển.`);
  };

  const filteredData = checklists.filter(item => {
    const matchesRitual = !selectedRitualId || item.ritualId === selectedRitualId;
    const matchesSearch = searchText === '' ||
      item.itemName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ritualName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.checkNote?.toLowerCase().includes(searchText.toLowerCase());
    return matchesRitual && matchesSearch;
  });

  const columns = [
    { title: 'STT', dataIndex: 'checklistId', key: 'checklistId', width: 80, sorter: (a, b) => a.checklistId - b.checklistId },
    { title: 'Tên Lễ Hội', dataIndex: 'ritualName', key: 'ritualName', sorter: (a, b) => a.ritualName.localeCompare(b.ritualName), render: (text) => <Tag color="gold">{text}</Tag> },
    { title: 'Vật Phẩm', dataIndex: 'itemName', key: 'itemName', sorter: (a, b) => a.itemName.localeCompare(b.itemName), render: (text) => <Text strong>{text}</Text> },
    { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity', width: 120, sorter: (a, b) => a.quantity - b.quantity, render: (qty, record) => `${qty} ${record.unit}` },
    { title: 'Ghi Chú', dataIndex: 'checkNote', key: 'checkNote', render: (text) => text || <Text type="secondary">Không có</Text> },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleAction('Xem', record)}>Xem</Button>
          <Button icon={<EditOutlined />} onClick={() => handleAction('Sửa', record)}>Sửa</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleAction('Xóa', record)}>Xóa</Button>
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
              <Space>
                {/* <CheckSquareOutlined />  */}
                Quản Lý Checklist</Space>
            </Title>
            <Text type="secondary">Danh sách vật phẩm cần chuẩn bị cho các lễ hội.</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchAllChecklists} loading={loading}>Tải lại</Button>
          {/* <Button onClick={handleReset}>Reset</Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAction('Tạo', {})} className="bg-vietnam-green hover:!bg-emerald-800">
              Thêm Checklist
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl mb-6">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={10}>
            <Text strong>Lọc theo lễ hội</Text>
            <Select
              placeholder="Chọn một lễ hội"
              value={selectedRitualId}
              onChange={handleRitualChange}
              className="w-full mt-1"
              allowClear
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {rituals.map(r => <Option key={r.ritualId} value={r.ritualId}>{r.ritualName}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Text strong>Tìm kiếm</Text>
            <Input
              placeholder="Tìm vật phẩm, lễ hội, ghi chú..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={handleSearchChange}
              className="w-full mt-1"
            />
          </Col>
          {/* <Col xs={24} md={4}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchAllChecklists} loading={loading}>Tải lại</Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col> */}
        </Row>
      </Card>

      {selectedRitualId && (
        <Alert
          message={`Đang lọc checklist cho lễ hội: ${rituals.find(r => r.ritualId === selectedRitualId)?.ritualName}`}
          type="info"
          showIcon
          className="mb-6 rounded-lg"
        />
      )}

      <Card className="shadow-lg rounded-xl">
        <Spin spinning={loading}>
          <div className="mb-4">
            <Title level={5} strong>Danh sách Checklist vật phẩm: {" "}
              <Tag color="blue" className="text-sm">{filteredData.length} vật phẩm</Tag>
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="checklistId"
            pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} vật phẩm` }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ChecklistManagement;