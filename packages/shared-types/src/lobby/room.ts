import { GameSettings } from "../game/settings";

export type RoomStatus = 'lobby' | 'game';

export interface Room {
  id: string;
  status: RoomStatus;
  hostId: string;
  settings: GameSettings;
}

export interface RoomPreview {
  id: string;
  status: RoomStatus;
  playersCount: number;
  settings: GameSettings;
  hostId: string;
  hostName: string;
  isMember: boolean;
}
