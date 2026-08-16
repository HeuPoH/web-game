import { Button, type ButtonProps } from 'antd';

import { cn } from '../../utils';

import classes from './style.module.css';

export const PinkGradientButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button {...props} className={cn(classes.pinkButton, props.className)} />
  );
};

export const OrangeGradientButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button {...props} className={cn(classes.orangeButton, props.className)} />
  );
};

export const GreenGradientButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button {...props} className={cn(classes.greenButton, props.className)} />
  );
};
