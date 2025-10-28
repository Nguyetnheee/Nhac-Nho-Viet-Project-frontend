import React, { useMemo } from 'react';
// Đã sửa đường dẫn
import ReactEChart from '../../common/ReactEChart'; 
import * as echarts from 'echarts/core';

const VisitorInsightsChart = ({ chartRef, data, style, ...rest }) => {
  const primaryMain = '#36B37E'; // Màu xanh lá cây
  const warningMain = '#FFAB00'; // Màu cam
  const white = '#FFFFFF';
  const greyA100 = '#F5F5F5'; // Màu xám nhạt

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: warningMain },
          label: { backgroundColor: warningMain },
        },
      },
      legend: { show: false, data: ['New Visitors'] },
      grid: {
        top: '5%',
        right: '1%',
        bottom: '2.5%',
        left: '1.25%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            // Loại bỏ formatter và style MUI, dùng JS/CSS cơ bản
            padding: [10, 25, 10, 15],
            fontSize: 14,
            fontWeight: 500,
            color: white,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 500,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            padding: [0, 10, 0, 0],
            fontSize: 14,
            fontWeight: 500,
            color: white,
          },
        },
      ],
      series: [
        {
          id: 1,
          name: 'New Visitors',
          type: 'line',
          stack: 'Total',
          smooth: false,
          color: primaryMain,
          lineStyle: { width: 2, color: primaryMain },
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 1, color: greyA100 },
              { offset: 0, color: primaryMain },
            ]),
          },
          emphasis: { focus: 'series' },
          data: data?.['New Visitors'],
        },
      ],
    }),
    [],
  );
  return <ReactEChart ref={chartRef} echarts={echarts} option={option} style={style} {...rest} />;
};

export default VisitorInsightsChart;