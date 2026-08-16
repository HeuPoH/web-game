import { useNavigate } from 'react-router';
import { PinkGradientButton } from '../../../shared/ui';
import classes from './empty-rooms.module.css';

export const EmptyRooms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <img src='/assets/game-icons/player-face-empty.png' />
        <h3>Нет доступных комнат!</h3>
      </div>
      <PinkGradientButton size='large' onClick={() => navigate('/new-room')}>
        Создать
      </PinkGradientButton>
    </div>
  );
};
