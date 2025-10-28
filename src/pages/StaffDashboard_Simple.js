import React from 'react';

const StaffDashboard = () => {
    return (
        <div style={{ 
            padding: '40px', 
            backgroundColor: '#1e1e1e', 
            color: 'white', 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                🎯 Staff Dashboard
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                Chào mừng bạn đến với trang quản lý dành cho nhân viên
            </p>
            <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h3>Thông tin hệ thống</h3>
                <p>✅ Đăng nhập thành công với role Staff</p>
                <p>✅ Trang dashboard đã load thành công</p>
                <p>🚀 Website hoạt động bình thường</p>
            </div>
        </div>
    );
};

export default StaffDashboard;