import React from 'react';
import DashboardLayout from '../components/Dashboard/Layouts/DashboardLayout';
import Level from '../components/Dashboard/Cards/Level';
import CustomerFulfillment from '../components/Dashboard/Cards/CustomerFulfillment';
import TopProducts from '../components/Dashboard/Controls/TopProducts';
import VisitorInsights from '../components/Dashboard/Cards/VisitorInsights';
import Earnings from '../components/Dashboard/Cards/Earnings';

// Cần import các components StatsCard sau khi chuyển đổi:
// import StatsIconCard from '../components/Dashboard/Cards/StatsIconCard';

const StaffDashboard = () => {
    return (
<DashboardLayout> 
            <div className="staff-dashboard-content" style={{ padding: '0 20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 25px 0', color: '#fff' }}>
                    Sales Summary
                </h2>
                
                {/* 1. KHU VỰC THẺ THỐNG KÊ (4 Cards) - Tạm thời giữ placeholder */}
                <div 
                    className="sales-summary-row" 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Responsive grid
                        gap: '20px', 
                        marginBottom: '30px' 
                    }}
                >
                    {/* Các Stats Cards sẽ được đặt ở đây */}
                    <div style={{ padding: 20, border: '1px dashed #444', backgroundColor: '#1E1E1E', borderRadius: 8, minHeight: 120 }}>Card 1: Total Sales</div>
                    <div style={{ padding: 20, border: '1px dashed #444', backgroundColor: '#1E1E1E', borderRadius: 8, minHeight: 120 }}>Card 2: Total Order</div>
                    <div style={{ padding: 20, border: '1px dashed #444', backgroundColor: '#1E1E1E', borderRadius: 8, minHeight: 120 }}>Card 3: Product Sold</div>
                    <div style={{ padding: 20, border: '1px dashed #444', backgroundColor: '#1E1E1E', borderRadius: 8, minHeight: 120 }}>Card 4: New Customer</div>
                </div>
                
                {/* 2. CẤU TRÚC 2 CỘT CHÍNH CỦA DASHBOARD */}
                <div 
                    className="main-dashboard-grid" 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1.5fr 1fr', 
                        gap: '20px', 
                        marginBottom: '30px' 
                    }}
                >
                    
                    {/* CỘT TRÁI: Top Products và Visitor Insights */}
                    <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* 2.1. BẢNG TOP PRODUCTS */}
                        <TopProducts /> 
                        
                        {/* 2.2. BIỂU ĐỒ VISITOR INSIGHTS */}
                        <VisitorInsights />
                    </div>

                    {/* CỘT PHẢI: Level, Customer Fulfillment, và Earnings */}
                    <div className="right-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* 2.3. BIỂU ĐỒ LEVEL */}
                        <Level /> 
                        
                        {/* 2.4. BIỂU ĐỒ CUSTOMER FULFILLMENT */}
                        <CustomerFulfillment />
                        
                        {/* 2.5. EARNINGS */}
                        <Earnings />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default StaffDashboard;