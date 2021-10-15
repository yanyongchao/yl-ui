import type { FC } from 'react';
import React from 'react';
import { Button as AButton } from 'antd';
import type { ButtonProps } from 'antd/lib/button';

const Button: FC<ButtonProps> = (props) => {
  return <AButton {...props} />;
};

export default Button;
