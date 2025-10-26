import React, { createContext, useContext, useState, useEffect } from 'react';
// ⚠️ Import service
import { checklistService } from '../services/checklistService'; 
import api from '../services/api'; // Giả sử đây là apiAuth

const ChecklistContext = createContext();

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
};

export const ChecklistProvider = ({ children }) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's checklists
  const fetchChecklists = async () => {
    try {
      setLoading(true);
      // Sử dụng checklistService đã được cung cấp
      const data = await checklistService.getChecklists();
      setChecklists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ Hàm mới: Lấy checklist theo Ritual ID (sử dụng service public)
  const getChecklistByRitualId = async (ritualId) => {
    try {
      setLoading(true);
      const data = await checklistService.getByRitual(ritualId);
      return data; // Trả về danh sách các mục của checklist
    } catch (err) {
      setError(err.message);
      console.error(`Lỗi khi lấy checklist theo ritualId ${ritualId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  };


  // Create new checklist
  const createChecklist = async (checklistData) => {
    try {
      // Chú ý: Cần đảm bảo api.post là apiAuth
      const response = await api.post('/api/checklists', checklistData);
      setChecklists([...checklists, response.data]);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Không thể tạo checklist'
      };
    }
  };

  // Update checklist
  const updateChecklist = async (id, checklistData) => {
    try {
      // Chú ý: Cần đảm bảo api.put là apiAuth
      const response = await api.put(`/api/checklists/${id}`, checklistData);
      setChecklists(checklists.map(list => 
        list.id === id ? response.data : list
      ));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Không thể cập nhật checklist'
      };
    }
  };

  // Delete checklist
  const deleteChecklist = async (id) => {
    try {
      // Chú ý: Cần đảm bảo api.delete là apiAuth
      await api.delete(`/api/checklists/${id}`);
      setChecklists(checklists.filter(list => list.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Không thể xóa checklist'
      };
    }
  };

  // Search checklists by ritual name
  const searchChecklists = async (searchTerm) => {
    try {
      setLoading(true);
      // Chú ý: Cần đảm bảo api.get là apiAuth
      const response = await api.get(`/api/checklists/search?q=${searchTerm}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    checklists,
    loading,
    error,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    searchChecklists,
    // ⚠️ Thêm hàm mới
    getChecklistByRitualId
  };

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
};