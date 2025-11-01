import React from 'react';
import SimpleBar from 'simplebar-react';
import NavItem from './NavItem';
import Image from '../../common/Image'; 
import navItems from '../../../data/nav-items'; 

const DRAWER_OPEN_WIDTH = 240;
const DRAWER_CLOSE_WIDTH = 110;

const logoWithText = '/Logo-with-text.png';
const logo = '/LOGO.png';
const homeRoot = '/'; 

const DashboardSidebar = ({ open }) => {
  const sidebarWidth = open ? DRAWER_OPEN_WIDTH : DRAWER_CLOSE_WIDTH;
  const toolbarHeight = 98;

  return (
    <div
      className="dashboard-sidebar-permanent"
      style={{
        display: window.innerWidth < 600 ? 'none' : 'block',
        position: 'fixed',
        height: '100vh',
        width: sidebarWidth,
        transition: 'width 0.3s ease-out',
        zIndex: 1200,
        backgroundColor: '#0d0c1e',
      }}
    >
      {/* Toolbar (Logo Section) */}
      <div
        style={{
          position: 'fixed',
          height: toolbarHeight,
          zIndex: 1,
          backgroundColor: '#0d0c1e',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: sidebarWidth,
          transition: 'width 0.3s ease-out',
        }}
      >
        <a 
          href={homeRoot} 
          style={{ marginTop: 12 }}
        >
          <Image
            src={open ? logoWithText : logo}
            alt={open ? 'logo with text' : 'logo'}
            style={{ height: 40 }}
          />
        </a>
      </div>

      {/* Navigation List (SimpleBar) */}
      <SimpleBar style={{ maxHeight: '100vh' }}>
        <nav>
          <ul
            style={{
              marginTop: toolbarHeight + 20,
              padding: '10px 0',
              margin: 0,
              listStyle: 'none',
              height: 724,
              justifyContent: 'space-between',
            }}
          >
            {navItems.map((navItem) => (
              <NavItem key={navItem.id} navItem={navItem} open={open} />
            ))}
          </ul>
        </nav>
      </SimpleBar>
    </div>
  );
};

export default DashboardSidebar;