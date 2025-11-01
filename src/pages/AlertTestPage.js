import React, { useState } from 'react';
import { Card, Button, Space } from 'antd';
import CustomAlert from '../components/CustomAlert';

const AlertTestPage = () => {
  const [showAlerts, setShowAlerts] = useState({
    success: true,
    error: true,
    warning: true,
    info: true
  });

  const toggleAlert = (type) => {
    setShowAlerts(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const resetAlerts = () => {
    setShowAlerts({
      success: true,
      error: true,
      warning: true,
      info: true
    });
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Test Alerts - Solid Colors
      </h1>

      <Card style={{ marginBottom: '30px' }}>
        <Space wrap>
          <Button 
            onClick={() => toggleAlert('success')}
            style={{ backgroundColor: showAlerts.success ? '#52c41a' : '#ccc', color: 'white' }}
          >
            {showAlerts.success ? 'Hide' : 'Show'} Success
          </Button>
          <Button 
            onClick={() => toggleAlert('error')}
            danger
            style={{ opacity: showAlerts.error ? 1 : 0.5 }}
          >
            {showAlerts.error ? 'Hide' : 'Show'} Error
          </Button>
          <Button 
            onClick={() => toggleAlert('warning')}
            style={{ backgroundColor: showAlerts.warning ? '#faad14' : '#ccc', color: 'white' }}
          >
            {showAlerts.warning ? 'Hide' : 'Show'} Warning
          </Button>
          <Button 
            onClick={() => toggleAlert('info')}
            style={{ backgroundColor: showAlerts.info ? '#1890ff' : '#ccc', color: 'white' }}
          >
            {showAlerts.info ? 'Hide' : 'Show'} Info
          </Button>
          <Button onClick={resetAlerts} type="default">
            Show All
          </Button>
        </Space>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {showAlerts.success && (
          <CustomAlert
            type="success"
            message="Success Tips"
            description="Detailed description and advice about successful copywriting."
            onClose={() => toggleAlert('success')}
          />
        )}

        {showAlerts.info && (
          <CustomAlert
            type="info"
            message="Informational Notes"
            description="Additional description and information about copywriting."
            onClose={() => toggleAlert('info')}
          />
        )}

        {showAlerts.warning && (
          <CustomAlert
            type="warning"
            message="Warning"
            description="This is a warning notice about copywriting."
            onClose={() => toggleAlert('warning')}
          />
        )}

        {showAlerts.error && (
          <CustomAlert
            type="error"
            message="Error"
            description="This is an error message about copywriting."
            onClose={() => toggleAlert('error')}
          />
        )}
      </div>

      <Card style={{ marginTop: '40px', backgroundColor: '#f5f5f5' }}>
        <h3>Color Reference:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Background</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Border</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Text Color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>Success</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#f6ffed (bg-green-50)</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#b7eb8f</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', color: '#135200' }}>text-green-800</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>Error</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#fff2f0 (bg-red-50)</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#ffadd2</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', color: '#a8071a' }}>text-red-800</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>Warning</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#fffbe6 (bg-yellow-50)</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#ffe58f</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', color: '#ad4e00' }}>text-yellow-800</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>Info</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#e6f7ff (bg-blue-50)</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>#91d5ff</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', color: '#003a8c' }}>text-blue-800</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AlertTestPage;