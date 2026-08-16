import EventEmitter from 'node:events';

import type { LobbyPlayer } from '@game/shared-types';

import type { LobbyEmitterEvents } from './types.js';

export type LobbyState = {
  players: LobbyPlayer[];
};

export class LobbyEntity {
  private state: LobbyState = { players: [] };
  private emitter = new EventEmitter<LobbyEmitterEvents>();

  getEmitter() {
    return this.emitter;
  }

  getState() {
    return this.state;
  }

  isMember(playerId: string) {
    return this.state.players.some(p => p.userId === playerId);
  }

  join(player: LobbyPlayer) {
    if (this.isMember(player.userId)) {
      return;
    }

    this.state.players.push(player);
    this.emitter.emit('playersListUpdated', this.state.players);
  }

  leave(playerId: string) {
    if (!this.isMember(playerId)) {
      return;
    }

    this.state.players = this.state.players.filter(p => p.userId !== playerId);
    this.emitter.emit('playersListUpdated', this.state.players);
  }

  clear() {
    this.state.players = [];
    this.emitter.emit('playersListUpdated', this.state.players);
  }

  isEmpty() {
    return this.state.players.length === 0;
  }

  setReadyFlag(playerId: string, flag: boolean) {
    if (!this.isMember(playerId)) {
      return;
    }

    const player = this.state.players.find(p => p.userId === playerId)!;
    if (player.isReady === flag) {
      return;
    }

    player.isReady = flag;
    this.emitter.emit('playerReadyChanged', playerId, flag);
  }
}
