import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  Alert,
  Spin
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';

// Import services - SỬA LẠI CÁCH IMPORT
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
  const [filteredData, setFilteredData] = useState([]);

  // Fetch tất cả checklists
  const fetchAllChecklists = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getAllChecklists();
      console.log('All checklists:', response);
      setChecklists(response || []);
      setFilteredData(response || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      message.error('Không thể tải danh sách checklist!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch checklist theo ritualId
  const fetchChecklistByRitual = async (ritualId) => {
    setLoading(true);
    try {
      const response = await checklistService.getChecklistByRitual(ritualId);
      console.log(`Checklist for ritual ${ritualId}:`, response);
      setFilteredData(response || []);
    } catch (error) {
      console.error('Error fetching checklist by ritual:', error);
      message.error('Không thể tải checklist cho ritual này!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách rituals cho dropdown
  const fetchRituals = async () => {
    try {
      const response = await ritualService.getAllRituals();
      console.log('Rituals:', response);
      setRituals(response || []);
    } catch (error) {
      console.error('Error fetching rituals:', error);
      message.error('Không thể tải danh sách lễ hội!');
    }
  };

  // useEffect để load data ban đầu
  useEffect(() => {
    fetchAllChecklists();
    fetchRituals();
  }, []);

  // Xử lý khi chọn ritual từ dropdown
  const handleRitualChange = (ritualId) => {
    setSelectedRitualId(ritualId);
    if (ritualId) {
      fetchChecklistByRitual(ritualId);
    } else {
      setFilteredData(checklists);
    }
  };

  // Xử lý search
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = (selectedRitualId ? filteredData : checklists).filter(item =>
      item.itemName?.toLowerCase().includes(value.toLowerCase()) ||
      item.ritualName?.toLowerCase().includes(value.toLowerCase()) ||
      item.checkNote?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Reset filters
  const handleReset = () => {
    setSelectedRitualId(null);
    setSearchText('');
    setFilteredData(checklists);
  };

  // Columns cho table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'checklistId',
      key: 'checklistId',
      width: 80,
      sorter: (a, b) => a.checklistId - b.checklistId,
    },
    {
      title: 'Tên Lễ Hội',
      dataIndex: 'ritualName',
      key: 'ritualName',
      render: (text) => (
        <Tag color="blue" style={{ borderRadius: '6px' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => a.ritualName.localeCompare(b.ritualName),
    },
    {
      title: 'Vật Phẩm',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => (
        <Text strong style={{ color: '#2c1810' }}>
          {text}
        </Text>
      ),
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity, record) => (
        <Text>
          {quantity} <Text type="secondary">({record.unit})</Text>
        </Text>
      ),
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'checkNote',
      key: 'checkNote',
      render: (text) => (
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {text || 'Không có ghi chú'}
        </Text>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
            title="Xem chi tiết"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            size="small"
            danger
            onClick={() => handleDelete(record)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  // Xử lý các actions
  const handleView = (record) => {
    console.log('View checklist:', record);
    // TODO: Implement view modal
  };

  const handleEdit = (record) => {
    console.log('Edit checklist:', record);
    // TODO: Implement edit modal
  };

  const handleDelete = (record) => {
    console.log('Delete checklist:', record);
    // TODO: Implement delete confirmation
  };

  const handleCreate = () => {
    console.log('Create new checklist');
    // TODO: Implement create modal
  };

  return (
    <div style={{ 
      background: '#faf8f3',
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e8dcc6, #f5f2ea)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e8dcc6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ 
              margin: 0,
              color: '#2c1810',
              display: 'flex',
              alignItems: 'center'
            }}>
              📋 Quản Lý Checklist Lễ hội
            </Title>
            <Text style={{ color: '#5d4e37', fontSize: '16px' }}>
              Xem và quản lý danh sách vật phẩm cần chuẩn bị cho các lễ hội
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{
              backgroundColor: '#d4b896',
              borderColor: '#d4b896',
              borderRadius: '8px'
            }}
          >
            Thêm Checklist
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: '12px' }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>🎭 Chọn Lễ Hội:</Text>
              <Select
                placeholder="Tất cả lễ hội"
                value={selectedRitualId}
                onChange={handleRitualChange}
                style={{ width: '100%' }}
                size="large"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {rituals.map(ritual => (
                  <Option key={ritual.ritualId} value={ritual.ritualId}>
                    {ritual.ritualName}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>🔍 Tìm Kiếm:</Text>
              <Input
                placeholder="Tìm theo tên vật phẩm, lễ hội, ghi chú..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Space>
          </Col>
          
          <Col span={8}>
            <Space style={{ marginTop: 24 }}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchAllChecklists}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Tải Lại
              </Button>
              <Button 
                icon={<FilterOutlined />}
                onClick={handleReset}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Đặt Lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
            <Text type="secondary">Tổng Checklist</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4b896' }}>
              {checklists.length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
            <Text type="secondary">Đang Hiển Thị</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#daa520' }}>
              {filteredData.length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
            <Text type="secondary">Tổng Lễ Hội</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b4513' }}>
              {rituals.length}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
            <Text type="secondary">Lễ Hội Đã Chọn</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {selectedRitualId ? 1 : 0}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Alert hiển thị trạng thái */}
      {selectedRitualId && (
        <Alert
          message={`🎯 Đang hiển thị checklist cho: ${rituals.find(r => r.ritualId === selectedRitualId)?.ritualName}`}
          type="info"
          showIcon
          style={{ marginBottom: 24, borderRadius: '8px' }}
          action={
            <Button size="small" onClick={() => handleRitualChange(null)}>
              Xem Tất Cả
            </Button>
          }
        />
      )}

      {/* Table */}
      <Card style={{ borderRadius: '12px' }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="checklistId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} checklist items`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            bordered={false}
            style={{ borderRadius: '8px' }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ChecklistManagement;