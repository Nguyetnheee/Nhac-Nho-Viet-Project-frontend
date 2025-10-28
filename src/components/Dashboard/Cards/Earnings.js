import React, { useEffect, useRef } from 'react';
import EarningsChart from './EarningsChart';
import { currencyFormat } from '../../../helpers/format-functions'; 

const Earnings = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        // Lấy instance Echarts để resize
        const echartsInstance = chartRef.current.getEchartsInstance();
        echartsInstance.resize({ width: 'auto', height: 'auto' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartRef]);
  
  const primaryMain = '#36B37E'; 

  return (
    <div 
        className="dashboard-card earnings-card" 
        style={{ padding: 20, height: '100%', backgroundColor: '#1E1E1E', borderRadius: 8 }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: 24, color: 'white' }}>
        Earnings
      </h3>
      <p style={{ margin: '0 0 15px 0', fontSize: 16, color: '#B0B0B0' }}>
        Total Expense
      </p>
      <h1 
        style={{ 
            margin: '0 0 15px 0', 
            fontSize: '36px', 
            color: primaryMain 
        }}
      >
        {currencyFormat(6078760, { useGrouping: false })} 
      </h1>
      <p style={{ margin: '0 0 30px 0', fontSize: 16, color: '#B0B0B0' }}>
        Profit is 48% More than last Month
      </p>
      
      {/* Khu vực Biểu đồ */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          maxHeight: 152,
        }}
      >
        <EarningsChart
          chartRef={chartRef}
          style={{ flex: '1 1 0%', maxWidth: '300px' }}
        />
        <h1
          style={{
            position: 'absolute',
            margin: 0,
            left: 0,
            right: 0,
            bottom: 0,
            textAlign: 'center',
            fontSize: '32px', 
            color: 'white',
          }}
        >
          80%
        </h1>
      </div>
    </div>
  );
};

export default Earnings;