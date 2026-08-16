import { useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Flex } from 'antd';

import { useLobbyStore, useRoomStore, useUserStore } from '../../../app/providers/store-provider';
import { PageContainer, PageTitle, PinkGradientButton } from '../../../shared/ui';
import { Players } from '../../../features/room';
import { PlayerReadyCounter } from './player-ready-counter/player-ready-counter';
import { cn } from '../../../shared/utils';

import animations from '../../../shared/ui/styles/animations.module.css';

export const Lobby: React.FC = observer(() => {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const userStore = useUserStore();
  const lobbyStore = useLobbyStore();
  const room = roomStore?.getCurrentRoom();
  const selfUserId = userStore.getUser()?.id;
  if (!roomStore || !room || !lobbyStore || !userStore || !selfUserId) {
    return null;
  }

  const lobbyState = lobbyStore.getState();
  const allPlayersReady = lobbyState.players.every(p => p.isReady);

  return (
    <PageContainer>
      <PageTitle title={room.settings.name} />
      <PlayerReadyCounter players={lobbyState.players} />
      <Players
        hostId={room.hostId}
        selfUserId={selfUserId}
        maxPlayers={room.settings.maxPlayers}
        players={lobbyState.players}
        setReady={(ready) => lobbyStore.setReady(ready)}
      />
      <Flex gap={10} justify='center'>
        <Button
          type='default'
          variant='solid'
          size='large'
          icon={<ArrowLeft size={16} />}
          onClick={() => {
            lobbyStore.leave();
            navigate('/');
          }}
        >
          Выйти
        </Button>
        {selfUserId === room.hostId
          ? (
            <PinkGradientButton
              type='primary'
              variant='solid'
              size='large'
              disabled={!allPlayersReady}
              icon={<ArrowRight size={16} />}
              onClick={() => roomStore.createGame()}
              iconPlacement='end'
              className={cn(allPlayersReady ? animations.pulseReady : '')}
            >
          Начать
            </PinkGradientButton>
          ) : null}
      </Flex>
    </PageContainer>
  );
});
