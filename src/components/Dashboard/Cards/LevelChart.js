import React, { useMemo } from 'react';
import ReactEChart from '../../common/ReactEChart';
import * as echarts from 'echarts/core';

const LevelChart = ({ chartRef, data, style, ...rest }) => {
  const primaryMain = '#36B37E'; 
  const grey800 = '#424242'; 
  const whiteAlpha006 = 'rgba(255, 255, 255, 0.06)';

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: { show: false, data: ['Volume', 'Service'] },
      xAxis: {
        type: 'category',
        show: true,
        axisTick: { show: false },
        data: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'],
        axisLabel: { show: false },
        axisLine: {
          show: true,
          lineStyle: { color: whiteAlpha006, width: 1 },
        },
      },
      yAxis: { type: 'value', show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 1 },
      series: [
        {
          id: 1,
          name: 'Volume',
          type: 'bar',
          stack: 'Service',
          barWidth: 25,
          emphasis: { focus: 'series' },
          data: data.Volume,
          color: primaryMain,
          itemStyle: { borderRadius: 4 },
        },
        {
          id: 2,
          name: 'Service',
          type: 'bar',
          stack: 'Service',
          barWidth: 25,
          emphasis: { focus: 'series' },
          data: data.Service,
          color: grey800,
          itemStyle: { borderRadius: 4 },
        },
      ],
    }),
    [data], 
  );

  return <ReactEChart ref={chartRef} option={option} echarts={echarts} style={style} {...rest} />;
};

export default LevelChart;