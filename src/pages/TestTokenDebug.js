import React, { useEffect, useState } from 'react';

/**
 * TestTokenDebug - Component để test và debug JWT token
 * Giúp kiểm tra cấu trúc token, quyền, và thử các endpoint khác nhau
 */
const TestTokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      try {
        // Decode JWT token (phần payload)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setTokenInfo({
            raw: token,
            payload: payload,
            role: role,
            exp: new Date(payload.exp * 1000).toLocaleString('vi-VN'),
            isExpired: payload.exp * 1000 < Date.now()
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const testEndpoints = async () => {
    const token = localStorage.getItem('token');
    const baseURL = process.env.REACT_APP_API_URL || 'https://isp-7jpp.onrender.com';
    
    const endpoints = [
      '/api/customer/orders',
      '/api/orders',
      '/api/customer/orders/17619116699510',
      '/api/orders/17619116699510',
      '/api/customer/profile',
      '/api/auth/me'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          data: response.ok ? await response.json() : await response.text()
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          statusText: error.message,
          success: false,
          data: null
        });
      }
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔐 JWT Token Debug Tool</h1>

        {/* Token Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          {tokenInfo ? (
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Role (localStorage):</span>{' '}
                <span className="bg-blue-100 px-2 py-1 rounded">{tokenInfo.role}</span>
              </div>
              <div>
                <span className="font-semibold">Expiration:</span>{' '}
                <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                  {tokenInfo.exp} {tokenInfo.isExpired ? '(EXPIRED!)' : '(Valid)'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Subject (sub):</span>{' '}
                <span className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                  {tokenInfo.payload.sub}
                </span>
              </div>
              <div>
                <span className="font-semibold">Authorities:</span>{' '}
                <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                  {JSON.stringify(tokenInfo.payload.authorities || tokenInfo.payload.roles || 'Not found', null, 2)}
                </pre>
              </div>
              <div>
                <span className="font-semibold">Full Payload:</span>
                <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
                  {JSON.stringify(tokenInfo.payload, null, 2)}
                </pre>
              </div>
              <div>
                <span className="font-semibold">Raw Token:</span>
                <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs break-all">
                  {tokenInfo.raw}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No token found in localStorage</p>
          )}
        </div>

        {/* Test Endpoints */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test API Endpoints</h2>
          <button
            onClick={testEndpoints}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mb-6"
          >
            🧪 Run Tests
          </button>

          {testResults.length > 0 && (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded ${
                    result.success
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold">
                      {result.endpoint}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        result.success
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {result.status} {result.statusText}
                    </span>
                  </div>
                  <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                    {typeof result.data === 'string'
                      ? result.data
                      : JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mt-6">
          <h3 className="font-semibold mb-2">🔍 Hướng dẫn debug:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Kiểm tra <strong>Expiration</strong> - Token có hết hạn không?</li>
            <li>Kiểm tra <strong>Authorities/Roles</strong> - Token có chứa "ROLE_CUSTOMER" hoặc "CUSTOMER" không?</li>
            <li>Nhấn <strong>Run Tests</strong> để test các endpoint</li>
            <li>Endpoint nào trả về 200 OK là endpoint đang hoạt động</li>
            <li>Nếu tất cả đều 403 → Vấn đề ở backend JWT configuration</li>
            <li>Nếu một số 200, một số 403 → Vấn đề ở backend Spring Security permissions</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestTokenDebug;
