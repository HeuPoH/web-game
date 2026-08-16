export type Direction = 'up' | 'down' | 'left' | 'right';

export type Tile = { type: 'wall' | 'floor'; sId?: number };
export type Field = Tile[][];

export interface Position {
  x: number;
  y: number;
}

export type MoveAction = 'step_up' | 'step_down' | 'step_left' | 'step_right';
export type TrickAction = 'build_wall' | 'destroy_wall' | 'shove' | 'throw' | 'pull' | 'swap' | 'jump';
export type ActionType = MoveAction | TrickAction;

export interface GameActionPayload {
  type: ActionType;
  params?: { x: number; y: number };
}

export interface GameAction extends GameActionPayload {
  id: string;
  type: ActionType;
  params?: { x: number; y: number };
  timestamp: number; // Date.now() при добавлении
}

export interface DynamicObject {
  id: string;
  type: 'wall';
  position: Position;
}

export interface ActionBarSlot<T extends ActionType = ActionType> {
  type: T;
  coldown?: number;
}

export type ActionBarState = {
  move: ActionBarSlot<MoveAction>[];
  trick: ActionBarSlot<TrickAction>[];
};

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GamePlayerRenderData {
  userId: string;
  position: Position;
  direction: Direction;
}

export type GameStatusChangedData = { status: GameStatus; winners?: Winner[]; ticks?: number };
export type SelfPlayerChangedData = { queue: GameAction[]; slots: ActionBarState };

/** Идентификационные данные игрока */
export interface GamePlayerIdentity {
  userId: string;
  login: string;
  connected: boolean;
  color: number;
}

export type GameEvent =
  /** Игрок сам шагнул (можно не использовать, вычисляется клиентом) */
  | { type: 'VOLUNTARY_MOVE'; playerId: string; from: Position; to: Position }
  /** Активный толчок (пинок) одного игрока другим */
  | { type: 'SHOVE'; sourceId: string; targetId: string; from: Position; to: Position }
  /** Построена стена (или другой объект) */
  | { type: 'WALL_BUILT'; position: Position; playerId: string }
  /** Стена разрушена */
  | { type: 'WALL_DESTROYED'; position: Position }
  /** Бросок через себя */
  | { type: 'THROW'; sourceId: string; targetId: string; from: Position; to: Position }
  /** Прыжок на 2 клетки */
  | { type: 'JUMP'; playerId: string; from: Position; to: Position }
  /** Притяжение цели к инициатору */
  | { type: 'PULL'; sourceId: string; targetId: string; from: Position; to: Position }
  /** Обмен местами */
  | { type: 'SWAP'; playerId1: string; playerId2: string; pos1: Position; pos2: Position };

export type Winner = { userId: string; login: string; color: number };

export type EffectsEventTypes =
  | 'SHOVE'
  | 'THROW'
  | 'JUMP'
  | 'PULL'
  | 'SWAP';
  