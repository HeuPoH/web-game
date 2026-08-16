import { CircleCheck, CircleX } from 'lucide-react';
import { cn } from '../../../../../shared/utils';

import classes from './style.module.css';

type Props = {
  isPlayerSelf: boolean;
  isReady: boolean;
  onChanged: (ready: boolean) => void;
};

export const Status: React.FC<Props> = ({ isReady, isPlayerSelf, onChanged }) => {
  const style: React.CSSProperties | undefined = isPlayerSelf ? { cursor: 'pointer' } : undefined;
  const onToggleStatus = () => {
    if (!isPlayerSelf) {
      return;
    }
    const next = !isReady;
    onChanged(next);
  };

  return isReady
    ? <Ready onClick={onToggleStatus} style={style} />
    : <NotReady onClick={onToggleStatus} style={style} />;
};

const Ready: React.FC<{ onClick: () => void; style?: React.CSSProperties }> = ({ onClick, style }) => (
  <span onClick={onClick} style={style} className={cn(classes.status, classes.statusReady)}>
    <CircleCheck size={14} />
    <span>Готов</span>
  </span>
);

const NotReady: React.FC<{ onClick: () => void; style?: React.CSSProperties }> = ({ onClick, style }) => (
  <span onClick={onClick} style={style} className={cn(classes.status, classes.statusNotReady)}>
    <CircleX size={14} />
    <span>Не готов</span>
  </span>
);
