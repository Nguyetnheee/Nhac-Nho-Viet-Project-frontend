import React, { useEffect, useRef } from 'react';
import LevelChart from './LevelChart';
import { levelData } from '../../../data/chart-data/level'; 

const Level = () => {
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

  return (
    <div 
        className="dashboard-card level-card" 
        style={{ padding: 20, height: '100%', backgroundColor: '#1E1E1E', borderRadius: 8 }}
    >
      <h3 style={{ margin: '0 0 20px 0', fontSize: 24, color: 'white' }}>
        Level
      </h3>
      <LevelChart
        chartRef={chartRef}
        data={levelData}
        style={{ height: 181, flexGrow: 1 }}
      />
      
      {/* Legend và Divider */}
      <div 
        style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            padding: '12px 0 0 0',
        }}
      >
        <button className="level-legend-item" style={{ background: 'none', border: 'none', color: '#B0B0B0', fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'default' }}>
            <div style={{ width: 8, height: 8, marginRight: 10, backgroundColor: '#36B37E', borderRadius: '50%' }} />
            Volume
        </button>
        <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />
        <button className="level-legend-item" style={{ background: 'none', border: 'none', color: '#B0B0B0', fontSize: 14, display: 'flex', alignItems: 'center', cursor: 'default' }}>
            <div style={{ width: 8, height: 8, marginRight: 10, backgroundColor: '#424242', borderRadius: '50%' }} />
            Service
        </button>
      </div>
    </div>
  );
};

export default Level;