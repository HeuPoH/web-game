/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForLobby, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { ISocketService } from '~/services/socket-service.js';

import type { TypedLobbySocket } from '../../types.js';

export function handleLobbyLeave(
  socket: TypedLobbySocket,
  container: IContainer,
) {
  return () => {
    const { roomId, userId } = socket.data;
    const roomsService = container.getSilent(IRoomsService);
    const socketService = container.getSilent(ISocketService);

    try {
      const room = assert(roomsService.get(roomId));
      if (room.getStatus() === 'game') {
        socketService.unregister(userId, roomId);
        return;
      }

      const lobby = room.getLobby();
      const prevPlayers = lobby.getState().players;
      lobby.leave(userId);

      const roomClosed = room.isEmpty();
      if (roomClosed) {
        const reason = `Комната закрыта, так как хост вышел из неё`;
        for (const player of prevPlayers) {
          socketService.unregister(player.userId, roomId, reason);
        }
        roomsService.delete(roomId);

        logger.info(
          { socketId: socket.id, userId, roomId },
          getTextForLobby('Room was closed because the host left the room'),
        );
      } else {
        socketService.unregister(userId, roomId);
      }

      logger.info(
        { socketId: socket.id, userId, roomId, roomClosed },
        getTextForLobby('Lobby leave processed'),
      );
    } catch (error: any) {
      logger.warn(
        {
          err: error,
          socketId: socket.id,
          roomId,
          userId,
        },
        getTextForLobby('Lobby leave failed'),
      );
      socket.emit('error', error.message || 'Неизвестная ошибка');
    }
  };
}
