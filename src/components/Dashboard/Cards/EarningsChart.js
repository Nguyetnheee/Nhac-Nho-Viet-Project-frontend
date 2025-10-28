
import React, { useMemo } from 'react';
import ReactEChart from '../../common/ReactEChart'; 
import * as echarts from 'echarts/core';

const EarningsChart = ({ chartRef, style, ...rest }) => {
  const primaryMain = '#36B37E'; 
  const grey800 = '#424242'; 

  const option = useMemo(
    () => ({
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '190%',
          center: ['50%', '100%'],
          splitNumber: 10,
          itemStyle: {
            color: primaryMain,
            borderWidth: 0,
          },
          progress: {
            show: true,
            roundCap: false,
            width: 40,
          },
          pointer: {
            icon: 'roundRect',
            length: '50%',
            width: 5,
            offsetCenter: [0, -90],
            itemStyle: {
              borderWidth: 20,
            },
          },
          axisLine: {
            roundCap: false,
            lineStyle: {
              width: 40,
              color: [[1, grey800]],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: { show: false },
          data: [
            {
              value: 80,
            },
          ],
        },
      ],
    }),
    [],
  );

  return <ReactEChart ref={chartRef} option={option} echarts={echarts} style={style} {...rest} />;
};

export default EarningsChart;