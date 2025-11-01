import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Footer from './Footer';

// Hằng số Layout
const DRAWER_OPEN_WIDTH = 240;
const DRAWER_CLOSE_WIDTH = 110;
const TOOLBAR_HEIGHT = 96;
const PADDING_X = 20; 

const DashboardLayout = ({ children }) => {
  const [open, setOpen] = useState(true); 
  const handleDrawerToggle = () => setOpen(!open);

  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 600);
  
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    if (window.innerWidth < 600) setOpen(false); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const currentSidebarWidth = isMobileScreen ? 0 : open ? DRAWER_OPEN_WIDTH : DRAWER_CLOSE_WIDTH;
  
  return (
    <>
      <div 
        className="main-layout-container"
        style={{ display: 'flex', minHeight: '100vh' }}
      >
        {/* 1. TOPBAR / HEADER */}
        <DashboardHeader open={open} handleDrawerToggle={handleDrawerToggle} />
        
        {/* 2. SIDEBAR */}
        <DashboardSidebar open={open} />
        
        {/* 3. MAIN CONTENT */}
        <main
          className="main-dashboard-content-wrapper"
          style={{
            width: '100%',
            flexGrow: 1,
            overflow: 'auto',
            marginLeft: currentSidebarWidth, 
            transition: 'margin-left 0.3s ease-out',
            paddingTop: 0, 
            paddingRight: PADDING_X,
            paddingBottom: 50, 
            paddingLeft: PADDING_X,
          }}
        >
          {/* Toolbar Spacer */}
          <div style={{ height: TOOLBAR_HEIGHT }} /> 
          
          {children}
        </main>
      </div>
      {/* 4. FOOTER */}
      <Footer open={open} />
    </>
  );
};

export default DashboardLayout;