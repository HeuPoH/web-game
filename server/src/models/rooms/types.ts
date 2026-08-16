import type {
  ActionBarState,
  GameAction,
  GamePlayerIdentity,
  GameStatus,
  LobbyPlayer,
  ServerPacket,
  Winner,
} from '@game/shared-types';

import { getGameEntitiesFactory } from './game/game-entities/game-entities-factory.js';
export type NewPlayer = {
  userId: string;
  login: string;
};

export interface GamePlayerData {
  userId: string;
  login: string;
  connected: boolean;
  color: number;
}

export interface PrivatePlayerState {
  userId: string;
  queue: GameAction[];
  slots: ActionBarState;
}

export type LobbyEmitterEvents = {
  playersListUpdated: [LobbyPlayer[]];
  playerReadyChanged: [string, boolean];
};

export type GameEmitterEvents = {
  tickProcessed: [Omit<ServerPacket, 'self'>];
  selfPlayerUpdated: [PrivatePlayerState];
  playerListUpdated: [GamePlayerIdentity[]];
  gameStatusChanged: [
    { status: GameStatus; winners?: Winner[]; ticks?: number },
  ];
};

export const roomLevels = getGameEntitiesFactory()
  .getAllRegistered()
  .map(m => m.type);

export type RoomEntityOwner = {
  registerPlayerRoom(playerId: string, roomId: string): void;
  unregisterPlayerRoom(playerId: string): void;
  isPlayerInAnyRoom(playerId: string): boolean;
};
