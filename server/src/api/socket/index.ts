import type { Server } from 'socket.io';

import type { IContainer } from '~/lib/container.js';
import { logger } from '~/lib/logger.js';

import { handleChatMessage as handleGameChatMessage } from './handlers/game/handle-chat-message.js';
import { handleGameAddAction } from './handlers/game/handle-game-add-action.js';
import { handleGameConnect } from './handlers/game/handle-game-connect.js';
import { handleGameDeleteAction } from './handlers/game/handle-game-delete-action.js';
import { handleGameDisconnect } from './handlers/game/handle-game-disconnect.js';
import { handleGameLeave } from './handlers/game/handle-game-leave.js';
import { handleChatMessage as handleLobbyChatMessage } from './handlers/lobby/handle-chat-message.js';
import { handleLobbyChangePlayerReady } from './handlers/lobby/handle-lobby-change-ready.js';
import { handleLobbyConnect } from './handlers/lobby/handle-lobby-connect.js';
import { handleLobbyDisconnect } from './handlers/lobby/handle-lobby-disconnect.js';
import { handleLobbyLeave } from './handlers/lobby/handle-lobby-leave.js';
import { handleLobbyStartGame } from './handlers/lobby/handle-lobby-start-game.js';
import { createSocketAuthMiddleware } from './middlewares/socket-auth-middleware.js';
import { createSocketGameMiddleware } from './middlewares/socket-game-middleware.js';
import { createSocketLobbyMiddleware } from './middlewares/socket-lobby-middleware.js';
import { createSocketRoomMiddleware } from './middlewares/socket-room-middleware.js';
import type {
  TypedGameServer,
  TypedGameSocket,
  TypedLobbyServer,
  TypedLobbySocket,
} from './types.js';

export function initSocket(io: Server, container: IContainer) {
  const lobbyNamespace = io.of('/lobby');
  const gameNamespace = io.of('/game');

  initLobbySocket(lobbyNamespace, container);
  initGameSocket(gameNamespace, container);

  return { lobbyNamespace, gameNamespace };
}

function initLobbySocket(io: TypedLobbyServer, container: IContainer) {
  io.use(createSocketAuthMiddleware(container));
  io.use(createSocketRoomMiddleware(container));
  io.use(createSocketLobbyMiddleware(container));

  io.on('connect', (socket: TypedLobbySocket) => {
    logger.info(
      { socketId: socket.id, namespace: 'lobby' },
      'Socket connected',
    );
    handleLobbyConnect(socket, container, () => {
      socket.on('disconnect', handleLobbyDisconnect(socket, container));
      socket.on('chatMessage', handleLobbyChatMessage(socket, container));
      socket.on('setReady', handleLobbyChangePlayerReady(socket, container));
      socket.on('leave', handleLobbyLeave(socket, container));
      socket.on('createGame', handleLobbyStartGame(socket, container));
    });
  });
}

function initGameSocket(io: TypedGameServer, container: IContainer) {
  io.use(createSocketAuthMiddleware(container));
  io.use(createSocketRoomMiddleware(container));
  io.use(createSocketGameMiddleware(container));

  io.on('connect', (socket: TypedGameSocket) => {
    logger.info({ socketId: socket.id, namespace: 'game' }, 'Socket connected');
    handleGameConnect(socket, container, () => {
      socket.on('deleteCommands', handleGameDeleteAction(socket, container));
      socket.on('disconnect', handleGameDisconnect(socket, container));
      socket.on('chatMessage', handleGameChatMessage(socket, container));
      socket.on('addCommand', handleGameAddAction(socket, container));
      socket.on('leave', handleGameLeave(socket, container));
    });
  });
}
