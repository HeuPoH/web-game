import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForGame, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';

import type { TypedGameSocket } from '../../types.js';

export function handleGameDeleteAction(
  socket: TypedGameSocket,
  container: IContainer,
) {
  return (data: { commandIds: string[] }) => {
    const { userId, roomId } = socket.data;
    try {
      const roomsService = container.getSilent(IRoomsService);
      const game = assert(roomsService.get(roomId)?.getGame());
      game.deleteActions(userId, data.commandIds);
      logger.info(
        { socketId: socket.id, userId, roomId, data },
        getTextForGame('Actions were deleted'),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      socket.emit('error', error.message || 'Не удалось удалить команды');
      logger.error(
        { err: error, socketId: socket.id, userId, roomId, data },
        getTextForGame('Action were not added'),
      );
    }
  };
}
