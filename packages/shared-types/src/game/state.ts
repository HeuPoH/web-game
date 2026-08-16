import type { GameAction, DynamicObject, GameStatus, ActionBarState, Field, GameEvent, GamePlayerRenderData, GamePlayerIdentity } from './types.js';
import type { GameSettings } from './settings.ts';

export interface ServerPacket {
  tick: number;
  events?: GameEvent[];
  state: {
    players: GamePlayerRenderData[];
    dynamicObjects: DynamicObject[];
  };
  self: {
    queue: GameAction[];
    slots: ActionBarState;
  }
}

export type ClientGameState = {
  players: GamePlayerIdentity[];
  settings: GameSettings;
  status: GameStatus;
  state: {
    players: GamePlayerRenderData[];
    field: Field;
    dynamicObjects: DynamicObject[];
  }
  self: {
    queue: GameAction[];
    slots: ActionBarState;
  };
};
