import classes from './style.module.css';

export const ErrorContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={classes.container}>
      {children}
    </div>
  );
};
