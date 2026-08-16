import classes from './style.module.css';

export const PageContainer: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = (props) => {
  return (
    <section className={classes.pageContainer} style={props.style}>
      {props.children}
    </section>
  );
};
