import React, { useState, useEffect } from 'react';
import IconifyIcon from '../../common/IconifyIcon'; 
import UserDropdown from './UserDropdown'; 

// Hằng số Layout, đồng bộ với DashboardLayout.js
const DRAWER_OPEN_WIDTH = 240;
const DRAWER_CLOSE_WIDTH = 110;
const TOOLBAR_HEIGHT = 96;

const DashboardHeader = ({ open, handleDrawerToggle }) => {
  // Logic responsive đơn giản, thay thế hook useBreakpoints
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 600);
  
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const appBarWidth = isMobileScreen
    ? '100%'
    : open
    ? `calc(100% - ${DRAWER_OPEN_WIDTH}px)`
    : `calc(100% - ${DRAWER_CLOSE_WIDTH}px)`;

  const appBarML = isMobileScreen ? 0 : open ? DRAWER_OPEN_WIDTH : DRAWER_CLOSE_WIDTH; 
  const toolbarBgColor = '#0d0c1e'; 

  return (
    <header
      className="topbar-appbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        marginLeft: appBarML,
        width: appBarWidth,
        zIndex: 1100,
        transition: 'all 0.3s',
        paddingRight: '0 !important',
      }}
    >
      <div
        className="topbar-toolbar"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: TOOLBAR_HEIGHT,
          padding: '0 20px', 
          backgroundColor: toolbarBgColor,
        }}
      >
        {/* Phần bên trái: Nút Menu & Thanh tìm kiếm */}
        <div 
          style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 52.5%' }}
        >
          {/* Nút Menu */}
          <button
            onClick={handleDrawerToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 8 }}
          >
            <IconifyIcon
              icon={open ? 'ri:menu-unfold-4-line' : 'ri:menu-unfold-3-line'}
              style={{ width: 20, height: 20 }}
            />
          </button>
          
          {/* Nút Search cho Mobile */}
          <button
            style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'white',
                padding: 8,
                display: isMobileScreen ? 'flex' : 'none'
            }}
          >
            <IconifyIcon icon="mdi:search" style={{ width: 20, height: 20 }} />
          </button>
          
          {/* Input Search cho Desktop */}
          <div style={{ display: isMobileScreen ? 'none' : 'flex', flexGrow: 1, position: 'relative' }}>
            <input
                type="text"
                placeholder="Search here..."
                style={{
                    width: '100%',
                    padding: '10px 15px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid #424242',
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                }}
            />
            <div style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#B0B0B0' }}>
                <IconifyIcon icon="akar-icons:search" width={13} height={13} />
            </div>
          </div>
        </div>

        {/* Phần bên phải: Thông báo & User Dropdown */}
        <div
          style={{ display: 'flex', gap: 15, alignItems: 'center', justifyContent: 'flex-end', flex: '1 1 20%' }}
        >
          {/* Notification Badge */}
          <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'white' }}
              >
                <IconifyIcon icon="ph:bell-bold" width={29} height={32} />
              </button>
              <span
                  style={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'red' // Màu error
                  }}
              ></span>
          </div>
          
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;