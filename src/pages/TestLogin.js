// import React, { useState } from 'react';
// import api from '../services/api';

// const TestLogin = () => {
//   const [result, setResult] = useState('');
//   const [loading, setLoading] = useState(false);

//   const testLogin = async () => {
//     setLoading(true);
//     setResult('Đang test...');
    
//     try {
//       console.log('Testing login API...');
//       const response = await api.post('/api/customer/login', {
//         username: 'admin',
//         password: 'admin123'
//       });
      
//       console.log('Login response:', response.data);
//       setResult(`✅ Thành công: ${JSON.stringify(response.data, null, 2)}`);
//     } catch (error) {
//       console.error('Login error:', error);
//       setResult(`❌ Lỗi: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const testLoginWithAuth = async () => {
//     setLoading(true);
//     setResult('Đang test login với AuthContext...');
    
//     try {
//       // Import AuthContext dynamically to avoid circular dependency
//       const { useAuth } = await import('../contexts/AuthContext');
//       console.log('Testing login with AuthContext...');
      
//       setResult(`✅ AuthContext import thành công. Hãy sử dụng trang Login thực tế để test.`);
//     } catch (error) {
//       console.error('AuthContext test error:', error);
//       setResult(`❌ Lỗi AuthContext: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const testConnection = async () => {
//     setLoading(true);
//     setResult('Đang test kết nối...');
    
//     try {
//       console.log('Testing connection...');
//   const response = await api.get('/api/rituals');
      
//       console.log('Connection response:', response.data);
//       setResult(`✅ Kết nối thành công: ${response.data.length} lễ hội`);
//     } catch (error) {
//       console.error('Connection error:', error);
//       setResult(`❌ Lỗi kết nối: ${error.message}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-vietnam-cream p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-vietnam-red mb-8">Test Login & API</h1>
        
//         <div className="space-y-4 mb-8">
//           <button
//             onClick={testConnection}
//             disabled={loading}
//             className="btn-primary mr-4"
//           >
//             {loading ? 'Đang test...' : 'Test Kết nối API'}
//           </button>
          
//           <button
//             onClick={testLogin}
//             disabled={loading}
//             className="btn-secondary mr-4"
//           >
//             {loading ? 'Đang test...' : 'Test Login API'}
//           </button>

//           <button
//             onClick={testLoginWithAuth}
//             disabled={loading}
//             className="btn-secondary"
//           >
//             {loading ? 'Đang test...' : 'Test AuthContext'}
//           </button>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <h2 className="text-xl font-bold text-vietnam-red mb-4">Kết quả:</h2>
//           <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
//             {result || 'Chưa có kết quả...'}
//           </pre>
//         </div>

//         <div className="mt-8 bg-blue-50 p-6 rounded-lg">
//           <h3 className="text-lg font-bold text-blue-800 mb-2">Thông tin đăng nhập test:</h3>
//           <p><strong>Admin:</strong> admin@nhacnho.vn / admin123</p>
//           <p><strong>User:</strong> user@nhacnho.vn / user123</p>
//           <p><strong>Shipper:</strong> shipper@nhacnho.vn / shipper123</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestLogin;
