import type { ExtendedError, Socket } from 'socket.io';

import type { IContainer } from '~/lib/container.js';
import { IRoomsService } from '~/services/rooms-service.js';

import { assert } from '../../../lib/assert.js';

export function createSocketRoomMiddleware(container: IContainer) {
  return (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
    try {
      const query = socket.handshake.query;
      const roomId = query.roomId;
      if (!roomId || typeof roomId !== 'string') {
        throw new Error('Комната не найдена');
      }

      const room = assert(container.getSilent(IRoomsService).get(roomId));
      const roomState = assert(room.getState());

      socket.data.roomId = roomState.id;
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      next(error);
    }
  };
}
