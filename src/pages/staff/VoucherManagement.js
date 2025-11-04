// src/pages/staff/VoucherManagement.js
import React, { useState, useEffect } from 'react';
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
import { getAllVouchers } from '../../services/voucherService';

const { RangePicker } = DatePicker;
const { Option } = Select;

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
      if (filters.isActive !== '') params.isActive = filters.isActive === 'true';
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

      setVouchers(voucherData);
      setPagination(prev => ({
        ...prev,
        total: total,
      }));

      // Calculate statistics
      calculateStats(voucherData);

      if (voucherData.length > 0) {
        message.success(`Đã tải ${voucherData.length} vouchers`);
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
    const active = data.filter(v => v.isActive).length;
    const expired = data.filter(v => new Date(v.endDate) < now).length;
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
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
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

      {/* Main Card */}
      <Card
        title={
          <Space>
            <GiftOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Quản lý Vouchers
            </span>
            <Badge count={stats.total} showZero style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Space>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchVouchers}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              // onClick={() => setCreateModalVisible(true)}
            >
              Tạo Voucher
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
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
        </Space>

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
        />
      </Card>
    </div>
  );
};

export default VoucherManagement;
