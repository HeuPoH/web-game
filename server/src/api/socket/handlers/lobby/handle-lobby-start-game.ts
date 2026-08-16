import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForLobby, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';

import type { TypedLobbySocket } from '../../types.js';

export function handleLobbyStartGame(
  socket: TypedLobbySocket,
  container: IContainer,
) {
  return async () => {
    try {
      const { roomId, userId } = socket.data;
      const roomsService = container.getSilent(IRoomsService);

      const room = assert(roomsService.get(roomId));
      if (!room.isHost(userId)) {
        throw new Error('Только хост может начать игру');
      }

      room.startGame(userId);

      const game = room.getGame();
      if (!game) {
        throw new Error('Не удалось создать игру');
      }

      logger.info(
        { socketId: socket.id, userId, roomId },
        getTextForLobby('Starting game from lobby'),
      );

      socket.to(roomId).emit('gameCreated', { gameId: roomId });
      socket.emit('gameCreated', { gameId: roomId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn(
        {
          err: error,
          socketId: socket.id,
          roomId: socket.data?.roomId,
          userId: socket.data?.userId,
        },
        getTextForLobby('Lobby game start failed'),
      );
      socket.emit('error', error.message || 'Не удалось начать игру');
    }
  };
}
