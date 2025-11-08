// src/pages/staff/VoucherManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Switch,
  Typography,
  Descriptions,
  Spin,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
// Import dayjs - Ant Design v5 uses dayjs for DatePicker
import dayjs from 'dayjs';
import { getAllVouchers, createVoucher, getVoucherById, updateVoucher, deleteVoucher } from '../../services/voucherService';
import { useAuth } from '../../contexts/AuthContext';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    code: '',
    discountType: '',
    isActive: '',
    startDate: '',
    endDate: '',
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    percentage: 0,
    fixedAmount: 0,
  });

  useEffect(() => {
    fetchVouchers();
  }, [pagination.current, pagination.pageSize]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      // Chuẩn bị params theo đúng API spec
      const params = {};

      // Chỉ thêm params nếu có giá trị
      if (filters.code) params.code = filters.code;
      if (filters.discountType) params.discountType = filters.discountType;
      // Gửi isActive=true khi lọc Hoạt động để backend giảm tải; các trường hợp khác lọc ở client
      if (filters.isActive === 'true') params.isActive = true;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      // Pagination params
      params.page = pagination.current - 1; // Backend sử dụng 0-indexed
      params.size = pagination.pageSize;
      params.sortBy = 'createdAt';
      params.direction = 'DESC';

      console.log('📤 Fetching vouchers with params:', params);

      const response = await getAllVouchers(params);

      console.log('📦 Raw API response:', response);

      // Xử lý response - Backend có thể trả về nhiều format khác nhau
      let voucherData = [];
      let total = 0;

      // Check nhiều format response
      if (response.content && Array.isArray(response.content)) {
        // Spring Boot Page format
        voucherData = response.content;
        total = response.totalElements || response.content.length;
      } else if (Array.isArray(response)) {
        // Direct array
        voucherData = response;
        total = response.length;
      } else if (response.data) {
        // Nested data
        if (Array.isArray(response.data)) {
          voucherData = response.data;
          total = response.data.length;
        } else if (response.data.content) {
          voucherData = response.data.content;
          total = response.data.totalElements || response.data.content.length;
        }
      } else if (response.additionalProp1 || response.additionalProp2) {
        // Swagger example format - convert to array
        voucherData = Object.values(response).filter(item => item && typeof item === 'object');
        total = voucherData.length;
      }

      console.log('✅ Processed vouchers:', voucherData, 'Total:', total);

      // Apply client-side filtering to ensure correct status with expiry
      const now = new Date();
      let filteredData = voucherData;
      if (filters.isActive === 'true') {
        filteredData = voucherData.filter(v => {
          const endDate = v.endDate ? new Date(v.endDate) : null;
          const notExpired = !endDate || endDate >= now;
          return Boolean(v.isActive) && notExpired;
        });
      } else if (filters.isActive === 'false') {
        filteredData = voucherData.filter(v => {
          const endDate = v.endDate ? new Date(v.endDate) : null;
          const isExpired = endDate && endDate < now;
          return !Boolean(v.isActive) || isExpired;
        });
      }

      setVouchers(filteredData);
      setPagination(prev => ({
        ...prev,
        total: filteredData.length,
      }));

      // Calculate statistics (respecting expiry)
      calculateStats(voucherData);

      if (filteredData.length > 0) {
        message.success(`Đã tải ${filteredData.length} vouchers`);
      } else {
        message.info('Không tìm thấy voucher nào');
      }
    } catch (error) {
      console.error('❌ Error fetching vouchers:', error);

      // Xử lý error message
      let errorMsg = 'Không thể tải danh sách vouchers';

      if (error.message.includes('no session')) {
        errorMsg = 'Lỗi hệ thống: Backend session issue. Vui lòng liên hệ quản trị viên.';
      } else if (error.response?.status === 403) {
        errorMsg = 'Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản STAFF.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      message.error(errorMsg);

      // Set empty data on error
      setVouchers([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const active = data.filter(v => {
      const endDate = v.endDate ? new Date(v.endDate) : null;
      const notExpired = !endDate || endDate >= now;
      return Boolean(v.isActive) && notExpired;
    }).length;
    const expired = data.filter(v => {
      const endDate = v.endDate ? new Date(v.endDate) : null;
      return Boolean(endDate) && endDate < now;
    }).length;
    const percentage = data.filter(v => v.discountType === 'PERCENTAGE').length;
    const fixedAmount = data.filter(v => v.discountType === 'FIXED_AMOUNT').length;

    setStats({
      total: data.length,
      active,
      expired,
      percentage,
      fixedAmount,
    });
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchVouchers();
  };

  const handleReset = () => {
    setFilters({
      code: '',
      discountType: '',
      isActive: '',
      startDate: '',
      endDate: '',
    });
    setPagination({ ...pagination, current: 1 });
    setTimeout(() => fetchVouchers(), 100);
  };

  const handleViewDetail = async (record) => {
    console.log('👁️ View detail clicked, record:', record);
    console.log('📊 Current detailModalVisible state:', detailModalVisible);
    
    // Hiển thị modal ngay lập tức với dữ liệu từ record
    setDetailModalVisible(true);
    setSelectedVoucher(record); // Hiển thị dữ liệu từ record trước
    setDetailLoading(true);
    
    console.log('✅ Modal state set to visible, selectedVoucher set');

    try {
      // Tìm voucherId từ nhiều field có thể có
      const voucherId = record.voucherId || record.id || record.voucher?.voucherId;
      
      console.log('🔍 Voucher ID found:', voucherId, 'from record:', {
        voucherId: record.voucherId,
        id: record.id,
        'voucher.voucherId': record.voucher?.voucherId
      });
      
      if (!voucherId) {
        console.warn('⚠️ No voucher ID found, using record data');
        message.warning('Không tìm thấy ID voucher, hiển thị thông tin từ danh sách');
        setDetailLoading(false);
        return;
      }

      // Gọi API để lấy chi tiết đầy đủ
      console.log('📤 Calling API getVoucherById with ID:', voucherId);
      const voucherData = await getVoucherById(voucherId);
      console.log('✅ Voucher detail fetched:', voucherData);
      
      setSelectedVoucher(voucherData);
      message.success('Tải thông tin voucher thành công');
    } catch (error) {
      console.error('❌ Error fetching voucher detail:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      const errorMsg = error?.response?.data?.message || error?.message || 'Không thể tải thông tin voucher từ server';
      message.warning(`${errorMsg}. Đang hiển thị thông tin từ danh sách.`);
      
      // Giữ nguyên dữ liệu từ record đã set ở trên
      // setSelectedVoucher(record); // Không cần vì đã set ở đầu function
    } finally {
      setDetailLoading(false);
      console.log('🏁 Detail loading finished');
    }
  };

  const handleEdit = async (record) => {
    console.log('✏️ Edit clicked, record:', record);
    
    try {
      // Lấy voucherId
      const voucherId = record.voucherId || record.id;
      
      if (!voucherId) {
        message.error('Không tìm thấy ID voucher');
        return;
      }

      // Gọi API để lấy chi tiết đầy đủ
      const voucherData = await getVoucherById(voucherId);
      console.log('✅ Voucher data for editing:', voucherData);
      
      setEditingVoucher(voucherData);
      
      // Set form values - convert to dayjs for DatePicker
      const startDate = voucherData.startDate ? dayjs(voucherData.startDate) : null;
      const endDate = voucherData.endDate ? dayjs(voucherData.endDate) : null;
      
      editForm.setFieldsValue({
        description: voucherData.description || '',
        discountType: voucherData.discountType || 'PERCENTAGE',
        discountValue: voucherData.discountValue || 0,
        minOrderAmount: voucherData.minOrderAmount || 0,
        maxDiscountAmount: voucherData.maxDiscountAmount || 0,
        usageLimit: voucherData.usageLimit || 0,
        dateRange: startDate && endDate ? [startDate, endDate] : null,
        isActive: voucherData.isActive !== undefined ? voucherData.isActive : true,
      });
      
      setEditModalVisible(true);
    } catch (error) {
      console.error('❌ Error loading voucher for edit:', error);
      const errorMsg = error?.message || 'Không thể tải thông tin voucher';
      message.error(errorMsg);
      
      // Fallback: dùng dữ liệu từ record - convert to dayjs
      setEditingVoucher(record);
      const startDate = record.startDate ? dayjs(record.startDate) : null;
      const endDate = record.endDate ? dayjs(record.endDate) : null;
      
      editForm.setFieldsValue({
        description: record.description || '',
        discountType: record.discountType || 'PERCENTAGE',
        discountValue: record.discountValue || 0,
        minOrderAmount: record.minOrderAmount || 0,
        maxDiscountAmount: record.maxDiscountAmount || 0,
        usageLimit: record.usageLimit || 0,
        dateRange: startDate && endDate ? [startDate, endDate] : null,
        isActive: record.isActive !== undefined ? record.isActive : true,
      });
      
      setEditModalVisible(true);
    }
  };

  const handleDelete = async (record) => {
    console.log('🗑️ Delete clicked, record:', record);
    
    const voucherId = record.voucherId || record.id;
    const voucherCode = record.code || 'N/A';
    
    if (!voucherId) {
      message.error('Không tìm thấy ID voucher');
      return;
    }

    try {
      await deleteVoucher(voucherId);
      message.success(`Đã xóa voucher ${voucherCode} thành công`);
      fetchVouchers(); // Refresh danh sách
    } catch (error) {
      console.error('❌ Error deleting voucher:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Không thể xóa voucher';
      message.error(errorMsg);
      if (error?.response?.status === 401) {
        // Token hết hạn: chuyển tới trang đăng nhập STAFF
        setTimeout(() => navigate('/admin-login'), 600);
      }
    }
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 150,
      render: (code) => (
        <Tag color="blue" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 140,
      render: (type) => (
        <Tag color={type === 'PERCENTAGE' ? 'green' : 'orange'}>
          {type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
        </Tag>
      ),
    },
    {
      title: 'Giá trị',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 120,
      render: (value, record) => (
        <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
          {record.discountType === 'PERCENTAGE'
            ? `${value}%`
            : `${value?.toLocaleString()}đ`}
        </span>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      width: 140,
      render: (value) => (
        <span>{value ? `${value.toLocaleString()}đ` : 'Không giới hạn'}</span>
      ),
    },
    {
      title: 'Giảm tối đa',
      dataIndex: 'maxDiscountAmount',
      key: 'maxDiscountAmount',
      width: 140,
      render: (value) => (
        <span>{value ? `${value.toLocaleString()}đ` : 'Không giới hạn'}</span>
      ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive, record) => {
        const now = new Date();
        const endDate = new Date(record.endDate);
        const isExpired = endDate < now;

        if (isExpired) {
          return <Tag color="red" icon={<CloseCircleOutlined />}>Hết hạn</Tag>;
        }
        return isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Hoạt động</Tag>
        ) : (
          <Tag color="default">Không hoạt động</Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => {
        console.log('🔍 Rendering action buttons for record:', record.voucherId || record.id);
        return (
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔘 Button clicked! Record:', record);
                  console.log('🔘 Voucher ID:', record.voucherId || record.id);
                  try {
                    handleViewDetail(record);
                  } catch (error) {
                    console.error('❌ Error in handleViewDetail:', error);
                    message.error('Có lỗi xảy ra khi xem chi tiết voucher');
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('✏️ Edit button clicked for record:', record);
                  handleEdit(record);
                }}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa voucher"
              description={`Bạn có chắc chắn muốn xóa voucher "${record.code}"?`}
              onConfirm={() => handleDelete(record)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div >
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>Quản lý Voucher</Space>
            </Title>
            <Text type="secondary">Thêm, xóa, sửa và quản lý các Voucher</Text>
          </div>
          <Space>
            <Tooltip title="Làm mới">
              <Button icon={<ReloadOutlined />} onClick={fetchVouchers} loading={loading}>
                Tải lại
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="bg-vietnam-green hover:!bg-emerald-800"
            >
              Thêm Voucher
            </Button>
          </Space>
        </div>
      </Card>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số Vouchers"
              value={stats.total}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giảm theo %"
              value={stats.percentage}
              suffix={`/ ${stats.total}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giảm theo số tiền"
              value={stats.fixedAmount}
              suffix={`/ ${stats.total}`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg rounded-xl mb-6">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Text strong>Mã voucher</Text>
            <Input
              placeholder="Tìm theo mã voucher"
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.code}
              onChange={(e) => setFilters({ ...filters, code: e.target.value })}
              className="w-full mt-1"
              allowClear
            />
          </Col>
          {/* Nếu muốn lọc theo lễ hội */}
          {/* <Col xs={24} sm={12} md={6}>
            <Text strong>Lễ hội</Text>
            <Select
              placeholder="Chọn lễ hội"
              value={filters.ritualId || undefined}
              onChange={(value) => setFilters({ ...filters, ritualId: value })}
              className="w-full mt-1"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {rituals?.map(r => (
                <Option key={r.ritualId} value={r.ritualId}>{r.ritualName}</Option>
              ))}
            </Select>
          </Col> */}
          <Col xs={24} sm={12} md={6}>
            <Text strong>Loại giảm giá</Text>
            <Select
              placeholder="Chọn loại giảm giá"
              value={filters.discountType || undefined}
              onChange={(value) => setFilters({ ...filters, discountType: value })}
              className="w-full mt-1"
              allowClear
            >
              <Option value="PERCENTAGE">Phần trăm</Option>
              <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Trạng thái</Text>
            <Select
              placeholder="Chọn trạng thái"
              value={filters.isActive || undefined}
              onChange={(value) => setFilters({ ...filters, isActive: value })}
              className="w-full mt-1"
              allowClear
            >
              <Option value="true">Hoạt động</Option>
              <Option value="false">Hết hạn</Option>
            </Select>
          </Col>
          <Col xs={24} md={6} className="flex items-end">
            <Space className="w-full">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                className="bg-vietnam-green hover:!bg-emerald-800"
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      {/* Filters */}
      {/* <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input
          placeholder="Tìm theo mã voucher"
          prefix={<SearchOutlined />}
          value={filters.code}
          onChange={(e) => setFilters({ ...filters, code: e.target.value })}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          placeholder="Loại giảm giá"
          value={filters.discountType || undefined}
          onChange={(value) => setFilters({ ...filters, discountType: value })}
          style={{ width: 160 }}
          allowClear
        >
          <Option value="PERCENTAGE">Phần trăm</Option>
          <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
        </Select>
        <Select
          placeholder="Trạng thái"
          value={filters.isActive || undefined}
          onChange={(value) => setFilters({ ...filters, isActive: value })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="true">Hoạt động</Option>
          <Option value="false">Không hoạt động</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button onClick={handleReset}>Đặt lại</Button>
      </Space> */}

      {/* <Col xs={24} md={4}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchAllChecklists} loading={loading}>Tải lại</Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col> */}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="voucherId"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1400 }}
        bordered
        onRow={(record) => {
          return {
            onClick: (e) => {
              // Chỉ prevent nếu click vào row, không phải button
              if (e.target.closest('button')) {
                return; // Let button handle its own click
              }
            },
          };
        }}
      />
      {/* Create Voucher Modal */}
      <Modal
        open={createModalVisible}
        title={<span style={{ color: '#166534' }}>Tạo Voucher mới</span>}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
        width={820}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ discountType: 'PERCENTAGE', isActive: true }}
          onFinish={async (values) => {
            try {
              // Lấy staff ID từ user object
              const staffId = user?.id || user?.staffId || user?.staff_id || 0;
              
              // Xử lý date range - values.dateRange là dayjs objects
              let startDate, endDate;
              if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
                // dayjs objects - sử dụng toISOString() nếu có, không thì dùng format()
                const start = values.dateRange[0];
                const end = values.dateRange[1];
                startDate = dayjs.isDayjs(start) ? start.toISOString() : (start.toISOString ? start.toISOString() : dayjs(start).toISOString());
                endDate = dayjs.isDayjs(end) ? end.toISOString() : (end.toISOString ? end.toISOString() : dayjs(end).toISOString());
              } else {
                // Fallback nếu không có dateRange
                startDate = new Date().toISOString();
                endDate = new Date().toISOString();
              }

              const payload = {
                code: values.code?.trim(),
                description: values.description || '',
                discountType: values.discountType,
                discountValue: Number(values.discountValue),
                minOrderAmount: Number(values.minOrderAmount || 0),
                maxDiscountAmount: Number(values.maxDiscountAmount || 0),
                usageLimit: Number(values.usageLimit || 0),
                startDate: startDate,
                endDate: endDate,
                isActive: values.isActive !== undefined ? values.isActive : true,
                createdBy: Number(staffId),
              };
              
              console.log('📤 Creating voucher with payload:', payload);
              await createVoucher(payload);
              message.success('Tạo voucher thành công');
              setCreateModalVisible(false);
              form.resetFields();
              fetchVouchers();
            } catch (e) {
              console.error('❌ Error creating voucher:', e);
              const msg = e?.message || 'Không thể tạo voucher';
              message.error(msg);
              if (e?.response?.status === 401) {
                // Token hết hạn: chuyển tới trang đăng nhập STAFF
                setTimeout(() => navigate('/admin-login'), 600);
              }
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã voucher" name="code" rules={[{ required: true, message: 'Nhập mã voucher' }]}>
                <Input placeholder="Ví dụ: GIAM50K" maxLength={32} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Loại giảm giá" name="discountType" rules={[{ required: true }]}>
                <Select>
                  <Option value="PERCENTAGE">Phần trăm</Option>
                  <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá trị giảm" name="discountValue" rules={[{ required: true, message: 'Nhập giá trị' }]}>
                <Input type="number" min={0} step={1} placeholder="% hoặc số tiền" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lần sử dụng" name="usageLimit">
                <Input type="number" min={0} step={1} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Đơn tối thiểu" name="minOrderAmount">
                <Input type="number" min={0} step={1000} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giảm tối đa" name="maxDiscountAmount">
                <Input type="number" min={0} step={1000} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Thời gian áp dụng" name="dateRange" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                <RangePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Mô tả ngắn về voucher" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Edit Voucher Modal */}
      <Modal
        open={editModalVisible}
        title={<span style={{ color: '#166534' }}>Chỉnh sửa Voucher {editingVoucher?.code}</span>}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingVoucher(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        width={820}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!editingVoucher) {
                message.error('Không tìm thấy thông tin voucher');
                return;
              }

              const voucherId = editingVoucher.voucherId || editingVoucher.id;
              if (!voucherId) {
                message.error('Không tìm thấy ID voucher');
                return;
              }

              // Xử lý date range - values.dateRange là dayjs objects
              let startDate, endDate;
              if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
                // dayjs objects - sử dụng toISOString() nếu có, không thì dùng format()
                const start = values.dateRange[0];
                const end = values.dateRange[1];
                startDate = dayjs.isDayjs(start) ? start.toISOString() : (start.toISOString ? start.toISOString() : dayjs(start).toISOString());
                endDate = dayjs.isDayjs(end) ? end.toISOString() : (end.toISOString ? end.toISOString() : dayjs(end).toISOString());
              } else {
                // Fallback nếu không có dateRange
                startDate = editingVoucher.startDate || new Date().toISOString();
                endDate = editingVoucher.endDate || new Date().toISOString();
              }

              const payload = {
                description: values.description || '',
                discountType: values.discountType,
                discountValue: Number(values.discountValue),
                minOrderAmount: Number(values.minOrderAmount || 0),
                maxDiscountAmount: Number(values.maxDiscountAmount || 0),
                usageLimit: Number(values.usageLimit || 0),
                startDate: startDate,
                endDate: endDate,
                isActive: values.isActive !== undefined ? values.isActive : true,
              };
              
              console.log('📤 Updating voucher with payload:', payload);
              await updateVoucher(voucherId, payload);
              message.success('Cập nhật voucher thành công');
              setEditModalVisible(false);
              setEditingVoucher(null);
              editForm.resetFields();
              fetchVouchers();
            } catch (e) {
              console.error('❌ Error updating voucher:', e);
              const msg = e?.response?.data?.message || e?.message || 'Không thể cập nhật voucher';
              message.error(msg);
              if (e?.response?.status === 401) {
                // Token hết hạn: chuyển tới trang đăng nhập STAFF
                setTimeout(() => navigate('/admin-login'), 600);
              }
            }
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mã voucher (không thể thay đổi)">
                <Input 
                  value={editingVoucher?.code || ''} 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Loại giảm giá" name="discountType" rules={[{ required: true }]}>
                <Select>
                  <Option value="PERCENTAGE">Phần trăm</Option>
                  <Option value="FIXED_AMOUNT">Số tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trị giảm" name="discountValue" rules={[{ required: true, message: 'Nhập giá trị' }]}>
                <Input type="number" min={0} step={1} placeholder="% hoặc số tiền" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số lần sử dụng" name="usageLimit">
                <Input type="number" min={0} step={1} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Đơn tối thiểu" name="minOrderAmount">
                <Input type="number" min={0} step={1000} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giảm tối đa" name="maxDiscountAmount">
                <Input type="number" min={0} step={1000} placeholder="0 = không giới hạn" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Thời gian áp dụng" name="dateRange" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                <RangePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Mô tả ngắn về voucher" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Detail Voucher Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>Chi tiết Voucher</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          console.log('❌ Modal cancelled');
          setDetailModalVisible(false);
          setSelectedVoucher(null);
        }}
        onOk={() => {
          setDetailModalVisible(false);
          setSelectedVoucher(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              console.log('❌ Close button clicked');
              setDetailModalVisible(false);
              setSelectedVoucher(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
        maskClosable={true}
        destroyOnClose={false}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Đang tải thông tin voucher...</div>
          </div>
        ) : selectedVoucher ? (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Mã Voucher" span={2}>
              <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold', padding: '4px 12px' }}>
                {selectedVoucher.code}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedVoucher.description || 'Không có mô tả'}
            </Descriptions.Item>

            <Descriptions.Item label="Loại giảm giá">
              <Tag color={selectedVoucher.discountType === 'PERCENTAGE' ? 'green' : 'orange'}>
                {selectedVoucher.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Giá trị giảm">
              <span style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: '16px' }}>
                {selectedVoucher.discountType === 'PERCENTAGE'
                  ? `${selectedVoucher.discountValue}%`
                  : `${selectedVoucher.discountValue?.toLocaleString()}đ`}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Đơn tối thiểu">
              {selectedVoucher.minOrderAmount && selectedVoucher.minOrderAmount > 0
                ? `${selectedVoucher.minOrderAmount.toLocaleString()}đ`
                : 'Không giới hạn'}
            </Descriptions.Item>

            <Descriptions.Item label="Giảm tối đa">
              {selectedVoucher.maxDiscountAmount && selectedVoucher.maxDiscountAmount > 0
                ? `${selectedVoucher.maxDiscountAmount.toLocaleString()}đ`
                : 'Không giới hạn'}
            </Descriptions.Item>

            <Descriptions.Item label="Số lần sử dụng">
              {selectedVoucher.usageLimit && selectedVoucher.usageLimit > 0
                ? `${selectedVoucher.usedCount || 0} / ${selectedVoucher.usageLimit}`
                : `${selectedVoucher.usedCount || 0} (Không giới hạn)`}
            </Descriptions.Item>

            <Descriptions.Item label="Đã sử dụng">
              <Tag color={selectedVoucher.usedCount > 0 ? 'orange' : 'default'}>
                {selectedVoucher.usedCount || 0} lần
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {(() => {
                const now = new Date();
                const endDate = selectedVoucher.endDate ? new Date(selectedVoucher.endDate) : null;
                const isExpired = endDate && endDate < now;

                if (isExpired) {
                  return <Tag color="red" icon={<CloseCircleOutlined />}>Hết hạn</Tag>;
                }
                return selectedVoucher.isActive ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Hoạt động</Tag>
                ) : (
                  <Tag color="default">Không hoạt động</Tag>
                );
              })()}
            </Descriptions.Item>

            <Descriptions.Item label="Hợp lệ">
              {selectedVoucher.isValid !== undefined ? (
                selectedVoucher.isValid ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Hợp lệ</Tag>
                ) : (
                  <Tag color="error" icon={<CloseCircleOutlined />}>Không hợp lệ</Tag>
                )
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày bắt đầu" span={2}>
              {selectedVoucher.startDate
                ? (() => {
                    const date = new Date(selectedVoucher.startDate);
                    return formatDate(selectedVoucher.startDate) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  })()
                : 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày kết thúc" span={2}>
              {selectedVoucher.endDate
                ? (() => {
                    const date = new Date(selectedVoucher.endDate);
                    return formatDate(selectedVoucher.endDate) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  })()
                : 'N/A'}
            </Descriptions.Item>

            {selectedVoucher.voucherId && (
              <Descriptions.Item label="ID Voucher">
                #{selectedVoucher.voucherId}
              </Descriptions.Item>
            )}

            {selectedVoucher.createdBy && (
              <Descriptions.Item label="Người tạo">
                {selectedVoucher.createdByName ? (
                  <span>{selectedVoucher.createdByName} (ID: {selectedVoucher.createdBy})</span>
                ) : (
                  <span>ID: {selectedVoucher.createdBy}</span>
                )}
              </Descriptions.Item>
            )}

            {selectedVoucher.createdAt && (
              <Descriptions.Item label="Ngày tạo" span={2}>
                {formatDate(selectedVoucher.createdAt)}
              </Descriptions.Item>
            )}

            {selectedVoucher.updatedAt && (
              <Descriptions.Item label="Ngày cập nhật" span={2}>
                {formatDate(selectedVoucher.updatedAt)}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Không có thông tin voucher</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VoucherManagement;
