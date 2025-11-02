import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';

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
          IconComponent: CheckCircleOutlined,
          iconBgColor: 'bg-green-100'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          descColor: 'text-red-700',
          iconColor: 'text-red-500',
          IconComponent: CloseCircleOutlined,
          iconBgColor: 'bg-red-100'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          IconComponent: WarningOutlined,
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
          IconComponent: InfoCircleOutlined,
          iconBgColor: 'bg-blue-100'
        };
    }
  };

  const config = getAlertConfig();
  const IconComponent = config.IconComponent;

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
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${config.iconBgColor}`}>
            <IconComponent className={`text-lg ${config.iconColor}`} />
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
            <CloseOutlined className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomAlert;