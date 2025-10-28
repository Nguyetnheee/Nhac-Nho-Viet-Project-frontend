import React, { useEffect, useRef } from 'react';
import VisitorInsightsChart from './VisitorInsightsChart';
import { visitorInsightsData } from '../../../data/chart-data/visitor-insights';
const VisitorInsights = () => {
  const chartRef = useRef(null);
  const warningMain = '#FFAB00'; 

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

  return (
    <div 
        className="dashboard-card visitor-insights-card" 
        style={{ padding: 20, height: '100%', backgroundColor: '#1E1E1E', borderRadius: 8 }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 30,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 24, color: 'white' }}>
          Visitor Insights
        </h3>
        
        <button
          style={{
            background: '#1C1C2E', 
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            color: '#B0B0B0', 
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            cursor: 'default',
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              backgroundColor: warningMain,
              borderRadius: '50%',
              marginRight: 8,
            }}
          />
          New Visitors
        </button>
      </div>
      <VisitorInsightsChart
        chartRef={chartRef}
        data={visitorInsightsData}
        style={{ height: 342, flexGrow: 1 }}
      />
    </div>
  );
};

export default VisitorInsights;