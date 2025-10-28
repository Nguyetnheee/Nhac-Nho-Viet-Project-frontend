import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
// ⚠️ Import useAuth để lấy thông tin role
import { useAuth } from '../contexts/AuthContext'; 

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { user } = useAuth(); // ⚠️ Lấy thông tin user
  
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    
    // ⚠️ LOGIC CHẶN TOAST CỤ THỂ CHO STAFF
    const staffSpecificError = "Không thể tải giỏ hàng từ server. Vui lòng thử lại.";
    
    // Nếu là STAFF và thông báo là lỗi tải giỏ hàng -> KHÔNG tạo Toast
    if (user?.role === 'Staff' && message === staffSpecificError) {
        console.log("Toast: Đã chặn thông báo giỏ hàng cho Staff.");
        return; // Dừng hàm, không thêm toast
    }
    
    // Nếu không bị chặn, tiếp tục thêm toast
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, [user]); // Thêm user vào dependency array

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container luôn hiển thị để Staff vẫn nhận các thông báo khác */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="absolute"
            style={{
              top: `${80 + index * 80}px`, 
              right: '20px',
              zIndex: 1000 + index
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};