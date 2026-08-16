import { Manager, type ManagerOptions, type SocketOptions } from 'socket.io-client';
import type { TypedGameSocket, TypedLobbySocket } from './types';

const options: Partial<ManagerOptions & SocketOptions>  = {
  path: `${import.meta.env.VITE_API_URL}/socket.io`,
  withCredentials: true,
  autoConnect: false,
  ackTimeout: 10000
};

const manager = new Manager(options);
export const lobbySocket: TypedLobbySocket = manager.socket('/lobby', options);
export const gameSocket: TypedGameSocket = manager.socket('/game', options);
