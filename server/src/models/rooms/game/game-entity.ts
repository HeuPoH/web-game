import EventEmitter from 'node:events';

import type {
  DynamicObject,
  Field,
  GameAction,
  GameEvent,
  GamePlayerIdentity,
  GamePlayerRenderData,
  GameStatus,
  GameStatusChangedData,
  LobbyPlayer,
  ServerPacket,
} from '@game/shared-types';

import type { GameEmitterEvents } from '../types.js';
import { TimerController } from './game-entities/timer-controller.js';
import type { GamePlayerEntity } from './game-player-entity.js';
import type { ISerializable } from './serializable.js';
import type { GameOwner } from './types.js';
import { WorldManager } from './world-manager.js';

export abstract class GameEntity implements ISerializable<{
  state: {
    field: Field;
    players: GamePlayerRenderData[];
    dynamicObjects: DynamicObject[];
  };
  playersIdentity: GamePlayerIdentity[];
}> {
  protected timer = new TimerController(this);
  protected worldManager = new WorldManager();
  protected gameStarted = false;
  protected emitter = new EventEmitter<GameEmitterEvents>();
  protected status: GameStatus = 'waiting';
  protected pendingEvents: GameEvent[] = [];

  protected tick = 0;
  protected players: GamePlayerEntity[] = [];

  constructor(protected gameOwner: GameOwner) {}

  abstract initialize(players: LobbyPlayer[]): void;
  protected abstract processTickImpl(): void;

  getStatus() {
    return this.status;
  }

  serialize() {
    const playersIdentity: GamePlayerIdentity[] = [];
    const playersRenderData: GamePlayerRenderData[] = [];

    for (const p of this.players) {
      const { identity, renderData } = p.serialize();
      playersIdentity.push(identity);
      playersRenderData.push(renderData);
    }

    return {
      playersIdentity,
      state: {
        ...this.worldManager.serialize(),
        players: playersRenderData,
      },
    };
  }

  processTick() {
    if (this.status !== 'playing') {
      return;
    }

    this.tick++;
    this.processTickImpl();
  }

  dispose() {
    this.timer.stopLoop();
  }

  getPlayers() {
    return this.players;
  }

  getEmitter() {
    return this.emitter;
  }

  setConnectedFlag(playerId: string, flag: boolean) {
    const player = this.players.find(p => p.getId() === playerId);
    if (!player) {
      return;
    }

    if (!player.setConnectedFlag(flag)) {
      return;
    }

    const data = this.players.map(player => player.serialize().identity);
    this.emitter.emit('playerListUpdated', data);

    const allConnected = this.allConnected();
    const nextStatus = allConnected ? 'playing' : 'waiting';
    this.updateGameStatus({ status: nextStatus });
  }

  leave(playerId: string) {
    this.players = this.players.filter(p => p.getId() !== playerId);
    if (this.status === 'finished') {
      return;
    }

    const data = this.players.map(player => player.serialize().identity);
    this.emitter.emit('playerListUpdated', data);

    if (this.players.length === 0) {
      this.updateGameStatus({ status: 'finished', winners: [] });
    } else {
      const allConnected = this.allConnected();
      const nextStatus = allConnected ? 'playing' : 'waiting';
      this.updateGameStatus({ status: nextStatus });
    }
  }

  deleteActions(playerId: string, actionIds: string[]) {
    if (!this.isMember(playerId)) {
      return;
    }

    const player = this.players.find(p => p.getId() === playerId);
    if (!player) {
      return;
    }

    if (player.deleteActions(actionIds)) {
      this.emitter.emit('selfPlayerUpdated', player.serialize().self);
    }
  }

  addAction(playerId: string, action: GameAction) {
    if (!this.isMember(playerId)) {
      return;
    }

    if (this.status !== 'playing') {
      return;
    }

    const player = this.players.find(p => p.getId() === playerId);
    if (!player) {
      return;
    }

    player.addAction(action);
    this.emitter.emit('selfPlayerUpdated', player.serialize().self);
  }

  isMember(playerId: string): boolean {
    return this.players.some(p => p.getId() === playerId);
  }

  isEmpty(): boolean {
    return this.players.length === 0;
  }

  protected allConnected(): boolean {
    return this.players.every(p => p.isConnected());
  }

  protected updateGameStatus({ status, winners }: GameStatusChangedData) {
    if (this.status === status) {
      return;
    }

    if (status === 'playing' && !this.gameStarted) {
      this.gameStarted = true;
      this.timer.startLoop(1000);
    }

    const data: GameStatusChangedData = { status };
    if (status === 'finished') {
      this.timer.stopLoop();
      data.winners = winners;
      data.ticks = this.tick;
    }

    this.status = status;
    this.emitter.emit('gameStatusChanged', data);
  }

  protected getTickState(): Omit<ServerPacket, 'self'> {
    const { state } = this.serialize();
    return {
      tick: this.tick,
      events: this.pendingEvents,
      state: {
        players: state.players,
        dynamicObjects: state.dynamicObjects,
      },
    };
  }
}
