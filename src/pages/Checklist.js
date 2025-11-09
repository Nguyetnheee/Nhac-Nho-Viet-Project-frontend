import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { scrollToTop } from '../utils/scrollUtils';
import { 
  Select, 
  Pagination, 
  Spin, 
  Empty, 
  Modal, 
  Input, 
  DatePicker, 
  Form, 
  message, 
  Table, 
  Tag, 
  Card, 
  Typography, 
  Button,
  Checkbox,
  InputNumber,
  Space,
  Divider
} from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined, ReloadOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { checklistService } from '../services/checklistService';
import { ritualService } from '../services/ritualService';

const { Title, Text } = Typography;
const { Option } = Select;

const Checklist = () => {
  const navigate = useNavigate(); 
  
  const [checklistsByRitual, setChecklistsByRitual] = useState([]); 
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // User-created checklists
  const [userChecklists, setUserChecklists] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListPagination, setUserListPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0 
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ritualId: null, title: '', reminderDate: null });
  const [rituals, setRituals] = useState([]);
  const [ritualsLoading, setRitualsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  
  // States cho checklist con (items)
  const [selectedRitualId, setSelectedRitualId] = useState(null);
  const [ritualChecklistItems, setRitualChecklistItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingRitualItems, setLoadingRitualItems] = useState(false);
  
  // Detail modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [checklistDetail, setChecklistDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [savingItem, setSavingItem] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemForm] = Form.useForm();
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemForm] = Form.useForm();
  const [savingChecklist, setSavingChecklist] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    ritualName: '',
    itemName: '',
    unit: ''
  });
  
  // Pagination states (data cũ, hiện không dùng đến)
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Filter options từ data
  const [filterOptions, setFilterOptions] = useState({
    ritualNames: [],
    itemNames: [],
    units: []
  });

  useEffect(() => {
    setChecklistsByRitual([]);
    setLoading(false);
    scrollToTop(true);
    fetchRituals();
  }, []);

  useEffect(() => {
    if (user?.id || user?.userId) {
      fetchUserChecklists(1, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.userId]);

  const fetchRituals = async () => {
    setRitualsLoading(true);
    try {
      const data = await ritualService.getAllRituals({ page: 0, size: 1000 });
      setRituals(Array.isArray(data) ? data : (data?.content || []));
    } catch (error) {
      console.error('Error fetching rituals:', error);
      message.error('Không thể tải danh sách lễ hội!');
    } finally {
      setRitualsLoading(false);
    }
  };

  // ✅ SỬA: luôn truyền page/size & set total để AntD phân trang đúng
  const fetchUserChecklists = async (page = 1, pageSize = 500) => {
    if (!user?.id && !user?.userId) return;

    setUserListLoading(true);
    try {
      const userId = user?.id || user?.userId;
      const params = {
        userId: Number(userId),
        page: page - 1, // API 0-based
        size: pageSize,
        sort: ['createdAt', 'desc']
      };
      
      const response = await checklistService.getUserChecklists(params);

      let checklists = [];
      let total = 0;

      if (Array.isArray(response)) {
        checklists = response;
        total = response.length;
      } else if (response?.content) {
        checklists = response.content || [];
        total = response.totalElements ?? response.total ?? 0;
      } else if (response?.data) {
        const d = response.data;
        checklists = Array.isArray(d) ? d : (d?.content || []);
        total = response.total ?? d?.totalElements ?? checklists.length;
      }

      setUserChecklists(checklists);
      setUserListPagination({
        current: page,
        pageSize,
        total
      });
    } catch (error) {
      console.error('Error fetching user checklists:', error);
      const status = error.response?.status;
      const isNotFound = status === 404;
      const isEmptyResponse = status === 200 && (!error.response?.data || 
        (Array.isArray(error.response.data) && error.response.data.length === 0));
      if (!isNotFound && !isEmptyResponse && status !== undefined) {
        if (status >= 500 || status === 403 || status === 401) {
          message.error('Không thể tải danh sách checklist!');
        }
      }
      if (isNotFound || isEmptyResponse || !error.response) {
        setUserChecklists([]);
        setUserListPagination({
          current: page,
          pageSize,
          total: 0
        });
      }
    } finally {
      setUserListLoading(false);
    }
  };

  const fetchChecklists = async () => {
    return;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, current: 0 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page - 1 }));
  };
  
  const handleViewDetails = (ritualId) => {
    if (!ritualId) return;
    navigate(`/rituals/${ritualId}`); 
  };

  // Create user checklist
  const openCreateModal = () => {
    form.resetFields();
    setFormData({ ritualId: null, title: '', reminderDate: null });
    setSelectedRitualId(null);
    setRitualChecklistItems([]);
    setSelectedItems([]);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    form.resetFields();
    setFormData({ ritualId: null, title: '', reminderDate: null });
    setSelectedRitualId(null);
    setRitualChecklistItems([]);
    setSelectedItems([]);
  };

  // Fetch checklist items khi chọn ritual
  const handleRitualChange = async (ritualId) => {
    setSelectedRitualId(ritualId);
    if (!ritualId) {
      setRitualChecklistItems([]);
      setSelectedItems([]);
      return;
    }

    setLoadingRitualItems(true);
    try {
      // ✅ SỬA: lấy nhiều bản ghi (vd size=1000)
      const itemsResp = await checklistService.getByRitual(ritualId, { page: 0, size: 1000 });
      const items = Array.isArray(itemsResp) ? itemsResp : (itemsResp?.content || []);
      setRitualChecklistItems(items || []);
    } catch (error) {
      console.error('Error fetching ritual checklist items:', error);
      message.warning('Không thể tải danh sách vật phẩm của lễ hội này.');
      setRitualChecklistItems([]);
    } finally {
      setLoadingRitualItems(false);
    }
  };

  // Add/remove/update items (local state)
  const handleAddItemToChecklist = (item) => {
    const existingItem = selectedItems.find(si => si.itemId === item.itemId);
    if (existingItem) {
      message.warning('Vật phẩm này đã được thêm vào danh sách!');
      return;
    }
    const newItem = {
      itemId: item.itemId,
      itemName: item.itemName || item.name || 'N/A',
      quantity: item.quantity || 1,
      note: item.checkNote || item.note || '',
      unit: item.unit || ''
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItemFromChecklist = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const handleUpdateItemInChecklist = (itemId, field, value) => {
    setSelectedItems(selectedItems.map(item => 
      item.itemId === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleCreate = async () => {
    if (!user?.id && !user?.userId) {
      Modal.warning({ 
        title: 'Vui lòng đăng nhập', 
        content: 'Bạn cần đăng nhập để tạo danh mục cá nhân.' 
      });
      return;
    }

    try {
      const values = await form.validateFields();
      const userId = user?.id || user?.userId;
      if (!userId) {
        Modal.warning({ 
          title: 'Lỗi xác thực', 
          content: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' 
        });
        return;
      }

      const payload = {
        userId: Number(userId),
        ritualId: Number(values.ritualId),
        title: values.title.trim(),
        reminderDate: values.reminderDate ? values.reminderDate.toISOString() : null
      };

      setCreating(true);
      const response = await checklistService.createUserChecklist(payload);
      const userChecklistId = response?.userChecklistId || response?.id || response?.data?.userChecklistId;
      if (!userChecklistId) throw new Error('Không thể lấy ID của checklist vừa tạo!');

      if (selectedItems.length > 0) {
        try {
          const itemPromises = selectedItems.map(item => 
            checklistService.createUserChecklistItem({
              userChecklistId: Number(userChecklistId),
              itemId: Number(item.itemId),
              quantity: Number(item.quantity) || 1,
              note: item.note || ''
            })
          );
          await Promise.all(itemPromises);
          message.success(`Đã thêm ${selectedItems.length} vật phẩm vào checklist!`);
        } catch (itemError) {
          console.error('Error creating checklist items:', itemError);
          message.warning('Checklist đã được tạo nhưng một số vật phẩm không thể thêm. Vui lòng thêm lại sau.');
        }
      }
      
      closeCreateModal();
      // ✅ SỬA: luôn refresh về trang 1 để thấy bản ghi mới nhất
      await fetchUserChecklists(1, userListPagination.pageSize);
      Modal.success({ title: 'Tạo danh mục mới thành công', width: 400 });
    } catch (error) {
      if (error?.errorFields) return;
      console.error('❌ Create user checklist failed:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Không thể tạo checklist. Vui lòng thử lại.';
      Modal.error({ title: 'Không thể tạo checklist', content: errorMessage });
    } finally {
      setCreating(false);
    }
  };

  // Detail modal
  const handleOpenDetailModal = async (userChecklistId) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setChecklistDetail(null);
    setChecklistItems([]);
    
    try {
      const [checklistResponse, itemsResponse, allItemsResp] = await Promise.all([
        checklistService.getUserChecklistById(userChecklistId),
        // ✅ SỬA: ép size lớn để lấy quá 10
        checklistService.getUserChecklistItems(userChecklistId, { page: 0, size: 1000 }),
        checklistService.getChecklistItems({ page: 0, size: 1000 })
      ]);
      
      const data = checklistResponse?.data || checklistResponse;
      if (data) setChecklistDetail(data);

      let items = [];
      if (Array.isArray(itemsResponse)) items = itemsResponse;
      else if (itemsResponse?.data) items = Array.isArray(itemsResponse.data) ? itemsResponse.data : (itemsResponse?.data?.content || []);
      else if (itemsResponse?.content) items = itemsResponse.content || [];
      else if (data?.items) items = data.items || [];

      items = (items || []).map(item => ({
        ...item,
        checked: item.checked !== undefined ? item.checked : false
      }));
      setChecklistItems(items);

      const allItems = Array.isArray(allItemsResp) ? allItemsResp : (allItemsResp?.content || []);
      setAvailableItems(allItems || []);
    } catch (error) {
      console.error('Error loading checklist detail:', error);
      message.error('Không thể tải chi tiết checklist!');
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setChecklistDetail(null);
    setChecklistItems([]);
    setAvailableItems([]);
    setEditingItemId(null);
    editingItemForm.resetFields();
  };

  const handleToggleItemChecked = async (item, checked) => {
    if (!item.userChecklistItemId) {
      message.warning('Không thể cập nhật item chưa được lưu!');
      return;
    }
    try {
      setSavingItem(true);
      const response = await checklistService.toggleUserChecklistItemChecked(item.userChecklistItemId);
      const newCheckedStatus = response?.checked !== undefined ? response.checked : !item.checked;
      setChecklistItems(prev => prev.map(i => 
        i.userChecklistItemId === item.userChecklistItemId 
          ? { ...i, checked: newCheckedStatus } 
          : i
      ));
    } catch (error) {
      console.error('❌ Error updating item checked status:', error);
      setChecklistItems(prev => prev.map(i => 
        i.userChecklistItemId === item.userChecklistItemId 
          ? { ...i, checked: item.checked } 
          : i
      ));
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Không thể cập nhật trạng thái!';
      message.error(errorMessage);
    } finally {
      setSavingItem(false);
    }
  };

  const handleAddNewItem = () => {
    if (!checklistDetail?.userChecklistId) {
      message.error('Không tìm thấy checklist!');
      return;
    }
    newItemForm.resetFields();
    setAddItemModalOpen(true);
  };

  const handleSaveNewItem = async () => {
    try {
      const values = await newItemForm.validateFields();
      const selectedItem = availableItems.find(i => i.itemId === values.itemId);

      setSavingItem(true);
      const response = await checklistService.createUserChecklistItem({
        userChecklistId: checklistDetail.userChecklistId,
        itemId: Number(values.itemId),
        quantity: Number(values.quantity),
        note: values.note || '',
        checked: false
      });

      const newItem = {
        userChecklistItemId: response?.data?.userChecklistItemId || response?.userChecklistItemId,
        itemId: selectedItem.itemId,
        itemName: selectedItem.itemName,
        unit: selectedItem.unit,
        quantity: Number(values.quantity),
        checked: false,
        note: values.note || '',
        stockQuantity: selectedItem.stockQuantity || 0
      };

      setChecklistItems(prev => [...prev, newItem]);
      message.success('Đã thêm vật phẩm vào danh mục!');
      setAddItemModalOpen(false);
      newItemForm.resetFields();
    } catch (error) {
      if (error.errorFields) return;
      console.error('Error adding item:', error);
      message.error('Không thể thêm vật phẩm!');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!item.userChecklistItemId) {
      setChecklistItems(prev => prev.filter(i => i !== item));
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${item.itemName}" khỏi checklist?`,
      onOk: async () => {
        try {
          setSavingItem(true);
          await checklistService.deleteUserChecklistItem(item.userChecklistItemId);
          setChecklistItems(prev => prev.filter(i => i.userChecklistItemId !== item.userChecklistItemId));
          message.success('Đã xóa vật phẩm!');
        } catch (error) {
          console.error('Error deleting item:', error);
          message.error('Không thể xóa vật phẩm!');
        } finally {
          setSavingItem(false);
        }
      }
    });
  };

  const handleViewItemDetail = async (userChecklistItemId) => {
    if (!userChecklistItemId) {
      message.warning('Không tìm thấy ID của vật phẩm!');
      return;
    }
    try {
      const itemDetail = await checklistService.getUserChecklistItemById(userChecklistItemId);
      Modal.info({
        title: 'Chi tiết vật phẩm',
        width: 600,
        content: (
          <div className="mt-4">
            <div className="space-y-3">
              <div>
                <Text strong className="text-vietnam-green">Tên vật phẩm:</Text>
                <div className="mt-1">{itemDetail.itemName || 'N/A'}</div>
              </div>
              <div>
                <Text strong className="text-vietnam-green">Số lượng:</Text>
                <div className="mt-1">{itemDetail.quantity || 0} {itemDetail.unit || ''}</div>
              </div>
              {itemDetail.note && (
                <div>
                  <Text strong className="text-vietnam-green">Ghi chú:</Text>
                  <div className="mt-1">{itemDetail.note}</div>
                </div>
              )}
              <div>
                <Text strong className="text-vietnam-green">Trạng thái:</Text>
                <div className="mt-1">
                  <Tag color={itemDetail.checked ? 'green' : 'default'}>
                    {itemDetail.checked ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                  </Tag>
                </div>
              </div>
              {itemDetail.createdAt && (
                <div>
                  <Text strong className="text-vietnam-green">Ngày tạo:</Text>
                  <div className="mt-1">{dayjs(itemDetail.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              )}
            </div>
          </div>
        ),
      });
    } catch (error) {
      console.error('Error fetching item detail:', error);
      message.error('Không thể tải chi tiết vật phẩm!');
    }
  };

  const handleStartEditItem = (item) => {
    setEditingItemId(item.userChecklistItemId);
    editingItemForm.setFieldsValue({
      quantity: item.quantity,
      note: item.note || ''
    });
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    editingItemForm.resetFields();
  };

  const handleSaveItem = async (item) => {
    try {
      const values = await editingItemForm.validateFields();
      if (!item.userChecklistItemId) {
        message.error('Không tìm thấy userChecklistItemId để cập nhật!');
        return;
      }
      setSavingItem(true);
      await checklistService.updateUserChecklistItem(item.userChecklistItemId, {
        quantity: Number(values.quantity),
        note: values.note || ''
      });
      setChecklistItems(prev => prev.map(i => 
        i.userChecklistItemId === item.userChecklistItemId
          ? { ...i, quantity: Number(values.quantity), note: values.note || '' }
          : i
      ));
      message.success('Đã cập nhật vật phẩm!');
      setEditingItemId(null);
      editingItemForm.resetFields();
    } catch (error) {
      if (error.errorFields) return;
      console.error('Error updating item:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật vật phẩm!';
      message.error(errorMessage);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteChecklist = async (userChecklistId) => {
    if (!userChecklistId) {
      message.error('Không tìm thấy danh mục để xóa!');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: 'Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setSavingChecklist(true);
          await checklistService.deleteUserChecklist(userChecklistId);
          message.success('Đã xóa danh mục!');
          if (detailModalOpen && checklistDetail?.userChecklistId === userChecklistId) {
            handleCloseDetailModal();
          }
          await fetchUserChecklists(userListPagination.current, userListPagination.pageSize);
        } catch (error) {
          console.error('Error deleting checklist:', error);
          const errorMessage = error.response?.data?.message 
            || error.response?.data?.error
            || error.message
            || 'Không thể xóa danh mục!';
          message.error(errorMessage);
        } finally {
          setSavingChecklist(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-vietnam-cream font-sans transition-all duration-300">
      {/* HERO SECTION */}
      <section 
        className="relative py-24 text-center overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-vietnam-green/70 backdrop-blur-[1px] transition-opacity duration-500"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white"> 
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">
            Danh Mục Lễ Hội
          </h1>
          <p className="text-base md:text-lg text-green-100 drop-shadow-md mb-8">
            Nơi bạn có thể tìm, tạo và lưu các danh sách lễ vật hoặc hoạt động cần chuẩn bị cho từng lễ hội.
          </p>

          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
              <div className="flex items-start gap-3">
                <InfoCircleOutlined className="text-2xl text-vietnam-gold mt-1" />
                <div>
                  <h3 className="text-xl font-semibold">Tạo danh mục cá nhân</h3>
                  <p className="text-green-100 text-sm">Danh mục sẽ được lưu vào hệ thống và chỉ hiển thị cho tài khoản của bạn.</p>
                </div>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 bg-vietnam-gold text-stone-900 px-5 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                <PlusCircleOutlined /> Thêm danh mục
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKLIST CỦA TÔI */}
      <section className="py-12 max-w-6xl mx-auto px-6">
        <div 
          className="relative shadow-2xl rounded-xl border-2 border-amber-200 overflow-hidden"
          style={{
            backgroundImage: "url('/checklist-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "local",
            minHeight: '400px'
          }}
        >
          <div 
            className="absolute inset-0 bg-white/85 backdrop-blur-sm"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
          ></div>
          
          <Card 
            className="relative"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none', zIndex: 1 }}
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex justify-between items-center mb-6">
              <Title level={3} className="!text-vietnam-green !mb-0">
                Danh Sách Danh Mục Của Tôi
              </Title>
              <div className="flex items-center gap-2">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => fetchUserChecklists(userListPagination.current, userListPagination.pageSize)}
                  loading={userListLoading}
                >
                  Làm mới
                </Button>
              </div>
            </div>

            {userListLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : userChecklists.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <h3 className="text-2xl font-bold text-vietnam-green mb-2">Chưa có danh mục nào</h3>
                    <p className="text-gray-600">Nhấn "Thêm danh mục" để bắt đầu.</p>
                  </div>
                }
              />
            ) : (
              <Table
                dataSource={userChecklists}
                rowKey={(record) => record.userChecklistId || record.id}
                loading={userListLoading}
                pagination={{
                  // current: userListPagination.current,
                  // pageSize: userListPagination.pageSize,
                  pageSize: 5,
                  total: userListPagination.total,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} checklist`,
                  // showSizeChanger: true,
                  // pageSizeOptions: ['5','10','20','50','100'],
                  // onChange: (page, pageSize) => fetchUserChecklists(page, pageSize),
                  // onShowSizeChange: (current, size) => fetchUserChecklists(1, size),
                }}
                onRow={(record) => ({
                  onClick: (e) => {
                    if (e.target.closest('button') || e.target.closest('.ant-space')) return;
                    handleOpenDetailModal(record.userChecklistId || record.id);
                  },
                  className: 'checklist-table-row',
                  style: { cursor: 'pointer', transition: 'all 0.3s ease' }
                })}
                columns={[
                  {
                    title: 'Tiêu Đề',
                    dataIndex: 'title',
                    key: 'title',
                    render: (text, record) => (
                      <div>
                        <Text strong className="text-lg text-vietnam-green">
                          {text || `Checklist #${record.userChecklistId || record.id}`}
                        </Text>
                      </div>
                    ),
                    width: '30%',
                  },
                  {
                    title: 'Lễ Hội',
                    dataIndex: 'ritualId',
                    key: 'ritualId',
                    render: (ritualId) => {
                      const ritual = rituals.find(r => r.ritualId === ritualId);
                      return ritual ? (
                        <Tag color="green" className="text-sm">
                          {ritual.ritualName}
                        </Tag>
                      ) : (
                        <Text type="secondary">ID: {ritualId}</Text>
                      );
                    },
                    width: '25%',
                  },
                  {
                    title: 'Ngày Nhắc Nhở',
                    dataIndex: 'reminderDate',
                    key: 'reminderDate',
                    render: (date) => {
                      if (!date) return <Text type="secondary">Không có</Text>;
                      const formatted = dayjs(date).format('DD/MM/YYYY');
                      const isPast = dayjs(date).isBefore(dayjs(), 'day');
                      const isToday = dayjs(date).isSame(dayjs(), 'day');
                      return (
                        <Tag color={isPast ? 'red' : isToday ? 'orange' : 'blue'}>
                          {formatted}
                        </Tag>
                      );
                    },
                    width: '20%',
                  },
                  {
                    title: 'Ngày Tạo',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date) => {
                      if (!date) return <Text type="secondary">-</Text>;
                      return dayjs(date).format('DD/MM/YYYY HH:mm');
                    },
                    width: '20%',
                  },
                  {
                    title: 'Thao Tác',
                    key: 'actions',
                    width: '15%',
                    render: (_, record) => (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChecklist(record.userChecklistId || record.id);
                        }}
                        loading={savingChecklist}
                      >
                        Xóa
                      </Button>
                    ),
                  },
                ]}
                className="checklist-table"
                style={{ background: 'transparent' }}
              />
            )}
          </Card>
        </div>
      </section>

      {/* Modal tạo checklist */}
      <Modal
        centered
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreate}
        okText="Tạo danh mục"
        cancelText="Hủy"
        confirmLoading={creating}
        className="nnv-create-checklist-modal"
        title={
          <div className="flex items-center gap-2 text-vietnam-green">
            <PlusCircleOutlined /> 
            <span className="font-semibold">Tạo Danh Mục Cá Nhân</span>
          </div>
        }
        okButtonProps={{ style: { background: '#d4af37', borderColor: '#d4af37', color: '#1f2937', fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderColor: '#065f46', color: '#065f46' } }}
        styles={{ body: { background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))' } }}
        width={600}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label={<span className="text-vietnam-green font-medium">Chọn Lễ Hội</span>}
            name="ritualId"
            rules={[{ required: true, message: 'Vui lòng chọn lễ hội!' }]}
          >
            <Select
              placeholder="Chọn lễ hội để tạo danh mục"
              size="large"
              loading={ritualsLoading}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleRitualChange}
            >
              {rituals.map(ritual => (
                <Option key={ritual.ritualId} value={ritual.ritualId}>
                  {ritual.ritualName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="text-vietnam-green font-medium">Tiêu Đề Danh Mục</span>}
            name="title"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề checklist!' },
              { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' }
            ]}
          >
            <Input placeholder="Ví dụ: Danh mục Lễ Tết 2025" size="large" maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            label={<span className="text-vietnam-green font-medium">Ngày Nhắc Nhở (Tùy chọn)</span>}
            name="reminderDate"
            tooltip="Chọn ngày bạn muốn được nhắc nhở về danh mục này"
          >
            <DatePicker
              placeholder="Chọn ngày nhắc nhở"
              size="large"
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              showTime={false}
            />
          </Form.Item>

          {selectedRitualId && (
            <div className="mt-4">
              <Divider orientation="left" className="!text-vietnam-green !font-semibold">
                Thêm Vật Phẩm Vào Danh Mục (Tùy chọn)
              </Divider>
              
              {loadingRitualItems ? (
                <div className="flex justify-center py-4"><Spin /></div>
              ) : ritualChecklistItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <Text strong className="text-sm text-vietnam-green mb-2 block">
                      Vật phẩm có sẵn cho lễ hội này:
                    </Text>
                    <div className="space-y-2">
                      {ritualChecklistItems.map((item) => {
                        const isSelected = selectedItems.some(si => si.itemId === item.itemId);
                        return (
                          <div
                            key={item.itemId || item.checklistId}
                            className={`flex items-center justify-between p-2 rounded border ${
                              isSelected ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex-1">
                              <Text strong className="text-sm">
                                {item.itemName || item.name || 'N/A'}
                              </Text>
                              <div className="text-xs text-gray-500 mt-1">
                                Số lượng mặc định: {item.quantity || 1} {item.unit || ''}
                              </div>
                            </div>
                            <Button
                              type={isSelected ? 'default' : 'primary'}
                              size="small"
                              icon={isSelected ? <CheckCircleOutlined /> : <PlusOutlined />}
                              onClick={() => {
                                if (isSelected) {
                                  handleRemoveItemFromChecklist(item.itemId);
                                } else {
                                  handleAddItemToChecklist(item);
                                }
                              }}
                              disabled={creating}
                            >
                              {isSelected ? 'Đã chọn' : 'Thêm'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <Text strong className="text-sm text-vietnam-green mb-2 block">
                        Vật phẩm đã chọn ({selectedItems.length}):
                      </Text>
                      <div className="space-y-2">
                        {selectedItems.map((item) => (
                          <div key={item.itemId} className="bg-white rounded p-3 border border-amber-300">
                            <div className="flex items-start justify-between mb-2">
                              <Text strong className="text-sm">{item.itemName}</Text>
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveItemFromChecklist(item.itemId)}
                                disabled={creating}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Text className="text-xs text-gray-600">Số lượng:</Text>
                                <InputNumber
                                  min={1}
                                  value={item.quantity}
                                  onChange={(value) => handleUpdateItemInChecklist(item.itemId, 'quantity', value || 1)}
                                  size="small"
                                  className="w-full mt-1"
                                  disabled={creating}
                                />
                              </div>
                              <div>
                                <Text className="text-xs text-gray-600">Đơn vị:</Text>
                                <Input
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItemInChecklist(item.itemId, 'unit', e.target.value)}
                                  size="small"
                                  className="w-full mt-1"
                                  disabled={creating}
                                  placeholder="Đơn vị"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <Text className="text-xs text-gray-600">Ghi chú:</Text>
                              <Input
                                value={item.note}
                                onChange={(e) => handleUpdateItemInChecklist(item.itemId, 'note', e.target.value)}
                                size="small"
                                className="w-full mt-1"
                                disabled={creating}
                                placeholder="Ghi chú (tùy chọn)"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Text type="secondary" className="text-sm">
                    Không có vật phẩm nào cho lễ hội này.
                  </Text>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800 mb-0">
              <InfoCircleOutlined className="mr-2" />
              <strong>Lưu ý:</strong> Bạn có thể thêm vật phẩm vào danh mục ngay bây giờ hoặc thêm sau. 
              Danh mục sẽ được lưu và bạn có thể chỉnh sửa sau đó.
            </p>
          </div>
        </Form>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        open={detailModalOpen}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={800}
        className="checklist-detail-modal"
        styles={{ body: { padding: 0, background: 'transparent' } }}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : checklistDetail ? (
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              backgroundImage: "url('/checklist-background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: '500px'
            }}
          >
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" style={{ zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, padding: '32px' }}>
              <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-amber-300">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Title level={2} className="!text-vietnam-green !mb-0">
                      {checklistDetail.title || 'Checklist'}
                    </Title>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteChecklist(checklistDetail.userChecklistId)}
                      loading={savingChecklist}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag color="green" className="text-sm">
                      {checklistDetail.ritualName || `Lễ hội ID: ${checklistDetail.ritualId}`}
                    </Tag>
                    <Text type="secondary" className="text-sm">
                      Tạo bởi: {checklistDetail.userName || 'N/A'}
                    </Text>
                  </div>
                </div>
                <div className="text-right">
                  {checklistDetail.reminderDate && (
                    <div>
                      <Text type="secondary" className="text-xs block mb-1">Ngày nhắc nhở</Text>
                      <Tag 
                        color={
                          dayjs(checklistDetail.reminderDate).isBefore(dayjs(), 'day') ? 'red' :
                          dayjs(checklistDetail.reminderDate).isSame(dayjs(), 'day') ? 'orange' : 'blue'
                        }
                        className="text-sm font-semibold"
                      >
                        {dayjs(checklistDetail.reminderDate).format('DD/MM/YYYY')}
                      </Tag>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4} className="!text-vietnam-green !mb-0">
                    Danh sách vật phẩm
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNewItem}
                    loading={savingItem}
                    className="bg-vietnam-gold hover:!bg-yellow-500 !border-vietnam-gold"
                  >
                    Thêm vật phẩm
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {checklistItems.length === 0 ? (
                    <Empty description="Chưa có vật phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    checklistItems.map((item, index) => (
                      <div
                        key={item.userChecklistItemId || index}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          item.checked ? 'bg-green-50 border-green-300 opacity-75' : 'bg-white border-amber-200 hover:border-amber-400'
                        }`}
                        style={{ textDecoration: item.checked ? 'line-through' : 'none' }}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.checked}
                            onChange={(e) => handleToggleItemChecked(item, e.target.checked)}
                            disabled={savingItem}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Text strong className={`text-base ${item.checked ? 'text-gray-500' : 'text-vietnam-green'}`}>
                                {item.itemName}
                              </Text>
                              <Space>
                                {editingItemId === item.userChecklistItemId ? (
                                  <>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<SaveOutlined />}
                                      onClick={() => handleSaveItem(item)}
                                      loading={savingItem}
                                      className="text-green-600"
                                    >
                                      Lưu
                                    </Button>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<CloseOutlined />}
                                      onClick={handleCancelEditItem}
                                    >
                                      Hủy
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => handleStartEditItem(item)}
                                      disabled={savingItem}
                                      className="text-blue-600"
                                    >
                                      Sửa
                                    </Button>
                                    <Button
                                      type="text"
                                      danger
                                      size="small"
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDeleteItem(item)}
                                      loading={savingItem}
                                    />
                                  </>
                                )}
                              </Space>
                            </div>
                            {editingItemId === item.userChecklistItemId ? (
                              <Form form={editingItemForm} layout="vertical" className="mt-2">
                                <Form.Item
                                  name="quantity"
                                  rules={[
                                    { required: true, message: 'Vui lòng nhập số lượng!' },
                                    { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                                  ]}
                                  className="mb-2"
                                >
                                  <InputNumber placeholder="Số lượng" min={1} style={{ width: '100%' }} addonAfter={item.unit || ''} />
                                </Form.Item>
                                <Form.Item name="note">
                                  <Input.TextArea placeholder="Ghi chú (tùy chọn)" rows={2} maxLength={200} />
                                </Form.Item>
                              </Form>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span><strong>Số lượng:</strong> {item.quantity} {item.unit || ''}</span>
                                </div>
                                {item.note && (
                                  <div className="mt-2 text-sm text-gray-500 italic">
                                    <strong>Ghi chú:</strong> {item.note}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Divider className="my-4" />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Tạo ngày: {dayjs(checklistDetail.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                <span>
                  Tổng: {checklistItems.length} vật phẩm | Đã hoàn thành: {checklistItems.filter(i => i.checked).length}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Empty description="Không tìm thấy checklist" />
        )}
      </Modal>

      {/* Modal thêm item */}
      <Modal
        title="Thêm Vật Phẩm Mới"
        open={addItemModalOpen}
        onOk={handleSaveNewItem}
        onCancel={() => { setAddItemModalOpen(false); newItemForm.resetFields(); }}
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={savingItem}
        okButtonProps={{ className: 'bg-vietnam-gold hover:!bg-yellow-500' }}
      >
        <Form form={newItemForm} layout="vertical">
          <Form.Item
            label="Chọn Vật Phẩm"
            name="itemId"
            rules={[{ required: true, message: 'Vui lòng chọn vật phẩm!' }]}
          >
            <Select
              placeholder="Chọn vật phẩm"
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableItems.map(item => (
                <Option key={item.itemId} value={item.itemId}>
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
            <InputNumber placeholder="Nhập số lượng" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Ghi Chú (Tùy chọn)" name="note">
            <Input.TextArea placeholder="Nhập ghi chú" rows={3} maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .checklist-table-row { transition: all 0.3s ease; }
        .checklist-table-row:hover {
          background-color: rgba(212, 175, 55, 0.1) !important;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
        }
        .checklist-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background-color: rgba(212, 175, 55, 0.15) !important;
        }
        .checklist-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
          background-color: rgba(212, 175, 55, 0.25) !important;
        }
        .checklist-table .ant-checkbox-wrapper { z-index: 10; }
        .checklist-table .ant-table-thead > tr > th {
          background-color: rgba(255, 255, 255, 0.9) !important;
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
          font-weight: 600;
          color: #065f46;
        }
        .checklist-table .ant-table-tbody > tr > td {
          background-color: rgba(255, 255, 255, 0.7) !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }
        .checklist-table .ant-pagination { margin-top: 20px; }
      `}</style>
    </div>
  );
};

export default Checklist;
