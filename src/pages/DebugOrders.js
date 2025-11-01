import React, { useState } from 'react';
import api from '../services/api';

const DebugOrders = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      console.log(`🔍 Testing ${method} ${endpoint}`);
      console.log('Token:', token ? 'EXISTS' : 'MISSING');
      console.log('Role:', role);

      const response = await api({ method, url: endpoint });
      
      setResults(prev => [...prev, {
        endpoint,
        status: 'SUCCESS',
        statusCode: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      }]);

      console.log(`✅ ${endpoint} SUCCESS:`, response.data);
    } catch (error) {
      setResults(prev => [...prev, {
        endpoint,
        status: 'ERROR',
        statusCode: error.response?.status,
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      }]);

      console.error(`❌ ${endpoint} ERROR:`, error);
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    '/api/customer/orders',
    '/api/orders',
    '/api/customer/orders/list',
    '/api/orders/customer',
    '/api/orders/my-orders',
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          🔧 Debug Orders API
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint}
                onClick={() => testEndpoint(endpoint)}
                disabled={loading}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-50"
              >
                <code className="text-sm">{endpoint}</code>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <button
              onClick={() => setResults([])}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear
            </button>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No results yet. Click an endpoint to test.
              </p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'SUCCESS'
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <code className="text-sm font-mono">{result.endpoint}</code>
                      <span className={`ml-3 px-2 py-1 rounded text-xs ${
                        result.status === 'SUCCESS'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {result.statusCode} {result.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  <div className="bg-white rounded p-3 mt-2 overflow-auto max-h-64">
                    <pre className="text-xs">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            📝 Debug Info
          </h3>
          <div className="text-sm space-y-1">
            <p><strong>Token:</strong> {localStorage.getItem('token') ? '✅ EXISTS' : '❌ MISSING'}</p>
            <p><strong>Role:</strong> {localStorage.getItem('role') || 'NOT SET'}</p>
            <p><strong>User:</strong> {localStorage.getItem('user') || 'NOT SET'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugOrders;
