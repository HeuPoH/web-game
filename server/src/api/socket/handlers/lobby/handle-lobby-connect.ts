/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LobbyPlayer } from '@game/shared-types';

import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForLobby, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { ISocketService } from '~/services/socket-service.js';

import type { TypedLobbySocket } from '../../types.js';

export function handleLobbyConnect(
  socket: TypedLobbySocket,
  container: IContainer,
  registerListeners: () => void,
) {
  try {
    const socketService = container.getSilent(ISocketService);
    const roomsService = container.getSilent(IRoomsService);

    const { roomId, userId } = socket.data;
    logger.info(
      { socketId: socket.id, userId, roomId },
      getTextForLobby('Lobby socket connected'),
    );
    socketService.registerOrReplace(userId, socket);

    registerListeners();

    socket.join(roomId);

    const room = assert(roomsService.get(roomId));
    const lobby = room.getLobby();

    const onPlayersListUpdated = (players: LobbyPlayer[]) => {
      socket.emit('playersListUpdated', players);
    };
    const onPlayerReadyChanged = (playerId: string, isReady: boolean) => {
      socket.emit('playerReadyChanged', { playerId, isReady });
    };

    const emitter = lobby.getEmitter();
    emitter.on('playersListUpdated', onPlayersListUpdated);
    emitter.on('playerReadyChanged', onPlayerReadyChanged);

    const handlers: Array<[string, (...args: any[]) => void]> = [
      ['playersListUpdated', onPlayersListUpdated],
      ['playerReadyChanged', onPlayerReadyChanged],
    ];

    const cleanup = () => {
      for (const [event, handler] of handlers) {
        emitter.off(event as any, handler);
      }
    };

    socket.once('disconnect', cleanup);

    const lobbyState = lobby.getState();
    socket.emit('lobbyInitialized', lobbyState);

    socket.to(roomId).emit('playersListUpdated', lobbyState.players);
    logger.info(
      { socketId: socket.id, userId, roomId },
      getTextForLobby('Lobby initialized'),
    );
  } catch (error: any) {
    logger.warn(
      {
        err: error,
        socketId: socket.id,
        roomId: socket.data?.roomId,
        userId: socket.data?.userId,
      },
      getTextForLobby('Lobby connect failed'),
    );
    socket.emit('error', error.message || 'Неизвестная ошибка');
  }
}
