import type { ClientGameState, GameActionPayload } from '@game/shared-types';

import type { GameEntity } from './game/game-entity.js';
import type { GamePlayerEntity } from './game/game-player-entity.js';
import type { RoomEntity } from './room-entity.js';

export type IGameFacade = {
  getEmitter: () => ReturnType<GameEntity['getEmitter']>;
  processTick: () => ReturnType<GameEntity['processTick']>;
  addAction: (playerId: string, action: GameActionPayload) => void;
  deleteActions: (playerId: string, actionIds: string[]) => void;
  leave: (playerId: string) => void;
  setConnectedFlag: (playerId: string, connected: boolean) => void;
  isMember: (playerId: string) => boolean;
  getPlayers: () => GamePlayerEntity[];
  getClientState: (userId: string) => ClientGameState;
};

export function createGameFacade(
  room: RoomEntity,
  game: GameEntity,
): IGameFacade {
  const owner = room.getOwner();
  return {
    getEmitter: () => {
      return game.getEmitter();
    },
    processTick: () => {
      return game.processTick();
    },
    addAction: (playerId: string, action: GameActionPayload) => {
      const timestamp = Date.now();
      return game.addAction(playerId, {
        ...action,
        id: `${playerId}-${timestamp}`,
        timestamp,
      });
    },
    deleteActions: (playerId: string, actionIds: string[]) => {
      return game.deleteActions(playerId, actionIds);
    },
    leave: (playerId: string) => {
      if (!game.isMember(playerId)) {
        throw new Error('Вы не являетесь участником комнаты');
      }

      game.leave(playerId);

      if (game.isEmpty()) {
        room.removeGame();
      }

      owner.unregisterPlayerRoom(playerId);
    },
    setConnectedFlag: (playerId: string, connected: boolean) => {
      return game.setConnectedFlag(playerId, connected);
    },
    isMember: (playerId: string) => {
      return game.isMember(playerId);
    },
    getPlayers: () => {
      return game.getPlayers();
    },
    getClientState: (userId: string): ClientGameState => {
      const { state, playersIdentity } = game.serialize();
      const settings = room.getState().settings;
      const selfPlayer = game.getPlayers().find(p => p.getId() === userId)!;

      return {
        players: playersIdentity,
        settings,
        state,
        status: game.getStatus(),
        self: selfPlayer.serialize().self,
      };
    },
  };
}
