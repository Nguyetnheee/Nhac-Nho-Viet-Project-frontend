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
          bg: 'bg-green-100',
          border: 'border-green-400',
          icon: '✅',
          text: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          icon: '❌',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          icon: '⚠️',
          text: 'text-yellow-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-400',
          icon: 'ℹ️',
          text: 'text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-400',
          icon: '💬',
          text: 'text-gray-800',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div 
      className={`
        fixed z-50 max-w-md w-full mx-auto
        top-24 right-4
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
