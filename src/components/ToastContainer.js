import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'antd';
import './ToastContainer.css';

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

  const addToast = useCallback((message, type, description = null, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      description,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after specified duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    // Add removing class for animation
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, removing: true } : toast
    ));
    
    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const showSuccess = useCallback((message, description, duration = 4000) => {
    addToast(message, 'success', description, duration);
  }, [addToast]);

  const showError = useCallback((message, description, duration = 6000) => {
    addToast(message, 'error', description, duration);
  }, [addToast]);

  const showWarning = useCallback((message, description, duration = 5000) => {
    addToast(message, 'warning', description, duration);
  }, [addToast]);

  const showInfo = useCallback((message, description, duration = 4000) => {
    addToast(message, 'info', description, duration);
  }, [addToast]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className={`toast-item ${toast.removing ? 'removing' : ''}`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <Alert
              message={toast.message}
              description={toast.description}
              type={toast.type}
              showIcon
              closable
              onClose={() => removeToast(toast.id)}
              style={{
                marginBottom: '12px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                borderRadius: '8px',
                border: '1px solid'
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};