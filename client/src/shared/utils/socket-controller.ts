/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Socket } from 'socket.io-client';

export class SocketController<T extends Record<string, (data: any) => any>> {
  private handlers?: T;

  constructor(protected socket: Socket) {}

  registerHandlers(handlers: T) {
    this.handlers = handlers;
    const events = Object.keys(handlers) as string[];
    events.forEach(event => {
      this.socket.on(event, handlers[event]);
    });
  }

  unregisterHandlers() {
    if (!this.handlers) {
      return;
    }

    const events = Object.keys(this.handlers) as string[];
    events.forEach(event => {
      this.socket.off(event, this.handlers![event]);
    });

    this.handlers = undefined;
  }

  isSocketActive() {
    return this.socket.active;
  }

  disconnect() {
    this.socket.disconnect();
  }
}
