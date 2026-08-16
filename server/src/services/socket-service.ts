import type { TypedSocket } from '~/api/socket/types.js';
import { createDecorator } from '~/lib/container.js';

export interface ISocketService {
  registerOrReplace(userId: string, socket: TypedSocket): void;
  unregister(userId: string, roomId: string, reason?: string): void;
  startDisconnectTimer(userId: string, onTimeout: () => void): void;
  clearDisconnectTimer(userId: string): void;
}

export class SocketService implements ISocketService {
  private readonly TIMEOUT = 60_000;
  private userSockets = new Map<string, TypedSocket>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();

  startDisconnectTimer(userId: string, onTimeout: () => void) {
    this.clearDisconnectTimer(userId);
    const timer = setTimeout(() => {
      this.disconnectTimers.delete(userId);
      try {
        onTimeout();
      } catch (error) {
        // Логируем ошибку, чтобы не терять информацию
        console.error(
          `[SocketService] Error in disconnect timer for user ${userId}:`,
          error,
        );
      }
    }, this.TIMEOUT);
    this.disconnectTimers.set(userId, timer);
  }

  clearDisconnectTimer(userId: string) {
    const timer = this.disconnectTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(userId);
    }
  }

  registerOrReplace(userId: string, socket: TypedSocket) {
    const existing = this.userSockets.get(userId);
    if (existing && existing !== socket) {
      existing.removeAllListeners();
      existing.disconnect(true);
    }
    this.userSockets.set(userId, socket);
  }

  unregister(userId: string, roomId: string, reason?: string) {
    this.clearDisconnectTimer(userId);
    const socket = this.userSockets.get(userId);
    if (socket) {
      if (reason) {
        socket.emit('willClose', { message: reason });
      }

      socket.leave(roomId);
      socket.disconnect(true);
      this.userSockets.delete(userId);
    }
  }
}

export const ISocketService = createDecorator<ISocketService>('ISocketService');
