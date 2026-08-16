import type { GameAction } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import type { IActionContext } from './types.js';

export class DestroyWall extends BaseActionEnt {
  override readonly priority = 1;
  override readonly category = 'trick';

  override execute(cmd: GameAction, context: IActionContext) {
    if (!cmd.params) {
      return;
    }

    const player = context.initiator;
    const playerPos = player.getPosition();
    const target = { x: cmd.params.x, y: cmd.params.y };
    const dx = Math.abs(target.x - playerPos.x);
    const dy = Math.abs(target.y - playerPos.y);
    if (dx + dy !== 1) {
      return;
    }

    context.removeDynamicObject(target);
    context.emitEvent({
      type: 'WALL_DESTROYED',
      position: target,
    });
  }

  override getColdown(): number {
    return 4;
  }
}
