import React from 'react';

// Component đơn giản thay thế cho Box component="img" của MUI
const Image = ({ src, alt, style, ...rest }) => (
  <img src={src} alt={alt} style={style} {...rest} />
);

export default Image;