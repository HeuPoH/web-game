import type { GameSettings } from '@game/shared-types';

export type GameOwner = {
  getGameSettings: () => GameSettings;
};
