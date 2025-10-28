import React, { useState, useEffect } from 'react';

const Footer = ({ open }) => {
  // Mô phỏng down('sm')
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 600);
  
  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lấy giá trị margin-left từ MUI (ml={isMobileScreen ? 0 : open ? 60 : 27.5})
  const marginLeftValue = isMobileScreen ? 0 : open ? 60 : 27.5; 
  const errorMain = '#F44336'; // Màu đỏ (error.main)
  const textPrimary = '#FFFFFF';
  const primaryMain = '#36B37E';

  return (
    <div
      className="main-layout-footer"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isMobileScreen ? 'center' : 'flex-end',
        marginLeft: marginLeftValue,
        paddingRight: 20, 
        paddingBottom: 50, 
        paddingLeft: 20,
        position: 'relative', 
        zIndex: 1000,
        transition: 'margin-left 0.3s ease-out',
      }}
    >
      <p style={{ margin: 0, fontSize: 14, textAlign: isMobileScreen ? 'center' : 'right', color: '#B0B0B0' }}>
        Made with{' '}
        <span style={{ color: errorMain, verticalAlign: 'middle' }}>
          &#10084;
        </span>{' '}
        by{' '}
        <a
          href="https://themewagon.com/"
          target="_blank"
          rel="noopener"
          aria-label="Explore ThemeWagon Website"
          style={{ color: textPrimary, textDecoration: 'none' }}
          onMouseOver={(e) => e.currentTarget.style.color = primaryMain}
          onMouseOut={(e) => e.currentTarget.style.color = textPrimary}
        >
          ThemeWagon
        </a>
      </p>
    </div>
  );
};

export default Footer;