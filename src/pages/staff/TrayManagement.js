import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Image, Modal, message, Input, ConfigProvider, Card, Typography, Select, Spin, Descriptions, Divider } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  // ExclamationCircleOutlined
} from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
// Import components
import CreateTrayProduct from './CreateTrayProduct';
import EditTrayProduct from './EditTrayProduct';

// Import service
import productService from '../../services/productService';
import productDetailService from '../../services/productDetailService';

const TrayManagement = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { Title, Text } = Typography;
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // States for product detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productDetailData, setProductDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load danh sách sản phẩm
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts();
      setProducts(response || []);
      console.log('Loaded products:', response);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm!');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Xử lý edit sản phẩm
  const handleEdit = (productId) => {
    console.log('Editing product:', productId);
    setSelectedProductId(productId);
    setCurrentView('edit');
  };

  // Xử lý xem chi tiết mâm cúng
  const handleViewDetail = async (productId) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setProductDetailData(null);
    
    try {
      // Bước 1: Lấy productDetailId từ productId (sử dụng api có token cho staff)
      const productDetailId = await productDetailService.getProductDetailIdByProductId(productId);
      
      if (!productDetailId) {
        message.error('Không tìm thấy chi tiết sản phẩm!');
        setDetailModalVisible(false);
        return;
      }
      
      // Bước 2: Lấy chi tiết nguyên liệu
      const detailData = await productDetailService.getProductDetailIngredients(productDetailId);
      setProductDetailData(detailData);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      const errorMessage = error.response?.status === 403 
        ? 'Bạn không có quyền truy cập thông tin này!' 
        : error.response?.status === 404
        ? 'Không tìm thấy thông tin mâm cúng!'
        : 'Không thể tải chi tiết mâm cúng!';
      message.error(errorMessage);
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Xử lý delete sản phẩm với confirm modal
  const handleDelete = (record) => {
    const { productId, productName } = record;

    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      icon: <DeleteOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '10px' }}>
            {/* <strong>ID:</strong> {productId}<br /> */}
            <strong>Tên:</strong> {productName}<br />
            <strong>Giá:</strong> {record.price?.toLocaleString()} VNĐ
          </div>
          {/* <p style={{ color: '#ff4d4f', marginTop: '10px', fontSize: '14px' }}>
            ⚠️ <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </p> */}
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          console.log('=== DELETING PRODUCT ===');
          console.log('Product ID:', productId);
          console.log('Product Name:', productName);

          // Hiển thị loading
          // const hide = message.loading('Đang xóa sản phẩm...', 0);

          // Gọi API xóa
          await productService.deleteProduct(productId);

          // Ẩn loading
          // hide();

          console.log('=== DELETE SUCCESS ===');
          message.success(`Đã xóa sản phẩm "${productName}" thành công!`);

          // Reload danh sách
          loadProducts();

        } catch (error) {
          console.error('=== DELETE ERROR ===');
          console.error('Error object:', error);
          console.error('Error response:', error.response);

          // Xử lý các loại lỗi
          if (error.response) {
            const { status, data } = error.response;
            console.error(`Delete API Error ${status}:`, data);

            switch (status) {
              case 400:
                message.error('Không thể xóa sản phẩm này!');
                break;
              case 401:
                message.error('Bạn không có quyền xóa sản phẩm!');
                break;
              case 403:
                message.error('Truy cập bị từ chối! Kiểm tra quyền của bạn.');
                break;
              case 404:
                message.error('Sản phẩm không tồn tại hoặc đã bị xóa!');
                // Vẫn reload để cập nhật UI
                loadProducts();
                break;
              case 409:
                message.error('Không thể xóa sản phẩm đang được sử dụng!');
                break;
              case 500:
                message.error('Lỗi server! Vui lòng thử lại sau.');
                break;
              default:
                message.error(`Lỗi không xác định: ${status}`);
            }
          } else if (error.request) {
            message.error('Không thể kết nối đến server!');
          } else {
            message.error(`Lỗi: ${error.message}`);
          }
        }
      },
      onCancel() {
        console.log('Delete cancelled by user');
      },
    });
  };

  // Xử lý tạo thành công
  const handleCreateSuccess = (newProduct) => {
    console.log('New product created:', newProduct);
    message.success('Đã thêm sản phẩm mới vào danh sách!');
    setCurrentView('list');
    loadProducts();
  };

  // Xử lý edit thành công
  const handleEditSuccess = (updatedProduct) => {
    console.log('Product updated:', updatedProduct);
    message.success('Đã cập nhật sản phẩm thành công!');
    setCurrentView('list');
    setSelectedProductId(null);
    loadProducts();
  };

  // Quay lại danh sách
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProductId(null);
  };

  // Filter products dựa trên search text
  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.categoryName?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.regionName?.toLowerCase().includes(searchText.toLowerCase())
  );

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
          src={image || 'https://via.placeholder.com/60x60?text=No+Image'}
          alt={record.productName}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/60x60?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên mâm cúng',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName) => (
        <Tag color="purple">{categoryName || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Vùng miền',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 120,
      render: (regionName) => {
        if (regionName === 'Miền Bắc') {
          return <Tag color="blue">Miền Bắc</Tag>;
        } else if (regionName === 'Miền Trung') {
          return <Tag color="green">Miền Trung</Tag>;
        } else if (regionName === 'Miền Nam') {
          return <Tag color="orange">Miền Nam</Tag>;
        } else {
          return <Tag color="purple">Toàn Quốc</Tag>;
        }

      },

      filters: [
        { text: 'Miền Bắc', value: 'Miền Bắc' },
        { text: 'Miền Trung', value: 'Miền Trung' },
        { text: 'Miền Nam', value: 'Miền Nam' },
        { text: 'Toàn Quốc', value: 'Toàn Quốc' },
      ],
      onFilter: (value, record) => record.regionName === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      // width: 120,
      render: (price) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
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
        const statusConfig = {
          'AVAILABLE': { color: 'green', text: 'Có sẵn' },
          'UNAVAILABLE': { color: 'red', text: 'Hết hàng' },
          // 'DISCONTINUED': { color: 'gray', text: 'Ngừng kinh doanh' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'Có sẵn', value: 'AVAILABLE' },
        { text: 'Hết hàng', value: 'UNAVAILABLE' },
      ],
      onFilter: (value, record) => record.productStatus === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.productId)}
          >
            Xem chi tiết
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.productId)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  // Render Create view
  if (currentView === 'create') {
    return (
      <CreateTrayProduct
        onBack={handleBackToList}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  // Render Edit view
  if (currentView === 'edit' && selectedProductId) {
    return (
      <EditTrayProduct
        productId={selectedProductId}
        onBack={handleBackToList}
        onSuccess={handleEditSuccess}
      />
    );
  }

  // Default list view
  return (
    <ConfigProvider locale={viVN}>
      {/* Header */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}> */}
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>
                {/* <BookOutlined />  */}
                Quản lý mâm cúng</Space>
            </Title>
            <Text type="secondary">Thêm, xóa, sửa và quản lý các mâm cúng.</Text>
          </div>
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="bg-vietnam-green hover:!bg-emerald-800">
                Thêm lễ hội
              </Button> */}
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadProducts}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCurrentView('create')}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm mâm cúng
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl mb-6">
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, danh mục, vùng miền..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />
        </div>

        {/* Stats */}
        <div >
          <Space>
            <Tag color="blue">Tổng: {filteredProducts.length} sản phẩm</Tag>
            <Tag color="green">
              Có sẵn: {filteredProducts.filter(p => p.productStatus === 'AVAILABLE').length}
            </Tag>
            <Tag color="red">
              Hết hàng: {filteredProducts.filter(p => p.productStatus === 'UNAVAILABLE').length}
            </Tag>
          </Space>
        </div>
      </Card>






      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="productId"
        loading={loading}
        pagination={{
          // pageSize: 10,
          showSizeChanger: false,
          // showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal Chi Tiết Mâm Cúng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined />
            <span>Chi tiết mâm cúng</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setProductDetailData(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setProductDetailData(null);
          }}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải thông tin...</div>
          </div>
        ) : productDetailData ? (
          <div>
            {/* Thông tin cơ bản */}
            <Descriptions title="Thông tin mâm cúng" bordered column={2} size="small">
              <Descriptions.Item label="Tên mâm cúng" span={2}>
                <Text strong>{productDetailData.productName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã sản phẩm">
                {productDetailData.productId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá">
                <Text strong style={{ color: '#1890ff' }}>
                  {productDetailData.price?.toLocaleString()} VNĐ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                <Tag color="purple">{productDetailData.categoryName || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Vùng miền">
                <Tag color="blue">{productDetailData.regionName || 'N/A'}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Bảng nguyên liệu */}
            <div style={{ marginTop: 24 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Nguyên liệu chi tiết của mâm cúng
              </Title>
              {productDetailData.checklists && productDetailData.checklists.length > 0 ? (
                <Table
                  dataSource={productDetailData.checklists}
                  rowKey={(record, index) => `${record.checklistId}-${index}`}
                  pagination={false}
                  size="small"
                  bordered
                  columns={[
                    {
                      title: 'STT',
                      key: 'index',
                      width: 60,
                      render: (_, __, index) => index + 1,
                    },
                    {
                      title: 'Lễ hội',
                      dataIndex: 'ritualName',
                      key: 'ritualName',
                      render: (text) => <Tag color="green">{text || 'N/A'}</Tag>,
                    },
                    {
                      title: 'Tên nguyên liệu',
                      dataIndex: 'itemName',
                      key: 'itemName',
                      render: (text) => <Text strong>{text || 'N/A'}</Text>,
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      align: 'center',
                      render: (quantity) => (
                        <Text>{quantity !== null && quantity !== undefined ? quantity : 'N/A'}</Text>
                      ),
                    },
                    {
                      title: 'Đơn vị',
                      dataIndex: 'unit',
                      key: 'unit',
                      align: 'center',
                      render: (unit) => <Tag>{unit || '-'}</Tag>,
                    },
                    {
                      title: 'Ghi chú',
                      dataIndex: 'checkNote',
                      key: 'checkNote',
                      render: (note) => (
                        <Text type="secondary" style={{ fontStyle: 'italic' }}>
                          {note || '-'}
                        </Text>
                      ),
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <Text type="secondary">Chưa có nguyên liệu nào cho mâm cúng này</Text>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <Text type="secondary">Không có dữ liệu</Text>
          </div>
        )}
      </Modal>
      {/* </div> */}
    </ConfigProvider>
  );
};

export default TrayManagement;