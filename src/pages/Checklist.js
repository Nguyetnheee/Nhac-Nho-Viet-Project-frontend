import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { checklistService } from '../services/checklistService';
import { toast } from 'react-toastify';

const Checklist = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDate, setNewChecklistDate] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState(['']);
  const [newChecklistImage, setNewChecklistImage] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewChecklistImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tạm thời bỏ useEffect vì chưa có backend

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  const handleCreateChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim() || !newChecklistDate) {
      return;
    }
    const filteredItems = newChecklistItems.filter(item => item.trim() !== '');
    const newChecklist = {
      id: Date.now(), // Tạm thời dùng timestamp làm id
      title: newChecklistTitle,
      date: newChecklistDate,
      image: newChecklistImage,
      items: filteredItems.map(item => ({
        text: item,
        completed: false
      }))
    };
    setChecklists([...checklists, newChecklist]);
    setNewChecklistTitle('');
    setNewChecklistDate('');
    setNewChecklistItems(['']);
    setNewChecklistImage(null);
    setShowCreateModal(false);
    toast.success('Tạo checklist thành công!');
  };

  const handleDeleteChecklist = (checklistId) => {
    setChecklists(checklists.filter(checklist => checklist.id !== checklistId));
    setShowOptionsMenu(null);
    toast.success('Xóa checklist thành công!');
  };

  const handleEditChecklist = (checklist) => {
    setNewChecklistTitle(checklist.title);
    setNewChecklistDate(checklist.date);
    setNewChecklistItems(checklist.items.map(item => item.text));
    setChecklists(checklists.filter(c => c.id !== checklist.id));
    setShowCreateModal(true);
    setShowOptionsMenu(null);
  };

  const handleAddChecklistItem = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  const handleChecklistItemChange = (index, value) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem();
    }
  };

  const toggleItemCompletion = (checklistIndex, itemIndex) => {
    const updatedChecklists = [...checklists];
    updatedChecklists[checklistIndex].items[itemIndex].completed = 
      !updatedChecklists[checklistIndex].items[itemIndex].completed;
    setChecklists(updatedChecklists);
  };

  return (
    <div className="min-h-screen bg-vietnam-cream py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-vietnam-red mb-2">
              DANH SÁCH THÔNG TIN CHI TIẾT CHO CÁC DỊP LỄ
            </h1>
            <p className="text-gray-600">
              Tìm kiếm hoặc tạo checklist cho dịp lễ của riêng bạn
            </p>
          </div>

          {/* Search and Create Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tên lễ hội..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vietnam-red focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-vietnam-red text-white rounded-lg hover:opacity-90"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Tạo checklist
            </button>
          </div>

          {/* Checklists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checklists.map((checklist, checklistIndex) => (
              <div 
                key={checklist.id}
                className="bg-vietnam-gold/10 rounded-xl p-6 shadow-sm relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-vietnam-red">{checklist.title}</h3>
                  <span className="text-sm text-gray-600">{checklist.date}</span>
                </div>
                {checklist.image && (
                  <div className="mb-4">
                    <img 
                      src={checklist.image} 
                      alt={checklist.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  {checklist.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItemCompletion(checklistIndex, itemIndex)}
                        className="w-5 h-5 text-vietnam-red rounded border-gray-300 focus:ring-vietnam-red"
                      />
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowOptionsMenu(showOptionsMenu === checklist.id ? null : checklist.id)}
                      className="text-gray-600 hover:text-vietnam-red p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {showOptionsMenu === checklist.id && (
                      <div className="absolute bottom-full right-0 mb-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleEditChecklist(checklist)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-vietnam-red"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteChecklist(checklist.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Checklist Modal */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Tạo Checklist Mới"
          >
            <form onSubmit={handleCreateChecklist} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề checklist
                  </label>
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="Nhập tiêu đề checklist..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vietnam-red focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tháng
                  </label>
                  <input
                    type="date"
                    value={newChecklistDate}
                    onChange={(e) => setNewChecklistDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vietnam-red focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {newChecklistImage ? (
                        <div className="relative">
                          <img
                            src={newChecklistImage}
                            alt="Preview"
                            className="mx-auto h-32 w-auto object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setNewChecklistImage(null)}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-vietnam-red hover:text-vietnam-red/80">
                              <span>Tải ảnh lên</span>
                              <input
                                id="image-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Các mục cần làm
                </label>
                {newChecklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled
                      className="w-5 h-5 text-vietnam-red rounded border-gray-300"
                    />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      placeholder="Nhập nội dung..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vietnam-red focus:border-transparent outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="text-vietnam-red hover:text-vietnam-red/80 text-sm flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thêm mục mới
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-vietnam-red text-white rounded-lg hover:opacity-90"
                >
                  Tạo checklist
                </button>
              </div>
            </form>
          </Modal>


        </div>
      </div>
    </div>
  );
};

export default Checklist;