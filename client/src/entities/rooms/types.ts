import type { RoomPreview } from '@game/shared-types';

export type Player = {
  userId: string;
  login: string;
};

export type RoomModeStore = {
  init: (roomPreview: RoomPreview) => Promise<void>;
  dispose: () => void;
  isSocketActive: () => boolean;
  getPlayers: () => ({ userId: string; login: string; color: number })[];
};
