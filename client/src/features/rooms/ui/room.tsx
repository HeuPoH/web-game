import { Flex } from 'antd';
import { useNavigate } from 'react-router';
import { Crown, LoaderCircle, Play } from 'lucide-react';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import type { RoomPreview } from '@game/shared-types';

import { PinkGradientButton } from '../../../shared/ui';

import colorClasses from '../../../shared/ui/styles/color.module.css';
import classes from './room.module.css';

type Props = {
  room: RoomPreview;
};

export const Room: React.FC<Props> = ({ room }) => {
  const navigate = useNavigate();
  const { settings, playersCount, hostName, status } = room;
  const isFull = playersCount === settings.maxPlayers;
  const isLobby = status === 'lobby';
  const canJoin = !isFull && isLobby;

  return (
    <div className={classes.room}>
      <div className={classes.roomInfo}>
        <h4>{room.settings.name}</h4>
        <div className={classes.roomMeta}>
          <Flex gap={6} align='center'>
            <EnvironmentOutlined />
            <div>{settings.level}</div>
          </Flex>
          <Flex className={classes.roomPlayers} gap={6}>
            <TeamOutlined />
            <div>{`${playersCount}/${settings.maxPlayers}`}</div>
          </Flex>
          {status === 'lobby' ? <LobbyStatus /> : <GameStatus />}
          <Flex align='center' gap={6}>
            <Crown className={colorClasses.orangeColor} size={16} />
            {hostName}
          </Flex>
        </div>
      </div>
      <div>
        <PinkGradientButton
          disabled={!canJoin}
          type='primary'
          variant='solid'
          onClick={() => navigate(`/room/${room.id}/lobby?ok=true`)}
          icon={<Play size={14} />}
        >
          Присоединиться
        </PinkGradientButton>
      </div>
    </div>
  );
};

const LobbyStatus: React.FC = () => {
  return <div className={classes.lobbyStatus}>Лобби</div>;
};

const GameStatus: React.FC = () => {
  return (
    <div className={classes.gameStatus}>
      <LoaderCircle className={classes.spinner} size={14} />
      <span>В игре</span>
    </div>
  );
};
