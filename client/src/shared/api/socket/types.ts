import type {
  GameClientToServerEvents,
  GameServerToClientEvents,
  LobbyClientToServerEvents,
  LobbyServerToClientEvents
} from '@game/shared-types';
import { type Socket } from 'socket.io-client';

// Базовый интерфейс общих событий (со стороны сервера)
interface CommonServerToClientEvents {
  /** Отправляется перед закрытием сокета */
  willClose: (reason: { message: string }) => void;
  /** Ошибка сервера */
  error: (message: string) => void;
}

export type TypedLobbySocket = Socket<
  LobbyServerToClientEvents,
  LobbyClientToServerEvents
>;

export type TypedGameSocket = Socket<
  GameServerToClientEvents,
  GameClientToServerEvents
>;

export type TypedCommonSocket = Socket<CommonServerToClientEvents>;
