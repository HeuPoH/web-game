import classes from './home-title.module.css';

export const HomeTitle: React.FC = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 className={classes.title}>
        Пузатый
      </h1>
      <h2 className={classes.subtitle}>
        Замес
      </h2>
      <h4>Мудрость приходит с весом</h4>
    </div>
  );
};
