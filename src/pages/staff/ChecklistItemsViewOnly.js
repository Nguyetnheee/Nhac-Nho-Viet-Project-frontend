import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Input,
  ConfigProvider,
  Card,
  Typography,
  Spin,
  Descriptions,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import { checklistService } from '../../services/checklistService';

const { Title, Text } = Typography;

const ChecklistItemsViewOnly = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal xem chi tiết
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [itemDetail, setItemDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load danh sách nguyên liệu
  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getChecklistItems();
      setItems(response || []);
      message.success(`Đã tải ${response?.length || 0} nguyên liệu`);
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu!');
      console.error('Error loading checklist items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Xem chi tiết nguyên liệu
  const handleViewDetail = async (itemId) => {
    if (!itemId) {
      message.error('Không xác định được nguyên liệu để xem chi tiết.');
      return;
    }

    setDetailModalVisible(true);
    setDetailLoading(true);
    setItemDetail(null);

    try {
      // Gọi API GET /api/checklist-items/{id}
      const detailData = await checklistService.getChecklistItemById(itemId);
      setItemDetail(detailData);
      console.log('✅ Loaded item detail:', detailData);
    } catch (error) {
      console.error('Error fetching item detail:', error);
      const status = error.response?.status;
      const errorMessage =
        status === 403
          ? 'Bạn không có quyền truy cập thông tin này!'
          : status === 404
            ? 'Không tìm thấy thông tin nguyên liệu!'
            : 'Không thể tải chi tiết nguyên liệu!';
      message.error(errorMessage);
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter search
  const filteredItems = items.filter((item) => {
    const text = searchText.toLowerCase();
    return (
      (item.itemName || '')
        .toLowerCase()
        .includes(text) ||
      (item.unit || '')
        .toLowerCase()
        .includes(text) ||
      String(item.stockQuantity || '').includes(text)
    );
  });

  const columns = [
    {
      title: 'STT',
      dataIndex: 'itemId',
      key: 'itemId',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.itemId - b.itemId,
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 200,
      ellipsis: true,
      align: 'left',
      sorter: (a, b) =>
        (a.itemName || '').localeCompare(b.itemName || ''),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      align: 'center',
      render: (unit) => (
        <Tag color="blue">
          {unit || 'N/A'}
        </Tag>
      ),
      filters: [
        { text: 'kg', value: 'kg' },
        { text: 'g', value: 'g' },
        { text: 'lít', value: 'lít' },
        { text: 'ml', value: 'ml' },
        { text: 'cái', value: 'cái' },
        { text: 'bó', value: 'bó' },
        { text: 'chai', value: 'chai' },
        { text: 'hộp', value: 'hộp' },
      ],
      onFilter: (value, record) => record.unit === value,
    },
    {
      title: 'Số lượng',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 150,
      align: 'center',
      render: (quantity) => (
        <Text strong style={{ 
          color: quantity > 0 ? '#52c41a' : '#ff4d4f',
          fontSize: '14px'
        }}>
          {quantity !== undefined && quantity !== null ? quantity.toLocaleString() : '0'}
        </Text>
      ),
      sorter: (a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              handleViewDetail(record.itemId)
            }
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title
              level={2}
              className="font-serif !text-vietnam-green !mb-1"
            >
              <Space>
                <DatabaseOutlined />
                Kho nguyên liệu
              </Space>
            </Title>
            <Text type="secondary">
              Xem danh sách các nguyên liệu có trong kho
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadItems}
              loading={loading}
            >
              Tải lại
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl mb-6">
        <div
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="Tìm kiếm theo tên, đơn vị, số lượng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
            style={{ width: 400 }}
            allowClear
          />
        </div>
        <div>
          <Space>
            <Tag color="blue">
              Tổng:{' '}
              {
                filteredItems.length
              }{' '}
              nguyên liệu
            </Tag>
            <Tag color="green">
              Còn hàng:{' '}
              {
                filteredItems.filter(item => (item.stockQuantity || 0) > 0).length
              }
            </Tag>
            <Tag color="red">
              Hết hàng:{' '}
              {
                filteredItems.filter(item => (item.stockQuantity || 0) === 0).length
              }
            </Tag>
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="itemId"
        loading={loading}
        pagination={{
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} nguyên liệu`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal Chi tiết nguyên liệu */}
      <Modal
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <EyeOutlined />
            <span>
              Chi tiết nguyên liệu
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setItemDetail(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(
                false
              );
              setItemDetail(
                null
              );
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {detailLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <Spin size="large" />
            <div
              style={{
                marginTop: 16,
              }}
            >
              Đang tải thông tin...
            </div>
          </div>
        ) : itemDetail ? (
          <div>
            <Descriptions
              title="Thông tin nguyên liệu"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item
                label="Mã nguyên liệu"
              >
                <Text strong>
                  {itemDetail.itemId ||
                    'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label="Tên nguyên liệu"
              >
                <Text strong style={{ fontSize: '16px' }}>
                  {itemDetail.itemName ||
                    'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị">
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {itemDetail.unit ||
                    'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng tồn kho">
                <Text 
                  strong 
                  style={{ 
                    fontSize: '16px',
                    color: (itemDetail.stockQuantity || 0) > 0 ? '#52c41a' : '#ff4d4f'
                  }}
                >
                  {itemDetail.stockQuantity !== undefined && itemDetail.stockQuantity !== null 
                    ? itemDetail.stockQuantity.toLocaleString() 
                    : '0'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
            }}
          >
            <Text type="secondary">
              Không có dữ liệu
            </Text>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default ChecklistItemsViewOnly;

