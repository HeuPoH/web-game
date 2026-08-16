import type { GameAction } from '@game/shared-types';

import { DynamicObjectEntity } from '../dynamic-object-entity.js';
import { BaseActionEnt } from './base-action-entity.js';
import type { IActionContext } from './types.js';

export class BuildWall extends BaseActionEnt {
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

    if (!context.isWalkable(target)) {
      return;
    }

    const obj = new DynamicObjectEntity({
      id: `${Date.now()}-${Math.trunc(Math.random() * 100)}`,
      type: 'wall',
      position: target,
    });
    context.buildDynamicObject(obj);
    context.emitEvent({
      type: 'WALL_BUILT',
      position: target,
      playerId: player.getId(),
    });
  }

  override getColdown(): number {
    return 4;
  }
}
