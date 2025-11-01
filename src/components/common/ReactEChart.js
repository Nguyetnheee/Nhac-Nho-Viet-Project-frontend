import React, { forwardRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core'; 

const ReactEChart = forwardRef(({ option, style, ...rest }, ref) => {
    return (
        <div style={style}>
            <ReactEChartsCore
                ref={ref}
                option={{
                    ...option,
                    tooltip: {
                        ...option.tooltip,
                        confine: true,
                    },
                }}
                // Truyền tất cả các props còn lại (echarts, notMerge, lazyUpdate...)
                {...rest} 
            />
        </div>
    );
});

export default ReactEChart;