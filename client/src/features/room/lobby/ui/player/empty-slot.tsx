import { cn } from '../../../../../shared/utils';
import classes from './style.module.css';

export const EmptySlot: React.FC = () => {
  return (
    <div className={classes.emptySlot}>
      <div className={cn(classes.head, classes.emptyHead)}>
        <img
          src='/assets/game-icons/player-face-empty.png'
          className={classes.headIcon}
        />
      </div>
      <span>Свежее мясо...</span>
    </div>
  );
};
