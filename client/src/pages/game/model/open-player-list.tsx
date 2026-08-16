import { observer } from 'mobx-react-lite';
import { defer } from '../../../shared/utils';
import { ConfirmModal, PlayerList } from '../../../shared/ui';
import { usePlayerSelf } from '../../../entities/game';
import { useGameStore } from '../../../app/providers/store-provider';

export const openPlayerList = (hostId: string) => {
  defer<void>((res, container) => (
    <PlayerListWrapper
      hostId={hostId}
      onClose={res}
      container={container}
    />
  ));
};

type Props = {
  onClose(): void;
  container: HTMLElement;
  hostId: string;
};

const PlayerListWrapper: React.FC<Props> = observer(({ onClose, hostId, container }) => {
  const game = useGameStore();
  const players = game.getPlayersIdentity();
  const playerSelf = usePlayerSelf();

  return (
    <ConfirmModal
      container={container}
      okText='Закрыть'
      onOk={onClose}
    >
      <PlayerList
        title='Игроки'
        selfUserId={playerSelf.getId()}
        players={players}
        hostId={hostId}
      />
    </ConfirmModal>
  );
});
