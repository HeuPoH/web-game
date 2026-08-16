/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ActionBarSlot,
  ActionBarState,
  ActionType,
  GameAction,
} from '@game/shared-types';

import type { BaseActionEnt } from './actions/base-action-entity.js';
import { createAction } from './actions/registry.js';
import type { IActionContext } from './actions/types.js';
import type { ISerializable } from './serializable.js';

export class ActionManager implements ISerializable<ActionBarState> {
  private actions = new Map<ActionType, BaseActionEnt>();
  private coldowns = new Map<ActionType, number>();

  constructor(avActions: ActionType[]) {
    for (const a of avActions) {
      const action = createAction(a);
      this.actions.set(a, action);
    }
  }

  serialize() {
    const result: ActionBarState = {
      move: [],
      trick: [],
    };

    for (const [type, action] of this.actions.entries()) {
      const slot: ActionBarSlot = { type };
      const cd = this.coldowns.get(type);
      if (cd) {
        slot.coldown = cd;
      }

      if (action.category === 'move') {
        result.move.push(slot as any);
      } else {
        result.trick.push(slot as any);
      }
    }

    return result;
  }

  tick(): void {
    for (const [type, remaining] of this.coldowns.entries()) {
      if (remaining > 1) {
        this.coldowns.set(type, remaining - 1);
      } else {
        this.coldowns.delete(type);
      }
    }
  }

  useAction(cmd: GameAction, context: IActionContext) {
    const action = this.actions.get(cmd.type);
    if (!action) {
      throw new Error('У вас нет такого действия');
    }

    const remaining = this.coldowns.get(cmd.type);
    if (remaining !== undefined && remaining > 0) {
      throw new Error('Действие на перезарядке');
    }

    const coldown = action.getColdown();
    if (coldown) {
      this.coldowns.set(cmd.type, coldown);
    }

    action.execute(cmd, context);
  }
}
