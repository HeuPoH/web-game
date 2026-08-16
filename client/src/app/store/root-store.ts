import type { RoomPreview } from '@game/shared-types';
import { RoomStore } from '../../entities/rooms';
import { userAPI, UserStore } from '../../entities/user';
import { AuthStore } from '../../features/auth';
import { lobbySocket, gameSocket } from '../../shared/api';

export class RootStore {
  private authStore: AuthStore;
  private userStore: UserStore;
  private roomStore: RoomStore | null = null;

  constructor() {
    this.userStore = new UserStore();
    this.authStore = new AuthStore(userAPI(), this.userStore);
  }

  createRoomStore(room: RoomPreview) {
    if (this.roomStore) {
      this.clearRoomStore();
    }
    this.roomStore = new RoomStore(
      { lobby: lobbySocket, game: gameSocket },
      room,
      this.userStore.getUser()!.id
    );
    return this.roomStore;
  }

  clearRoomStore() {
    this.roomStore?.dispose();
    this.roomStore = null;
  }

  getRoomStore() {
    return this.roomStore;
  }

  getUserStore() {
    return this.userStore;
  }

  getAuthStore() {
    return this.authStore;
  }
}

export const rootStore = new RootStore();
