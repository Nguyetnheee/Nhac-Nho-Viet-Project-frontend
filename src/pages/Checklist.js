import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { scrollToTop } from '../utils/scrollUtils';
import { Select, Pagination, Spin, Empty, Modal, Input, DatePicker } from 'antd';
import { PlusCircleOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

const Checklist = () => {
  const navigate = useNavigate(); 
  
  const [checklistsByRitual, setChecklistsByRitual] = useState([]); 
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // User-created checklists (will be loaded via GET later). For now, display created ones immediately.
  const [userChecklists, setUserChecklists] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [userListPage, setUserListPage] = useState({ page: 0, size: 9, total: 0 });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userChecklistId: '', itemId: '', quantity: 1, note: '' });
  
  // Filter states
  const [filters, setFilters] = useState({
    ritualName: '',
    itemName: '',
    unit: ''
  });
  
  // Pagination states
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
    // Temporarily disable old ritual checklist loading
    setChecklistsByRitual([]);
    setLoading(false);
    scrollToTop(true);
  }, [filters, pagination.current]);

  // Hủy nối các API cũ cho checklist; không fetch từ server ở phiên bản này

  const fetchChecklists = async () => {
    // Old data source removed for the new user-owned checklist experience
    return;
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, current: 0 })); // Reset về trang đầu
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page - 1 // Ant Design pagination is 1-based, API is 0-based
    }));
  };
  
  const handleViewDetails = (ritualId) => {
    console.log('🔍 Navigating to ritual detail. RitualId:', ritualId);
    if (!ritualId) {
      console.error('❌ RitualId is undefined! Cannot navigate.');
      return;
    }
    navigate(`/rituals/${ritualId}`); 
  };

  // Create user checklist (POST /api/user-checklists)
  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setFormData({ title: '', reminderDate: null });
  };

  const handleCreate = async () => {
    if (!user?.id && !user?.userId) {
      Modal.warning({ title: 'Vui lòng đăng nhập', content: 'Bạn cần đăng nhập để tạo checklist.' });
      return;
    }
    // Validate fields for creating user checklist item
    if (!formData.userChecklistId || !formData.itemId) {
      Modal.warning({ title: 'Thiếu thông tin', content: 'Cần nhập UserChecklist ID và Item ID.' });
      return;
    }

    const payload = {
      userChecklistId: Number(formData.userChecklistId),
      itemId: Number(formData.itemId),
      quantity: Number(formData.quantity || 1),
      note: formData.note || '',
    };

    try {
      const res = await api.post('/api/user-checklist-items', payload);
      const created = res.data?.data || res.data || payload;
      // Thêm vào danh sách hiển thị tạm thời
      setUserChecklists(prev => [created, ...prev]);
      closeCreateModal();
      Modal.success({ title: 'Đã thêm mục', content: 'Mục checklist của bạn đã được lưu.' });
    } catch (error) {
      console.error('❌ Create user checklist item failed:', error);
      console.error('Backend error payload:', error.response?.data);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Vui lòng kiểm tra lại thông tin nhập';
      Modal.error({ title: 'Không thể thêm mục', content: msg });
    }
  };

  return (
    <div className="min-h-screen bg-vietnam-cream font-sans transition-all duration-300">
      {/* HERO SECTION với Bộ Lọc */}
      <section 
        className="relative py-24 text-center overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lớp overlay màu xanh mờ */}
        <div className="absolute inset-0 bg-vietnam-green/70 backdrop-blur-[1px] transition-opacity duration-500"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white"> 
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-lg">
            Danh Mục Lễ Hội
          </h1>
          <p className="text-base md:text-lg text-green-100 drop-shadow-md mb-8">
            Nơi bạn có thể tìm, tạo và lưu các danh sách lễ vật hoặc hoạt động cần chuẩn bị cho từng lễ hội.
          </p>

          {/* Banner hướng dẫn tạo checklist */}
          <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
              <div className="flex items-start gap-3">
                <InfoCircleOutlined className="text-2xl text-vietnam-gold mt-1" />
                <div>
                  <h3 className="text-xl font-semibold">Tạo checklist cá nhân</h3>
                  <p className="text-green-100 text-sm">Checklist sẽ được lưu vào hệ thống và chỉ hiển thị cho tài khoản của bạn.</p>
                </div>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 bg-vietnam-gold text-stone-900 px-5 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                <PlusCircleOutlined /> Thêm checklist
              </button>
            </div>
          </div>

          {/* Bộ Lọc */}
          <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/30 hover:shadow-[0_20px_50px_rgba(218,165,32,0.3)] transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lọc theo Tên Nghi Lễ */}
              <div>
                <label className="block text-white text-sm font-bold mb-3 text-left tracking-wide">
                  Tên Nghi Lễ
                </label>
                <Select
                  allowClear
                  placeholder="Chọn nghi lễ"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.ritualName || undefined}
                  onChange={(value) => handleFilterChange('ritualName', value)}
                  className="custom-select-filter"
                >
                  {filterOptions.ritualNames.map(name => (
                    <Option key={name} value={name}>{name}</Option>
                  ))}
                </Select>
              </div>

              {/* Lọc theo Tên Vật Phẩm */}
              <div>
                <label className="block text-white text-sm font-bold mb-3 text-left tracking-wide">
                  Tên Vật Phẩm
                </label>
                <Select
                  allowClear
                  placeholder="Chọn vật phẩm"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.itemName || undefined}
                  onChange={(value) => handleFilterChange('itemName', value)}
                  className="custom-select-filter"
                >
                  {filterOptions.itemNames.map(name => (
                    <Option key={name} value={name}>{name}</Option>
                  ))}
                </Select>
              </div>

              {/* Lọc theo Đơn Vị */}
              <div>
                <label className="block text-white text-sm font-bold mb-3 text-left tracking-wide">
                  Đơn Vị
                </label>
                <Select
                  allowClear
                  placeholder="Chọn đơn vị"
                  style={{ width: '100%' }}
                  size="large"
                  value={filters.unit || undefined}
                  onChange={(value) => handleFilterChange('unit', value)}
                  className="custom-select-filter"
                >
                  {filterOptions.units.map(unit => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKLIST CỦA TÔI */}
      <section className="py-12 max-w-6xl mx-auto px-6">

        {loading || userListLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : userChecklists.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<div>
              <h3 className="text-2xl font-bold text-vietnam-green mb-2">Chưa có checklist nào</h3>
              <p className="text-gray-600">Nhấn "Thêm checklist" để bắt đầu.</p>
            </div>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"> 
            {userChecklists.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden shadow-2xl border border-amber-300/60 transition-transform duration-300 hover:scale-[1.03] hover:shadow-3xl"
                style={{
                  backgroundImage: "url('/checklist-background.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px]"></div>

                {/* Nội dung checklist */}
                <div className="relative z-10 p-4 md:p-5 text-stone-800 text-sm flex flex-col h-full">
                  {/* Tiêu đề màu vàng */}
                  <h3 className="text-xl font-bold text-amber-600 drop-shadow mb-4 border-b pb-2 border-amber-300/60">
                    Mục checklist #{item.id || item.itemId}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-stone-700">
                    <p><span className="font-semibold">UserChecklist ID:</span> {item.userChecklistId}</p>
                    <p><span className="font-semibold">Item ID:</span> {item.itemId}</p>
                    <p><span className="font-semibold">Số lượng:</span> {item.quantity}</p>
                    {item.note && <p><span className="font-semibold">Ghi chú:</span> {item.note}</p>}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-amber-300/60 text-right mt-auto">
                    <span className="text-xs text-stone-500">Mục checklist của tôi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {userListPage.total > userListPage.size && (
            <div className="flex justify-center mt-10">
              <Pagination
                current={userListPage.page + 1}
                pageSize={userListPage.size}
                total={userListPage.total}
                onChange={(page, size) => setUserListPage({ page: page - 1, size, total: userListPage.total })}
                showTotal={(total) => `Tổng ${total} checklist`}
              />
            </div>
          )}
        </>
        )}
      </section>
      {/* Modal tạo checklist mới */}
      <Modal
        centered
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreate}
        okText="Tạo checklist"
        cancelText="Hủy"
        className="nnv-create-checklist-modal"
        title={<div className="flex items-center gap-2 text-vietnam-green"><PlusCircleOutlined /> <span className="font-semibold">Thêm mục checklist mới</span></div>}
        okButtonProps={{ style: { background: '#d4af37', borderColor: '#d4af37', color: '#1f2937', fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderColor: '#065f46', color: '#065f46' } }}
        styles={{ body: { background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))' } }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-vietnam-green">UserChecklist ID</label>
            <Input
              value={formData.userChecklistId}
              onChange={(e) => setFormData(prev => ({ ...prev, userChecklistId: e.target.value.replace(/[^0-9]/g, '') }))}
              placeholder="Nhập ID danh sách của bạn"
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-vietnam-green">Item ID</label>
              <Input
                value={formData.itemId}
                onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value.replace(/[^0-9]/g, '') }))}
                placeholder="Nhập ID vật phẩm"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-vietnam-green">Số lượng</label>
              <Input
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value.replace(/[^0-9]/g, '') || 1 }))}
                placeholder="1"
                inputMode="numeric"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-vietnam-green">Ghi chú</label>
            <Input.TextArea
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Ghi chú cho mục checklist (tuỳ chọn)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checklist;