import { Link } from 'react-router';

import { ErrorContainer } from '../error-container/error-container';

import classes from './style.module.css';

export const SimpleError: React.FC<{ code: string; message: string; icon: string }> = ({ code, icon, message }) => {
  return (
    <ErrorContainer>
      <div className={classes.card}>
        <div className={classes.icon}>{icon}</div>
        <h1 className={classes.title}>{code}</h1>
        <p className={classes.subtitle}>{message}</p>
        <Link to='/'>Вернуться на главную</Link>
      </div>
    </ErrorContainer>
  );
};
