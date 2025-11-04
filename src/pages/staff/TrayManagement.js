import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Image, Modal, message, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

// Import components
import CreateTrayProduct from './CreateTrayProduct';
import EditTrayProduct from './EditTrayProduct';

// Import service
import productService from '../../services/productService';

const TrayManagement = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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
          const hide = message.loading('Đang xóa sản phẩm...', 0);

          // Gọi API xóa
          await productService.deleteProduct(productId);

          // Ẩn loading
          hide();

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
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            // size="small"
            onClick={() => handleEdit(record.productId)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            // size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <h1 className='text-2xl font-bold text-vietnam-green'>Quản lý mâm cúng</h1>
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
          >
            Thêm mâm cúng
          </Button>
        </Space>
      </div>

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
      <div style={{ marginBottom: 16 }}>
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="productId"
        loading={loading}
        pagination={{
          // pageSize: 10,
          showSizeChanger: true,
          // showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default TrayManagement;