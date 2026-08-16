import type {
  GameClientToServerEvents,
  GameServerToClientEvents,
  LobbyClientToServerEvents,
  LobbyServerToClientEvents,
} from '@game/shared-types';
import type { Namespace, Socket as BaseSocket } from 'socket.io';

// Данные, прикреплённые к сокету (socket.data)
interface SocketData {
  roomId: string;
  userId: string;
}

export type TypedLobbyServer = Namespace<
  LobbyClientToServerEvents,
  LobbyServerToClientEvents
>;

export type TypedLobbySocket = BaseSocket<
  LobbyClientToServerEvents,
  LobbyServerToClientEvents,
  object,
  SocketData
>;

export type TypedGameServer = Namespace<
  GameClientToServerEvents,
  GameServerToClientEvents
>;

export type TypedGameSocket = BaseSocket<
  GameClientToServerEvents,
  GameServerToClientEvents,
  object,
  SocketData
>;

export type TypedSocket = BaseSocket;
