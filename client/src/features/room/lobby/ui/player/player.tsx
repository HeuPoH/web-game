import React, { useEffect, useState } from 'react';
import { Flex } from 'antd';
import { Crown, Trash } from 'lucide-react';
import type { LobbyPlayer } from '@game/shared-types';

import { cn, toCssColor } from '../../../../../shared/utils';
import { Status } from '../status/status';

import classes from './style.module.css';
import colorClasses from '../../../../../shared/ui/styles/color.module.css';

type Props = {
  hostId: string;
  player: LobbyPlayer;
  selfUserId: string;
  setReady: (ready: boolean) => void;
  onKick?: (userId: string) => void;
};

export const Player: React.FC<Props> = ({ player, hostId, selfUserId, setReady, onKick }) => {
  const isHost = player.userId === hostId;
  const [isReady, setIsReady] = useState(player.isReady ?? false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(player.isReady);
  }, [player.isReady]);

  return (
    <div className={cn(classes.player, isReady && classes.playerReady)}>
      <div className={classes.playerData}>
        <div
          className={classes.head}
          style={{ background: toCssColor(player.color) }}
        >
          {isReady
            ? (
              <img
                src='/assets/game-icons/player-face.png'
                className={cn(classes.headIcon, classes.headIconReady)}
              />
            )
            : (
              <img
                src='/assets/game-icons/player-face-sleep.png'
                className={cn(classes.headIcon, classes.headIconNotReady)}
              />
            )}
        </div>
        <Flex orientation='vertical'>
          <Flex gap={6} align='center'>
            {player.login}
            {selfUserId === player.userId ? ' (Вы)' : null}
            {isHost ? <Crown className={colorClasses.orangeColor} size={16} /> : null}
          </Flex>
          <Status
            isReady={isReady}
            isPlayerSelf={selfUserId === player.userId}
            onChanged={(f) => {
              setIsReady(f);
              setReady(f);
            }}
          />
        </Flex>
        {hostId === selfUserId && player.userId !== selfUserId && (
          <DeleteButton onClick={() => onKick?.(player.userId)} />
        )}
      </div>
    </div>
  );
};

const DeleteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className={classes.deleteIcon} onClick={onClick}>
      <Trash />
    </div>
  );
};
