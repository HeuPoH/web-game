import type { ActionType } from '@game/shared-types';

import type { BaseActionEnt } from './base-action-entity.js';
import { BuildWall } from './build-wall.js';
import { DestroyWall } from './destroy-wall.js';
import { JumpPlayer } from './jump-player.js';
import { MoveDown, MoveLeft, MoveRight, MoveUp } from './move-actions.js';
import { PullPlayer } from './pull-player.js';
import { ShovePlayer } from './shove-player.js';
import { SwapPlayer } from './swap-player.js';
import { ThrowPlayer } from './throw-actions.js';

const ActionRegistry: Record<
  ActionType,
  new (type: ActionType) => BaseActionEnt
> = {
  step_up: MoveUp,
  step_down: MoveDown,
  step_left: MoveLeft,
  step_right: MoveRight,
  build_wall: BuildWall,
  shove: ShovePlayer,
  destroy_wall: DestroyWall,
  throw: ThrowPlayer,
  pull: PullPlayer,
  jump: JumpPlayer,
  swap: SwapPlayer,
};

export function createAction(type: ActionType): BaseActionEnt {
  const Ctor = ActionRegistry[type];
  if (!Ctor) {
    throw new Error(`Неизвестный тип команды: ${type}`);
  }
  return new Ctor(type);
}
