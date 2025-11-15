import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
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
} from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import productService from '../../services/productService';
import productDetailService from '../../services/productDetailService';

const { Title, Text } = Typography;

const TrayViewOnly = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal xem chi tiết
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productDetailData, setProductDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load danh sách sản phẩm
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts();
      setProducts(response || []);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm!');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Xem chi tiết mâm cúng
  const handleViewDetail = async (record) => {
    const productId = record.productId;
    if (!productId) {
      message.error('Không xác định được sản phẩm để xem chi tiết.');
      return;
    }

    setDetailModalVisible(true);
    setDetailLoading(true);
    setProductDetailData(null);

    try {
      // Lấy thông tin sản phẩm từ API GET /api/products/{id} - đây là nguồn dữ liệu chính xác nhất
      const productData = await productService.getProductById(productId);
      
      // Lấy thông tin chi tiết với checklists từ endpoint GET /api/product-details/{productDetailId}/details
      let checklists = [];
      let productDetailId = null;
      try {
        // Bước 1: Lấy productDetailId từ productId
        productDetailId = await productDetailService.getProductDetailIdByProductId(productId);
        
        // Bước 2: Gọi endpoint GET /api/product-details/{productDetailId}/details để lấy danh mục nguyên liệu
        if (productDetailId) {
          const detailData = await productDetailService.getProductDetailWithChecklists(productDetailId);
          checklists = detailData.checklists || [];
          console.log('✅ Loaded checklists for product:', {
            productId,
            productDetailId,
            checklistsCount: checklists.length
          });
        }
      } catch (err) {
        // Nếu không có product detail, không có checklists
        console.log('No product detail found, no checklists available:', err.message);
      }

      // Sử dụng dữ liệu từ GET /api/products/{id} làm nguồn chính để đảm bảo đồng bộ với bảng
      setProductDetailData({
        productId: productData.productId,
        productName: productData.productName,
        price: productData.price,
        productDescription: productData.productDescription,
        categoryName: productData.categoryName,
        regionName: productData.regionName,
        productImage: productData.productImage,
        productStatus: productData.productStatus, // Sử dụng trạng thái từ API GET /api/products/{id}
        checklists: checklists, // Danh mục nguyên liệu từ GET /api/product-details/{productDetailId}/details
      });
    } catch (error) {
      console.error('Error fetching product detail:', error);
      const status = error.response?.status;
      const errorMessage =
        status === 403
          ? 'Bạn không có quyền truy cập thông tin này!'
          : status === 404
            ? 'Không tìm thấy thông tin mâm cúng!'
            : 'Không thể tải chi tiết mâm cúng!';
      message.error(errorMessage);
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filter search
  const filteredProducts = products.filter((product) => {
    const text = searchText.toLowerCase();
    return (
      (product.productName || '')
        .toLowerCase()
        .includes(text) ||
      (product.categoryName || '')
        .toLowerCase()
        .includes(text) ||
      (product.regionName || '')
        .toLowerCase()
        .includes(text)
    );
  });

  const columns = [
    {
      title: 'STT',
      dataIndex: 'productId',
      key: 'productId',
      width: 80,
      sorter: (a, b) => a.productId - b.productId,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 100,
      render: (image, record) => (
        <Image
          width={60}
          height={60}
          src={
            image ||
            'https://via.placeholder.com/60x60?text=No+Image'
          }
          alt={record.productName}
          style={{
            objectFit: 'cover',
            borderRadius: 4,
          }}
          fallback="https://via.placeholder.com/60x60?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên mâm cúng',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      sorter: (a, b) =>
        a.productName.localeCompare(b.productName),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName) => (
        <Tag color="purple">
          {categoryName || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Vùng miền',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 120,
      render: (regionName) => {
        if (regionName === 'Miền Bắc')
          return <Tag color="blue">Miền Bắc</Tag>;
        if (regionName === 'Miền Trung')
          return <Tag color="green">Miền Trung</Tag>;
        if (regionName === 'Miền Nam')
          return <Tag color="orange">Miền Nam</Tag>;
        return (
          <Tag color="purple">Toàn Quốc</Tag>
        );
      },
      filters: [
        { text: 'Miền Bắc', value: 'Miền Bắc' },
        { text: 'Miền Trung', value: 'Miền Trung' },
        { text: 'Miền Nam', value: 'Miền Nam' },
        { text: 'Toàn Quốc', value: 'Toàn Quốc' },
      ],
      onFilter: (value, record) =>
        record.regionName === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span
          style={{
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          {price?.toLocaleString()} VNĐ
        </span>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'productStatus',
      key: 'productStatus',
      width: 120,
      render: (status) => {
        const map = {
          AVAILABLE: {
            color: 'green',
            text: 'Có sẵn',
          },
          UNAVAILABLE: {
            color: 'red',
            text: 'Hết hàng',
          },
        };
        const cfg = map[status] || {
          color: 'default',
          text: status,
        };
        return (
          <Tag color={cfg.color}>
            {cfg.text}
          </Tag>
        );
      },
      filters: [
        {
          text: 'Có sẵn',
          value: 'AVAILABLE',
        },
        {
          text: 'Hết hàng',
          value: 'UNAVAILABLE',
        },
      ],
      onFilter: (value, record) =>
        record.productStatus === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              handleViewDetail(record)
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
                Danh sách mâm cúng
              </Space>
            </Title>
            <Text type="secondary">
              Xem danh sách các mâm cúng đang có trên hệ thống
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadProducts}
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
            placeholder="Tìm kiếm theo tên, danh mục, vùng miền..."
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
                filteredProducts.length
              }{' '}
              sản phẩm
            </Tag>
            <Tag color="green">
              Có sẵn:{' '}
              {
                filteredProducts.filter(
                  (p) =>
                    p.productStatus ===
                    'AVAILABLE'
                ).length
              }
            </Tag>
            <Tag color="red">
              Hết hàng:{' '}
              {
                filteredProducts.filter(
                  (p) =>
                    p.productStatus ===
                    'UNAVAILABLE'
                ).length
              }
            </Tag>
          </Space>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="productId"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal Chi tiết mâm cúng */}
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
              Chi tiết mâm cúng
            </span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setProductDetailData(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(
                false
              );
              setProductDetailData(
                null
              );
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
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
        ) : productDetailData ? (
          <div>
            {productDetailData.productImage && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Image
                  src={productDetailData.productImage}
                  alt={productDetailData.productName}
                  width={300}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                  }}
                />
              </div>
            )}
            
            <Descriptions
              title="Thông tin mâm cúng"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item
                label="Tên mâm cúng"
                span={2}
              >
                <Text strong>
                  {productDetailData.productName ||
                    'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã sản phẩm">
                {productDetailData.productId ||
                  'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                <Text
                  strong
                  style={{
                    color:
                      '#1890ff',
                  }}
                >
                  {productDetailData.price?.toLocaleString()}{' '}
                  VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="purple">
                  {productDetailData.categoryName ||
                    'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vùng miền">
                <Tag color="orange">
                  {productDetailData.regionName ||
                    'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={productDetailData.productStatus === 'AVAILABLE' ? 'green' : 'red'}>
                  {productDetailData.productStatus === 'AVAILABLE' ? 'Có sẵn' : 'Hết hàng'}
                </Tag>
              </Descriptions.Item>
              {productDetailData.productDescription && (
                <Descriptions.Item label="Mô tả" span={2}>
                  <Text>{productDetailData.productDescription}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />
            <div
              style={{
                marginTop: 24,
              }}
            >
              <Title
                level={4}
                style={{
                  marginBottom: 16,
                }}
              >
                Danh mục nguyên liệu
              </Title>
              {productDetailData.checklists && productDetailData.checklists.length > 0 ? (
                <Table
                  dataSource={
                    productDetailData.checklists
                  }
                  rowKey={(
                    record,
                    index
                  ) =>
                    `${record.checklistId}-${index}`
                  }
                  pagination={false}
                  size="small"
                  bordered
                  columns={[
                    {
                      title:
                        'STT',
                      key: 'index',
                      width: 60,
                      render: (
                        _,
                        __,
                        index
                      ) =>
                        index +
                        1,
                    },
                    {
                      title:
                        'Lễ hội',
                      dataIndex:
                        'ritualName',
                      key: 'ritualName',
                      render: (
                        text
                      ) => (
                        <Tag color="green">
                          {text ||
                            'N/A'}
                        </Tag>
                      ),
                    },
                    {
                      title:
                        'Tên nguyên liệu',
                      dataIndex:
                        'itemName',
                      key: 'itemName',
                      render: (
                        text
                      ) => (
                        <Text strong>
                          {text ||
                            'N/A'}
                        </Text>
                      ),
                    },
                    {
                      title:
                        'Số lượng',
                      dataIndex:
                        'quantity',
                      key: 'quantity',
                      align:
                        'center',
                      render: (
                        quantity
                      ) => (
                        <Text>
                          {quantity ??
                            'N/A'}
                        </Text>
                      ),
                    },
                    {
                      title:
                        'Đơn vị',
                      dataIndex:
                        'unit',
                      key: 'unit',
                      align:
                        'center',
                      render: (
                        unit
                      ) => (
                        <Tag>
                          {unit ||
                            '-'}
                        </Tag>
                      ),
                    },
                    {
                      title:
                        'Ghi chú',
                      dataIndex:
                        'checkNote',
                      key: 'checkNote',
                      render: (
                        note
                      ) => (
                        <Text
                          type="secondary"
                          style={{
                            fontStyle:
                              'italic',
                          }}
                        >
                          {note ||
                            '-'}
                        </Text>
                      ),
                    },
                  ]}
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#999',
                  }}
                >
                  <Text type="secondary">
                    Mâm cúng này chưa có danh mục nguyên liệu được gán
                  </Text>
                </div>
              )}
            </div>
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

export default TrayViewOnly;

