import type { GameAction } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import { getRandomNeighbor } from './helper.js';
import type { IActionContext } from './types.js';

export class PullPlayer extends BaseActionEnt {
  override readonly category = 'trick';
  override readonly priority = 1;

  override execute(cmd: GameAction, context: IActionContext): void {
    const player = context.initiator;
    const playerPos = player.getPosition();

    const targetPlayer = getRandomNeighbor(player, context.getPlayers(), 2);
    if (!targetPlayer) {
      return;
    }

    const prevTargetPos = targetPlayer.getPosition();
    targetPlayer.setPosition(playerPos);
    context.emitEvent({
      type: 'PULL',
      sourceId: player.getId(),
      targetId: targetPlayer.getId(),
      from: prevTargetPos,
      to: playerPos,
    });
  }

  override getColdown(): number {
    return 4;
  }
}
