import { Flex } from 'antd';
import { Crown } from 'lucide-react';
import type { GamePlayerIdentity } from '@game/shared-types';

import { cn, toCssColor } from '../../utils';

import classes from './player-list.module.css';
import colorClasses from '../styles/color.module.css';

type Props = {
  hostId: string;
  players: GamePlayerIdentity[];
  selfUserId?: string;
  title?: string;
  disconnectedText?: string;
};

export const PlayerList: React.FC<Props> = ({
  players,
  hostId,
  title,
  disconnectedText,
  selfUserId,
}) => {
  return (
    <section className={classes.players}>
      <div className={classes.playersHeader}>{title}</div>
      {players.map(p => ((
        <Player
          key={p.userId}
          selfUserId={selfUserId}
          isHost={hostId === p.userId}
          player={p}
          disconnectedText={disconnectedText}
        />
      )))}
    </section>
  );
};

type PlayerProps = {
  player: GamePlayerIdentity;
  isHost: boolean;
  selfUserId?: string;
  disconnectedText?: string;
};

const Player: React.FC<PlayerProps> = ({
  player,
  disconnectedText = '● Нет связи',
  selfUserId,
  isHost
}) => {
  return (
    <div className={classes.player}>
      <Flex gap={10}>
        <div
          className={classes.playerAvatar}
          style={{ background: toCssColor(player.color) }}
        >
          <img
            src='/assets/game-icons/player-face.png'
            style={{ width: 36 }}
          />
        </div>
        <div>
          <Flex gap={4} align='center'>
            {player.login}
            {isHost ? <Crown className={colorClasses.orangeColor} size={16} /> : null}
            {player.userId === selfUserId ? ' (Вы)' : null}
          </Flex>
          {player.connected ? <OnlineStatus /> : <OfflineStatus text={disconnectedText} />}
        </div>
      </Flex>
    </div>
  );
};

const OnlineStatus: React.FC = () => {
  return (
    <div
      className={cn(classes.playerStatus, classes.playerOnlineStatus)}
    >
      ● Активен
    </div>
  );
};

const OfflineStatus: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      className={cn(classes.playerStatus, classes.playerOfflineStatus)}
    >
      {text}
    </div>
  );
};
