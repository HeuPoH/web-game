import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForGame, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { ISocketService } from '~/services/socket-service.js';

import type { TypedGameSocket } from '../../types.js';

export function handleGameDisconnect(
  socket: TypedGameSocket,
  container: IContainer,
) {
  return () => {
    const { userId, roomId } = socket.data;
    const socketService = container.getSilent(ISocketService);
    const roomsService = container.getSilent(IRoomsService);
    const room = assert(roomsService.get(roomId));
    const game = room.getGame();

    game.setConnectedFlag(userId, false);

    logger.info(
      { socketId: socket.id, userId, roomId },
      getTextForGame('Game socket disconnect scheduled'),
    );

    const onDisconnectTimeout = () => {
      try {
        game.leave(userId);
        socketService.unregister(userId, roomId);
        if (room.isEmpty()) {
          roomsService.delete(roomId);
        }
        logger.info(
          { socketId: socket.id, userId, roomId },
          getTextForGame('Game disconnect timeout processed'),
        );
      } catch {
        // комната уже удалена – ничего не делаем
      }
    };

    socketService.startDisconnectTimer(userId, onDisconnectTimeout);
  };
}
