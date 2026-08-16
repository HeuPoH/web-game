import type { LobbyState, LobbyPlayer } from '../lobby/types.js';
import type { ClientGameState, ServerPacket } from '../game/state.js';
import type { ActionType, GameActionPayload, GamePlayerIdentity, GameStatusChangedData, SelfPlayerChangedData } from '../game/types.js';
import { ChatMessage } from '../chat.js';

// Lobby events
export interface LobbyServerToClientEvents {
  error: (message: string) => void;
  willClose: (reason: { message: string }) => void;
  lobbyInitialized: (lobby: LobbyState) => void;
  playerReadyChanged: (player: { playerId: string; isReady: boolean }) => void;
  playersListUpdated: (players: LobbyPlayer[]) => void;
  gameCreated: (data: { gameId: string }) => void;
  chatMessage: (data: { message: ChatMessage }) => void;
}

export interface LobbyClientToServerEvents {
  setReady: (data: { ready: boolean }) => void;
  leave: () => void;
  createGame: () => void;
  chatMessage: (data: { message: string }) => void;
}

// Game events
export interface GameServerToClientEvents {
  error: (message: string) => void;
  willClose: (reason: { message: string }) => void;
  gameInitialized: (data: { game: ClientGameState }) => void;
  tickProcessed: (data: ServerPacket) => void;
  selfPlayerUpdated: (data: SelfPlayerChangedData) => void;
  gameStatusChanged: (data: GameStatusChangedData) => void;
  playersListUpdated: (data: { players: GamePlayerIdentity[] }) => void;
  chatMessage: (data: { message: ChatMessage }) => void;
}

export interface GameClientToServerEvents {
  leave: () => void;
  addCommand: (data: GameActionPayload) => void;
  deleteCommands: (data: { commandIds: string[] }) => void;
  chatMessage: (data: { message: string }) => void;
}
