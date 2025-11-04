import React, { useState } from 'react';
import api from '../services/api';

/**
 * Component debug để test API voucher
 * Thêm vào Cart.js tạm thời để debug
 */
const VoucherDebugger = ({ currentTotal }) => {
  const [debugCode, setDebugCode] = useState('GIAM50K');
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApplyVoucher = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      console.log('🧪 Testing voucher apply with:', {
        voucherCode: debugCode,
        orderAmount: currentTotal
      });

      const response = await api.post('/api/vouchers/apply', {
        voucherCode: debugCode,
        orderAmount: currentTotal
      });

      setDebugResult({
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      console.log('✅ Success:', response);

    } catch (error) {
      setDebugResult({
        success: false,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
        fullError: {
          message: error.message,
          name: error.name,
          code: error.code,
          response: {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
          }
        }
      });

      console.error('❌ Error:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const testGetValidVouchers = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      const response = await api.get('/api/vouchers/valid');
      
      setDebugResult({
        success: true,
        endpoint: '/api/vouchers/valid',
        status: response.status,
        data: response.data
      });

      console.log('✅ Valid vouchers:', response.data);

    } catch (error) {
      setDebugResult({
        success: false,
        endpoint: '/api/vouchers/valid',
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 max-w-md">
      <h3 className="text-lg font-bold mb-3">🔧 Voucher API Debugger</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs mb-1">Voucher Code:</label>
          <input
            type="text"
            value={debugCode}
            onChange={(e) => setDebugCode(e.target.value.toUpperCase())}
            className="w-full px-2 py-1 text-black rounded text-sm"
            placeholder="GIAM50K"
          />
        </div>

        <div className="text-xs">
          <strong>Order Amount:</strong> {currentTotal?.toLocaleString('vi-VN') || 0} VNĐ
        </div>

        <div className="flex gap-2">
          <button
            onClick={testApplyVoucher}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm disabled:bg-gray-600"
          >
            {loading ? 'Testing...' : 'Test Apply'}
          </button>

          <button
            onClick={testGetValidVouchers}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm disabled:bg-gray-600"
          >
            {loading ? 'Loading...' : 'Get Valid'}
          </button>
        </div>

        {debugResult && (
          <div className="mt-3 p-3 bg-gray-800 rounded text-xs overflow-auto max-h-64">
            <div className="mb-2">
              <span className={`font-bold ${debugResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {debugResult.success ? '✅ SUCCESS' : '❌ ERROR'}
              </span>
              {debugResult.status && (
                <span className="ml-2 text-yellow-400">
                  Status: {debugResult.status}
                </span>
              )}
            </div>

            {debugResult.endpoint && (
              <div className="mb-2 text-blue-400">
                Endpoint: {debugResult.endpoint}
              </div>
            )}

            {debugResult.message && (
              <div className="mb-2 text-orange-400">
                Message: {debugResult.message}
              </div>
            )}

            <div className="mt-2">
              <div className="font-bold mb-1">Response Data:</div>
              <pre className="whitespace-pre-wrap break-words text-xs">
                {JSON.stringify(debugResult.data || {}, null, 2)}
              </pre>
            </div>

            {debugResult.fullError && (
              <div className="mt-2">
                <div className="font-bold mb-1 text-red-400">Full Error:</div>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(debugResult.fullError, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 mt-2">
          💡 Check console (F12) for detailed logs
        </div>
      </div>
    </div>
  );
};

export default VoucherDebugger;
