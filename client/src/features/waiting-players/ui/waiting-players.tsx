import React from 'react';
import { observer } from 'mobx-react-lite';

import { Modal, PlayerList } from '../../../shared/ui';
import { defer } from '../../../shared/utils';
import { useGameStore } from '../../../app/providers/store-provider';

export function openWaitingPlayers(abortSignal: AbortSignal) {
  return defer<void>((_, container) => {
    return (
      <Modal
        closable={false}
        footer={null}
        getContainer={container}
      >
        <WaitingPlayers />
      </Modal>
    );
  }, abortSignal);
}

const WaitingPlayers: React.FC = observer(() => {
  const game = useGameStore();
  const players = game.getPlayersIdentity().filter(p => !p.connected);

  return (
    <PlayerList
      hostId=''
      title='Ожидание подключения игроков'
      disconnectedText='Подключается'
      players={players ?? []}
    />
  );
});
