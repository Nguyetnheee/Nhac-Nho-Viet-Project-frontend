import React, { useEffect, useState } from 'react';

const Toast = ({ 
  message, 
  type = 'info',
  duration = 4000,
  onClose,
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [handleClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-800',
          border: 'border-green-600',
          icon: '✅',
          text: 'text-white',
        };
      case 'error':
        return {
          bg: 'bg-red-800',
          border: 'border-red-600',
          icon: '❌',
          text: 'text-white',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-800',
          border: 'border-yellow-600',
          icon: '⚠️',
          text: 'text-white',
        };
      case 'info':
        return {
          bg: 'bg-blue-800',
          border: 'border-blue-600',
          icon: 'ℹ️',
          text: 'text-white',
        };
      default:
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-600',
          icon: '💬',
          text: 'text-white',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div 
      className={`
        // ⚠️ Đã xóa 'fixed z-50' và 'top-24 right-4'. 
        // Vị trí được kiểm soát bởi ToastContainer.
        max-w-md w-full mx-auto
        transition-all duration-300 ease-in-out
        ${isLeaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      <div 
        className={`
          ${typeStyles.bg} ${typeStyles.border} border rounded-lg shadow-md
          flex items-center p-4 space-x-4
        `}
      >
        <span className="text-xl">{typeStyles.icon}</span>
        <p className={`flex-1 text-sm font-medium ${typeStyles.text}`}>{message}</p>
        <button
          onClick={handleClose}
          className={`text-lg ${typeStyles.text} hover:opacity-70 transition-opacity`}
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Toast;