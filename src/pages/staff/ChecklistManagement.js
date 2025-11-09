// src/pages/admin/ChecklistManagement.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, message, Row, Col, Typography, Tag, Alert, Spin, ConfigProvider, Modal, Form, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { checklistService } from '../../services/checklistService';
import { ritualService } from '../../services/ritualService';
import viVN from 'antd/locale/vi_VN';
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ChecklistManagement = () => {
  const [loading, setLoading] = useState(false);
  const [groupedChecklists, setGroupedChecklists] = useState({});
  const [allChecklists, setAllChecklists] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [editingChecklistItems, setEditingChecklistItems] = useState([]);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [editingSubmitting, setEditingSubmitting] = useState(false);

  useEffect(() => {
    fetchGroupedChecklists();
    fetchRituals();
    fetchItems();
  }, []);

  const fetchGroupedChecklists = async () => {
    setLoading(true);
    try {
      const response = await checklistService.getGroupedChecklists();
      setGroupedChecklists(response || {});
      // Đồng thời lấy tất cả checklist để kiểm tra lễ hội đã có checklist
      const allChecklistsResponse = await checklistService.getAllChecklists();
      setAllChecklists(allChecklistsResponse || []);
    } catch (error) {
      console.error('Error fetching grouped checklists:', error);
      message.error('Không thể tải danh sách checklist!');
    } finally {
      setLoading(false);
    }
  };

  const fetchRituals = async () => {
    try {
      const response = await ritualService.getAllRituals();
      setRituals(response || []);
    } catch (error) {
      message.error('Không thể tải danh sách lễ hội!');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await checklistService.getChecklistItems();
      setItems(response || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Không thể tải danh sách vật phẩm!');
    }
  };

  const handleRitualChange = (ritualId) => {
    setSelectedRitualId(ritualId);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleReset = () => {
    setSelectedRitualId(null);
    setSearchText('');
  };

  const handleAction = (action, record) => {
    if (action === 'Tạo') {
      handleOpenModal();
    } else {
      message.info(`Chức năng ${action} cho ID ${record.checklistId} đang được phát triển.`);
    }
  };

  const handleOpenEditModal = async (checklist) => {
    try {
      // Lấy danh sách items của checklist này (từ groupedChecklists)
      const checklistItems = checklist.items || [];
      
      // Tìm ritualId từ items đầu tiên có checklistId
      const firstItem = checklistItems[0];
      let ritualId = firstItem?.ritualId;
      
      // Nếu không có trong item, tìm từ allChecklists
      if (!ritualId && firstItem?.checklistId) {
        const checklistData = allChecklists.find(c => c.checklistId === firstItem.checklistId);
        ritualId = checklistData?.ritualId;
      }
      
      // Nếu vẫn không có, thử tìm từ tên checklist
      if (!ritualId) {
        const ritual = rituals.find(r => r.ritualName === checklist.checklistName);
        ritualId = ritual?.ritualId;
      }
      
      if (!ritualId) {
        message.error('Không tìm thấy thông tin lễ hội!');
        return;
      }

      // Đảm bảo mỗi item có đầy đủ thông tin
      const itemsWithFullInfo = checklistItems.map(item => ({
        ...item,
        ritualId: item.ritualId || ritualId
      }));

      setEditingChecklist({
        checklistName: checklist.checklistName,
        ritualId: ritualId,
        items: itemsWithFullInfo
      });
      setEditingChecklistItems([...itemsWithFullInfo]);
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      message.error('Không thể mở form chỉnh sửa!');
    }
  };

  const handleCloseEditModal = () => {
    setEditingChecklist(null);
    setEditingChecklistItems([]);
    editForm.resetFields();
    setIsEditModalVisible(false);
  };

  const handleAddItemToEdit = () => {
    const newItem = {
      checklistId: null,
      itemId: null,
      itemName: '',
      unit: '',
      quantity: 1,
      checkNote: '',
      isNew: true
    };
    setEditingChecklistItems([...editingChecklistItems, newItem]);
  };

  const handleRemoveItemFromEdit = (index) => {
    const newItems = editingChecklistItems.filter((_, i) => i !== index);
    setEditingChecklistItems(newItems);
  };

  const handleUpdateItemInEdit = (index, field, value) => {
    const newItems = [...editingChecklistItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditingChecklistItems(newItems);
  };

  const handleSaveEdit = async () => {
    if (!editingChecklist || editingChecklistItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một vật phẩm!');
      return;
    }

    setEditingSubmitting(true);
    try {
      // Xử lý từng item: tạo mới, cập nhật, hoặc xóa
      const promises = [];

      for (const item of editingChecklistItems) {
        if (item.isNew) {
          // Tạo mới
          if (item.itemId && item.quantity) {
            promises.push(
              checklistService.createChecklist({
                ritualId: editingChecklist.ritualId,
                itemId: item.itemId,
                quantity: item.quantity,
                checkNote: item.checkNote || ''
              })
            );
          }
        } else if (item.checklistId) {
          // Cập nhật item hiện có
          promises.push(
            checklistService.updateChecklist(item.checklistId, {
              ritualId: editingChecklist.ritualId,
              itemId: item.itemId,
              quantity: item.quantity,
              checkNote: item.checkNote || ''
            })
          );
        }
      }

      await Promise.all(promises);
      message.success('Cập nhật checklist thành công!');
      handleCloseEditModal();
      await fetchGroupedChecklists();
    } catch (error) {
      console.error('Error saving edit:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật checklist!';
      message.error(errorMessage);
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleDeleteItem = async (checklistId, index) => {
    if (!checklistId) {
      // Item mới chưa lưu, chỉ xóa khỏi danh sách
      handleRemoveItemFromEdit(index);
      return;
    }

    try {
      await checklistService.deleteChecklist(checklistId);
      message.success('Xóa item thành công!');
      handleRemoveItemFromEdit(index);
      await fetchGroupedChecklists();
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa item!';
      message.error(errorMessage);
    }
  };

  const handleDeleteChecklist = async (checklist) => {
    try {
      const checklistItems = checklist.items || [];
      
      if (checklistItems.length === 0) {
        message.warning('Checklist này không có vật phẩm nào!');
        return;
      }

      // Lấy tất cả checklistId từ các items
      const checklistIds = checklistItems
        .map(item => item.checklistId)
        .filter(id => id != null);

      if (checklistIds.length === 0) {
        message.warning('Không tìm thấy checklist items để xóa!');
        return;
      }

      // Xóa từng item
      const deletePromises = checklistIds.map(id => 
        checklistService.deleteChecklist(id).catch(error => {
          console.error(`Error deleting checklist ${id}:`, error);
          return null; // Tiếp tục xóa các item khác dù có lỗi
        })
      );

      await Promise.all(deletePromises);
      message.success(`Đã xóa checklist "${checklist.checklistName}" thành công!`);
      
      // Refresh danh sách checklist
      await fetchGroupedChecklists();
    } catch (error) {
      console.error('Error deleting checklist:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa checklist!';
      message.error(errorMessage);
    }
  };

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  // Lấy danh sách tất cả lễ hội (cho phép chọn bất kỳ lễ hội nào)
  const getAvailableRituals = () => {
    // Hiển thị tất cả lễ hội, cho phép thêm vật phẩm vào bất kỳ lễ hội nào
    return rituals;
  };

  // Kiểm tra lễ hội đã có checklist chưa
  const hasChecklist = (ritualId) => {
    if (!ritualId || !allChecklists || allChecklists.length === 0) {
      return false;
    }
    // So sánh với cả string và number để tránh lỗi kiểu dữ liệu
    return allChecklists.some(checklist => {
      const checklistRitualId = checklist.ritualId;
      return checklistRitualId == ritualId || 
             String(checklistRitualId) === String(ritualId) ||
             Number(checklistRitualId) === Number(ritualId);
    });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await checklistService.createChecklist({
        ritualId: values.ritualId,
        itemId: values.itemId,
        quantity: values.quantity,
        checkNote: values.checkNote || ''
      });
      message.success('Thêm checklist item thành công!');
      
      // Refresh danh sách checklist để cập nhật
      await fetchGroupedChecklists();
      
      // Reset các trường item, quantity, checkNote nhưng giữ lại ritualId
      // để có thể thêm item khác cho cùng lễ hội
      form.setFieldsValue({
        ritualId: values.ritualId, // Giữ lại lễ hội đã chọn
        itemId: undefined,
        quantity: undefined,
        checkNote: undefined
      });
    } catch (error) {
      console.error('Error creating checklist:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo checklist mới!';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Chuyển đổi grouped data thành array để hiển thị
  const getChecklistList = () => {
    return Object.entries(groupedChecklists).map(([checklistName, items]) => ({
      key: checklistName,
      checklistName: checklistName,
      items: items || [],
      itemCount: items?.length || 0
    }));
  };

  const filteredChecklists = getChecklistList().filter(checklist => {
    // Lọc theo tên checklist nếu có chọn lễ hội (giả sử tên checklist có thể chứa tên lễ hội)
    const selectedRitualName = selectedRitualId 
      ? rituals.find(r => r.ritualId === selectedRitualId)?.ritualName?.toLowerCase()
      : null;
    const matchesRitual = !selectedRitualId || 
      (selectedRitualName && checklist.checklistName?.toLowerCase().includes(selectedRitualName));
    
    // Lọc theo tìm kiếm
    const matchesSearch = searchText === '' ||
      checklist.checklistName?.toLowerCase().includes(searchText.toLowerCase()) ||
      checklist.items.some(item => 
        item.itemName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.checkNote?.toLowerCase().includes(searchText.toLowerCase())
      );
    return matchesRitual && matchesSearch;
  });

  // Columns cho bảng checklist chính
  const mainColumns = [
    { 
      title: 'STT', 
      key: 'index', 
      width: 80,
      render: (_, __, index) => index + 1
    },
    { 
      title: 'Tên Danh Mục', 
      dataIndex: 'checklistName', 
      key: 'checklistName',
      render: (text) => <Text strong className="text-lg">{text}</Text>
    },
    { 
      title: 'Số Lượng Vật Phẩm', 
      dataIndex: 'itemCount', 
      key: 'itemCount',
      width: 180,
      render: (count) => <Tag color="blue">{count} vật phẩm</Tag>
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              const isExpanded = expandedRows.includes(record.key);
              if (isExpanded) {
                setExpandedRows(expandedRows.filter(key => key !== record.key));
              } else {
                setExpandedRows([...expandedRows, record.key]);
              }
            }}
          >
            {expandedRows.includes(record.key) ? 'Ẩn' : 'Xem'}
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa checklist"
            description={`Bạn có chắc muốn xóa toàn bộ checklist "${record.checklistName}"? Hành động này không thể hoàn tác.`}
            onConfirm={() => handleDeleteChecklist(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columns cho bảng chi tiết vật phẩm
  const detailColumns = [
    { 
      title: 'STT', 
      key: 'index', 
      width: 60,
      render: (_, __, index) => index + 1
    },
    { 
      title: 'Tên Vật Phẩm', 
      dataIndex: 'itemName', 
      key: 'itemName',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Số Lượng', 
      dataIndex: 'quantity', 
      key: 'quantity',
      width: 120,
      render: (qty, record) => `${qty} ${record.unit || ''}`
    },
    { 
      title: 'Ghi Chú', 
      dataIndex: 'checkNote', 
      key: 'checkNote',
      render: (text) => text || <Text type="secondary">Không có</Text>
    },
  ];

  return (
    <ConfigProvider locale={viVN}>  
    <div className="font-sans">
      <Card className="shadow-lg rounded-xl border-t-4 border-vietnam-gold mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Title level={2} className="font-serif !text-vietnam-green !mb-1">
              <Space>
                {/* <CheckSquareOutlined />  */}
                Quản Lý Danh Mục Theo Lễ</Space>
            </Title>
            <Text type="secondary">Danh sách vật phẩm cần chuẩn bị cho các lễ hội.</Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchGroupedChecklists} loading={loading}>Tải lại</Button>
          {/* <Button onClick={handleReset}>Reset</Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAction('Tạo', {})} className="bg-vietnam-green hover:!bg-emerald-800">
              Thêm Danh Mục Mới
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-lg rounded-xl mb-6">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={10}>
            <Text strong>Lọc theo lễ hội</Text>
            <Select
              placeholder="Chọn một lễ hội"
              value={selectedRitualId}
              onChange={handleRitualChange}
              className="w-full mt-1"
              allowClear
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {rituals.map(r => <Option key={r.ritualId} value={r.ritualId}>{r.ritualName}</Option>)}
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Text strong>Tìm kiếm</Text>
            <Input
              placeholder="Tìm vật phẩm, lễ hội, ghi chú..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={handleSearchChange}
              className="w-full mt-1"
            />
          </Col>
          {/* <Col xs={24} md={4}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchAllChecklists} loading={loading}>Tải lại</Button>
              <Button onClick={handleReset}>Reset</Button>
            </Space>
          </Col> */}
        </Row>
      </Card>

      {selectedRitualId && (
        <Alert
          message={`Đang lọc checklist cho lễ hội: ${rituals.find(r => r.ritualId === selectedRitualId)?.ritualName}`}
          type="info"
          showIcon
          className="mb-6 rounded-lg"
        />
      )}

      <Card className="shadow-lg rounded-xl">
        <Spin spinning={loading}>
          <div className="mb-4">
            <Title level={5} strong>Danh sách Danh Mục: {" "}
              <Tag color="blue" className="text-sm">{filteredChecklists.length} danh mục</Tag>
            </Title>
          </div>
          <Table
            columns={mainColumns}
            dataSource={filteredChecklists}
            rowKey="key"
            pagination={{ 
              pageSize: 10, 
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} checklist` 
            }}
            expandable={{
              expandedRowKeys: expandedRows,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRows([...expandedRows, record.key]);
                } else {
                  setExpandedRows(expandedRows.filter(key => key !== record.key));
                }
              },
              expandedRowRender: (record) => (
                <div style={{ margin: '16px 0', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <Title level={5} style={{ marginBottom: '16px' }}>
                    Chi tiết vật phẩm trong checklist: <Tag color="green">{record.checklistName}</Tag>
                  </Title>
                  <Table
                    columns={detailColumns}
                    dataSource={record.items}
                    rowKey={(item, index) => `${item.checklistId}-${item.itemId}-${index}`}
                    pagination={false}
                    size="small"
                  />
                </div>
              ),
              rowExpandable: (record) => record.items && record.items.length > 0,
            }}
            scroll={{ x: 800 }}
          />
          </Spin>
        </Card>
      </div>

      {/* Modal tạo checklist mới */}
      <Modal
        title="Tạo Checklist Mới"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Chọn Lễ Hội"
            name="ritualId"
            rules={[
              { required: true, message: 'Vui lòng chọn lễ hội!' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === '') {
                    return Promise.reject(new Error('Vui lòng chọn lễ hội!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              placeholder="Chọn một lễ hội"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const numValue = value ? Number(value) : undefined;
                form.setFieldValue('ritualId', numValue);
                // Trigger validation sau khi set giá trị
                setTimeout(() => {
                  form.validateFields(['ritualId']);
                }, 0);
              }}
              notFoundContent={
                getAvailableRituals().length === 0 ? (
                  <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                    Không có lễ hội nào
                  </div>
                ) : null
              }
            >
              {getAvailableRituals().map(ritual => (
                <Option key={ritual.ritualId} value={Number(ritual.ritualId)}>
                  {ritual.ritualName}
                </Option>
              ))}
            </Select>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Chọn lễ hội và thêm vật phẩm từ kho hàng vào checklist. Bạn có thể thêm nhiều vật phẩm cho cùng một lễ hội.
            </Text>
          </Form.Item>

          <Form.Item
            label="Chọn Vật Phẩm"
            name="itemId"
            rules={[
              { required: true, message: 'Vui lòng chọn vật phẩm!' },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === '') {
                    return Promise.reject(new Error('Vui lòng chọn vật phẩm!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              placeholder="Chọn vật phẩm từ kho hàng"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const numValue = value ? Number(value) : undefined;
                form.setFieldValue('itemId', numValue);
                // Trigger validation sau khi set giá trị
                setTimeout(() => {
                  form.validateFields(['itemId']);
                }, 0);
              }}
            >
              {items.map(item => (
                <Option key={item.itemId} value={Number(item.itemId)}>
                  {item.itemName} {item.unit ? `(${item.unit})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số Lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Ghi Chú"
            name="checkNote"
            tooltip="Ghi chú này sẽ hiển thị cho khách hàng khi họ xem danh mục"
          >
            <TextArea
              placeholder="Nhập ghi chú (tùy chọn)"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseModal}>
                Hoàn thành
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                className="bg-vietnam-green hover:!bg-emerald-800"
              >
                Thêm Vật Phẩm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa checklist */}
      <Modal
        title={`Chỉnh sửa Checklist: ${editingChecklist?.checklistName || ''}`}
        open={isEditModalVisible}
        onCancel={handleCloseEditModal}
        footer={null}
        width={900}
        destroyOnClose
      >
        {editingChecklist && (
          <div>
            <Form.Item label="Lễ Hội" style={{ marginBottom: '16px' }}>
              <Input
                value={rituals.find(r => r.ritualId === editingChecklist.ritualId)?.ritualName || ''}
                disabled
                style={{ background: '#f5f5f5' }}
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Không thể thay đổi lễ hội khi chỉnh sửa
              </Text>
            </Form.Item>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>Danh sách vật phẩm</Title>
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleAddItemToEdit}
              >
                Thêm vật phẩm
              </Button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {editingChecklistItems.map((item, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: '12px', background: item.isNew ? '#f0f9ff' : '#fff' }}
                  title={
                    <Space>
                      <Text strong>Vật phẩm {index + 1}</Text>
                      {item.isNew && <Tag color="blue">Mới</Tag>}
                    </Space>
                  }
                  extra={
                    <Popconfirm
                      title="Xác nhận xóa"
                      description="Bạn có chắc muốn xóa vật phẩm này?"
                      onConfirm={() => handleDeleteItem(item.checklistId, index)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button 
                        danger 
                        size="small" 
                        icon={<DeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  }
                >
                  <Row gutter={16}>
                    <Col span={10}>
                      <Form.Item label="Vật phẩm" required>
                        <Select
                          placeholder="Chọn vật phẩm"
                          value={item.itemId}
                          onChange={(value) => {
                            const selectedItem = items.find(i => i.itemId === value);
                            handleUpdateItemInEdit(index, 'itemId', value);
                            if (selectedItem) {
                              handleUpdateItemInEdit(index, 'itemName', selectedItem.itemName);
                              handleUpdateItemInEdit(index, 'unit', selectedItem.unit);
                            }
                          }}
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {items.map(i => (
                            <Option key={i.itemId} value={i.itemId}>
                              {i.itemName} {i.unit ? `(${i.unit})` : ''}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="Số lượng" required>
                        <InputNumber
                          placeholder="Số lượng"
                          min={1}
                          value={item.quantity}
                          onChange={(value) => handleUpdateItemInEdit(index, 'quantity', value)}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Ghi chú">
                        <Input
                          placeholder="Ghi chú (tùy chọn)"
                          value={item.checkNote}
                          onChange={(e) => handleUpdateItemInEdit(index, 'checkNote', e.target.value)}
                          maxLength={500}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            {editingChecklistItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <Text>Chưa có vật phẩm nào. Vui lòng thêm vật phẩm.</Text>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={handleCloseEditModal}>
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleSaveEdit}
                loading={editingSubmitting}
                className="bg-vietnam-green hover:!bg-emerald-800"
                disabled={editingChecklistItems.length === 0}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default ChecklistManagement;