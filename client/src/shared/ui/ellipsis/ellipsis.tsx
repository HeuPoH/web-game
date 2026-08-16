import classes from './style.module.css';

export const Ellipsis: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className={classes.ellipsis}>{children}</div>;
};
