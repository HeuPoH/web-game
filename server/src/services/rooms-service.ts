import type { GameSettings, Room, RoomPreview } from '@game/shared-types';

import { assert } from '~/lib/assert.js';
import { createDecorator, type IContainer } from '~/lib/container.js';
import type { RoomEntity } from '~/models/rooms/room-entity.js';
import type { IRoomsModel } from '~/models/rooms/rooms.js';
import type { NewPlayer } from '~/models/rooms/types.js';

import { IUserService } from './users-service.js';

export interface IRoomsService {
  create(userId: string, gameSettings: GameSettings): { id: string };
  get(roomId: string): RoomEntity | undefined;
  delete(roomId: string): void;
  getPreview(roomId: string, playerId: string): RoomPreview | undefined;
  getAllPreviews(playerId: string): RoomPreview[];
  getAll(): Room[];
}

export class RoomsService implements IRoomsService {
  constructor(
    private roomsModel: IRoomsModel,
    private di: IContainer,
  ) {}

  create(userId: string, roomSettings: GameSettings) {
    const user = assert(this.getUserData(userId));

    if (this.roomsModel.getRoomByPlayerId(userId)) {
      throw new Error('Вы уже находитесь в другой комнате');
    }

    const host: NewPlayer = {
      userId: user.id,
      login: user.login,
    };

    const roomId = this.roomsModel.create(host, roomSettings);
    return { id: roomId };
  }

  get(roomId: string) {
    return this.roomsModel.getRoomById(roomId);
  }

  delete(roomId: string) {
    return this.roomsModel.deleteRoom(roomId);
  }

  getPreview(roomId: string, playerId: string) {
    const room = assert(
      this.roomsModel.getRoomById(roomId),
      'Комната не найдена',
    );

    return room.getRoomPreview(playerId);
  }

  getAllPreviews(playerId: string) {
    const allRooms = this.roomsModel.getAllRooms();
    return allRooms.map(room => room.getRoomPreview(playerId));
  }

  getRoomState(roomId: string) {
    return this.roomsModel.getRoomById(roomId)?.getState();
  }

  getAll() {
    return this.roomsModel.getAllRooms().map(r => r.getState());
  }

  private getUserData(userId: string) {
    const users = this.di.getSilent(IUserService);
    return users.getUserById(userId);
  }
}

export const IRoomsService = createDecorator<IRoomsService>('IRoomsService');
