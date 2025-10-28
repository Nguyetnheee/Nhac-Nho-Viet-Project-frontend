import React, { useCallback, useEffect, useRef } from 'react';
import CustomerFulfillmentChart from './CustomerFulfillmentChart';
// Đường dẫn data: Đã đúng 3 cấp
import { customerFulfillmentData } from '../../../data/chart-data/customer-fulfillment'; 
// SỬA ĐƯỜNG DẪN: 3 cấp ../ để thoát khỏi Cards/Dashboard/components và vào src/helpers
import { currencyFormat } from '../../../helpers/format-functions'; 

const CustomerFulfillment = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef]);

  const getTotalFulfillment = useCallback(
    (chartData) => {
      // Dùng hàm helper mới, đã là VNĐ
      return currencyFormat(chartData.reduce((prev, current) => prev + current, 0));
    },
    [customerFulfillmentData],
  );
  
  const secondaryMain = '#FFAB00'; // Màu cam
  const primaryMain = '#36B37E';  // Màu xanh lá cây

  return (
    <div 
        className="dashboard-card fulfillment-card" 
        style={{ padding: 20, height: '100%', backgroundColor: '#1E1E1E', borderRadius: 8 }}
    >
      <h3 style={{ margin: '0 0 20px 0', fontSize: 24, color: 'white' }}>
        Customer Fulfillment
      </h3>
      <CustomerFulfillmentChart
        chartRef={chartRef}
        style={{ height: 220, flexGrow: 1 }}
        data={customerFulfillmentData}
      />
      
      {/* Legend và Value */}
      <div 
        style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            padding: '12px 0 0 0',
        }}
      >
        {/* This Month */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <button style={{ background: 'none', border: 'none', color: '#B0B0B0', fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'default', padding: 5 }}>
            <div style={{ width: 6, height: 6, marginRight: 5, backgroundColor: secondaryMain, borderRadius: '50%' }} />
            Tháng này
          </button>
          <div style={{ fontSize: 14, color: 'white' }}>
            {getTotalFulfillment(customerFulfillmentData['This Month'])}
          </div>
        </div>
        
        <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Last Month */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <button style={{ background: 'none', border: 'none', color: '#B0B0B0', fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'default', padding: 5 }}>
            <div style={{ width: 6, height: 6, marginRight: 5, backgroundColor: primaryMain, borderRadius: '50%' }} />
            Tháng trước
          </button>
          <div style={{ fontSize: 14, color: 'white' }}>
            {getTotalFulfillment(customerFulfillmentData['Last Month'])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFulfillment;