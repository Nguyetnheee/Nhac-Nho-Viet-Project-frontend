import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Card,
  Drawer,
  Descriptions,
  Badge,
  Spin,
  Tooltip,
  Row,
  Col,
  Statistic,
  ConfigProvider,
} from 'antd';
import viVN from 'antd/locale/vi_VN';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { checklistService } from '../../services/checklistService';

const { Option } = Select;

const Inventory = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // Track which item is being deleted
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Fetch data khi component mount
  useEffect(() => {
    fetchInventoryData();
    fetchUnits();
  }, []);

  // Filter data khi search hoặc filter thay đổi
  useEffect(() => {
    filterData();
  }, [searchText, selectedUnit, data]);

  // Tính toán statistics
  useEffect(() => {
    calculateStats();
  }, [data]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getChecklistItems();
      console.log('Dữ liệu kho hàng:', response);
      setData(response || []);
      message.success('Tải dữ liệu kho hàng thành công!');
    } catch (error) {
      console.error(' Lỗi khi tải kho hàng:', error);
      message.error('Không thể tải dữ liệu kho hàng!');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await checklistService.getUnits();
      console.log('Dữ liệu đơn vị:', response);
      // API trả về object với key-value pairs
      if (response && typeof response === 'object') {
        const unitArray = Object.entries(response).map(([key, value]) => ({
          key,
          value,
        }));
        setUnits(unitArray);
      }
    } catch (error) {
      console.error(' Lỗi khi tải đơn vị:', error);
      // message.error('Không thể tải danh sách đơn vị!');
    }
  };

  const filterData = () => {
    let filtered = [...data];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.itemName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by unit
    if (selectedUnit) {
      filtered = filtered.filter((item) => item.unit === selectedUnit);
    }

    setFilteredData(filtered);
  };

  const calculateStats = () => {
    const total = data.length;
    const lowStock = data.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 10).length;
    const outOfStock = data.filter((item) => item.stockQuantity === 0).length;

    setStats({ total, lowStock, outOfStock });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      itemName: record.itemName,
      unit: record.unit,
      stockQuantity: record.stockQuantity,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (itemId, itemName) => {
    setDeleteLoading(itemId);
    try {
      console.log(`Đang xóa sản phẩm ID: ${itemId}, Tên: ${itemName}`);
      const response = await checklistService.deleteChecklistItem(itemId);
      console.log('Xóa thành công:', response);

      message.success({
        content: (
          <span>
            Đã xóa sản phẩm <strong>"{itemName}"</strong> khỏi kho!
          </span>
        ),
        duration: 3,
      });

      // Reload data
      await fetchInventoryData();

      // Nếu đang xem chi tiết sản phẩm vừa xóa, đóng drawer
      if (viewingItem && viewingItem.itemId === itemId) {
        setIsDetailDrawerVisible(false);
        setViewingItem(null);
      }
    } catch (error) {
      console.error(' Lỗi khi xóa sản phẩm:', error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể xóa sản phẩm! Vui lòng thử lại.';

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              Xóa sản phẩm thất bại!
            </div>
            <div style={{ fontSize: 13 }}>{errorMessage}</div>
          </div>
        ),
        duration: 5,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewDetail = async (record) => {
    setIsDetailDrawerVisible(true);
    setDetailLoading(true);
    setViewingItem(null); // Clear previous data

    try {
      // Fetch chi tiết từ API
      const detailData = await checklistService.getChecklistItemById(record.itemId);
      console.log('Chi tiết sản phẩm:', detailData);
      setViewingItem(detailData);
      message.success('Tải chi tiết sản phẩm thành công!');
    } catch (error) {
      console.error(' Lỗi khi tải chi tiết:', error);
      message.error('Không thể tải chi tiết sản phẩm!');
      // Fallback to record data if API fails
      setViewingItem(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);

      if (editingItem) {
        // Cập nhật sản phẩm hiện có
        const response = await checklistService.updateChecklistItem(editingItem.itemId, values);
        console.log('Cập nhật thành công:', response);
        message.success({
          content: `Đã cập nhật sản phẩm "${values.itemName}" thành công!`,
          duration: 3,
        });
      } else {
        // Tạo sản phẩm mới
        const response = await checklistService.createChecklistItem(values);
        console.log('Tạo mới thành công:', response);
        message.success({
          content: `Đã thêm sản phẩm "${values.itemName}" vào kho!`,
          duration: 3,
        });
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      await fetchInventoryData(); // Reload data
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Validation error from form
        message.warning('Vui lòng kiểm tra lại thông tin!');
      } else {
        console.error(' Lỗi khi lưu sản phẩm:', error);
        const errorMessage = error.response?.data?.message || 'Không thể lưu sản phẩm!';
        message.error({
          content: errorMessage,
          duration: 4,
        });
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingItem(null);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { color: 'error', text: 'Hết hàng', icon: <WarningOutlined /> };
    } else if (quantity <= 10) {
      return { color: 'warning', text: 'Sắp hết', icon: <WarningOutlined /> };
    } else {
      return { color: 'success', text: 'Còn hàng', icon: <CheckCircleOutlined /> };
    }
  };

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'itemId',
      key: 'itemId',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.itemId - b.itemId,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'itemName',
      key: 'itemName',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <strong>{text}</strong>
        </Tooltip>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      align: 'center',
      render: (unit) => (
        <Tag color="blue">
          {unit}
        </Tag>
      ),
      filters: units.map((u) => ({ text: u.value, value: u.key })),
      onFilter: (value, record) => record.unit === value,
    },
    {
      title: 'Số lượng trong kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 180,
      align: 'center',
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (quantity) => {
        const status = getStockStatus(quantity);
        return (
          <Badge
            count={quantity}
            showZero
            overflowCount={9999}
            style={{
              backgroundColor: status.color === 'error' ? '#ff4d4f' : status.color === 'warning' ? '#faad14' : '#52c41a',
            }}
          />
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record.stockQuantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Còn hàng', value: 'instock' },
        { text: 'Sắp hết', value: 'lowstock' },
        { text: 'Hết hàng', value: 'outofstock' },
      ],
      onFilter: (value, record) => {
        if (value === 'outofstock') return record.stockQuantity === 0;
        if (value === 'lowstock') return record.stockQuantity > 0 && record.stockQuantity <= 10;
        if (value === 'instock') return record.stockQuantity > 10;
        return true;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              // size="small"
              onClick={() => handleViewDetail(record)}
              disabled={deleteLoading === record.itemId}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              // size="small"
              onClick={() => handleEdit(record)}
              disabled={deleteLoading === record.itemId}
            />
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Popconfirm
              title={
                <div style={{ maxWidth: 300 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 15 }}>
                    Xác nhận xóa sản phẩm
                  </div>
                  <div style={{ color: '#666' }}>
                    Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?
                  </div>
                </div>
              }
              description={
                <div style={{
                  padding: '8px 12px',
                  background: '#fff7e6',
                  borderRadius: 6,
                  border: '1px solid #ffd591',
                  marginTop: 8
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {record.itemName}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Mã: #{record.itemId} | Đơn vị: {record.unit} | Số lượng: {record.stockQuantity}
                  </div>
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#d46b08',
                    fontWeight: 500
                  }}>
                    Hành động này không thể hoàn tác!
                  </div>
                </div>
              }
              onConfirm={() => handleDelete(record.itemId, record.itemName)}
              okText=" Xóa ngay"
              cancelText="Hủy bỏ"
              okButtonProps={{
                danger: true,
                loading: deleteLoading === record.itemId,
                size: 'middle'
              }}
              cancelButtonProps={{
                disabled: deleteLoading === record.itemId,
                size: 'middle'
              }}
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                // size="small"
                loading={deleteLoading === record.itemId}
                disabled={deleteLoading !== null && deleteLoading !== record.itemId}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <div style={{ minHeight: '100vh' }}>
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số sản phẩm"
                value={stats.total}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Sắp hết hàng"
                value={stats.lowStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Hết hàng"
                value={stats.outOfStock}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* <InboxOutlined style={{ fontSize: 20 }} /> */}
              <span>Quản lý kho hàng</span>
            </div>
          }
          extra={
            <Space>
              <Tooltip title="Làm mới">
                <Button icon={<ReloadOutlined />} onClick={fetchInventoryData} loading={loading} >
                  Tải lại
                </Button>
              </Tooltip>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-vietnam-green hover:!bg-emerald-800">
                Thêm sản phẩm
              </Button>
            </Space>
          }
        >
          {/* Search and Filter Bar */}
          <div style={{ marginBottom: 16 }}>
            <Space size="middle" wrap>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Select
                placeholder={
                  <span>
                    <FilterOutlined /> Lọc theo đơn vị
                  </span>
                }
                value={selectedUnit}
                onChange={setSelectedUnit}
                style={{ width: 200 }}
                allowClear
              >
                {units.map((unit) => (
                  <Option key={unit.key} value={unit.key}>
                    {unit.value}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="itemId"
            loading={loading}
            pagination={{
              // pageSize: 10,
              // showSizeChanger: true,
              // showQuickJumper: true,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
            bordered
          // size="middle"
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {editingItem ? <EditOutlined style={{ color: '#1890ff' }} /> : <PlusOutlined style={{ color: '#52c41a' }} />}
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {editingItem ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
              </span>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={
            <span>
              {editingItem ? '💾 Cập nhật' : '➕ Thêm mới'}
            </span>
          }
          cancelText="❌ Hủy bỏ"
          width={650}
          confirmLoading={saveLoading}
          maskClosable={false}
          okButtonProps={{
            size: 'large',
            loading: saveLoading,
          }}
          cancelButtonProps={{
            size: 'large',
            disabled: saveLoading,
          }}
        >
          {editingItem && (
            <div style={{
              padding: '12px 16px',
              background: '#e6f7ff',
              borderRadius: 8,
              marginBottom: 20,
              border: '1px solid #91d5ff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <InboxOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                <span style={{ fontWeight: 600, color: '#1890ff' }}>
                  Đang chỉnh sửa: {editingItem.itemName}
                </span>
                <Tag color="blue" style={{ marginLeft: 'auto' }}>
                  ID: #{editingItem.itemId}
                </Tag>
              </div>
            </div>
          )}

          <Form form={form} layout="vertical" size="large">
            <Form.Item
              name="itemName"
              label={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  <InboxOutlined style={{ marginRight: 6 }} />
                  Tên sản phẩm
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' },
                { max: 100, message: 'Tên sản phẩm không được vượt quá 100 ký tự!' },
                { whitespace: true, message: 'Tên sản phẩm không được chỉ chứa khoảng trắng!' },
              ]}
              tooltip="Nhập tên đầy đủ và rõ ràng của sản phẩm"
            >
              <Input
                placeholder="Ví dụ: Gạo tẻ Hương Việt, Trái cây tươi..."
                prefix={<InboxOutlined style={{ color: '#bfbfbf' }} />}
                showCount
                maxLength={100}
                disabled={saveLoading}
              />
            </Form.Item>

            <Form.Item
              name="unit"
              label={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  <InboxOutlined style={{ marginRight: 6 }} />
                  Đơn vị tính
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng chọn đơn vị tính!' },
              ]}
              tooltip="Chọn đơn vị phù hợp với sản phẩm"
            >
              <Select
                placeholder="Chọn đơn vị tính (kg, gói, hộp, ...)"
                disabled={saveLoading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {units.map((unit) => (
                  <Option key={unit.key} value={unit.key}>
                    <InboxOutlined style={{ marginRight: 8 }} />
                    {unit.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="stockQuantity"
              label={
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  <InboxOutlined style={{ marginRight: 6 }} />
                  Số lượng trong kho
                </span>
              }
              rules={[
                { required: true, message: '⚠️ Vui lòng nhập số lượng!' },
                { type: 'number', min: 0, message: '⚠️ Số lượng phải lớn hơn hoặc bằng 0!' },
                { type: 'number', max: 999999, message: '⚠️ Số lượng không được vượt quá 999,999!' },
              ]}
              tooltip="Nhập số lượng hiện có trong kho"
              extra={
                <div style={{ marginTop: 8 }}>
                  <Tag color="success">≥ 11: Còn đủ hàng</Tag>
                  <Tag color="warning">1-10: Sắp hết hàng</Tag>
                  <Tag color="error">0: Hết hàng</Tag>
                </div>
              }
            >
              <InputNumber
                placeholder="Nhập số lượng"
                style={{ width: '100%' }}
                min={0}
                max={999999}
                disabled={saveLoading}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Form>

          {saveLoading && (
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: '#f0f0f0',
              borderRadius: 8,
              marginTop: 16
            }}>
              <Spin />
              <span style={{ marginLeft: 12, color: '#666' }}>
                Đang {editingItem ? 'cập nhật' : 'thêm'} sản phẩm...
              </span>
            </div>
          )}
        </Modal>

        {/* Detail Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* <EyeOutlined /> */}
              <span>Chi tiết sản phẩm</span>
            </div>
          }
          placement="right"
          onClose={() => {
            setIsDetailDrawerVisible(false);
            setViewingItem(null);
          }}
          open={isDetailDrawerVisible}
          width={500}
          extra={
            <Space>
              {viewingItem && (
                <>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setIsDetailDrawerVisible(false);
                      handleEdit(viewingItem);
                    }}
                    disabled={deleteLoading === viewingItem.itemId}
                  >
                    Chỉnh sửa
                  </Button>
                  <Popconfirm
                    title={
                      <div style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 15 }}>
                          Xóa sản phẩm
                        </div>
                        <div style={{ color: '#666' }}>
                          Xóa sản phẩm này khỏi kho?
                        </div>
                      </div>
                    }
                    description={
                      <div style={{
                        padding: '8px 12px',
                        background: '#fff1f0',
                        borderRadius: 6,
                        border: '1px solid #ffa39e',
                        marginTop: 8
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          📦 {viewingItem.itemName}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          Mã: #{viewingItem.itemId}
                        </div>
                        <div style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#cf1322',
                          fontWeight: 500
                        }}>
                          ⚠️ Không thể hoàn tác!
                        </div>
                      </div>
                    }
                    onConfirm={() => handleDelete(viewingItem.itemId, viewingItem.itemName)}
                    okText="🗑️ Xóa"
                    cancelText="❌ Hủy"
                    okButtonProps={{
                      danger: true,
                      loading: deleteLoading === viewingItem.itemId,
                    }}
                    cancelButtonProps={{
                      disabled: deleteLoading === viewingItem.itemId,
                    }}
                    icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={deleteLoading === viewingItem.itemId}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          }
        >
          {detailLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
            </div>
          ) : viewingItem ? (
            <>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: 'bold' }}>
                      {/* <InboxOutlined style={{ marginRight: 8 }} /> */}
                      Mã sản phẩm
                    </span>
                  }
                >
                  <Tag color="cyan">
                    #{viewingItem.itemId}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: 'bold' }}>
                      {/* <InboxOutlined style={{ marginRight: 8 }} /> */}
                      Tên sản phẩm
                    </span>
                  }
                >
                  <strong>{viewingItem.itemName}</strong>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: 'bold' }}>
                      {/* <InboxOutlined style={{ marginRight: 8 }} /> */}
                      Đơn vị tính
                    </span>
                  }
                >
                  <Tag color="blue">
                    {viewingItem.unit}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: 'bold' }}>
                      {/* <InboxOutlined style={{ marginRight: 8 }} /> */}
                      Số lượng trong kho
                    </span>
                  }
                >
                  <div >
                    <Badge
                      count={viewingItem.stockQuantity}
                      showZero
                      overflowCount={9999}
                      style={{
                        backgroundColor:
                          viewingItem.stockQuantity === 0
                            ? '#ff4d4f'
                            : viewingItem.stockQuantity <= 10
                              ? '#faad14'
                              : '#52c41a',
                        // fontSize: '16px',
                        // padding: '8px 16px',
                        height: 'auto',
                      }}
                    />
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span style={{ fontWeight: 'bold' }}>
                      {/* <CheckCircleOutlined style={{ marginRight: 8 }} /> */}
                      Trạng thái
                    </span>
                  }
                >
                  {(() => {
                    const status = getStockStatus(viewingItem.stockQuantity);
                    return (
                      <Tag
                        color={status.color}
                        // icon={status.icon}
                        // style={{ fontSize: '14px', padding: '6px 16px' }}
                      >
                        {status.text}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
              </Descriptions>

              {/* Additional Info Card */}
              <Card
                style={{ marginTop: 24 }}
                title={
                  <span>
                    <WarningOutlined style={{ marginRight: 8 }} />
                    Thông tin bổ sung
                  </span>
                }
                size="small"
              >
                {viewingItem.stockQuantity === 0 && (
                  <div style={{ padding: '12px', background: '#fff2e8', borderRadius: 8, border: '1px solid #ffbb96' }}>
                    <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    <strong style={{ color: '#ff4d4f' }}>Cảnh báo:</strong> Sản phẩm đã hết hàng!
                  </div>
                )}
                {viewingItem.stockQuantity > 0 && viewingItem.stockQuantity <= 10 && (
                  <div style={{ padding: '12px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                    <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    <strong style={{ color: '#faad14' }}>Cảnh báo:</strong> Sản phẩm sắp hết hàng! Cần nhập thêm.
                  </div>
                )}
                {viewingItem.stockQuantity > 10 && (
                  <div style={{ padding: '12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    <strong style={{ color: '#52c41a' }}>Tốt:</strong> Sản phẩm còn đủ hàng trong kho.
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <p style={{ color: '#999', marginTop: 16 }}>Không có dữ liệu</p>
            </div>
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

export default Inventory;