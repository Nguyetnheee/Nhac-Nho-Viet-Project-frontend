import React from 'react';
import Modal from './Modal';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "warning", // 'success', 'error', 'warning', 'info'
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
      closeOnOverlayClick={!isLoading}
    >
      <div className="space-y-4">
        <p className="text-gray-700 text-center">
          {message}
        </p>
        
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${type === 'error' ? 'bg-vietnam-red hover:opacity-80' : 
                type === 'success' ? 'bg-green-500 hover:bg-green-600' :
                type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
