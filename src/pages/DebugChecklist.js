import React, { useEffect, useState } from 'react';
import { checklistService } from '../services/checklistService';
import { groupChecklistsByRitualName } from '../utils/dataUtils';

/**
 * DebugChecklist - Component để debug API calls cho Checklist page
 * Giúp kiểm tra xem API có trả về data đúng không và grouping có hoạt động không
 */
const DebugChecklist = () => {
  const [rawData, setRawData] = useState(null);
  const [groupedData, setGroupedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setRawData(null);
    setGroupedData(null);
    setError(null);

    try {
      console.log('🔍 Testing Checklist API: GET /api/checklists');
      const data = await checklistService.getChecklists();
      console.log('✅ API Response:', data);
      setRawData(data);

      // Test grouping
      console.log('🔄 Testing groupChecklistsByRitualName...');
      const grouped = groupChecklistsByRitualName(data);
      console.log('✅ Grouped Data:', grouped);
      setGroupedData(grouped);

    } catch (err) {
      console.error('❌ API Error:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug Checklist API</h1>

        <button
          onClick={testAPI}
          className="mb-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? '🔄 Testing...' : '🧪 Re-test API'}
        </button>

        {/* Raw API Response */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            1️⃣ Raw API Response: GET /api/checklists
          </h2>
          
          {error ? (
            <div className="border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="text-red-600">{error.status} {error.statusText}</span>
                </div>
                <div>
                  <span className="font-semibold">Message:</span> {error.message}
                </div>
                <div>
                  <span className="font-semibold">URL:</span>{' '}
                  <span className="font-mono text-xs">{error.url}</span>
                </div>
                {error.data && (
                  <div>
                    <span className="font-semibold">Response Data:</span>
                    <pre className="bg-white p-2 rounded mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : rawData ? (
            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Success ({Array.isArray(rawData) ? rawData.length : 0} items)
              </h3>
              
              {Array.isArray(rawData) && rawData.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold">Total checklist items:</span>{' '}
                    <span className="text-green-700">{rawData.length}</span>
                  </div>
                  
                  {/* Sample items */}
                  <div className="text-sm font-semibold mt-3 mb-2">Sample items (first 5):</div>
                  {rawData.slice(0, 5).map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded text-xs border">
                      <div><strong>Item Name:</strong> {item.itemName || 'N/A'}</div>
                      <div><strong>Ritual ID:</strong> {item.ritualId || 'N/A'}</div>
                      <div><strong>Ritual Name:</strong> {item.ritualName || 'N/A'}</div>
                      <div><strong>Quantity:</strong> {item.quantity || 'N/A'}</div>
                      <div><strong>Note:</strong> {item.checkNote || 'N/A'}</div>
                    </div>
                  ))}
                  
                  {rawData.length > 5 && (
                    <div className="text-xs text-gray-600">
                      ... and {rawData.length - 5} more items
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-yellow-700 mb-4">
                  ⚠️ API returned empty array or non-array data
                </div>
              )}
              
              <details>
                <summary className="cursor-pointer font-semibold text-sm mb-2">
                  View Full Response
                </summary>
                <pre className="bg-white p-3 rounded overflow-x-auto text-xs border max-h-96">
                  {JSON.stringify(rawData, null, 2)}
                </pre>
              </details>
            </div>
          ) : loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-gray-500">No data yet. Click "Re-test API" button.</div>
          )}
        </div>

        {/* Grouped Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            2️⃣ Grouped Data (by Ritual)
          </h2>
          
          {groupedData ? (
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                ✅ Grouped ({groupedData.length} rituals)
              </h3>
              
              {groupedData.length > 0 ? (
                <div className="space-y-3">
                  {groupedData.map((ritual, index) => (
                    <div key={index} className="bg-white p-4 rounded border">
                      <div className="font-semibold text-lg mb-2">
                        {ritual.ritualName || 'Unknown Ritual'}
                        <span className="text-sm text-gray-500 ml-2">
                          (ID: {ritual.ritualId})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        📋 {ritual.items?.length || 0} checklist items
                      </div>
                      {ritual.items && ritual.items.length > 0 && (
                        <details>
                          <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                            View items
                          </summary>
                          <ul className="mt-2 ml-4 list-disc text-xs space-y-1">
                            {ritual.items.map((item, idx) => (
                              <li key={idx}>
                                {item.itemName} (x{item.quantity || 1})
                                {item.checkNote && ` - ${item.checkNote}`}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-yellow-700">
                  ⚠️ No rituals after grouping. Check if items have ritualId and ritualName.
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-sm text-gray-500">
              Cannot group data due to API error
            </div>
          ) : loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-gray-500">No data yet.</div>
          )}
        </div>

        {/* Data Structure Check */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
          <h3 className="font-semibold mb-2">🔍 Expected Data Structure:</h3>
          <div className="text-sm space-y-2">
            <div><strong>API Response should be:</strong> Array of objects</div>
            <div><strong>Each item should have:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code className="bg-white px-1 rounded">checklistId</code> - Unique ID of checklist item</li>
              <li><code className="bg-white px-1 rounded">itemId</code> - ID of the item</li>
              <li><code className="bg-white px-1 rounded">itemName</code> - Name of the item (required)</li>
              <li><code className="bg-white px-1 rounded">ritualId</code> - ID of the ritual (required for grouping)</li>
              <li><code className="bg-white px-1 rounded">ritualName</code> - Name of the ritual (required for grouping)</li>
              <li><code className="bg-white px-1 rounded">quantity</code> - Quantity of the item</li>
              <li><code className="bg-white px-1 rounded">checkNote</code> - Notes for the item</li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-yellow-300">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>If API returns 404: Endpoint doesn't exist</li>
                <li>If API returns []: No checklist items in database</li>
                <li>If grouping returns []: Items missing ritualId or ritualName</li>
                <li>If items show but page doesn't: Check Checklist.js rendering logic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugChecklist;
