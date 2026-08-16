/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExtendedError } from 'socket.io';

import type { IContainer } from '~/lib/container.js';
import { IRoomsService } from '~/services/rooms-service.js';

import { assert } from '../../../lib/assert.js';
import type { TypedLobbySocket } from '../types.js';

export function createSocketLobbyMiddleware(container: IContainer) {
  return (socket: TypedLobbySocket, next: (err?: ExtendedError) => void) => {
    try {
      const { roomId, userId } = socket.data;
      const roomsService = container.getSilent(IRoomsService);
      const room = assert(roomsService.get(roomId));

      const lobby = room.getLobby();
      if (!lobby.isMember(userId)) {
        throw new Error('Сначала необходимо войти в комнату');
      }

      if (room.getStatus() !== 'lobby') {
        throw new Error('Игра уже началась');
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
}
