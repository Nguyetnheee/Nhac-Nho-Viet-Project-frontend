import React, { useState, useEffect, useMemo } from "react";
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
  Typography,
} from "antd";
import viVN from "antd/locale/vi_VN";
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
} from "@ant-design/icons";
import { checklistService } from "../../services/checklistService";

const { Option } = Select;
const { Title, Text } = Typography;

const Inventory = () => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]); // [{key:'KG', value:'Kilogram'}, ...]
  const [filteredData, setFilteredData] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null); // key
  const [sortedInfo, setSortedInfo] = useState({ field: 'itemId', order: 'ascend' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [form] = Form.useForm();

  const unitKeyToLabel = useMemo(() => {
    const map = {};
    units.forEach((u) => (map[u.key] = u.value));
    return map;
  }, [units]);

  const unitLabelToKey = useMemo(() => {
    const map = {};
    units.forEach((u) => (map[u.value] = u.key));
    return map;
  }, [units]);

  // Helpers: nhận mọi kiểu unit (string/object) và trả về key/label an toàn
  const getUnitKey = (unit) => {
    if (!unit) return undefined;
    if (typeof unit === "string") return unitLabelToKey[unit] || unit;
    return unit.name || unit.key || unitLabelToKey[unit.displayName || unit.value] || unit.displayName || unit.value;
  };

  const getUnitLabel = (unit) => {
    if (!unit) return "";
    if (typeof unit === "string") return unitKeyToLabel[unit] || unit;

    const key = unit.name || unit.key;
    const label = unit.displayName || unit.value;
    return label || unitKeyToLabel[key] || key || "";
  };

  // Statistics
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => {
    fetchInventoryData();
    fetchUnits();
  }, []);

  // ✅ Sort và filter data với useMemo để đảm bảo STT luôn tăng dần
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Filter theo search text
    if (searchText) {
      filtered = filtered.filter((item) =>
        item.itemName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter theo đơn vị
    if (selectedUnit) {
      filtered = filtered.filter((item) => {
        const unit = item.unit;
        if (!unit) return false;
        let unitKey;
        if (typeof unit === "string") {
          unitKey = unitLabelToKey[unit] || unit;
        } else {
          unitKey = unit.name || unit.key || unitLabelToKey[unit.displayName || unit.value] || unit.displayName || unit.value;
        }
        return unitKey === selectedUnit;
      });
    }

    // ✅ Luôn sort theo itemId tăng dần cuối cùng (secondary sort)
    filtered.sort((a, b) => {
      // Nếu có sort theo cột khác
      if (sortedInfo.field && sortedInfo.field !== 'itemId' && sortedInfo.order) {
        let primarySort = 0;
        if (sortedInfo.field === 'itemName') {
          primarySort = sortedInfo.order === 'ascend' 
            ? (a.itemName || '').localeCompare(b.itemName || '')
            : (b.itemName || '').localeCompare(a.itemName || '');
        } else if (sortedInfo.field === 'stockQuantity') {
          primarySort = sortedInfo.order === 'ascend'
            ? a.stockQuantity - b.stockQuantity
            : b.stockQuantity - a.stockQuantity;
        }
        // Nếu bằng nhau, sort theo itemId tăng dần
        return primarySort !== 0 ? primarySort : a.itemId - b.itemId;
      }
      // Mặc định: sort theo itemId tăng dần
      return a.itemId - b.itemId;
    });

    return filtered;
  }, [searchText, selectedUnit, data, unitLabelToKey, sortedInfo]);

  useEffect(() => {
    setFilteredData(processedData);
  }, [processedData]);

  useEffect(() => {
    // Logic calculateStats được di chuyển vào đây để tránh lỗi dependency
    const total = data.length;
    const lowStock = data.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 10).length;
    const outOfStock = data.filter((item) => item.stockQuantity === 0).length;
    setStats({ total, lowStock, outOfStock });
  }, [data]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getChecklistItems();
      setData(response || []);
      message.success("Tải dữ liệu kho hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi tải kho hàng:", error);
      message.error("Không thể tải dữ liệu kho hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await checklistService.getUnits();
      if (response && typeof response === "object" && !Array.isArray(response)) {
        // BE trả object { "KG": "Kilogram", ... }
        const unitArray = Object.entries(response).map(([key, value]) => ({ key, value }));
        setUnits(unitArray);
      } else if (Array.isArray(response)) {
        // fallback nếu BE trả mảng [{key, value}] hoặc [{name, displayName}]
        const unitArray = response.map((u) => ({
          key: u.key || u.name || u.value || u.displayName,
          value: u.value || u.displayName || u.key || u.name,
        }));
        setUnits(unitArray);
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn vị:", error);
    }
  };


  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    const unitKey = getUnitKey(record.unit); // luôn là key
    form.setFieldsValue({ 
      itemName: record.itemName,
      unit: unitKey,
      stockQuantity: record.stockQuantity,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (itemId, itemName) => {
    setDeleteLoading(itemId);
    try {
      await checklistService.deleteChecklistItem(itemId);
      message.success({
        content: (
          <span>
            Đã xóa sản phẩm <strong>"{itemName}"</strong> khỏi kho!
          </span>
        ),
        duration: 3,
      });
      await fetchInventoryData();
      if (viewingItem && viewingItem.itemId === itemId) {
        setIsDetailDrawerVisible(false);
        setViewingItem(null);
      }
    } catch (error) {
      const status = error?.response?.status;
      const dataRes = error?.response?.data;
      console.error("DELETE error:", { status, data: dataRes, url: error?.config?.url, method: error?.config?.method });

      let friendly = "Không thể xóa sản phẩm! Vui lòng thử lại.";
      if (status === 401) friendly = "Bạn chưa đăng nhập (401). Hãy đăng nhập lại.";
      // else if (status === 403) friendly = "Bạn không có quyền xoá (403). Cần tài khoản có role phù hợp.";
      // else if (status === 404) friendly = "Không tìm thấy sản phẩm (404).";
      // else if (status === 405) friendly = "Server không cho phép phương thức DELETE (405).";

      message.error(
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Xóa sản phẩm thất bại</div>
          <div style={{ fontSize: 12, color: "#666" }}>{friendly}</div>
          {/* {dataRes?.message && (
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Server: {dataRes.message}</div>
          )} */}
        </div>,
        5
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewDetail = async (record) => {
    setIsDetailDrawerVisible(true);
    setDetailLoading(true);
    setViewingItem(null);

    try {
      const detailData = await checklistService.getChecklistItemById(record.itemId);
      setViewingItem(detailData);
      message.success("Tải chi tiết sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
      message.error("Không thể tải chi tiết sản phẩm!");
      setViewingItem(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaveLoading(true);

      // Form trả unit là KEY. Nếu BE cần OBJECT thì map ở đây:
      let payload = { ...values };
      // Nếu backend muốn object {name, displayName} thì dùng:
      // payload = { ...values, unit: { name: values.unit, displayName: unitKeyToLabel[values.unit] || values.unit } };

      if (editingItem) {
        await checklistService.updateChecklistItem(editingItem.itemId, payload);
        message.success({ content: `Đã cập nhật sản phẩm "${values.itemName}" thành công!`, duration: 3 });
      } else {
        await checklistService.createChecklistItem(payload);
        message.success({ content: `Đã thêm sản phẩm "${values.itemName}" vào kho!`, duration: 3 });
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      await fetchInventoryData();
    } catch (error) {
      if (error?.name === "ValidationError") {
        message.warning("Vui lòng kiểm tra lại thông tin!");
      } else {
        const msg = error?.response?.data?.message || "Không thể lưu sản phẩm!";
        message.error({ content: msg, duration: 4 });
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
    if (quantity === 0) return { color: "error", text: "Hết hàng", icon: <WarningOutlined /> };
    if (quantity <= 10) return { color: "warning", text: "Sắp hết", icon: <WarningOutlined /> };
    return { color: "success", text: "Còn hàng", icon: <CheckCircleOutlined /> };
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 100,
      align: "center",
      // ✅ Hiển thị số thứ tự dựa trên vị trí trong danh sách đã filter/sort, có tính đến pagination
      render: (text, record, index) => {
        // Tính số thứ tự: (trang hiện tại - 1) * số items/trang + index + 1
        const stt = (pagination.current - 1) * pagination.pageSize + index + 1;
        return stt;
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "itemName",
      key: "itemName",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <strong>{text}</strong>
        </Tooltip>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 120,
      align: "center",
      render: (unit) => <Tag color="blue">{getUnitLabel(unit)}</Tag>,
      filters: units.map((u) => ({ text: u.value, value: u.key })), // value = key
      onFilter: (value, record) => getUnitKey(record.unit) === value,
    },
    {
      title: "Số lượng trong kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 180,
      align: "center",
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (quantity) => {
        const status = getStockStatus(quantity);
        return (
          <Badge
            count={quantity}
            showZero
            overflowCount={9999}
            style={{
              backgroundColor:
                status.color === "error" ? "#ff4d4f" : status.color === "warning" ? "#faad14" : "#52c41a",
            }}
          />
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      align: "center",
      render: (_, record) => {
        const status = getStockStatus(record.stockQuantity);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
      filters: [
        { text: "Còn hàng", value: "instock" },
        { text: "Sắp hết", value: "lowstock" },
        { text: "Hết hàng", value: "outofstock" },
      ],
      onFilter: (value, record) => {
        if (value === "outofstock") return record.stockQuantity === 0;
        if (value === "lowstock") return record.stockQuantity > 0 && record.stockQuantity <= 10;
        if (value === "instock") return record.stockQuantity > 10;
        return true;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              disabled={deleteLoading === record.itemId}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={deleteLoading === record.itemId}
            />
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Popconfirm
              title={
                <div style={{ maxWidth: 300 }}>
                  <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 15 }}>
                    Xác nhận xóa sản phẩm
                  </div>
                  <div style={{ color: "#666" }}>
                    Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?
                  </div>
                </div>
              }
              description={
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fff7e6",
                    borderRadius: 6,
                    border: "1px solid #ffd591",
                    marginTop: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{record.itemName}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Mã: #{record.itemId} | Đơn vị: {getUnitLabel(record.unit)} | Số lượng: {record.stockQuantity}
                  </div>
                </div>
              }
              onConfirm={() => handleDelete(record.itemId, record.itemName)}
              okText=" Xóa ngay"
              cancelText="Hủy bỏ"
              okButtonProps={{
                danger: true,
                loading: deleteLoading === record.itemId,
                size: "middle",
              }}
              cancelButtonProps={{
                disabled: deleteLoading === record.itemId,
                size: "middle",
              }}
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
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
      <div style={{ minHeight: "100vh" }}>
        <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <Title level={2} className="font-serif !text-vietnam-green !mb-1">
                <Space>Quản lý kho hàng</Space>
              </Title>
              <Text type="secondary">Thêm, xóa, sửa và quản lý các sản phẩm trong kho</Text>
            </div>
            <Space>
              <Tooltip title="Làm mới">
                <Button icon={<ReloadOutlined />} onClick={fetchInventoryData} loading={loading}>
                  Tải lại
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                className="bg-vietnam-green hover:!bg-emerald-800"
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="Tổng số sản phẩm" value={stats.total} prefix={<InboxOutlined />} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Sắp hết hàng" value={stats.lowStock} prefix={<WarningOutlined />} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Hết hàng" value={stats.outOfStock} prefix={<WarningOutlined />} valueStyle={{ color: "#ff4d4f" }} />
            </Card>
          </Col>
        </Row>

        {/* Main */}
        <Card>
          {/* Search & Filter */}
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
                style={{ width: 220 }}
                allowClear
                showSearch
                optionFilterProp="children"
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
              showTotal: (total) => `Tổng ${total} sản phẩm`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: 1000 }}
            bordered
            onChange={(paginationInfo, filters, sorter) => {
              // ✅ Cập nhật pagination state
              if (paginationInfo) {
                setPagination({
                  current: paginationInfo.current || 1,
                  pageSize: paginationInfo.pageSize || 10,
                });
              }
              
              // ✅ Cập nhật sortedInfo để useMemo tự động sort lại
              // Luôn đảm bảo itemId được sort tăng dần như secondary sort
              if (sorter && sorter.field) {
                // ✅ Nếu sort theo itemId, luôn force là 'ascend'
                if (sorter.field === 'itemId') {
                  setSortedInfo({ field: 'itemId', order: 'ascend' });
                } else {
                  setSortedInfo({
                    field: sorter.field,
                    order: sorter.order || 'ascend'
                  });
                }
              } else {
                // Nếu không có sort, mặc định sort theo itemId tăng dần
                setSortedInfo({ field: 'itemId', order: 'ascend' });
              }
            }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                {editingItem ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm mới"}
                {editingItem?.itemName ? (
                  <span style={{ fontWeight: 600, color: "#1890ff" }}>: {editingItem.itemName}</span>
                ) : null}
              </span>
            </div>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText={<span>{editingItem ? "Cập nhật" : "Thêm mới"}</span>}
          cancelText="Hủy bỏ"
          width={650}
          confirmLoading={saveLoading}
          maskClosable={false}
          okButtonProps={{ size: "large", loading: saveLoading }}
          cancelButtonProps={{ size: "large", disabled: saveLoading }}
        >
          <Form form={form} layout="vertical" size="large">
            <Form.Item
              name="itemName"
              label={<span style={{ fontSize: 15, fontWeight: 600 }}>Tên sản phẩm</span>}
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự!" },
                { max: 100, message: "Tên sản phẩm không được vượt quá 100 ký tự!" },
                { whitespace: true, message: "Tên sản phẩm không được chỉ chứa khoảng trắng!" },
              ]}
            >
              <Input placeholder="Ví dụ: Gạo tẻ Hương Việt, Trái cây tươi..." showCount maxLength={100} disabled={saveLoading} />
            </Form.Item>

            <Form.Item
              name="unit"
              label={<span style={{ fontSize: 15, fontWeight: 600 }}>Đơn vị tính</span>}
              rules={[{ required: true, message: "Vui lòng chọn đơn vị tính!" }]}
            >
              <Select
                placeholder="Chọn đơn vị tính (kg, gói, hộp, ...)"
                disabled={saveLoading}
                showSearch
                optionFilterProp="children"
              >
                {units.map((unit) => (
                  <Option key={unit.key} value={unit.key}>
                    {unit.value}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="stockQuantity"
              label={<span style={{ fontSize: 15, fontWeight: 600 }}>Số lượng trong kho</span>}
              rules={[
                { required: true, message: "⚠️ Vui lòng nhập số lượng!" },
                { type: "number", min: 0, message: "⚠️ Số lượng phải lớn hơn hoặc bằng 0!" },
                { type: "number", max: 999999, message: "⚠️ Số lượng không được vượt quá 999,999!" },
              ]}
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
                style={{ width: "100%" }}
                min={0}
                max={999999}
                disabled={saveLoading}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Form>

          {saveLoading && (
            <div style={{ textAlign: "center", padding: "12px", background: "#f0f0f0", borderRadius: 8, marginTop: 16 }}>
              <Spin />
              <span style={{ marginLeft: 12, color: "#666" }}>
                Đang {editingItem ? "cập nhật" : "thêm"} sản phẩm...
              </span>
            </div>
          )}
        </Modal>

        {/* Detail Drawer */}
        <Drawer
          title={<div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>Chi tiết sản phẩm</span></div>}
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
                        <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 15 }}>Xác nhận xóa sản phẩm</div>
                        <div style={{ color: "#666" }}>Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?</div>
                      </div>
                    }
                    description={
                      <div
                        style={{
                          padding: "8px 12px",
                          background: "#fff7e6",
                          borderRadius: 6,
                          border: "1px solid #ffd591",
                          marginTop: 8,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Tên sản phẩm: {viewingItem.itemName}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          Mã: #{viewingItem.itemId} | Đơn vị: {getUnitLabel(viewingItem.unit)} | Số lượng: {viewingItem.stockQuantity}
                        </div>
                      </div>
                    }
                    onConfirm={() => handleDelete(viewingItem.itemId, viewingItem.itemName)}
                    okText=" Xóa"
                    cancelText=" Hủy"
                    okButtonProps={{ danger: true, loading: deleteLoading === viewingItem.itemId, size: "middle" }}
                    cancelButtonProps={{ disabled: deleteLoading === viewingItem.itemId, size: "middle" }}
                    icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={deleteLoading === viewingItem.itemId}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          }
        >
          {detailLoading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
            </div>
          ) : viewingItem ? (
            <>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label={<span style={{ fontWeight: "bold" }}>Mã sản phẩm</span>}>
                  <Tag color="cyan">#{viewingItem.itemId}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label={<span style={{ fontWeight: "bold" }}>Tên sản phẩm</span>}>
                  <strong>{viewingItem.itemName}</strong>
                </Descriptions.Item>

                <Descriptions.Item label={<span style={{ fontWeight: "bold" }}>Đơn vị tính</span>}>
                  <Tag color="blue">{getUnitLabel(viewingItem.unit)}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label={<span style={{ fontWeight: "bold" }}>Số lượng trong kho</span>}>
                  <div>
                    <Badge
                      count={viewingItem.stockQuantity}
                      showZero
                      overflowCount={9999}
                      style={{
                        backgroundColor:
                          viewingItem.stockQuantity === 0
                            ? "#ff4d4f"
                            : viewingItem.stockQuantity <= 10
                            ? "#faad14"
                            : "#52c41a",
                        height: "auto",
                      }}
                    />
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label={<span style={{ fontWeight: "bold" }}>Trạng thái</span>}>
                  {(() => {
                    const status = getStockStatus(viewingItem.stockQuantity);
                    return <Tag color={status.color}>{status.text}</Tag>;
                  })()}
                </Descriptions.Item>
              </Descriptions>

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
                  <div style={{ padding: "12px", background: "#fff2e8", borderRadius: 8, border: "1px solid #ffbb96" }}>
                    <WarningOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                    <strong style={{ color: "#ff4d4f" }}>Cảnh báo:</strong> Sản phẩm đã hết hàng!
                  </div>
                )}
                {viewingItem.stockQuantity > 0 && viewingItem.stockQuantity <= 10 && (
                  <div style={{ padding: "12px", background: "#fffbe6", borderRadius: 8, border: "1px solid #ffe58f" }}>
                    <WarningOutlined style={{ color: "#faad14", marginRight: 8 }} />
                    <strong style={{ color: "#faad14" }}>Cảnh báo:</strong> Sản phẩm sắp hết hàng! Cần nhập thêm.
                  </div>
                )}
                {viewingItem.stockQuantity > 10 && (
                  <div style={{ padding: "12px", background: "#f6ffed", borderRadius: 8, border: "1px solid #b7eb8f" }}>
                    <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                    <strong style={{ color: "#52c41a" }}>Tốt:</strong> Sản phẩm còn đủ hàng trong kho.
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
              <p style={{ color: "#999", marginTop: 16 }}>Không có dữ liệu</p>
            </div>
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

export default Inventory;
