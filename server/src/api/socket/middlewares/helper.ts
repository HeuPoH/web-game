import type { Socket } from 'socket.io';

import { TOKEN_KEY } from '~/api/controllers/auth-controller.js';
import { assert } from '~/lib/assert.js';
import { logger } from '~/lib/logger.js';
import { extractParam } from '~/lib/string.js';
import { getUserDataFromToken, verifyToken } from '~/services/jwt-token.js';

export function tryExtractUserDataFromSocket(socket: Socket) {
  const cookie = assert(socket.handshake.headers.cookie, 'Не установлены куки');

  const token = extractParam(cookie, TOKEN_KEY);
  if (!token || !verifyToken(token)) {
    logger.warn(
      { socketId: socket.id },
      'Socket authentication token is invalid',
    );
    throw new Error('Невалидный токен');
  }

  return assert(getUserDataFromToken(token), 'Невалидный токен');
}
