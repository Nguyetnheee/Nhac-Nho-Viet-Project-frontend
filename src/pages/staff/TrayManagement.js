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
  Form,
  Alert,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarFilled,
  UserOutlined,
} from '@ant-design/icons';
import viVN from 'antd/locale/vi_VN';
import api from '../../services/api';

import CreateTrayProduct from './CreateTrayProduct';
import EditTrayProduct from './EditTrayProduct';

import productService from '../../services/productService';
import productDetailService from '../../services/productDetailService';
import { checklistService } from '../../services/checklistService';
import { ritualService } from '../../services/ritualService';

const { Title, Text } = Typography;
const { Option } = Select;

const TrayManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal xem chi tiết
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [productDetailData, setProductDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Feedbacks
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackPagination, setFeedbackPagination] = useState({
    current: 0,
    pageSize: 5,
    total: 0,
    totalPages: 0
  });

  // Modal gán checklist
  const [assignChecklistModalVisible, setAssignChecklistModalVisible] =
    useState(false);
  const [assignChecklistForm] = Form.useForm();
  const [availableRituals, setAvailableRituals] = useState([]);
  const [groupedChecklists, setGroupedChecklists] = useState({});
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [assigningProduct, setAssigningProduct] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

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

  // Load metadata cho gán checklist
  const loadAssignChecklistMetadata = async () => {
    try {
      const [ritualsRes, groupedChecklistsRes] = await Promise.all([
        ritualService.getAllRituals(),
        checklistService.getGroupedChecklists(),
      ]);
      setAvailableRituals(ritualsRes || []);
      setGroupedChecklists(groupedChecklistsRes || {});
    } catch (error) {
      console.error(
        'Error loading metadata for assign checklist:',
        error
      );
    }
  };

  useEffect(() => {
    loadProducts();
    loadAssignChecklistMetadata();
  }, []);

  // Edit mâm cúng
  const handleEdit = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('edit');
  };

  // Fetch feedbacks
  const fetchFeedbacks = async (productId, page = 0) => {
    try {
      setFeedbackLoading(true);
      console.log('📤 Fetching feedbacks for product:', productId, 'page:', page);
      
      const response = await api.get('/api/feedbacks', {
        params: {
          page: page,
          size: feedbackPagination.pageSize,
          sort: 'createdAt,desc'
        }
      });
      
      console.log('✅ Feedbacks response:', response.data);
      
      const data = response.data;
      
      // Filter feedbacks by productId (nếu backend chưa hỗ trợ filter)
      // Giả sử feedback có orderId, cần map orderId -> productId
      // Tạm thời hiển thị tất cả feedbacks
      setFeedbacks(data.content || []);
      setFeedbackPagination({
        current: data.number || 0,
        pageSize: data.size || 5,
        total: data.totalElements || 0,
        totalPages: data.totalPages || 0
      });
      
      setFeedbackLoading(false);
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      setFeedbacks([]);
      setFeedbackLoading(false);
    }
  };

  const handleFeedbackPageChange = (newPage, productId) => {
    fetchFeedbacks(productId, newPage);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarFilled
            key={star}
            style={{
              fontSize: 16,
              color: star <= rating ? '#fadb14' : '#d9d9d9'
            }}
          />
        ))}
      </div>
    );
  };

  // Tính trung bình sao
  const calculateAverageRating = () => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, fb) => acc + (fb.star || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  // Xóa feedback
  const handleDeleteFeedback = (feedback) => {
    Modal.confirm({
      title: 'Xác nhận xóa đánh giá',
      icon: <DeleteOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa đánh giá này không?</p>
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginTop: '10px',
            }}
          >
            <strong>Người đánh giá:</strong> {feedback.userName || 'Khách hàng'}
            <br />
            <strong>Số sao:</strong> {feedback.star}/5
            <br />
            {feedback.content && (
              <>
                <strong>Nội dung:</strong> {feedback.content.substring(0, 100)}
                {feedback.content.length > 100 && '...'}
              </>
            )}
          </div>
          <div style={{ marginTop: 10, color: '#ff4d4f' }}>
            <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          console.log('🗑️ Deleting feedback:', feedback.fbId);
          
          await api.delete(`/api/feedbacks/${feedback.fbId}`);
          
          message.success('Đã xóa đánh giá thành công!');
          
          // Reload feedbacks
          if (productDetailData?.productId) {
            await fetchFeedbacks(productDetailData.productId, feedbackPagination.current);
          }
        } catch (error) {
          console.error('❌ Delete feedback error:', error);
          
          if (error.response) {
            const { status } = error.response;
            switch (status) {
              case 400:
                message.error('Không thể xóa đánh giá này!');
                break;
              case 401:
                message.error('Bạn không có quyền xóa đánh giá!');
                break;
              case 403:
                message.error('Truy cập bị từ chối!');
                break;
              case 404:
                message.error('Đánh giá không tồn tại hoặc đã bị xóa!');
                // Reload để cập nhật danh sách
                if (productDetailData?.productId) {
                  await fetchFeedbacks(productDetailData.productId, feedbackPagination.current);
                }
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
    });
  };

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
    setFeedbacks([]);

    try {
      const detailData =
        await productDetailService.getProductDetailWithChecklistsByProductId(
          productId
        );
      setProductDetailData(detailData);
      
      // Fetch feedbacks
      await fetchFeedbacks(productId, 0);
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

  // Xóa mâm cúng
  const handleDelete = (record) => {
    const { productId, productName } = record;

    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      icon: <DeleteOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              marginTop: '10px',
            }}
          >
            <strong>Tên:</strong> {productName}
            <br />
            <strong>Giá:</strong> {record.price?.toLocaleString()} VNĐ
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          await productService.deleteProduct(productId);
          message.success(
            `Đã xóa sản phẩm "${productName}" thành công!`
          );
          loadProducts();
        } catch (error) {
          console.error('Delete error:', error);
          if (error.response) {
            const { status } = error.response;
            switch (status) {
              case 400:
                message.error('Không thể xóa sản phẩm này!');
                break;
              case 401:
                message.error(
                  'Bạn không có quyền xóa sản phẩm!'
                );
                break;
              case 403:
                message.error('Truy cập bị từ chối!');
                break;
              case 404:
                message.error(
                  'Sản phẩm không tồn tại hoặc đã bị xóa!'
                );
                loadProducts();
                break;
              case 409:
                message.error(
                  'Không thể xóa sản phẩm đang được sử dụng!'
                );
                break;
              case 500:
                message.error(
                  'Lỗi server! Vui lòng thử lại sau.'
                );
                break;
              default:
                message.error(
                  `Lỗi không xác định: ${status}`
                );
            }
          } else if (error.request) {
            message.error('Không thể kết nối đến server!');
          } else {
            message.error(`Lỗi: ${error.message}`);
          }
        }
      },
    });
  };

  // Tạo thành công
  const handleCreateSuccess = () => {
    message.success('Đã thêm sản phẩm mới vào danh sách!');
    setCurrentView('list');
    loadProducts();
  };

  // Sửa thành công
  const handleEditSuccess = () => {
    message.success('Đã cập nhật sản phẩm thành công!');
    setCurrentView('list');
    setSelectedProductId(null);
    loadProducts();
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProductId(null);
  };

  // Mở modal gán checklist cho mâm cúng
  const handleOpenAssignChecklistForProduct = async (record) => {
    try {
      setAssignLoading(true);
      setAssigningProduct(null);
      setSelectedRitualId(null);
      assignChecklistForm.resetFields();

      let productDetailId;

      // Thử lấy productDetailId
      try {
        const id =
          await productDetailService.getProductDetailIdByProductId(
            record.productId
          );
        productDetailId = id;
      } catch (err) {
        // Nếu chưa có: tạo mới
        try {
          const newProductDetail =
            await productDetailService.createProductDetail(
              record.productId
            );
          productDetailId =
            newProductDetail.productDetailId ||
            newProductDetail.id ||
            newProductDetail;
          if (productDetailId) {
            message.info(
              'Đã tạo product detail mới cho mâm cúng này.'
            );
          }
        } catch (createErr) {
          console.error(
            'Error creating product detail:',
            createErr
          );
          message.error(
            'Không thể tạo product detail cho mâm cúng này!'
          );
          setAssignLoading(false);
          return;
        }
      }

      if (!productDetailId) {
        message.error(
          'Không tìm thấy product detail cho mâm cúng này!'
        );
        setAssignLoading(false);
        return;
      }

      setAssigningProduct({
        ...record,
        productDetailId,
      });

      setAssignChecklistModalVisible(true);
    } finally {
      setAssignLoading(false);
    }
  };

  // Lấy danh sách checklist theo lễ hội
  const getChecklistsByRitual = () => {
    if (!selectedRitualId || !groupedChecklists) return [];
    const ritual = availableRituals.find(
      (r) => r.ritualId === selectedRitualId
    );
    if (!ritual || !ritual.ritualName) return [];
    const ritualChecklists = groupedChecklists[ritual.ritualName];
    if (!ritualChecklists || !Array.isArray(ritualChecklists))
      return [];
    return ritualChecklists;
  };

  // Gửi request gán checklist
  const handleAssignChecklists = async () => {
    try {
      const values =
        await assignChecklistForm.validateFields();

      if (!assigningProduct?.productDetailId) {
        message.error(
          'Không tìm thấy product detail ID để gán danh mục!'
        );
        return;
      }

      if (
        !values.checklistIds ||
        values.checklistIds.length === 0
      ) {
        message.warning(
          'Vui lòng chọn ít nhất một checklist!'
        );
        return;
      }

      await productDetailService.assignChecklistsToProductDetail(
        assigningProduct.productDetailId,
        values.checklistIds
      );

      message.success(
        'Đã gán checklist thành công cho mâm cúng!'
      );
      setAssignChecklistModalVisible(false);
      assignChecklistForm.resetFields();
      setSelectedRitualId(null);
      setAssigningProduct(null);
    } catch (error) {
      if (error.errorFields) return; // lỗi form
      console.error('Error assigning checklists:', error);
      let msg =
        error.response?.data?.message ||
        error.message ||
        'Không thể gán danh mục!';
      if (
        msg.toLowerCase().includes('not found') ||
        msg
          .toLowerCase()
          .includes('không tìm thấy')
      ) {
        msg =
          'Không tìm thấy product detail hoặc checklist. Vui lòng kiểm tra lại dữ liệu!';
      }
      message.error(msg);
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
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              handleViewDetail(record)
            }
          >
            Xem chi tiết
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              handleEdit(record.productId)
            }
          >
            Sửa
          </Button>
          <Button
            type="primary"
            onClick={() =>
              handleOpenAssignChecklistForProduct(
                record
              )
            }
            loading={
              assignLoading &&
              assigningProduct
                ?.productId ===
              record.productId
            }
          >
            Gán Danh Mục
          </Button>
        </Space>
      ),
    },
  ];

  // View tạo
  if (currentView === 'create') {
    return (
      <CreateTrayProduct
        onBack={handleBackToList}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  // View sửa
  if (currentView === 'edit' && selectedProductId) {
    return (
      <EditTrayProduct
        productId={selectedProductId}
        onBack={handleBackToList}
        onSuccess={handleEditSuccess}
      />
    );
  }

  // View danh sách
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
                Quản lý mâm cúng
              </Space>
            </Title>
            <Text type="secondary">
              Thêm, xóa, sửa và quản lý các mâm
              cúng.
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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                setCurrentView('create')
              }
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm mâm cúng
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
                Nguyên liệu chi tiết
              </Title>
              {productDetailData.checklists &&
                productDetailData
                  .checklists
                  .length >
                0 ? (
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
                    textAlign:
                      'center',
                    padding:
                      '40px',
                    color: '#999',
                  }}
                >
                  <Text type="secondary">
                    Chưa có nguyên liệu nào
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            {/* Feedbacks Section */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ marginBottom: 0 }}>
                  Đánh giá từ khách hàng
                </Title>
                {feedbacks.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarFilled style={{ fontSize: 20, color: '#fadb14' }} />
                      <span style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                        {calculateAverageRating()}
                      </span>
                      <span style={{ fontSize: 12, color: '#999' }}>/ 5.0</span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({feedbackPagination.total} đánh giá)
                    </Text>
                  </div>
                )}
              </div>

              {feedbackLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16, color: '#999' }}>
                    Đang tải đánh giá...
                  </div>
                </div>
              ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, backgroundColor: '#fafafa', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Chưa có đánh giá nào cho sản phẩm này
                  </Text>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.fbId}
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                          padding: 16,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.3s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#e6f7ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <UserOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                            </div>
                            <div>
                              <Text strong style={{ display: 'block' }}>
                                {feedback.userName || 'Khách hàng'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {formatDate(feedback.createdAt)}
                              </Text>
                            </div>
                          </div>
                          {renderStars(feedback.star)}
                        </div>

                        {feedback.content && (
                          <Text style={{ display: 'block', marginLeft: 52, color: '#595959', lineHeight: 1.6 }}>
                            {feedback.content}
                          </Text>
                        )}

                        {/* Delete button */}
                        <div style={{ marginTop: 12, marginLeft: 52 }}>
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteFeedback(feedback)}
                          >
                            Xóa đánh giá
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {feedbackPagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                      <Button
                        size="small"
                        onClick={() => handleFeedbackPageChange(feedbackPagination.current - 1, productDetailData.productId)}
                        disabled={feedbackPagination.current === 0}
                      >
                        ← Trước
                      </Button>
                      
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[...Array(feedbackPagination.totalPages)].map((_, index) => (
                          <Button
                            key={index}
                            size="small"
                            type={index === feedbackPagination.current ? 'primary' : 'default'}
                            onClick={() => handleFeedbackPageChange(index, productDetailData.productId)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>

                      <Button
                        size="small"
                        onClick={() => handleFeedbackPageChange(feedbackPagination.current + 1, productDetailData.productId)}
                        disabled={feedbackPagination.current >= feedbackPagination.totalPages - 1}
                      >
                        Sau →
                      </Button>
                    </div>
                  )}
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

      {/* Modal Gán checklist */}
      <Modal
        title={
          <div>
            <div
              style={{
                fontWeight: 600,
              }}
            >
              Gán danh mục
              checklist cho
              mâm cúng
            </div>
            {assigningProduct && (
              <div
                style={{
                  fontSize: 12,
                  color: '#888',
                }}
              >  
                Mâm cúng:{' '}
                <strong>
                  {
                    assigningProduct.productName
                  }
                </strong>{' '}
                {/* (ID:{' '}
                {
                  assigningProduct.productId
                }
                ) */}
              </div>
            )}
          </div>
        }
        open={assignChecklistModalVisible}
        onOk={handleAssignChecklists}
        onCancel={() => {
          setAssignChecklistModalVisible(
            false
          );
          assignChecklistForm.resetFields();
          setSelectedRitualId(null);
          setAssigningProduct(null);
        }}
        okText="Gán danh mục"
        cancelText="Hủy"
        width={700}
        confirmLoading={assignLoading}
      >
        <Form
          form={assignChecklistForm}
          layout="vertical"
        >
          <Form.Item
            name="ritualId"
            label="Chọn lễ hội"
            rules={[
              {
                required: true,
                message:
                  'Vui lòng chọn lễ hội!',
              },
            ]}
            tooltip="Chọn lễ hội để xem danh sách danh mục đã tạo sẵn"
          >
            <Select
              placeholder="Chọn lễ hội"
              showSearch
              value={
                selectedRitualId
              }
              onChange={(value) => {
                setSelectedRitualId(
                  value
                );
                assignChecklistForm.setFieldValue(
                  'checklistIds',
                  []
                );
              }}
              filterOption={(
                input,
                option
              ) =>
                (option?.children ??
                  '')
                  .toLowerCase()
                  .includes(
                    input.toLowerCase()
                  )
              }
            >
              {availableRituals.map(
                (ritual) => (
                  <Option
                    key={
                      ritual.ritualId
                    }
                    value={
                      ritual.ritualId
                    }
                  >
                    {
                      ritual.ritualName
                    }
                  </Option>
                )
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="checklistIds"
            label="Chọn checklist"
            rules={[
              {
                required: true,
                message:
                  'Vui lòng chọn ít nhất một danh mục!',
              },
            ]}
            tooltip="Chọn các danh mục đã tạo sẵn cho lễ hội này"
          >
            <Select
              mode="multiple"
              placeholder={
                selectedRitualId
                  ? 'Chọn danh mục'
                  : 'Vui lòng chọn lễ hội trước'
              }
              disabled={
                !selectedRitualId
              }
              showSearch
              filterOption={(
                input,
                option
              ) => {
                const checklist =
                  getChecklistsByRitual().find(
                    (c) =>
                      c.checklistId ===
                      option.value
                  );
                if (!checklist)
                  return false;
                const itemName =
                  checklist.itemName ||
                  checklist
                    .item
                    ?.itemName ||
                  '';
                return itemName
                  .toLowerCase()
                  .includes(
                    input.toLowerCase()
                  );
              }}
              optionLabelProp="label"
            >
              {getChecklistsByRitual().map(
                (checklist) => {
                  const itemName =
                    checklist.itemName ||
                    checklist
                      .item
                      ?.itemName ||
                    'N/A';
                  const quantity =
                    checklist.quantity ||
                    0;
                  const unit =
                    checklist.unit ||
                    checklist
                      .item
                      ?.unit ||
                    '';

                  return (
                    <Option
                      key={
                        checklist.checklistId
                      }
                      value={
                        checklist.checklistId
                      }
                      label={
                        itemName
                      }
                    >
                      <div>
                        <div>
                          <strong>
                            {
                              itemName
                            }
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize:
                              12,
                            color:
                              '#999',
                          }}
                        >
                          Số lượng:{' '}
                          {
                            quantity
                          }{' '}
                          {
                            unit
                          }
                        </div>
                      </div>
                    </Option>
                  );
                }
              )}
            </Select>
          </Form.Item>

          {!selectedRitualId && (
            <Alert
              message="Vui lòng chọn lễ hội"
              description="Sau khi chọn lễ hội, danh sách danh mục tương ứng sẽ hiển thị."
              type="info"
              showIcon
              style={{
                marginTop: 16,
              }}
            />
          )}

          {selectedRitualId &&
            getChecklistsByRitual()
              .length === 0 && (
              <Alert
                message="Không có danh mục nào"
                description="Lễ hội này chưa có danh mục. Vào 'Quản lý danh mục' để tạo trước."
                type="warning"
                showIcon
                style={{
                  marginTop: 16,
                }}
              />
            )}

          <div
            style={{
              padding: 12,
              backgroundColor:
                '#f0f0f0',
              borderRadius: 4,
              marginTop: 16,
            }}
          >
            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              <strong>
                Lưu ý:
              </strong>{' '}
              Checklist chỉ gán
              được nếu đã
              được khai báo
              trước. Khi
              khách hàng đặt
              hàng, hệ
              thống có thể sử
              dụng thông tin
              này để trừ kho.
            </Text>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default TrayManagement;
