import React, { useEffect, useState } from 'react';

const Toast = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 4000,
  onClose,
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '✅',
          text: 'text-green-800',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '❌',
          text: 'text-red-800',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⚠️',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'ℹ️',
          text: 'text-blue-800',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: '💬',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-20 right-4'; // 80px để tránh navbar
      case 'top-left':
        return 'top-20 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-20 right-4';
    }
  };

  const typeStyles = getTypeStyles();
  const positionStyles = getPositionStyles();

  return (
    <div 
      className={`
        fixed z-40 max-w-sm w-full mx-4
        ${positionStyles}
        transform transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
      `}
    >
      <div 
        className={`
          ${typeStyles.bg} ${typeStyles.border} border rounded-xl shadow-lg
          backdrop-blur-sm bg-opacity-95
        `}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 p-1 rounded-full ${typeStyles.iconBg}`}>
              <span className="text-lg">{typeStyles.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${typeStyles.text}`}>
                {message}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${typeStyles.text} hover:opacity-70 transition-opacity`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
