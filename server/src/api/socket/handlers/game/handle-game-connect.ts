/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  GamePlayerIdentity,
  GameStatusChangedData,
  ServerPacket,
} from '@game/shared-types';

import { assert } from '~/lib/assert.js';
import type { IContainer } from '~/lib/container.js';
import { getTextForGame, logger } from '~/lib/logger.js';
import type { PrivatePlayerState } from '~/models/rooms/types.js';
import { IRoomsService } from '~/services/rooms-service.js';
import { ISocketService } from '~/services/socket-service.js';

import type { TypedGameSocket } from '../../types.js';

export function handleGameConnect(
  socket: TypedGameSocket,
  container: IContainer,
  registerListeners: () => void,
) {
  try {
    const socketService = container.getSilent(ISocketService);
    const roomsService = container.getSilent(IRoomsService);

    const { roomId, userId } = socket.data;
    logger.info(
      { socketId: socket.id, userId, roomId },
      getTextForGame('Game socket connected'),
    );

    socketService.clearDisconnectTimer(userId);
    socketService.registerOrReplace(userId, socket);

    registerListeners();
    socket.join(roomId);

    const room = assert(roomsService.get(roomId));
    const game = room.getGame();
    if (!game) {
      throw new Error('Игра не найдена');
    }

    const emitter = game.getEmitter();
    const handlers: Array<[string, (...args: any[]) => void]> = [];

    const onPlayerListUpdated = (players: GamePlayerIdentity[]) => {
      socket.emit('playersListUpdated', { players });
    };
    emitter.on('playerListUpdated', onPlayerListUpdated);
    handlers.push(['playerListUpdated', onPlayerListUpdated]);

    const onTickProcessed = (packet: Omit<ServerPacket, 'self'>) => {
      const player = game.getPlayers().find(p => p.getId() === userId)!;
      socket.emit('tickProcessed', {
        ...packet,
        self: player.serialize().self,
      });
    };
    emitter.on('tickProcessed', onTickProcessed);
    handlers.push(['tickProcessed', onTickProcessed]);

    const onSelfPlayerUpdated = (data: PrivatePlayerState) => {
      if (data.userId === userId) {
        socket.emit('selfPlayerUpdated', {
          queue: data.queue,
          slots: data.slots,
        });
      }
    };
    emitter.on('selfPlayerUpdated', onSelfPlayerUpdated);
    handlers.push(['selfPlayerUpdated', onSelfPlayerUpdated]);

    // Изменение статуса игры
    const onGameStatusChanged = (data: GameStatusChangedData) => {
      socket.emit('gameStatusChanged', data);
      if (data.status === 'finished') {
        cleanup();
      }
    };
    emitter.on('gameStatusChanged', onGameStatusChanged);
    handlers.push(['gameStatusChanged', onGameStatusChanged]);

    const cleanup = () => {
      for (const [event, handler] of handlers) {
        emitter.off(event, handler);
      }
    };

    socket.once('disconnect', cleanup);

    // Начальное состояние для только что подключившегося клиента
    const gameState = game.getClientState(userId);
    socket.emit('gameInitialized', { game: gameState });
    game.setConnectedFlag(userId, true);
    logger.info(
      { socketId: socket.id, userId, roomId },
      getTextForGame('Game initialized'),
    );
  } catch (error: any) {
    logger.warn(
      {
        err: error,
        socketId: socket.id,
        roomId: socket.data?.roomId,
        userId: socket.data?.userId,
      },
      getTextForGame('Game connect failed'),
    );
    socket.emit('error', error.message || 'Неизвестная ошибка');
  }
}
