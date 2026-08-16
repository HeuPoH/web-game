import type { ActionType, GameAction } from '@game/shared-types';

import type { IAction, IActionContext } from './types.js';

export abstract class BaseActionEnt implements IAction {
  constructor(protected type: ActionType) {}

  abstract readonly priority: 0 | 1 | 2;
  abstract readonly category: 'move' | 'trick';
  abstract execute(cmd: GameAction, context: IActionContext): void;

  getColdown() {
    return 0;
  }
}
