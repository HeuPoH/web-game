import type { GameSettings } from '@game/shared-types';

import { RoomEntity } from './room-entity.js';
import type { NewPlayer } from './types.js';

export interface IRoomsModel {
  /**
   * Создаёт новую комнату с указанным хостом и настройками.
   * @param host - объект игрока-создателя
   * @param gameSettings - настройки комнаты (название, скорость робота, уровень и т.д.)
   * @returns уникальный идентификатор созданной комнаты
   */
  create(host: NewPlayer, gameSettings: GameSettings): string;

  /**
   * Возвращает комнату по её идентификатору.
   * @param id - идентификатор комнаты
   * @returns сущность комнаты
   */
  getRoomById(id: string): RoomEntity | undefined;

  /**
   * Возвращает комнату, в которую пользователь вошел ранее.
   * @param playerId - идентификатор пользователя
   * @returns объект комнаты
   */
  getRoomByPlayerId(playerId: string): RoomEntity | undefined;

  /**
   * Удаляет комнату по id.
   * @param id - идентификатор комнаты
   */
  deleteRoom(id: string): void;

  /**
   * Возвращает все комнаты
   * @return RoomEntity[]
   */
  getAllRooms(): RoomEntity[];
}

class RoomsModel implements IRoomsModel {
  /** Мапа комнат: ключ – roomId, сущность комнаты */
  private rooms = new Map<string, RoomEntity>();
  /** Индекс для связи playerId -> roomId (позволяет быстро найти комнату по идентификатору игрока) */
  private playerRooms = new Map<string, string>();

  create(host: NewPlayer, gameSettings: GameSettings) {
    const room = new RoomEntity(host, gameSettings, {
      registerPlayerRoom: (playerId: string, roomId: string) => {
        this.playerRooms.set(playerId, roomId);
      },
      unregisterPlayerRoom: (playerId: string) => {
        this.playerRooms.delete(playerId);
      },
      isPlayerInAnyRoom: (playerId: string) => {
        return this.playerRooms.has(playerId);
      },
    });
    const roomId = room.getId();
    this.rooms.set(roomId, room);
    this.playerRooms.set(host.userId, roomId);

    return roomId;
  }

  deleteRoom(id: string) {
    const room = this.rooms.get(id);
    if (!room) {
      return;
    }

    const roomPlayers = room.getRoomPlayers();
    for (const player of roomPlayers) {
      this.playerRooms.delete(player.userId);
    }

    room.dispose();
    this.rooms.delete(id);
  }

  getRoomById(id: string) {
    return this.rooms.get(id);
  }

  getRoomByPlayerId(playerId: string) {
    const roomId = this.playerRooms.get(playerId);
    const room = roomId ? this.rooms.get(roomId) : undefined;
    return room;
  }

  getAllRooms() {
    return [...this.rooms.values()];
  }
}

export const roomsModel = new RoomsModel();
