import React, { forwardRef } from 'react';
// Yêu cầu thư viện echarts-for-react đã được cài đặt
import ReactEChartsCore from 'echarts-for-react/lib/core'; 

// Dùng forwardRef để component cha có thể truyền ref vào EChartsCore
const ReactEChart = forwardRef(({ option, style, ...rest }, ref) => {
    return (
        // Dùng div thay cho Box của MUI
        <div style={style}>
            <ReactEChartsCore
                ref={ref}
                option={{
                    ...option,
                    // Giữ lại logic xử lý tooltip confine
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