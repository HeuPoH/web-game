import { cn } from '../../utils';
import classes from './style.module.css';

type Props = {
  nickname: string;
  className?: string;
  style?: React.CSSProperties
};

export const PlayerAvatarDumb: React.FC<Props> = ({ nickname, style, className }) => {
  const firstLetter = nickname.slice(0, 1);
  return (
    <div
      style={style}
      className={cn(classes.playerAvatar, className)}
    >
      {firstLetter.toLocaleUpperCase()}
    </div>
  );
};
