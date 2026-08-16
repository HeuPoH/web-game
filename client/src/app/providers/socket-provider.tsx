import { createContext, useContext } from 'react';

import { gameSocket, lobbySocket, type TypedGameSocket, type TypedLobbySocket } from '../../shared/api';

type SocketContextData = {
  lobby: TypedLobbySocket;
  game: TypedGameSocket;
};

const sockets: SocketContextData = {
  lobby: lobbySocket,
  game: gameSocket
};

const SocketContext = createContext<SocketContextData>(sockets);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => (
  <SocketContext.Provider value={sockets}>{children}</SocketContext.Provider>
);

const useSocket = () => {
  return useContext(SocketContext);
};

export const useLobbySocket = () => {
  return useSocket().lobby;
};

export const useGameSocket = () => {
  return useSocket().game;
};
