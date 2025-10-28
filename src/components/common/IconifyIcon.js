import React from 'react';
import { Icon } from '@iconify/react';

// Component base cho Icon
const IconifyIcon = ({ icon, width, height, style, ...rest }) => {
  return (
    <div style={{ width, height, display: 'inline-flex', ...style }}>
      <Icon icon={icon} width="100%" height="100%" {...rest} />
    </div>
  );
};

export default IconifyIcon;