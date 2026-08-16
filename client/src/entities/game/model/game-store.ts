import { makeAutoObservable, runInAction } from 'mobx';
import type {
  ChatMessage,
  ClientGameState,
  GamePlayerIdentity,
  GameStatus,
  GameStatusChangedData,
  RoomPreview,
  ServerPacket
} from '@game/shared-types';

import type { TypedGameSocket } from '../../../shared/api';
import { roomsAPI, type RoomModeStore } from '../../rooms';
import { PlayerSelf } from './player-self';
import { WorldManager } from './world-manager';
import { openGameResult } from '../../../features/game-result';
import type { ChatStore } from '../../chat';
import { PlayerSocketController } from './player-socket-controller';

export class GameStore implements RoomModeStore {
  private players: GamePlayerIdentity[] = [];
  private state = {
    status: 'waiting' as GameStatus,
    settings: {
      name: '',
      level: '',
      maxCommandsPerPlayer: 5,
    },
  };

  private playerSelf: PlayerSelf;
  private world: WorldManager;

  constructor(
    private socket: TypedGameSocket,
    playerId: string,
    private chatStore: ChatStore
  ) {
    makeAutoObservable(this);

    this.world = new WorldManager();
    this.playerSelf = new PlayerSelf(playerId, new PlayerSocketController(socket));
  }

  getPlayers() {
    return this.players;
  }

  getWorld(): WorldManager {
    return this.world;
  }

  getPlayerSelf(): PlayerSelf {
    return this.playerSelf;
  }

  getStatus(): GameStatus {
    return this.state.status;
  }

  getMaxActions(): number {
    return this.state.settings.maxCommandsPerPlayer;
  }

  isSocketActive(): boolean {
    return this.socket.active;
  }

  async init(preview: RoomPreview): Promise<void> {
    await new Promise<void>((res) => {
      this.registerSocketHandles();
      this.socket.once('connect', res);
      this.socket.io.opts.query = { roomId: preview.id };
      this.socket.connect();
    });

    const response = await roomsAPI().fetchChatMessages(preview.id);
    this.chatStore.prependMessages(response.messages);
  }

  dispose(): void {
    this.unregisterSocketHandles();
    this.socket.disconnect();
  }

  registerSocketHandles(): void {
    this.socket.on('willClose', this.willClose);
    this.socket.on('tickProcessed', this.tickProcessed);
    this.socket.on('gameInitialized', this.gameInitialized);
    this.socket.on('gameStatusChanged', this.gameStatusChanged);
    this.socket.on('playersListUpdated', this.playersListUpdated);
    this.socket.on('chatMessage', this.chatMessage);
    this.playerSelf.registerSocketHandles();
  }

  unregisterSocketHandles(): void {
    this.socket.off('willClose', this.willClose);
    this.socket.off('tickProcessed', this.tickProcessed);
    this.socket.off('gameInitialized', this.gameInitialized);
    this.socket.off('gameStatusChanged', this.gameStatusChanged);
    this.socket.off('playersListUpdated', this.playersListUpdated);
    this.socket.off('chatMessage', this.chatMessage);
    this.playerSelf.unregisterSocketHandles();
  }

  leave(): void {
    this.socket.emit('leave');
  }

  getPlayerIdentity(userId: string) {
    return this.players.find(p => p.userId === userId);
  }

  getPlayersIdentity() {
    return this.players;
  }

  private chatMessage = (data: { message: ChatMessage }) => {
    this.chatStore.addMessage(data.message);
  };

  private playersListUpdated = (data: { players: GamePlayerIdentity[] }) => {
    runInAction(() => {
      this.players = data.players;
    });
  };

  private tickProcessed = (packet: ServerPacket): void => {
    this.world.tickProcessed(packet);
    this.playerSelf.selfPlayerUpdated(packet.self);
  };

  private gameInitialized = (data: { game: ClientGameState }): void => {
    runInAction(() => {
      this.players = data.game.players;
      this.state.settings = data.game.settings;
      this.state.status = data.game.status;
    });
    this.playerSelf.selfPlayerUpdated(data.game.self);
    this.world.initialized(data);
  };

  private gameStatusChanged = (data: GameStatusChangedData): void => {
    runInAction(() => {
      this.state.status = data.status;
    });

    if (data.status === 'finished') {
      this.leave();
      openGameResult({
        winners: data.winners ?? [],
        ticks: data.ticks ?? 0
      });
      this.dispose();
    }
  };

  private willClose = (reason: { message: string }): void => {
    this.dispose();
    console.log(reason.message);
  };
}
