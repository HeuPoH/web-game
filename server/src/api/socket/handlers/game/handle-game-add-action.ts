import type { GameActionPayload } from '@game/shared-types';

import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForGame, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';

import type { TypedGameSocket } from '../../types.js';

export function handleGameAddAction(
  socket: TypedGameSocket,
  container: IContainer,
) {
  return (data: GameActionPayload) => {
    const { userId, roomId } = socket.data;
    try {
      const roomsService = container.getSilent(IRoomsService);
      const game = assert(roomsService.get(roomId)?.getGame());
      game.addAction(userId, data);

      logger.info(
        { socketId: socket.id, userId, roomId, data },
        getTextForGame('Action was added'),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      socket.emit('error', error.message || 'Не удалось добавить команду');
      logger.error(
        { err: error, socketId: socket.id, userId, roomId },
        getTextForGame('Action was not added'),
      );
    }
  };
}
