/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForGame, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { ISocketService } from '~/services/socket-service.js';

import type { TypedGameSocket } from '../../types.js';

export function handleGameLeave(
  socket: TypedGameSocket,
  container: IContainer,
) {
  return () => {
    const { roomId, userId } = socket.data;
    try {
      const socketService = container.getSilent(ISocketService);
      const roomsService = container.getSilent(IRoomsService);
      const room = assert(roomsService.get(roomId));
      const game = room.getGame();

      socketService.unregister(userId, roomId);
      game.leave(userId);

      const roomClosed = room.isEmpty();
      if (roomClosed) {
        roomsService.delete(roomId);
        logger.info(
          { socketId: socket.id, userId, roomId },
          getTextForGame('Room was deleted'),
        );
      }
    } catch (error: any) {
      socket.emit('error', error.message || 'Неизвестная ошибка');
      logger.error(
        { err: error, socketId: socket.id, userId, roomId },
        getTextForGame('Player could not leave from room'),
      );
    }
  };
}
