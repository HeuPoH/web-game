import type { ExtendedError, Socket } from 'socket.io';

import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { logger } from '~/lib/logger.js';
import { IUserService } from '~/services/users-service.js';

import { tryExtractUserDataFromSocket } from './helper.js';

export function createSocketAuthMiddleware(container: IContainer) {
  return (socket: Socket, next: (err?: ExtendedError) => void) => {
    try {
      const userData = tryExtractUserDataFromSocket(socket);
      const user = assert(
        container.getSilent(IUserService).getUserById(userData.id),
        'Пользователь не найден',
      );

      socket.data.userId = user.id;
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.warn({ err: error, socketId: socket.id }, 'Socket auth failed');
      next(error);
    }
  };
}
