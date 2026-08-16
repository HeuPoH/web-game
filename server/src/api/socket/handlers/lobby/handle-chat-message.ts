/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForLobby, logger } from '~/lib/logger.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { IUserService } from '~/services/users-service.js';

import type { TypedLobbySocket } from '../../types.js';

export function handleChatMessage(
  socket: TypedLobbySocket,
  container: IContainer,
) {
  return (data: { message: string }) => {
    const { roomId, userId } = socket.data;
    try {
      const users = assert(container.getSilent(IUserService));
      const user = users.getUserById(userId);
      if (!user) {
        logger.error(
          { socketId: socket.id, userId, roomId },
          getTextForLobby('User is not found'),
        );
        return;
      }

      const room = assert(container.getSilent(IRoomsService).get(roomId));
      const chat = room.getChat();
      const message = chat.add({ message: data.message, login: user?.login });

      socket.emit('chatMessage', { message });
      socket.to(roomId).emit('chatMessage', { message });

      logger.info(
        { socketId: socket.id, userId, roomId, message: data.message },
        getTextForLobby('New message was added'),
      );
    } catch (error: any) {
      socket.emit('error', error.message || 'Неизвестная ошибка');
      logger.warn(
        { err: error, socketId: socket.id, userId, roomId },
        getTextForLobby('New message was not added'),
      );
    }
  };
}
