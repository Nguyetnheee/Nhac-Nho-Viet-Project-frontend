import React, { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'default', // 'success', 'error', 'warning', 'info', 'default'
  showCloseButton = true,
  closeOnOverlayClick = true,
  size = 'md' // 'sm', 'md', 'lg', 'xl'
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800'
        };
      default:
        return {
          icon: '💬',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-800'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const typeStyles = getTypeStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 pt-20">
        <div 
          className={`
            relative w-full ${sizeStyles} transform overflow-hidden rounded-2xl 
            bg-white shadow-2xl transition-all duration-300 ease-out
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            border-2 ${typeStyles.borderColor}
          `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${typeStyles.iconBg}`}>
                  <span className={`text-xl ${typeStyles.iconColor}`}>
                    {typeStyles.icon}
                  </span>
                </div>
                <h3 className={`text-xl font-semibold ${typeStyles.titleColor}`}>
                  {title}
                </h3>
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
