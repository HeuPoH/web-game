import { makeAutoObservable } from 'mobx';
import type { RoomPreview } from '@game/shared-types';

import type { RoomModeStore } from '../types';
import type { TypedGameSocket, TypedLobbySocket } from '../../../shared/api';
import { LobbyStore } from '../../lobby';
import { GameStore } from '../../game';
import { customHistory } from '../../../shared/lib';
import { ChatStore } from '../../chat/model/chat-store';

export class RoomStore {
  private roomModeStore: RoomModeStore | null = null;
  private chatStore: ChatStore;

  constructor(
    private sockets: { lobby: TypedLobbySocket; game: TypedGameSocket },
    private room: RoomPreview,
    private playerId: string,
  ) {
    makeAutoObservable(this);
    this.chatStore = new ChatStore();
  }

  getHostName() {
    return this.room.hostName;
  }

  getHostId() {
    return this.room.hostId;
  }

  getCurrentRoom() {
    return this.room;
  }

  getChatMessages() {
    return this.chatStore.getMessages();
  }

  hasNewMessages() {
    return this.chatStore.hasNewMessages();
  }

  setAllMessagesRead() {
    this.chatStore.setAllMessagesRead();
  }

  sendChatMessage(text: string) {
    if (this.roomModeStore instanceof LobbyStore) {
      this.sockets.lobby.emit('chatMessage', { message: text });
    } else if (this.roomModeStore instanceof GameStore) {
      this.sockets.game.emit('chatMessage', { message: text });
    }
  }

  createGame() {
    if (this.roomModeStore instanceof LobbyStore) {
      this.roomModeStore.createGame();
    }
  }

  leaveGame() {
    if (this.roomModeStore instanceof GameStore) {
      this.roomModeStore.leave();
      this.dispose();
    }
  }

  async initSocket() {
    if (this.roomModeStore?.isSocketActive()) {
      return;
    }

    if (this.room.status === 'lobby') {
      this.registerSocketHandles();
    }

    try {
      const roomModeStore = (this.roomModeStore = this.createRoomModeStore(this.room));
      await roomModeStore.init(this.room);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private registerSocketHandles() {
    this.sockets.lobby.on('gameCreated', this.gameCreated);
  }

  private unregisterSocketHandles() {
    this.sockets.lobby.off('gameCreated', this.gameCreated);
  }

  private gameCreated = async () => {
    this.roomModeStore?.dispose();
    const roomMode = (this.roomModeStore = new GameStore(
      this.sockets.game,
      this.playerId,
      this.chatStore,
    ));
    await roomMode.init(this.room);
    customHistory.replace(`/room/${this.room.id}/game`, { replace: true });
  };

  private createRoomModeStore(preview: RoomPreview) {
    return preview.status === 'lobby'
      ? new LobbyStore(this.sockets.lobby, this.chatStore)
      : new GameStore(this.sockets.game, this.playerId, this.chatStore);
  }

  dispose() {
    this.roomModeStore?.dispose();
    this.roomModeStore = null;
    this.chatStore.dispose();
    this.unregisterSocketHandles();
  }

  getCurrentModeStore() {
    return this.roomModeStore;
  }
}
