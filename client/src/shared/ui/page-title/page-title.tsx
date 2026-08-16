import classes from './style.module.css';
import ellipsisClasses from '../ellipsis/style.module.css';

type Props = {
  title: React.JSX.Element | string;
};

export const PageTitle: React.FC<Props> = (props) => {
  return (
    <div className={classes.title}>
      <h2 className={ellipsisClasses.ellipsis}>
        {props.title}
      </h2>
    </div>
  );
};
