import type { LobbyPlayer } from '@game/shared-types';

import { EmptySlot } from '../player/empty-slot';
import { Player } from '../player/player';

import classes from './style.module.css';

type Props = {
  hostId: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  selfUserId: string;
  setReady: (ready: boolean) => void;
  onKick?: (userId: string) => void;
};

export const Players: React.FC<Props> = ({ players, hostId, selfUserId, maxPlayers, setReady, onKick }) => {
  const renderEmptySlots = () => {
    if (players.length === maxPlayers) {
      return null;
    }
    const slots = new Array(maxPlayers - players.length).fill(null);
    return slots.map((_, i) => <EmptySlot key={`empty-${i}`} />);
  };

  return (
    <div className={classes.players}>
      {players.map((player) => (
        <Player
          key={player.userId}
          selfUserId={selfUserId}
          setReady={setReady}
          hostId={hostId}
          player={player}
          onKick={onKick}
        />
      ))}
      {renderEmptySlots()}
    </div>
  );
};
