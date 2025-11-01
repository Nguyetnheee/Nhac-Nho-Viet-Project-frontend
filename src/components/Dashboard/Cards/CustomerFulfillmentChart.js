import React, { useMemo } from 'react';
import * as echarts from 'echarts'; 
import ReactEChart from '../../common/ReactEChart'; 
import EChartsReactCore from 'echarts-for-react/lib/core'; 

const CustomerFulfillmentChart = ({ chartRef, data, style, ...rest }) => {
  const secondaryMain = '#FFAB00'; 
  const primaryMain = '#36B37E'; 
  const whiteAlpha006 = 'rgba(255, 255, 255, 0.06)';
  const greyA100 = '#F5F5F5'; 

  const option = useMemo(
    () => ({
      color: [secondaryMain, primaryMain],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
      },
      legend: { show: false, data: ['This Month', 'Last Month'] },
      grid: { top: 0, right: 5, bottom: 1, left: 5 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        show: true,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLabel: { show: false },
        axisLine: {
          show: true,
          lineStyle: { color: whiteAlpha006, width: 1 },
        },
      },
      yAxis: [{ type: 'value', show: false }],
      series: [
        {
          id: 1,
          name: 'This Month',
          type: 'line',
          stack: 'Total',
          lineStyle: { width: 2 },
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 5,
          areaStyle: {
            opacity: 0.8,
            
            color: new echarts.graphic.LinearGradient(0, 0, 0, 0.9, [
              { offset: 1, color: greyA100 },
              { offset: 0, color: secondaryMain },
            ]),
          },
          emphasis: { focus: 'series' },
          data: data['This Month'],
        },
        {
          id: 2,
          name: 'Last Month',
          type: 'line',
          stack: 'Total',
          lineStyle: { width: 2 },
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 5,
          areaStyle: {
            opacity: 0.75,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 0.95, [
              { offset: 1, color: greyA100 },
              { offset: 0, color: primaryMain },
            ]),
          },
          emphasis: { focus: 'series' },
          data: data['Last Month'],
        },
      ],
    }),
    [data],
  );

  return <ReactEChart ref={chartRef} option={option} echarts={echarts} style={style} {...rest} />;
};

export default CustomerFulfillmentChart;