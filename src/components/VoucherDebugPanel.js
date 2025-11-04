// src/components/VoucherDebugPanel.js
import React, { useState } from 'react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

/**
 * Component Debug Panel để test voucher API
 * Hiển thị chi tiết request/response để debug lỗi 400
 */
const VoucherDebugPanel = () => {
  const { getTotalPrice } = useCart();
  const [testCode, setTestCode] = useState('');
  const [testAmount, setTestAmount] = useState('');
  const [requestLog, setRequestLog] = useState(null);
  const [responseLog, setResponseLog] = useState(null);
  const [errorLog, setErrorLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const testValidateVoucher = async () => {
    setLoading(true);
    setRequestLog(null);
    setResponseLog(null);
    setErrorLog(null);

    const requestData = {
      voucherCode: testCode.toUpperCase(),
      orderAmount: parseFloat(testAmount) || getTotalPrice()
    };

    setRequestLog({
      url: '/api/vouchers/apply',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')?.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      },
      body: requestData
    });

    try {
      const response = await api.post('/api/vouchers/apply', requestData);
      
      setResponseLog({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    } catch (error) {
      setErrorLog({
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Log to console for easy copy
      console.error('🔴 VOUCHER API ERROR:', {
        request: requestData,
        error: {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetValidVouchers = async () => {
    setLoading(true);
    setRequestLog(null);
    setResponseLog(null);
    setErrorLog(null);

    setRequestLog({
      url: '/api/vouchers/valid',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')?.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      }
    });

    try {
      const response = await api.get('/api/vouchers/valid');
      
      setResponseLog({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      console.log('✅ Valid vouchers:', response.data);
    } catch (error) {
      setErrorLog({
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-red-500 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto z-50">
      <h3 className="text-lg font-bold text-red-600 mb-4">🔧 Voucher Debug Panel</h3>
      
      {/* Test Controls */}
      <div className="space-y-3 mb-4 pb-4 border-b">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Voucher Code:
          </label>
          <input
            type="text"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value.toUpperCase())}
            placeholder="VD: GIAM50K"
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Order Amount (VNĐ):
          </label>
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            placeholder={`Current: ${getTotalPrice()}`}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={testValidateVoucher}
            disabled={loading || !testCode}
            className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Testing...' : 'Test Apply'}
          </button>
          
          <button
            onClick={testGetValidVouchers}
            disabled={loading}
            className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
          >
            Get Valid
          </button>
        </div>
      </div>

      {/* Request Log */}
      {requestLog && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-blue-600 mb-1">📤 REQUEST:</h4>
          <pre className="text-xs bg-blue-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(requestLog, null, 2)}
          </pre>
        </div>
      )}

      {/* Response Log */}
      {responseLog && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-green-600 mb-1">✅ RESPONSE:</h4>
          <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(responseLog, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Log */}
      {errorLog && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-red-600 mb-1">❌ ERROR:</h4>
          <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
            {JSON.stringify(errorLog, null, 2)}
          </pre>
          
          {errorLog.data && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs font-medium text-yellow-800">
                Backend Message:
              </p>
              <p className="text-xs text-yellow-700">
                {errorLog.data?.message || errorLog.data?.error || 'No message'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
        💡 Check browser console for detailed logs
      </div>
    </div>
  );
};

export default VoucherDebugPanel;
