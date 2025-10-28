import React from 'react';

// Hàm mô phỏng LinearProgress (Thanh tiến trình) đơn giản
const LinearProgress = ({ value, color }) => {
    const colorMap = {
        info: '#36B37E',
        success: '#1976D2',
        warning: '#FFAB00',
        error: '#F44336',
    };
    const barColor = colorMap[color] || colorMap['info'];

    return (
        <div 
            style={{ 
                height: '8px', 
                backgroundColor: '#1C1C2E', 
                borderRadius: '4px',
                overflow: 'hidden'
            }}
        >
            <div 
                style={{ 
                    width: `${value}%`, 
                    height: '100%', 
                    backgroundColor: barColor,
                    transition: 'width 0.5s'
                }}
            />
        </div>
    );
};

// Hàm mô phỏng Chip (Nhãn) đơn giản
const Chip = ({ label, color }) => {
    const colorMap = {
        info: '#36B37E', 
        success: '#1976D2',
        warning: '#FFAB00',
        error: '#F44336',
    };
    const chipColor = colorMap[color] || colorMap['info'];

    return (
        <span 
            style={{
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600',
                color: chipColor,
                border: `1px solid ${chipColor}`,
                whiteSpace: 'nowrap'
            }}
        >
            {label}
        </span>
    );
};

const ProductItemRow = ({ productItem }) => {
  return (
    <tr style={{ borderBottom: '1px solid #333' }}>
      <td style={cellStyle}>
        {productItem.id}
      </td>
      <td style={{...cellStyle, whiteSpace: 'nowrap'}}>
        {productItem.name}
      </td>
      <td style={cellStyle}>
        <LinearProgress color={productItem.color} value={productItem.sales} />
      </td>
      <td style={{...cellStyle, textAlign: 'center'}}>
        <Chip label={`${productItem.sales}%`} color={productItem.color} />
      </td>
    </tr>
  );
};

const cellStyle = { padding: '15px 10px', fontSize: 14, color: '#B0B0B0' };

export default ProductItemRow;