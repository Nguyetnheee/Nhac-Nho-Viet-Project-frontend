import React from 'react';

const Image = ({ src, alt, style, ...rest }) => (
  <img src={src} alt={alt} style={style} {...rest} />
);

export default Image;