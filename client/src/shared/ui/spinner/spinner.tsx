import classes from './style.module.css';

export const Spinner: React.FC = () => {
  return <div className={classes.loader}></div>;
};

export const FullPageSpinner: React.FC = () => {
  return (
    <div className={classes.loaderContainer}>
      <Spinner />
    </div>
  );
};
