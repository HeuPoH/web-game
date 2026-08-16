/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForLobby, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';

import type { TypedLobbySocket } from '../../types.js';

export function handleLobbyChangePlayerReady(
  socket: TypedLobbySocket,
  container: IContainer,
) {
  return (data: { ready: boolean }) => {
    const { roomId, userId } = socket.data;
    try {
      const room = assert(container.getSilent(IRoomsService).get(roomId));
      const lobby = room.getLobby();
      lobby.setReady(userId, data.ready);

      logger.info(
        { socketId: socket.id, userId, roomId },
        getTextForLobby('Lobby socket flag ready changed'),
      );
    } catch (error: any) {
      socket.emit('error', error.message || 'Неизвестная ошибка');
      logger.warn(
        { err: error, socketId: socket.id, userId, roomId },
        getTextForLobby('Lobby socket flag ready is not changed'),
      );
    }
  };
}
