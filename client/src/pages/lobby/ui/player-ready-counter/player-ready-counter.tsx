import { CircleCheck } from 'lucide-react';
import type { LobbyPlayer } from '@game/shared-types';

import colorClasses from '../../../../shared/ui/styles/color.module.css';
import classes from './style.module.css';

type Props = {
  players: LobbyPlayer[];
};

export const PlayerReadyCounter: React.FC<Props> = ({ players }) => {
  const totalReady = players.reduce((prev, curr) => curr.isReady ? prev + 1 : prev, 0);
  return (
    <div className={classes.container}>
      <CircleCheck className={colorClasses.greenColor} />
      <span>Готово {`${totalReady} / ${players.length}`}</span>
    </div>
  );
};
