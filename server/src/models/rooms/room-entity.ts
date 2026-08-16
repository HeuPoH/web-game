import type {
  ChatMessagePayload,
  GameSettings,
  Room,
  RoomPreview,
} from '@game/shared-types';
import { v4 } from 'uuid';

import { assert } from '~/lib/assert.js';

import { ChatEntity } from '../chat/chat-entity.js';
import { createGameFacade, type IGameFacade } from './create-game-facade.js';
import { createLobbyFacade, type ILobbyFacade } from './create-lobby-facade.js';
import { getGameEntitiesFactory } from './game/game-entities/game-entities-factory.js';
import type { GameEntity } from './game/game-entity.js';
import { LobbyEntity } from './lobby-entity.js';
import type { NewPlayer, RoomEntityOwner } from './types.js';

export class RoomEntity {
  private state: Room;
  private chat: ChatEntity;

  private lobby?: LobbyEntity;
  private lobbyFacade?: ILobbyFacade;

  private game?: GameEntity;
  private gameFacade?: IGameFacade;

  constructor(
    host: NewPlayer,
    gameSettings: GameSettings,
    private owner: RoomEntityOwner,
  ) {
    this.state = {
      id: v4(),
      status: 'lobby',
      settings: gameSettings,
      hostId: host.userId,
    };
    this.chat = new ChatEntity();
    this.lobby = new LobbyEntity();
    this.lobbyFacade = createLobbyFacade(this, this.lobby);
    this.lobbyFacade.join(host);
  }

  dispose() {
    this.removeLobby();
    this.removeGame();
    this.chat.clear();
  }

  removeLobby() {
    this.lobby?.getEmitter().removeAllListeners();
    this.lobby = undefined;
    this.lobbyFacade = undefined;
  }

  removeGame() {
    this.game?.getEmitter().removeAllListeners();
    this.game?.dispose();
    this.game = undefined;
    this.gameFacade = undefined;
  }

  getOwner() {
    return this.owner;
  }

  getChat() {
    return {
      add: (message: ChatMessagePayload) => this.chat.addMessage(message),
      getAll: () => this.chat.getMessages(),
    };
  }

  getLobby() {
    return assert(this.lobbyFacade);
  }

  getGame() {
    return assert(this.gameFacade);
  }

  getState() {
    return this.state;
  }

  getRoomPlayers(): { login: string; userId: string }[] {
    return this.state.status === 'lobby'
      ? (this.lobby?.getState().players ?? [])
      : (this.game?.getPlayers().map(p => {
          const { userId, login } = p.serialize().identity;
          return { login, userId };
        }) ?? []);
  }

  startGame(playerId: string) {
    if (this.state.status === 'game') {
      throw new Error('Игра уже началась');
    }

    if (this.state.hostId !== playerId) {
      throw new Error('Вы не являетесь хостом');
    }

    const lobbyState = assert(this.lobby?.getState());
    const allPlayersReady = lobbyState.players.every(p => p.isReady);
    if (!allPlayersReady) {
      throw new Error('Не все игроки нажали готовность');
    }

    const factory = getGameEntitiesFactory();
    const regItem = factory.getRegistered(this.state.settings.level);
    if (!regItem) {
      throw new Error('Не удалось найти тип игры');
    }

    this.state.status = 'game';
    this.removeLobby();

    const gameEntity = regItem.entity({
      getGameSettings: () => this.state.settings,
    });
    gameEntity.initialize(lobbyState.players);

    this.game = gameEntity;
    this.gameFacade = createGameFacade(this, this.game);
  }

  getId() {
    return this.state.id;
  }

  isHost(playerId: string) {
    return this.state.hostId === playerId;
  }

  getStatus() {
    return this.state.status;
  }

  isEmpty() {
    return !this.lobby && !this.game;
  }

  isMember(userId: string) {
    return this.lobby?.isMember(userId) ?? this.game?.isMember(userId) ?? false;
  }

  getRoomPreview(playerId: string): RoomPreview {
    const players = this.getRoomPlayers();
    const hostPlayer = players.find(p => p.userId === this.state.hostId);
    return {
      id: this.getId(),
      status: this.getStatus(),
      settings: this.state.settings,
      hostId: this.state.hostId,
      hostName: hostPlayer?.login ?? '',
      playersCount: players.length,
      isMember: players.some(p => p.userId === playerId),
    };
  }
}
