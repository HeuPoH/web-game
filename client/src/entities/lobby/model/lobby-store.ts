import { makeAutoObservable, runInAction } from 'mobx';
import type { ChatMessage, LobbyPlayer, LobbyState, RoomPreview } from '@game/shared-types';

import type { TypedLobbySocket } from '../../../shared/api';
import { customHistory } from '../../../shared/lib';
import { roomsAPI, type RoomModeStore } from '../../rooms';
import { openConfirmModal } from '../../../shared/ui';
import type { ChatStore } from '../../chat/model/chat-store';

export class LobbyStore implements RoomModeStore {
  private state: LobbyState = {
    players: []
  };

  constructor(private socket: TypedLobbySocket, private chatStore: ChatStore) {
    makeAutoObservable(this);
  }

  getPlayers() {
    return this.state.players;
  }

  async init(preview: RoomPreview) {
    await new Promise<void>((res) => {
      this.registerSocketHandles();
      this.socket.once('connect', res);
      this.socket.io.opts.query = { roomId: preview.id };
      this.socket.connect();
    });

    const response = await roomsAPI().fetchChatMessages(preview.id);
    this.chatStore.prependMessages(response.messages);
  }

  dispose() {
    this.unregisterSocketHandles();
    this.socket.disconnect();
  }

  isSocketActive() {
    return this.socket.active;
  }

  setReady(ready: boolean) {
    this.socket.emit('setReady', { ready });
  }

  leave() {
    this.socket.emit('leave');
  }

  getState() {
    return this.state;
  }

  private registerSocketHandles() {
    this.socket.on('willClose', this.willClose);
    this.socket.on('lobbyInitialized', this.lobbyInitialized);
    this.socket.on('playersListUpdated', this.playersListUpdated);
    this.socket.on('playerReadyChanged', this.playerReadyChanged);
    this.socket.on('chatMessage', this.chatMessage);
  }

  unregisterSocketHandles() {
    this.socket.off('willClose', this.willClose);
    this.socket.off('lobbyInitialized', this.lobbyInitialized);
    this.socket.off('playersListUpdated', this.playersListUpdated);
    this.socket.off('playerReadyChanged', this.playerReadyChanged);
    this.socket.off('chatMessage', this.chatMessage);
  }

  createGame() {
    this.socket.emit('createGame');
  }

  private chatMessage = (data: { message: ChatMessage }) => {
    this.chatStore.addMessage(data.message);
  };

  private playerReadyChanged = (data: { playerId: string, isReady: boolean }) => {
    runInAction(() => {
      this.state.players = this.state.players.map(player => {
        if (player.userId === data.playerId) {
          player.isReady = data.isReady;
        }
  
        return player;
      });
    });
  };
  
  private playersListUpdated = (players: LobbyPlayer[]) => {
    runInAction(() => {
      this.state.players = players;
    });
  };

  private lobbyInitialized = (state: LobbyState) => {
    runInAction(() => {
      this.state = state;;
    });
  };

  private willClose = (reason: { message: string }) => {
    this.dispose();

    const args = {
      text: reason.message,
      okText: 'На главную',
      onOk: () => customHistory.push('/')
    };
    openConfirmModal(args);
  };
}
