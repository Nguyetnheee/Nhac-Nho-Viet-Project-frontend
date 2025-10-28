import React from 'react';
import { useLocation } from 'react-router-dom';
// ĐÃ SỬA: 2 cấp ../ để đến src/components/common/
import IconifyIcon from '../../common/IconifyIcon'; 

// Hàm NavItem nhận vào navItem object và trạng thái open của sidebar
const NavItem = ({ navItem, open }) => {
  const { pathname } = useLocation();
  const isActive = pathname === navItem.path;
  
  // Màu sắc cơ bản
  const primaryMain = '#36B37E'; 
  const backgroundDefault = '#0d0c1e'; 
  const textPrimary = '#FFFFFF'; 

  // Style cho ListItem
  const listItemStyle = {
    display: 'block',
    padding: 0,
    paddingLeft: 20,
    paddingRight: 20,
    borderRight: !open && isActive 
      ? `3px solid ${primaryMain}` 
      : `3px solid transparent`,
  };

  // Style cho Link (ListItemButton)
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: open ? '10px 15px' : '10px 0',
    borderRadius: '8px',
    textDecoration: 'none',
    opacity: navItem.active ? 1 : 0.5,
    backgroundColor: isActive && open ? primaryMain : backgroundDefault,
    color: isActive && open ? backgroundDefault : textPrimary,
    transition: 'background-color 0.2s, color 0.2s',
    justifyContent: open ? 'flex-start' : 'center',
    width: '100%',
  };

  // Style cho Icon
  const iconStyle = {
    width: 20,
    height: 20,
    marginRight: open ? 15 : 0,
    color: isActive 
      ? (open ? backgroundDefault : primaryMain) 
      : textPrimary,
  };

  // Style cho Text
  const textContainerStyle = {
    display: open ? 'inline-block' : 'none',
    opacity: open ? 1 : 0,
    color: isActive ? backgroundDefault : 'inherit',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };

  return (
    <li style={listItemStyle}>
      <a 
        href={navItem.path} 
        style={linkStyle}
      >
        <div style={iconStyle}>
          <IconifyIcon icon={navItem.icon} width={20} height={20} />
        </div>
        <span style={textContainerStyle}>
          {navItem.title}
        </span>
      </a>
    </li>
  );
};

export default NavItem;