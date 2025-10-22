import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
      const response = await api.get('/api/checklists');
      setChecklists(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new checklist
  const createChecklist = async (checklistData) => {
    try {
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
    searchChecklists
  };

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
};