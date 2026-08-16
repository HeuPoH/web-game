/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExtendedError } from 'socket.io';

import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { IRoomsService } from '~/services/rooms-service.js';

import type { TypedGameSocket } from '../types.js';

export function createSocketGameMiddleware(container: IContainer) {
  return (socket: TypedGameSocket, next: (err?: ExtendedError) => void) => {
    try {
      const { roomId, userId } = socket.data;
      const room = assert(container.getSilent(IRoomsService).get(roomId));
      const game = room.getGame();

      if (!game.isMember(userId)) {
        throw new Error('Вы не состоите в игре');
      }

      if (room.getStatus() !== 'game') {
        throw new Error('Игра еще не началась');
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
}
