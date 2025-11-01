import React, { useState } from 'react';

const CSSVerificationPage = () => {
  const [alerts] = useState([
    {
      type: 'success',
      message: 'Success Tips',
      description: 'Detailed description and advice about successful copywriting.'
    },
    {
      type: 'info',
      message: 'Informational Notes',
      description: 'Additional description and information about copywriting.'
    },
    {
      type: 'warning',
      message: 'Warning',
      description: 'This is a warning notice about copywriting.'
    },
    {
      type: 'error',
      message: 'Error',
      description: 'This is an error message about copywriting.'
    }
  ]);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
        CSS Verification - Alert Styles
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        Verify that all alert styles from index.css and ToastContainer.css are being applied correctly
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            <div style={{ display: 'flex' }}>
              <div className="alert-icon-wrapper" style={{ marginRight: '12px' }}>
                {alert.type === 'success' && '✓'}
                {alert.type === 'error' && '✕'}
                {alert.type === 'warning' && '!'}
                {alert.type === 'info' && 'i'}
              </div>
              <div style={{ flex: 1 }}>
                <p className="alert-message" style={{ margin: '0 0 8px 0' }}>
                  {alert.message}
                </p>
                <p className="alert-description" style={{ margin: 0 }}>
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>CSS Verification Checklist:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✓ Success alert: <strong>Green background (#f6ffed)</strong> with green border</li>
          <li>✓ Error alert: <strong>Red background (#fff2f0)</strong> with red border</li>
          <li>✓ Warning alert: <strong>Yellow background (#fffbe6)</strong> with yellow border</li>
          <li>✓ Info alert: <strong>Blue background (#e6f7ff)</strong> with blue border</li>
          <li>✓ Icon backgrounds match alert type colors</li>
          <li>✓ Text colors are appropriate for each alert type</li>
          <li>✓ Border styling with colored left borders</li>
          <li>✓ Rounded corners (8px)</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff9e6', borderRadius: '8px', border: '1px solid #ffe58f' }}>
        <h3 style={{ marginTop: 0 }}>CSS Files Updated:</h3>
        <ol>
          <li><code>src/index.css</code> - Alert and Ant Design customization</li>
          <li><code>src/components/ToastContainer.css</code> - Toast notification styles</li>
          <li><code>src/index.js</code> - Imports index.css (already done)</li>
          <li><code>src/components/ToastContainer.js</code> - Imports ToastContainer.css (already done)</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
        <h3 style={{ marginTop: 0 }}>Colors Used:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #91d5ff' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Background</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Border</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Text</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: '#f6ffed' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Success</td>
              <td style={{ padding: '10px' }}>#f6ffed</td>
              <td style={{ padding: '10px' }}>#b7eb8f</td>
              <td style={{ padding: '10px', color: '#135200' }}>Dark Green</td>
            </tr>
            <tr style={{ backgroundColor: '#fff2f0' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Error</td>
              <td style={{ padding: '10px' }}>#fff2f0</td>
              <td style={{ padding: '10px' }}>#ffadd2</td>
              <td style={{ padding: '10px', color: '#a8071a' }}>Dark Red</td>
            </tr>
            <tr style={{ backgroundColor: '#fffbe6' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Warning</td>
              <td style={{ padding: '10px' }}>#fffbe6</td>
              <td style={{ padding: '10px' }}>#ffe58f</td>
              <td style={{ padding: '10px', color: '#ad4e00' }}>Dark Orange</td>
            </tr>
            <tr style={{ backgroundColor: '#e6f7ff' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Info</td>
              <td style={{ padding: '10px' }}>#e6f7ff</td>
              <td style={{ padding: '10px' }}>#91d5ff</td>
              <td style={{ padding: '10px', color: '#003a8c' }}>Dark Blue</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSSVerificationPage;