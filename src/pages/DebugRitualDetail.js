import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ritualService } from '../services/ritualService';
import { checklistService } from '../services/checklistService';

/**
 * DebugRitualDetail - Component để debug API calls cho RitualDetail
 * Giúp kiểm tra xem API có trả về data đúng không
 */
const DebugRitualDetail = () => {
  const { id } = useParams();
  const [ritualData, setRitualData] = useState(null);
  const [checklistData, setChecklistData] = useState(null);
  const [ritualError, setRitualError] = useState(null);
  const [checklistError, setChecklistError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPIs = async () => {
    setLoading(true);
    setRitualData(null);
    setChecklistData(null);
    setRitualError(null);
    setChecklistError(null);

    // Test Ritual API
    try {
      console.log('🔍 Testing Ritual API for ID:', id);
      const res = await ritualService.getRitualById(id);
      const data = res?.data || res;
      console.log('✅ Ritual API Response:', data);
      setRitualData(data);
    } catch (error) {
      console.error('❌ Ritual API Error:', error);
      setRitualError({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    }

    // Test Checklist API
    try {
      console.log('🔍 Testing Checklist API for Ritual ID:', id);
      const data = await checklistService.getByRitual(id);
      console.log('✅ Checklist API Response:', data);
      setChecklistData(data);
    } catch (error) {
      console.error('❌ Checklist API Error:', error);
      setChecklistError({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      testAPIs();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Ritual Detail API</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Ritual ID</h2>
          <div className="bg-blue-50 p-4 rounded">
            <span className="font-mono text-lg">{id || 'No ID provided'}</span>
          </div>
          <button
            onClick={testAPIs}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? '🔄 Testing...' : '🧪 Re-test APIs'}
          </button>
        </div>

        {/* Ritual API Result */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            1️⃣ Ritual API: GET /api/rituals/{id}
          </h2>
          
          {ritualError ? (
            <div className="border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="text-red-600">{ritualError.status} {ritualError.statusText}</span>
                </div>
                <div>
                  <span className="font-semibold">Message:</span> {ritualError.message}
                </div>
                <div>
                  <span className="font-semibold">URL:</span>{' '}
                  <span className="font-mono text-xs">{ritualError.url}</span>
                </div>
                {ritualError.data && (
                  <div>
                    <span className="font-semibold">Response Data:</span>
                    <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(ritualError.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : ritualData ? (
            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Success</h3>
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-semibold">Ritual Name:</span>{' '}
                  <span className="text-green-700">{ritualData.ritualName}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Region:</span> {ritualData.regionName || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Date Lunar:</span> {ritualData.dateLunar || 'N/A'}
                </div>
              </div>
              <details>
                <summary className="cursor-pointer font-semibold text-sm mb-2">
                  View Full Response
                </summary>
                <pre className="bg-white p-3 rounded overflow-x-auto text-xs border">
                  {JSON.stringify(ritualData, null, 2)}
                </pre>
              </details>
            </div>
          ) : loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-gray-500">No data yet. Click "Re-test APIs" button.</div>
          )}
        </div>

        {/* Checklist API Result */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            2️⃣ Checklist API: GET /api/checklists/ritual/{id}
          </h2>
          
          {checklistError ? (
            <div className="border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="text-red-600">{checklistError.status} {checklistError.statusText}</span>
                </div>
                <div>
                  <span className="font-semibold">Message:</span> {checklistError.message}
                </div>
                <div>
                  <span className="font-semibold">URL:</span>{' '}
                  <span className="font-mono text-xs">{checklistError.url}</span>
                </div>
                {checklistError.data && (
                  <div>
                    <span className="font-semibold">Response Data:</span>
                    <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(checklistError.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : checklistData ? (
            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Success ({Array.isArray(checklistData) ? checklistData.length : 0} items)
              </h3>
              {Array.isArray(checklistData) && checklistData.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {checklistData.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm bg-white p-2 rounded">
                      <span className="font-semibold">{item.itemName}</span>
                      {' - Qty: '}{item.quantity || 1}
                      {item.checkNote && ` (${item.checkNote})`}
                    </div>
                  ))}
                  {checklistData.length > 3 && (
                    <div className="text-xs text-gray-600">
                      ... and {checklistData.length - 3} more items
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-yellow-700 mb-4">
                  ⚠️ No checklist items found for this ritual
                </div>
              )}
              <details>
                <summary className="cursor-pointer font-semibold text-sm mb-2">
                  View Full Response
                </summary>
                <pre className="bg-white p-3 rounded overflow-x-auto text-xs border">
                  {JSON.stringify(checklistData, null, 2)}
                </pre>
              </details>
            </div>
          ) : loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-gray-500">No data yet. Click "Re-test APIs" button.</div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
          <h3 className="font-semibold mb-2">🔍 Hướng dẫn debug:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Kiểm tra "Current Ritual ID" có đúng không</li>
            <li>Nhấn "Re-test APIs" để test lại cả 2 endpoints</li>
            <li>Nếu Ritual API lỗi:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>404: Ritual ID không tồn tại trong database</li>
                <li>500: Backend server error</li>
                <li>Network Error: Backend không chạy hoặc CORS issue</li>
              </ul>
            </li>
            <li>Nếu Checklist API lỗi:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>404: Endpoint không tồn tại</li>
                <li>500: Backend lỗi khi query checklist</li>
                <li>Trả về []: Ritual chưa có checklist items</li>
              </ul>
            </li>
            <li>Nếu cả 2 đều success → Vấn đề ở RitualDetail component rendering</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugRitualDetail;
