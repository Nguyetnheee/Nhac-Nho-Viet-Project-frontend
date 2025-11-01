import React from 'react';

const CustomAlert = ({ type = 'info', message, description, onClose, className = '' }) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          descColor: 'text-green-700',
          iconColor: 'text-green-500',
          icon: '✓',
          iconBgColor: 'bg-green-100'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          descColor: 'text-red-700',
          iconColor: 'text-red-500',
          icon: '✕',
          iconBgColor: 'bg-red-100'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          icon: '!',
          iconBgColor: 'bg-yellow-100'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          descColor: 'text-blue-700',
          iconColor: 'text-blue-500',
          icon: 'i',
          iconBgColor: 'bg-blue-100'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div 
      className={`
        ${config.bgColor} 
        border ${config.borderColor}
        p-4 rounded-lg shadow-sm
        transition-all duration-200
        ${className}
      `}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-center h-6 w-6 rounded-full ${config.iconBgColor}`}>
            <span className={`text-sm font-bold ${config.iconColor}`}>
              {config.icon}
            </span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {message}
          </p>
          {description && (
            <p className={`mt-2 text-sm ${config.descColor}`}>
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`ml-3 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none`}
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomAlert;